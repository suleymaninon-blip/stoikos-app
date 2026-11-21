import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView, Platform, Animated, Easing,
  PanResponder, Modal, Pressable, KeyboardAvoidingView, AccessibilityInfo,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang, upper } from '../constants/i18n';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { appendToJournalToday } from '../constants/journal';
import { CalmPressable } from '../components/CalmPressable';
import { PaperBg } from '../components/PaperBg';
import { DoneMark } from '../components/DoneMark';

/**
 * Kontrol Eleği (21 Kasım 2026; tasarım https://claude.ai/artifact/RTrVnZZAzwGn92rw64bb7S, kullanıcı seçimi A).
 * Zor anda 30 saniyelik araç: aklındakileri yaz (en çok 5) → her birini "elimde olan / olmayan"a ayır
 * (dokun + düğme ya da alana sürükle) → bırakmadan önce "içinde elinde olan bir parça var mı?" →
 * bırakılan taş altın toza dönüşüp dağılır → yalnız yapabileceklerin kalır.
 * Yazılanlar hiçbir yere gitmez: kaydetmezsen ekran kapanınca silinir. "Koçla konuş" yalnız
 * elinde olan maddeleri koçun yazı alanına taslak olarak koyar; göndermek kişiye kalır.
 * Titreşim bilerek yok (TestFlight'ta denenecek). "Hareketi Azalt"ta toz yok, taş söner.
 */

type Zone = 'in' | 'out';
type Item = { id: number; text: string; zone: Zone | null; part: boolean };
type Rect = { x: number; y: number; w: number; h: number };
const MAX_ITEMS = 5;
const MAX_LEN = 70;
const LATIN = 'Dichotomy of Control';

// Dağılma tozu: [sol %, üst %, dx, dy, boyut, gecikme (0–1)]
const DUST: [number, number, number, number, number, number][] = [
  [8, 30, -34, -46, 4, 0], [18, 70, -22, -60, 3, 0.05], [28, 20, -8, -70, 5, 0.03], [36, 80, 4, -52, 3, 0.1],
  [46, 40, -2, -84, 4, 0], [54, 60, 12, -66, 5, 0.08], [62, 25, 22, -74, 3, 0.04], [70, 75, 30, -50, 4, 0.13],
  [80, 35, 38, -62, 3, 0.02], [90, 60, 46, -44, 4, 0.1], [14, 50, -40, -30, 3, 0.15], [40, 55, -14, -40, 3, 0.17],
  [66, 50, 18, -36, 3, 0.2], [86, 22, 42, -80, 5, 0.05],
];

const inside = (r: Rect | null, x: number, y: number) => !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export default function SieveScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const gold = Colors.isDark ? '#e6cc94' : '#b8944f';

  const [screen, setScreen] = useState<'write' | 'sort' | 'clear'>('write');
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState('');
  const [sel, setSel] = useState<number | null>(null);
  const [partFor, setPartFor] = useState<number | null>(null);
  const [partDraft, setPartDraft] = useState('');
  const [dissolving, setDissolving] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  // Netlikte koça götürülmeyecek maddeler (varsayılan: hepsi seçili; kullanıcı: "koça atmak istediklerimi seçemiyorum")
  const [skipCoach, setSkipCoach] = useState<number[]>([]);
  // Bırakılanlardan koça götürülecekler (varsayılan: hiçbiri; kullanıcı işaretlerse "bırakmakta zorlandıklarım")
  const [letCoach, setLetCoach] = useState<number[]>([]);
  const nid = useRef(1);
  const inputRef = useRef<TextInput>(null);
  const zoneInRef = useRef<View>(null);
  const zoneOutRef = useRef<View>(null);
  const zones = useRef<{ in: Rect | null; out: Rect | null }>({ in: null, out: null });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const kept = items.filter((i) => i.zone === 'in');
  const released = items.filter((i) => i.zone === 'out');
  const field = items.filter((i) => i.zone === null || dissolving.includes(i.id));
  const pending = items.filter((i) => i.zone === null).length;

  // Hepsi ayrıldı, toz dağıldı, soru penceresi kapalı → netlik.
  useEffect(() => {
    if (screen !== 'sort' || items.length === 0 || pending > 0 || dissolving.length > 0 || partFor != null) return;
    timer.current = setTimeout(() => setScreen('clear'), reduce ? 200 : 650);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [screen, items.length, pending, dissolving.length, partFor, reduce]);

  const newItem = (text: string, zone: Zone | null = null, part = false): Item =>
    ({ id: nid.current++, text: text.trim().slice(0, MAX_LEN), zone, part });

  const add = () => {
    const txt = draft.trim();
    if (!txt || items.length >= MAX_ITEMS) return;
    setItems((cur) => [...cur, newItem(txt)]);
    setDraft('');
    inputRef.current?.focus();
  };
  const fillExamples = () => setItems(t('sieve.examplesList').split('|').map((x) => newItem(x)));
  const remove = (id: number) => setItems((cur) => cur.filter((i) => i.id !== id));

  const keep = (id: number) => {
    setSel(null);
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, zone: 'in' } : i)));
  };
  const askRelease = (id: number) => { setSel(null); setPartDraft(''); setPartFor(id); };
  const release = (withPart: boolean) => {
    const id = partFor;
    if (id == null) return;
    const p = partDraft.trim();
    setItems((cur) => {
      const next = cur.map((i) => (i.id === id ? { ...i, zone: 'out' as Zone } : i));
      return withPart && p ? [...next, newItem(p, 'in', true)] : next;
    });
    setDissolving((d) => [...d, id]);
    setPartFor(null);
    setPartDraft('');
  };

  const measureZones = () => {
    zoneInRef.current?.measureInWindow((x, y, w, h) => { zones.current.in = { x, y, w, h }; });
    zoneOutRef.current?.measureInWindow((x, y, w, h) => { zones.current.out = { x, y, w, h }; });
  };
  const onDrop = (id: number, x: number, y: number): boolean => {
    if (inside(zones.current.in, x, y)) { keep(id); return true; }
    if (inside(zones.current.out, x, y)) { askRelease(id); return true; }
    return false;
  };

  const restart = () => {
    setSkipCoach([]);
    setLetCoach([]);
    setItems([]); setSaved(false); setSel(null); setDissolving([]); setPartFor(null); setScreen('write');
  };
  const save = async () => {
    const lines = [t('sieve.name')];
    if (kept.length) lines.push(`${t('sieve.zoneIn')}: ${kept.map((i) => i.text).join('; ')}`);
    if (released.length) lines.push(`${t('sieve.jLet')}: ${released.map((i) => i.text).join('; ')}`);
    try {
      await appendToJournalToday(lines.join('\n'));
      setSaved(true);
      AccessibilityInfo.announceForAccessibility?.(t('sieve.saved'));
    } catch {}
  };
  const toCoach = () => {
    const chosen = kept.filter((i) => !skipCoach.includes(i.id)).map((i) => i.text).join('; ');
    const lets = released.filter((i) => letCoach.includes(i.id)).map((i) => i.text).join('; ');
    if (!chosen && !lets) return;
    const draftMsg = chosen && lets
      ? t('sieve.coachDraftBoth', { list: chosen, let: lets })
      : chosen ? t('sieve.coachDraft', { list: chosen }) : t('sieve.coachDraftLet', { let: lets });
    router.navigate({ pathname: '/coach', params: { draft: draftMsg } });
  };

  const chosenCount = kept.filter((i) => !skipCoach.includes(i.id)).length + released.filter((i) => letCoach.includes(i.id)).length;
  const stepOf = screen === 'write' ? 1 : screen === 'sort' ? 2 : 3;
  const partItem = items.find((i) => i.id === partFor);
  const active = sel != null || dragging;
  const kb = Colors.isDark ? 'dark' : 'light';

  return (
    <SafeAreaView style={styles.container}>
      <PaperBg />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Üst satır: kapat · ad · adım */}
        <View style={styles.top}>
          <View style={styles.topRow}>
            <CalmPressable onPress={() => router.back()} style={styles.closeBtn} pressScale={0.92} accessibilityLabel={t('sieve.close')}>
              <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M6 6l12 12M18 6L6 18" stroke={Colors.text2} strokeWidth={1.6} strokeLinecap="round" /></Svg>
            </CalmPressable>
            <Text style={styles.topName}>{upper(t('sieve.name'), lang)}</Text>
            <Text style={styles.topStep}>{t('sieve.step', { n: stepOf })}</Text>
          </View>
          <View style={styles.segs}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={[styles.seg, n <= stepOf && styles.segOn]} />
            ))}
          </View>
        </View>

        {/* 1 · Boşalt */}
        {screen === 'write' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.h1}>{t('sieve.writeTitle')}</Text>
              <Text style={styles.lead}>{t('sieve.writeBody')}</Text>
              <Text style={styles.label}>{upper(t('sieve.inputLabel'), lang)}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={add}
                  blurOnSubmit={false}
                  returnKeyType="done"
                  maxLength={MAX_LEN}
                  placeholder={t('sieve.placeholder')}
                  placeholderTextColor={Colors.muted}
                  keyboardAppearance={kb}
                  editable={items.length < MAX_ITEMS}
                  accessibilityLabel={t('sieve.inputLabel')}
                  style={styles.input}
                />
                <CalmPressable
                  onPress={add}
                  disabled={!draft.trim() || items.length >= MAX_ITEMS}
                  style={[styles.addBtn, (!draft.trim() || items.length >= MAX_ITEMS) && styles.dim]}
                >
                  <Text style={styles.addText}>{t('sieve.add')}</Text>
                </CalmPressable>
              </View>

              <View style={styles.list}>
                {items.map((i) => (
                  <WriteStone key={i.id} text={i.text} onRemove={() => remove(i.id)} removeLabel={t('sieve.remove')} />
                ))}
              </View>

              {items.length === 0 ? (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>{t('sieve.emptyHint')}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <CalmPressable onPress={fillExamples} style={styles.linkBtn}>
                      <Text style={styles.linkText}>{t('sieve.examples')}</Text>
                    </CalmPressable>
                  </View>
                </View>
              ) : (
                <Text style={styles.count}>{t('sieve.count', { n: items.length })}</Text>
              )}
            </ScrollView>
            <View style={styles.footer}>
              <CalmPressable
                onPress={() => { if (items.length) { setSel(null); setScreen('sort'); } }}
                disabled={items.length === 0}
                style={[styles.primary, items.length === 0 && styles.dim]}
              >
                <Text style={styles.primaryText}>{t('sieve.toSort')}</Text>
              </CalmPressable>
            </View>
          </View>
        )}

        {/* 2 · Ele */}
        {screen === 'sort' && (
          // Kaydırılabilir: 5 taş küçük ekranda alanların üstüne biniyordu (21 Kasım 2026, kullanıcının iPhone'u).
          // Sürüklerken kaydırma kapalı; taşta web'de touchAction 'none' (parmak sayfayı değil taşı taşısın).
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.sortWrap}
            scrollEnabled={!dragging}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.h1}>{t('sieve.sortTitle')}</Text>
            <Text style={styles.lead}>{t('sieve.sortBody')}</Text>

            {/* Sürüklenen taş alanların üstünde çizilsin (kardeşler arasında zIndex) */}
            <View style={[styles.field, dragging && styles.fieldLifted]}>
              {field.map((i) =>
                dissolving.includes(i.id) ? (
                  <DissolvingStone
                    key={i.id}
                    text={i.text}
                    gold={gold}
                    reduce={reduce}
                    onDone={() => setDissolving((d) => d.filter((x) => x !== i.id))}
                  />
                ) : (
                  <SortStone
                    key={i.id}
                    text={i.text}
                    selected={sel === i.id}
                    hint={t('sieve.stoneHint')}
                    onTap={() => setSel((s) => (s === i.id ? null : i.id))}
                    onDragStart={() => { setSel(null); setDragging(true); measureZones(); }}
                    onDragEnd={(x, y) => { setDragging(false); return onDrop(i.id, x, y); }}
                    onKeep={() => keep(i.id)}
                    onRelease={() => askRelease(i.id)}
                    mineLabel={t('sieve.mine')}
                    notMineLabel={t('sieve.notMine')}
                  />
                )
              )}
              {field.length === 0 && <Text style={styles.emptyField}>{t('sieve.emptyField')}</Text>}
            </View>

            <View style={styles.zones}>
              <Pulse active={active && !reduce} style={{ flex: 1 }}>
                <Pressable
                  ref={zoneInRef}
                  collapsable={false}
                  onPress={() => { if (sel != null) keep(sel); }}
                  accessibilityRole="button"
                  accessibilityLabel={t('sieve.zoneIn')}
                  style={[styles.zone, styles.zoneIn, active && styles.zoneInActive]}
                >
                  <Text style={styles.zoneInLabel}>{upper(t('sieve.zoneIn'), lang)}</Text>
                  {kept.slice(0, 3).map((k) => (
                    <Text key={k.id} style={styles.chip} numberOfLines={1}>{k.text}</Text>
                  ))}
                  {kept.length > 3 && <Text style={styles.zoneMeta}>{t('sieve.more', { n: kept.length - 3 })}</Text>}
                  {kept.length === 0 && <Text style={styles.zoneHint}>{t('sieve.zoneInHint')}</Text>}
                </Pressable>
              </Pulse>
              <Pulse active={active && !reduce} style={{ flex: 1 }}>
                <Pressable
                  ref={zoneOutRef}
                  collapsable={false}
                  onPress={() => { if (sel != null) askRelease(sel); }}
                  accessibilityRole="button"
                  accessibilityLabel={t('sieve.zoneOut')}
                  style={[styles.zone, styles.zoneOut, active && styles.zoneOutActive]}
                >
                  <Text style={styles.zoneOutLabel}>{upper(t('sieve.zoneOut'), lang)}</Text>
                  <Text style={styles.zoneHint}>{t('sieve.zoneOutHint')}</Text>
                  {released.length > 0 && (
                    <View style={styles.releasedRow}>
                      <View style={[styles.goldDot, { backgroundColor: gold }]} />
                      <Text style={styles.zoneMeta}>{t('sieve.released', { n: released.length })}</Text>
                    </View>
                  )}
                </Pressable>
              </Pulse>
            </View>
          </ScrollView>
        )}

        {/* 4 · Netlik */}
        {screen === 'clear' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <DoneMark size={84} />
              </View>
              <Text style={[styles.h1, styles.center]} accessibilityRole="header">{t('sieve.clearTitle')}</Text>
              <Text style={styles.clearSub}>{kept.length ? t('sieve.clearSub') : t('sieve.clearNone')}</Text>
              <LinearGradient
                colors={[Colors.tint(0), Colors.tint(0.55), Colors.tint(0)]}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.divider}
              />
              {kept.length > 0 && <Text style={[styles.label, { marginTop: 18, marginBottom: 0 }]}>{upper(t('sieve.pickHint'), lang)}</Text>}
              <View style={[styles.list, { marginTop: 10 }]}>
                {kept.map((k) => {
                  const on = !skipCoach.includes(k.id);
                  return (
                    <Pressable
                      key={k.id}
                      onPress={() => setSkipCoach((cur) => (on ? [...cur, k.id] : cur.filter((x) => x !== k.id)))}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      style={[styles.keptCard, styles.cardShadow, !on && styles.keptOff]}
                    >
                      <View style={[styles.keptBox, on && styles.keptBoxOn]}>
                        {on && (
                          <Svg width={14} height={14} viewBox="0 0 24 24"><Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={Colors.onAccent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                        )}
                      </View>
                      <Text style={styles.keptText}>{k.text}</Text>
                      {k.part && <Text style={styles.partBadge}>{upper(t('sieve.partBadge'), lang)}</Text>}
                    </Pressable>
                  );
                })}
              </View>
              {kept.some((k) => k.part) && <Text style={styles.legend}>{t('sieve.partLegend')}</Text>}
              {/* Bıraktıkların: varsayılan seçili değil; bırakmakta zorlanılan işaretlenirse koça o da gider */}
              {released.length > 0 && (
                <>
                  <View style={[styles.releasedRow, { marginTop: 22 }]}>
                    <View style={[styles.goldDot, { backgroundColor: gold }]} />
                    <Text style={[styles.label, { marginBottom: 0 }]}>{upper(t('sieve.letTitle'), lang)}</Text>
                  </View>
                  <Text style={[styles.legend, { marginTop: 4 }]}>{t('sieve.letHint')}</Text>
                  <View style={[styles.list, { marginTop: 10 }]}>
                    {released.map((r) => {
                      const on = letCoach.includes(r.id);
                      return (
                        <Pressable
                          key={r.id}
                          onPress={() => setLetCoach((cur) => (on ? cur.filter((x) => x !== r.id) : [...cur, r.id]))}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: on }}
                          style={[styles.keptCard, styles.letCard, on && styles.letCardOn]}
                        >
                          <View style={[styles.keptBox, on && styles.keptBoxOn]}>
                            {on && (
                              <Svg width={14} height={14} viewBox="0 0 24 24"><Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={Colors.onAccent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                            )}
                          </View>
                          <Text style={[styles.keptText, !on && styles.letText]}>{r.text}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </ScrollView>
            <View style={styles.footer}>
              {(kept.length > 0 || released.length > 0) && (
                <>
                  <CalmPressable onPress={toCoach} disabled={chosenCount === 0} style={[styles.primary, chosenCount === 0 && styles.dim]}>
                    <Text style={styles.primaryText}>{t('sieve.coach')}</Text>
                  </CalmPressable>
                  <Text style={styles.note}>{chosenCount ? t('sieve.coachNote', { n: chosenCount }) : t('sieve.pickNone')}</Text>
                </>
              )}
              <CalmPressable onPress={save} disabled={saved} style={styles.secondary} accessibilityState={{ disabled: saved }}>
                <View style={styles.secondaryInner}>
                  {saved && (
                    <Svg width={16} height={16} viewBox="0 0 24 24"><Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={Colors.sand} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  )}
                  <Text style={styles.secondaryText}>{saved ? t('sieve.saved') : t('sieve.save')}</Text>
                </View>
              </CalmPressable>
              <View style={styles.endRow}>
                <CalmPressable onPress={restart} style={styles.endBtn}>
                  <Text style={styles.endMuted}>{t('sieve.again')}</Text>
                </CalmPressable>
                <CalmPressable onPress={() => router.back()} style={styles.endBtn}>
                  <Text style={styles.endAccent}>{t('sieve.done')}</Text>
                </CalmPressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* 3 · Payını al — bırakmadan önce tek soru */}
      <Modal
        visible={partFor != null}
        transparent
        animationType={reduce ? 'none' : 'slide'}
        onRequestClose={() => setPartFor(null)}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.scrim} onPress={() => setPartFor(null)} accessibilityLabel={t('sieve.close')} />
          <View style={styles.sheet}>
            <View style={styles.grip} />
            <Text style={styles.label}>{upper(t('sieve.partTag'), lang)}</Text>
            <Text style={styles.sheetTitle}>{t('sieve.partTitle', { x: partItem?.text ?? '' })}</Text>
            <Text style={styles.lead}>{t('sieve.partBody')}</Text>
            <TextInput
              value={partDraft}
              onChangeText={setPartDraft}
              onSubmitEditing={() => release(!!partDraft.trim())}
              maxLength={MAX_LEN}
              placeholder={t('sieve.partPh')}
              placeholderTextColor={Colors.muted}
              keyboardAppearance={kb}
              accessibilityLabel={t('sieve.partLabel')}
              style={styles.input}
            />
            <View style={styles.sheetBtns}>
              <CalmPressable onPress={() => release(false)} style={[styles.secondary, { flex: 1 }]}>
                <Text style={[styles.secondaryText, styles.center]}>{t('sieve.releaseOnly')}</Text>
              </CalmPressable>
              <CalmPressable
                onPress={() => release(true)}
                disabled={!partDraft.trim()}
                style={[styles.primary, { flex: 1 }, !partDraft.trim() && styles.dim]}
              >
                <Text style={styles.primaryText}>{t('sieve.releaseWith')}</Text>
              </CalmPressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Yazma listesindeki taş: belirirken hafifçe yükselir ──
function WriteStone({ text, onRemove, removeLabel }: { text: string; onRemove: () => void; removeLabel: string }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    if (!reduce) Animated.timing(v, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.stone, styles.stoneRow, styles.cardShadow, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
      <Text style={[styles.stoneText, { flex: 1 }]}>{text}</Text>
      <CalmPressable onPress={onRemove} style={styles.removeBtn} pressScale={0.9} accessibilityLabel={removeLabel}>
        <Svg width={16} height={16} viewBox="0 0 24 24"><Path d="M7 7l10 10M17 7L7 17" stroke={Colors.muted} strokeWidth={1.6} strokeLinecap="round" /></Svg>
      </CalmPressable>
    </Animated.View>
  );
}

// ── Elemedeki taş: dokununca iki düğme açılır; sürüklenince alanlara bırakılabilir ──
function SortStone({
  text, selected, hint, onTap, onDragStart, onDragEnd, onKeep, onRelease, mineLabel, notMineLabel,
}: {
  text: string; selected: boolean; hint: string;
  onTap: () => void; onDragStart: () => void; onDragEnd: (x: number, y: number) => boolean;
  onKeep: () => void; onRelease: () => void; mineLabel: string; notMineLabel: string;
}) {
  const styles = useStyles(makeStyles);
  const reduce = useReduceMotion();
  const pan = useRef(new Animated.ValueXY()).current;
  const [lifted, setLifted] = useState(false);
  // PanResponder bir kez kurulur; geri çağrılar her çizimde güncel kalsın.
  const cb = useRef({ onDragStart, onDragEnd });
  cb.current = { onDragStart, onDragEnd };

  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
    onPanResponderGrant: () => { setLifted(true); cb.current.onDragStart(); },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_, g) => {
      setLifted(false);
      const dropped = cb.current.onDragEnd(g.moveX, g.moveY);
      if (dropped || reduce) pan.setValue({ x: 0, y: 0 });
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 7 }).start();
    },
    onPanResponderTerminate: () => {
      setLifted(false);
      cb.current.onDragEnd(-1, -1);
      pan.setValue({ x: 0, y: 0 });
    },
  }), [reduce]);

  return (
    <View style={lifted ? styles.liftedWrap : undefined}>
      <Animated.View {...responder.panHandlers} style={[{ transform: pan.getTranslateTransform() }, Platform.OS === 'web' && ({ touchAction: 'none' } as any)]}>
        <Pressable
          onPress={onTap}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityHint={hint}
          style={[styles.stone, styles.cardShadow, selected && styles.stoneSel, lifted && styles.stoneLifted]}
        >
          <Text style={styles.stoneText}>{text}</Text>
        </Pressable>
      </Animated.View>
      {selected && (
        <View style={styles.choiceRow}>
          <CalmPressable onPress={onKeep} style={[styles.primary, styles.choiceBtn]}>
            <Text style={styles.primaryText}>{mineLabel}</Text>
          </CalmPressable>
          <CalmPressable onPress={onRelease} style={[styles.secondary, styles.choiceBtn]}>
            <Text style={[styles.secondaryText, styles.center]}>{notMineLabel}</Text>
          </CalmPressable>
        </View>
      )}
    </View>
  );
}

// ── Bırakılan taş: ısınır, söner, altın toza dönüşüp yükselir (~1 sn). Hareketi Azalt'ta yalnız söner. ──
function DissolvingStone({ text, gold, reduce, onDone }: { text: string; gold: string; reduce: boolean; onDone: () => void }) {
  const styles = useStyles(makeStyles);
  const v = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const a = Animated.timing(v, {
      toValue: 1,
      duration: reduce ? 420 : 1150,
      easing: reduce ? Easing.linear : Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    a.start(({ finished }) => { if (finished) done.current(); });
    return () => a.stop();
  }, []);

  const body = reduce
    ? { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }
    : {
        opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1, 0] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.03, 0.94] }) },
          { translateY: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, -8] }) },
        ],
      };
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.stone, body]}>
        {!reduce && (
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { borderRadius: 16, backgroundColor: gold, opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.28, 0] }) }]}
          />
        )}
        <Text style={styles.stoneText}>{text}</Text>
      </Animated.View>
      {!reduce && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {DUST.map(([l, tp, dx, dy, s, d], k) => (
            <Animated.View
              key={k}
              style={{
                position: 'absolute', left: `${l}%`, top: `${tp}%`, width: s, height: s, borderRadius: s / 2,
                backgroundColor: gold,
                opacity: v.interpolate({ inputRange: [d, d + 0.12, 1], outputRange: [0, 1, 0], extrapolate: 'clamp' }),
                transform: [
                  { translateX: v.interpolate({ inputRange: [d, 1], outputRange: [0, dx], extrapolate: 'clamp' }) },
                  { translateY: v.interpolate({ inputRange: [d, 1], outputRange: [0, dy], extrapolate: 'clamp' }) },
                  { scale: v.interpolate({ inputRange: [d, 1], outputRange: [1, 0.3], extrapolate: 'clamp' }) },
                ],
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Seçim ya da sürükleme varken alanlar hafifçe atar ──
function Pulse({ active, style, children }: { active: boolean; style?: any; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) { v.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1.015, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active]);
  return <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>;
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { textAlign: 'center' },
  dim: { opacity: 0.45 },
  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: { shadowColor: '#1D2A2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  top: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 34 : 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 },
  closeBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topName: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.4, color: Colors.muted },
  topStep: { width: 44, textAlign: 'right', fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  segs: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 8 },
  seg: { flex: 1, height: 3, borderRadius: 3, backgroundColor: Colors.stone4 },
  segOn: { backgroundColor: Colors.sand },

  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  h1: { fontFamily: Fonts.cormorant, fontSize: 34, lineHeight: 40, color: Colors.text },
  lead: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 24, color: Colors.text2, marginTop: 8, marginBottom: 18 },
  label: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.8, color: Colors.muted, marginBottom: 8 },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: Colors.stone4,
    backgroundColor: Colors.stone2, color: Colors.text, paddingHorizontal: 14, fontFamily: Fonts.jost, fontSize: 16,
  },
  addBtn: { height: 50, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Colors.sand, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.onAccent },

  list: { gap: 10, marginTop: 18 },
  stone: {
    backgroundColor: Colors.stone2, borderWidth: 1.5, borderColor: Colors.stone4, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  stoneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingRight: 4, minHeight: 52 },
  stoneText: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 22, color: Colors.text },
  stoneSel: { backgroundColor: Colors.tint(0.1), borderColor: Colors.sand },
  stoneLifted: { borderColor: Colors.sand, opacity: 0.96 },
  liftedWrap: { zIndex: 10, elevation: 8 },
  removeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  hintBox: { marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.stone4, borderRadius: 16, padding: 16, gap: 8 },
  hintText: { fontFamily: Fonts.jost, fontSize: 15, lineHeight: 22, color: Colors.muted },
  linkBtn: { minHeight: 36, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand },
  count: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 10 },

  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 18, gap: 10 },
  primary: { minHeight: 52, borderRadius: 16, backgroundColor: Colors.sand, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  primaryText: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.onAccent, textAlign: 'center' },
  secondary: {
    minHeight: 50, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.stone4,
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12,
  },
  secondaryInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondaryText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text2 },
  note: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 18, color: Colors.muted, textAlign: 'center', marginTop: -2 },
  endRow: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  endBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  endMuted: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted },
  endAccent: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand },

  sortWrap: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  field: { flexGrow: 1, gap: 10 },
  fieldLifted: { zIndex: 5, elevation: 8 },
  emptyField: { fontFamily: Fonts.cormorantItalic, fontSize: 22, color: Colors.muted, textAlign: 'center', marginTop: 30 },
  choiceRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  choiceBtn: { flex: 1, minHeight: 46, borderRadius: 14 },

  zones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  zone: { height: 150, borderRadius: 20, padding: 14, gap: 8, borderWidth: 1.5 },
  zoneIn: { backgroundColor: Colors.tint(0.1), borderColor: Colors.tint(0.3) },
  zoneInActive: { borderColor: Colors.sand },
  zoneOut: { borderStyle: 'dashed', borderColor: Colors.stone4 },
  zoneOutActive: { borderColor: Colors.muted },
  zoneInLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.6, color: Colors.sand2 },
  zoneOutLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.6, color: Colors.muted },
  zoneHint: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 18, color: Colors.muted },
  zoneMeta: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2 },
  chip: {
    fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, backgroundColor: Colors.stone2,
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 9, overflow: 'hidden',
  },
  releasedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto' },
  goldDot: { width: 6, height: 6, borderRadius: 3 },
  releasedText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted },

  clearSub: { fontFamily: Fonts.cormorantItalic, fontSize: 21, lineHeight: 28, color: Colors.text2, textAlign: 'center', marginTop: 6 },
  divider: { height: 1, marginTop: 20, marginHorizontal: 40 },
  keptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.stone2,
    borderWidth: 1, borderColor: Colors.stone4, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  keptBox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  keptBoxOn: { backgroundColor: Colors.sand, borderColor: Colors.sand },
  keptOff: { opacity: 0.6 },
  letCard: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  letCardOn: { borderStyle: 'solid', borderColor: Colors.sand, backgroundColor: Colors.tint(0.08) },
  letText: { color: Colors.text2 },
  legend: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.muted, marginTop: 10 },
  keptText: { flex: 1, fontFamily: Fonts.jost, fontSize: 16, lineHeight: 22, color: Colors.text },
  partBadge: {
    fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1.2, color: Colors.sand2,
    backgroundColor: Colors.tint(0.1), borderRadius: 99, paddingVertical: 3, paddingHorizontal: 8, overflow: 'hidden',
  },

  scrim: { flex: 1, backgroundColor: Colors.isDark ? 'rgba(5,10,18,0.55)' : 'rgba(29,42,47,0.35)' },
  sheet: {
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30, gap: 4,
  },
  grip: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.stone4, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontFamily: Fonts.cormorant, fontSize: 26, lineHeight: 31, color: Colors.text },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
