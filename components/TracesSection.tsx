import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Fonts } from '../constants/theme';
import { useStyles, useTheme, type Palette } from '../constants/themeContext';
import { localeOf, upper, useLang } from '../constants/i18n';
import { getPrograms, getProgress, getUpcomingAll } from '../constants/programs';
import { backfillTraces, type TraceMap } from '../constants/traces';
import { useReduceMotion } from '../hooks/useReduceMotion';
import TraceCoin, { type TraceState } from './TraceCoin';
import { CalmPressable } from './CalmPressable';
import TraceShare from './TraceShare';

/**
 * İlerleme → İzler (22 Kasım 2026; tasarım
 * https://claude.ai/artifact/BDgiRmFzWyeSVGoUKayzio#play-Kese).
 * Her program için bir yuva: kazanılan sikke renkli, kazanılmamış kesik
 * çizgili ("henüz yürünmedi" — "kilitli" değil), yayımlanmamış program
 * noktalı ("yakında"). Dokununca alttan ayrıntı. Sayı yalnız "3 / 10";
 * sıralama, seri, puan yok.
 */
interface Slot { id: string; title: string; icon: string; state: TraceState; date: string | null }

export default function TracesSection() {
  const styles = useStyles(makeStyles);
  const { C } = useTheme();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [sel, setSel] = useState<Slot | null>(null);
  // Kazanılmış sikkede "Bir arkadaşına öner": aynı Modal'ın içinde kart önizlemesine geçer.
  const [sharing, setSharing] = useState(false);
  const sheet = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    const programs = getPrograms(lang);
    const prog = await Promise.all(programs.map(async (p) => [p, await getProgress(p.id)] as const));
    // Özellikten önce bitirilmiş programlar sikkesini burada kendiliğinden alır.
    const traces: TraceMap = await backfillTraces(prog.filter(([p, d]) => d.length >= p.dayCount).map(([p]) => p.id));
    const released: Slot[] = programs.map((p) => ({
      id: p.id, title: p.title, icon: p.icon,
      state: p.id in traces ? 'earned' : 'locked',
      date: traces[p.id] || null,
    }));
    const soon: Slot[] = getUpcomingAll(lang).map((p) => ({ id: p.id, title: p.title, icon: p.icon, state: 'soon', date: null }));
    setSlots([...released, ...soon]);
  }, [lang]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!sel) { setSharing(false); return; }
    sheet.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(sheet, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [sel]);

  if (!slots.length) return null;
  const releasedCount = slots.filter((s) => s.state !== 'soon').length;
  const earnedCount = slots.filter((s) => s.state === 'earned').length;

  const a11y = (s: Slot) =>
    t(s.state === 'earned' ? 'trace.earnedA11y' : s.state === 'soon' ? 'trace.soonA11y' : 'trace.lockedA11y', { name: s.title });
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });

  const goProgram = (id: string) => { setSel(null); router.push(`/programs?open=${id}`); };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.label}>{upper(t('trace.title'), lang)}</Text>
        <View style={styles.line} />
        <Text style={styles.count}>{earnedCount} / {releasedCount}</Text>
      </View>
      <Text style={styles.sub}>{t('trace.sub')}</Text>

      <View style={styles.grid}>
        {slots.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setSel(s)}
            style={({ pressed }) => [styles.cell, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={a11y(s)}
          >
            <TraceCoin pid={s.id} state={s.state} size={72} glyph={s.icon} />
            <Text style={[styles.cellText, s.state !== 'earned' && styles.cellTextDim]} numberOfLines={2}>
              {s.state === 'soon' ? t('trace.soonTag') : s.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal transparent visible={!!sel} animationType="fade" onRequestClose={() => (sharing ? setSharing(false) : setSel(null))}>
        <Pressable style={styles.scrim} onPress={() => setSel(null)} accessibilityLabel={t('trace.close')} />
        {sel && sharing && <TraceShare pid={sel.id} title={sel.title} onBack={() => setSharing(false)} />}
        {sel && !sharing && (
          <Animated.View
            accessibilityViewIsModal
            style={[styles.sheet, { transform: [{ translateY: sheet.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] }]}
          >
            <View style={styles.grab} />
            <Text style={[styles.tag, sel.state !== 'earned' && { color: C.muted }]}>
              {upper(t(sel.state === 'earned' ? 'trace.tag' : sel.state === 'soon' ? 'trace.soonTag' : 'trace.lockedTag'), lang)}
            </Text>
            <View style={{ marginTop: 18 }}>
              <TraceCoin pid={sel.id} state={sel.state} size={132} glyph={sel.icon} />
            </View>
            <Text style={styles.title}>{sel.state === 'soon' ? sel.title : t('trace.coinTitle', { name: sel.title })}</Text>
            {sel.state === 'earned' && <Text style={styles.motif}>{t(`trace.m.${sel.id}`)}</Text>}
            <Text style={styles.body}>
              {sel.state === 'earned'
                ? (sel.date ? t('trace.walked', { date: fmt(sel.date) }) : t('trace.walkedNoDate'))
                : sel.state === 'soon' ? t('trace.soonBody') : t('trace.lockedBody', { name: sel.title })}
            </Text>
            <View style={styles.actions}>
              {sel.state === 'locked' && (
                <CalmPressable onPress={() => goProgram(sel.id)} style={[styles.primary, { backgroundColor: C.accent }]}>
                  <Text style={styles.primaryText}>{t('trace.goProgram')}</Text>
                </CalmPressable>
              )}
              {sel.state === 'earned' && (
                <CalmPressable onPress={() => setSharing(true)} style={[styles.primary, { backgroundColor: C.accent }]} accessibilityHint={t('trace.shareHint')}>
                  <Text style={styles.primaryText}>{t('trace.share')}</Text>
                </CalmPressable>
              )}
              {sel.state === 'earned' && (
                <CalmPressable onPress={() => goProgram(sel.id)} style={styles.secondary}>
                  <Text style={styles.secondaryText}>{t('trace.viewProgram')}</Text>
                </CalmPressable>
              )}
              <Pressable onPress={() => setSel(null)} style={styles.close} accessibilityRole="button" hitSlop={6}>
                <Text style={styles.closeText}>{t('trace.close')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </Modal>
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  wrap: { marginBottom: 24 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  label: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.2, color: Colors.sand },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.stone4 },
  count: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  sub: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 21, color: Colors.text2, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -4 },
  cell: { width: '33.33%', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 6, gap: 6, minHeight: 44 },
  cellText: { fontFamily: Fonts.jost, fontSize: 12, lineHeight: 15, color: Colors.text2, textAlign: 'center' },
  cellTextDim: { color: Colors.faint },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,16,24,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingTop: 14, paddingHorizontal: 28, paddingBottom: 34, alignItems: 'center',
  },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.stone4 },
  tag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.2, color: Colors.sand, marginTop: 22 },
  title: { fontFamily: Fonts.cormorant, fontSize: 28, lineHeight: 33, color: Colors.text, textAlign: 'center', marginTop: 16 },
  motif: { fontFamily: Fonts.cormorantItalic, fontSize: 18, lineHeight: 25, color: Colors.sand2, textAlign: 'center', marginTop: 6 },
  body: { fontFamily: Fonts.jost, fontSize: 15, lineHeight: 23, color: Colors.text2, textAlign: 'center', marginTop: 12 },
  actions: { alignSelf: 'stretch', alignItems: 'stretch', gap: 6, marginTop: 22 },
  primary: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.onAccent },
  secondary: { height: 50, borderRadius: 16, borderWidth: 1, borderColor: Colors.stone4, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand2 },
  close: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  closeText: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted },
});
