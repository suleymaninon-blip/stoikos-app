import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal, Pressable, TextInput,
  Animated, Easing, Platform,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang, upper, localeOf } from '../constants/i18n';
import { getPrograms, getUpcoming, getProgress, getDoneAt, dayState, setDayDone, resetProgress, hasReflected, markReflected, Program } from '../constants/programs';
import { appendToJournalToday } from '../constants/journal';
import { usePlus } from '../constants/entitlement';
import { ENFORCE_PLUS_GATE } from '../constants/config';
import { maybeAskForReview } from '../constants/review';
import { Paywall } from '../components/Paywall';
import { LockIcon } from '../components/Icons';
import { FirstTip } from '../components/FirstTip';
import { CalmPressable } from '../components/CalmPressable';
import { StaggerSection } from '../components/StaggerSection';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { addTrace } from '../constants/traces';
import TraceSeal from '../components/TraceSeal';

// Liste kartındaki ilerleme çubuğu akıcı dolar ("Hareketi Azalt"ta doğrudan yerine gelir).
function ProgramBar({ pct }: { pct: number }) {
  const styles = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(0)).current;
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) { anim.setValue(pct); return; }
    Animated.timing(anim, { toValue: pct, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct, anim, reduce]);
  return (
    <View style={styles.cardTrack}>
      <Animated.View style={[styles.cardFill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
    </View>
  );
}

export default function ProgramsScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const programs = getPrograms(lang);
  const upcoming = getUpcoming(lang);
  const [progress, setProgress] = useState<Record<string, number[]>>({});
  const [doneAt, setDoneAt] = useState<Record<string, Record<number, string>>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const rootRef = useRef<View>(null);
  const daysRef = useRef<View>(null);
  // Son gün işaretlenince artar; kaydırma alanı yeniden kurulur ve en baştan (kapanış kartından) başlar.
  const [finishKey, setFinishKey] = useState(0);
  // Programlar Stoikos Plus'a dahil. Kilitliyken kart gizlenmiyor — ne olduğu
  // görünsün, dokununca ödeme duvarı açılsın; kapatmak yerine tanıtmak.
  const { plus, loading: plusLoading } = usePlus();
  // ⚠️ ENFORCE_PLUS_GATE geçici olarak false (bkz. constants/config.ts).
  // Ad bilerek `unlocked` değil: aşağıda gün kilidi için o ad kullanılıyor.
  const plusOk = plus || !ENFORCE_PLUS_GATE;
  const [paywallOpen, setPaywallOpen] = useState(false);
  // Bitiş akışı: kapanış yansıması (atlanabilir) + yeniden başlatma
  const [reflected, setReflected] = useState<Record<string, boolean>>({});
  const [reflection, setReflection] = useState('');
  const [restartArmed, setRestartArmed] = useState(false);
  // İzler: yedinci gün ilk kez bitince o programın sikkesi (sessiz mühür).
  const [sealPid, setSealPid] = useState<string | null>(null);

  // Ana ekrandaki "Kaldığın yer" kartı programı doğrudan açar (?open=<id>).
  // `day` verilirse o günün penceresi de açılır ("Bugünkü adımı aç").
  const params = useLocalSearchParams<{ open?: string; day?: string }>();
  // Ana ekrandan doğrudan açıldıysa geri tuşu listeye değil ana ekrana döner (29 Ekim 2026):
  // kullanıcı listeyi hiç görmeden gelmişti, geri basınca araya liste çıkması şaşırtıyordu.
  const [fromHome, setFromHome] = useState(false);
  useEffect(() => {
    const id = Array.isArray(params.open) ? params.open[0] : params.open;
    const day = Number(Array.isArray(params.day) ? params.day[0] : params.day);
    if (id && programs.some((p) => p.id === id)) {
      // Abonelik durumu henüz yüklenirken karar verme: abone kullanıcıya bir an ödeme penceresi açılıyordu.
      if (!plusOk) { if (!plusLoading) setPaywallOpen(true); return; }
      setPaywallOpen(false);
      setOpenId(id);
      setFromHome(true);
      // Gün henüz açılmadıysa (yarın açılır) pencere açılmaz; liste o günü notuyla gösterir.
      if (Number.isInteger(day) && day >= 0) {
        Promise.all([getProgress(id), getDoneAt(id)]).then(([d, at]) => { if (dayState(d, at, day) === 'open') setDayIdx(day); });
      }
    }
  }, [params.open, params.day, plusOk, plusLoading]);

  const rank = (p: { id: string; dayCount: number }) => {
    const n = (progress[p.id] || []).length;
    return n > 0 && n < p.dayCount ? 0 : n === 0 ? 1 : 2;
  };

  const loadAll = useCallback(async () => {
    const entries = await Promise.all(programs.map(async (p) => [p.id, await getProgress(p.id)] as const));
    setProgress(Object.fromEntries(entries));
    const ats = await Promise.all(programs.map(async (p) => [p.id, await getDoneAt(p.id)] as const));
    setDoneAt(Object.fromEntries(ats));
    const flags = await Promise.all(programs.map(async (p) => [p.id, await hasReflected(p.id)] as const));
    setReflected(Object.fromEntries(flags));
  }, [lang]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const open = openId ? programs.find((p) => p.id === openId) : null;

  async function toggleDay(pid: string, idx: number) {
    const done = (progress[pid] || []).includes(idx);
    const next = await setDayDone(pid, idx, !done);
    setProgress((prev) => ({ ...prev, [pid]: next }));
    getDoneAt(pid).then((at) => setDoneAt((prev) => ({ ...prev, [pid]: at })));

    // Bir yolculuk baştan sona bitti — değerlendirme istemi için ikinci
    // hak edilmiş an. (Geri alma işaretlenirken tetiklenmesin diye !done.)
    const total = programs.find((p) => p.id === pid)?.dayCount;
    if (!done && total != null && next.length === total) {
      maybeAskForReview('programDone');
      // Kapanış kartı ("Bu hafta sende ne değişti?") listenin başında beliriyor; son günü
      // işaretleyen kişi sayfanın altında kalıp onu görmeden geçiyordu (2 Kasım 2026,
      // kullanıcı geri bildirimi). Gün penceresi kapanınca (320 ms) kaydırma alanını yeniden
      // kurarak başa dön. (Web'de ScrollView ref'i burada boş geliyordu; yeniden kurmak her
      // platformda aynı çalışıyor.)
      setTimeout(() => setFinishKey((k) => k + 1), 380);
      // Sikke yalnız ilk bitişte verilir; yeniden başlatılıp bitirilince mühür tekrar çıkmaz.
      if (await addTrace(pid)) setTimeout(() => setSealPid(pid), 420);
    }
  }

  // Tamamlanmış gün her zaman açık kalır: önceki bir günün işareti geri alınınca sonraki
  // tamamlanmış gün kilitlenip kendi işaretini geri almak imkânsızlaşıyordu (29 Ekim 2026).
  // Günde bir gün (28 Kasım 2026): önceki gün BUGÜN bittiyse sıradaki gün yarın açılır (dayState).
  function isUnlocked(pid: string, idx: number): boolean {
    return dayState(progress[pid] || [], doneAt[pid] || {}, idx) === 'open';
  }
  const opensTomorrow = (pid: string, idx: number) => dayState(progress[pid] || [], doneAt[pid] || {}, idx) === 'tomorrow';

  const isComplete = (p: Program) => (progress[p.id] || []).length === p.dayCount;
  // Mühür penceresindeki "Sıradaki" düğmesi: bitiş kartındaki "Sırada" ile aynı seçim.
  const sealNext = sealPid ? programs.find((p) => p.id !== sealPid && !isComplete(p)) : undefined;

  /**
   * Kapanış yansımasını bugünün günlüğüne EKLER (üzerine yazmaz — günde tek
   * kayıt var, sabah yazılmış bir yansıma silinmemeli).
   *
   * Koç hafızasına GÖNDERİLMİYOR. Pratik ekranındaki KVKK onay kutusu günlük
   * yansımalar için verilmiş bir rıza; program kapanışını da oraya akıtmak
   * kullanıcının onayladığından fazlasını göndermek olurdu.
   */
  async function saveReflection(p: Program) {
    const txt = reflection.trim();
    if (txt) {
      await appendToJournalToday(`${t('programs.journalHeader', { program: p.title })}\n${txt}`);
    }
    await markReflected(p.id);
    setReflected((prev) => ({ ...prev, [p.id]: true }));
    setReflection('');
  }

  /** Atlamak da "cevaplandı" sayılıyor — bitirmiş kullanıcıya ısrar edilmiyor. */
  async function skipReflection(p: Program) {
    await markReflected(p.id);
    setReflected((prev) => ({ ...prev, [p.id]: true }));
    setReflection('');
  }

  async function restart(pid: string) {
    await resetProgress(pid);
    setProgress((prev) => ({ ...prev, [pid]: [] }));
    setReflected((prev) => ({ ...prev, [pid]: false }));
    setRestartArmed(false);
  }

  // ─── DETAY ───
  if (open) {
    const done = progress[open.id] || [];
    return (
      <SafeAreaView ref={rootRef} style={styles.container}>
        <LinearGradient colors={[open.color, 'transparent']} style={styles.grad} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
        <View style={styles.topBar}>
          <CalmPressable onPress={() => (fromHome ? (router.canGoBack() ? router.back() : router.replace('/')) : setOpenId(null))} style={[styles.backBtn, styles.cardShadow]} pressScale={0.94}>
            <Text style={styles.backIcon}>‹</Text>
          </CalmPressable>
        </View>
        <ScrollView key={finishKey} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <StaggerSection delay={0}>
            <Text style={styles.detailIcon}>{open.icon}</Text>
            <Text style={styles.detailTitle}>{open.title}</Text>
            <Text style={styles.detailSub}>{open.subtitle}</Text>
            <Text style={styles.detailProgress}>{t('programs.progress', { done: done.length, total: open.dayCount })}</Text>
          </StaggerSection>
          {done.length === open.dayCount && (() => {
            // Bitiş akışı. Amaç 6. programa zincirlemek değil — yolculuklar
            // giriş rampası, günlük pratik ise sonsuza dek tekrar eden asıl iş.
            const next = programs.find((p) => p.id !== open.id && !isComplete(p));
            return (
              <StaggerSection delay={80}>
              <View style={[styles.finishBox, styles.cardShadow]}>
                <Text style={styles.finished}>{t('programs.finished')}</Text>

                {!reflected[open.id] ? (
                  <View style={styles.reflectWrap}>
                    <Text style={styles.reflectPrompt}>{t('programs.reflectPrompt')}</Text>
                    <Text style={styles.reflectHint}>{t('programs.reflectHint')}</Text>
                    <TextInput keyboardAppearance={Colors.isDark ? 'dark' : 'light'}
                      style={styles.reflectInput}
                      value={reflection}
                      onChangeText={setReflection}
                      placeholder={t('programs.reflectPlaceholder')}
                      placeholderTextColor={Colors.muted}
                      multiline
                      textAlignVertical="top"
                    />
                    <Text style={styles.reflectNote}>{t('programs.reflectNote')}</Text>
                    <View style={styles.reflectRow}>
                      <TouchableOpacity onPress={() => skipReflection(open)} hitSlop={8}>
                        <Text style={styles.reflectSkip}>{t('programs.reflectSkip')}</Text>
                      </TouchableOpacity>
                      <CalmPressable
                        style={[styles.reflectBtn, !reflection.trim() && styles.reflectBtnOff]}
                        onPress={() => saveReflection(open)}
                        disabled={!reflection.trim()}
                      >
                        <Text style={styles.reflectBtnText}>{t('programs.reflectSave')}</Text>
                      </CalmPressable>
                    </View>
                  </View>
                ) : (
                  // Dokunulabilir (2 Kasım 2026): yansımaların nerede durduğu belli değildi.
                  <TouchableOpacity onPress={() => router.push('/journal')} hitSlop={8} activeOpacity={0.7} accessibilityRole="link">
                    <Text style={styles.reflectSaved}>{t('programs.reflectSaved')} · <Text style={styles.reflectView}>{t('journal.view')}</Text></Text>
                  </TouchableOpacity>
                )}

                {next ? (
                  <CalmPressable
                    style={styles.nextBtn}
                    onPress={() => { setOpenId(next.id); setRestartArmed(false); }}
                  >
                    <Text style={styles.nextLabel}>{upper(t('programs.nextUp'), lang)}</Text>
                    <Text style={styles.nextTitle}>{next.icon}  {next.title}</Text>
                  </CalmPressable>
                ) : (
                  <View style={styles.allDoneBox}>
                    <Text style={styles.allDoneTitle}>{t('programs.allDone')}</Text>
                    <Text style={styles.allDoneBody}>{t('programs.allDoneBody')}</Text>
                    <CalmPressable
                      style={styles.practiceBtn}
                      onPress={() => router.replace('/(tabs)/practice')}
                    >
                      <Text style={styles.practiceBtnText}>{t('programs.toPractice')}</Text>
                    </CalmPressable>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => (restartArmed ? restart(open.id) : setRestartArmed(true))}
                  hitSlop={8}
                >
                  <Text style={[styles.restart, restartArmed && styles.restartArmed]}>
                    {restartArmed ? t('programs.restartConfirm') : t('programs.restart')}
                  </Text>
                </TouchableOpacity>
              </View>
              </StaggerSection>
            );
          })()}

          <View style={{ marginTop: 20 }}>
            {open.days.map((d, i) => {
              const unlocked = isUnlocked(open.id, i);
              const completed = done.includes(i);
              return (
                <StaggerSection key={i} delay={Math.min(80 + i * 45, 360)}>
                <View ref={i === 0 ? daysRef : undefined} collapsable={false}>
                <CalmPressable
                  disabled={!unlocked}
                  style={[styles.dayRow, styles.cardShadow, !unlocked && styles.dayRowLocked]}
                  onPress={() => unlocked && setDayIdx(i)}
                >
                  <View style={[styles.dayNum, completed && styles.dayNumDone, !unlocked && styles.dayNumLocked]}>
                    <Text style={[styles.dayNumText, completed && styles.dayNumTextDone]}>{completed ? '✓' : unlocked ? i + 1 : ''}</Text>
                    {!completed && !unlocked && <LockIcon size={15} color={Colors.muted} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayLabel}>{t('programs.day')} {i + 1}</Text>
                    <Text style={[styles.dayTitle, !unlocked && styles.dayTitleLocked]}>{d.title}</Text>
                    {opensTomorrow(open.id, i) && <Text style={styles.dayTomorrow}>{t('programs.tomorrowNote')}</Text>}
                  </View>
                  {unlocked && <Text style={styles.dayChevron}>›</Text>}
                </CalmPressable>
                </View>
                </StaggerSection>
              );
            })}
          </View>
        </ScrollView>

        {/* Gün kartı */}
        <Modal transparent visible={dayIdx !== null} animationType="fade" onRequestClose={() => setDayIdx(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setDayIdx(null)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {dayIdx !== null && (() => {
                const d = open.days[dayIdx];
                const completed = done.includes(dayIdx);
                return (
                  <>
                    {/* Kart neredeyse tüm ekranı kaplıyor; dışına dokunmak iPhone'da tek kapanma yolu olmamalı. */}
                    <TouchableOpacity onPress={() => setDayIdx(null)} style={styles.modalClose} accessibilityRole="button" accessibilityLabel={t('practice.close')} hitSlop={6}>
                      <Text style={styles.modalCloseText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalDayLabel}>{t('programs.dayOf', { n: dayIdx + 1, total: open.dayCount })}</Text>
                    <Text style={styles.modalTitle}>{d.title}</Text>
                    <View style={styles.modalDivider} />
                    {d.read ? (
                      // Zenginleştirilmiş gün: kısa okuma → bugünün pratiği → akşam sorusu
                      <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalRead}>{d.read}</Text>
                        <View style={styles.modalBox}>
                          <Text style={styles.modalBoxLabel}>{upper(t('programs.todayPractice'), lang)}</Text>
                          <Text style={styles.modalBoxText}>{d.body}</Text>
                        </View>
                        {d.ask && (
                          <View style={styles.modalAsk}>
                            <Text style={styles.modalBoxLabel}>{upper(t('programs.eveningAsk'), lang)}</Text>
                            <Text style={styles.modalAskText}>{d.ask}</Text>
                          </View>
                        )}
                      </ScrollView>
                    ) : (
                      <Text style={styles.modalBody}>{d.body}</Text>
                    )}
                    <TouchableOpacity
                      style={[styles.modalBtn, completed && styles.modalBtnDone]}
                      onPress={() => {
                        toggleDay(open.id, dayIdx!);
                        // Pratik ekranıyla aynı davranış: tamamlayınca kısa bir
                        // "✦ Tamamlandı" onayı görünsün, sonra kart kendiliğinden
                        // kapansın; geri alınca hemen kapansın. Kart açık kalırsa
                        // hem yeni açılan günü hem de 7. günde beliren bitiş
                        // bloğunu örtüyordu.
                        if (completed) setDayIdx(null);
                        else setTimeout(() => setDayIdx(null), 320);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.modalBtnText, completed && styles.modalBtnTextDone]}>
                        {completed ? t('programs.undo') : t('programs.complete')}
                      </Text>
                    </TouchableOpacity>

                    {completed && <Text style={styles.modalDoneNote}>✦ {t('programs.done')}</Text>}
                  </>
                );
              })()}
            </Pressable>
          </Pressable>
        </Modal>
        <FirstTip id="programs" text={t('tip.programs')} target={daysRef} container={rootRef} enabled={!sealPid} />
        <TraceSeal
          pid={sealPid}
          programTitle={programs.find((p) => p.id === sealPid)?.title ?? ''}
          nextTitle={sealNext?.title}
          onNext={sealNext ? () => { setSealPid(null); setRestartArmed(false); setDayIdx(null); setOpenId(sealNext.id); } : undefined}
          onContinue={() => setSealPid(null)}
          onSeeAll={() => { setSealPid(null); router.navigate({ pathname: '/(tabs)/progress', params: { focus: 'traces' } }); }}
        />
      </SafeAreaView>
    );
  }

  // ─── LİSTE ───
  const sortedPrograms = [...programs].sort((a, b) => rank(a) - rank(b));
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']} style={styles.grad} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <View style={styles.topBar}>
        <CalmPressable onPress={() => router.back()} style={[styles.backBtn, styles.cardShadow]} pressScale={0.94}>
          <Text style={styles.backIcon}>‹</Text>
        </CalmPressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StaggerSection delay={0}>
          <Text style={styles.title}>{t('programs.title')}</Text>
          <Text style={styles.subtitle}>{t('programs.subtitle')}</Text>
        </StaggerSection>

        <View style={{ marginTop: 22, gap: 14 }}>
          {/* Devam eden program en üstte, sonra başlanmamışlar, bitenler en altta (22 Ekim 2026). */}
          {sortedPrograms.map((p, i) => {
            const done = (progress[p.id] || []).length;
            const pct = done / p.dayCount;
            const label = done === 0 ? t('programs.start') : done === p.dayCount ? t('programs.review') : t('programs.continue');
            return (
              <StaggerSection key={p.id} delay={Math.min(70 + i * 55, 350)}>
              <CalmPressable
                style={[styles.card, styles.cardShadow, { backgroundColor: p.color }]}
                onPress={() => (plusOk ? setOpenId(p.id) : setPaywallOpen(true))}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardSub}>{p.subtitle}</Text>
                  </View>
                  {p.isNew && done === 0 && <Text style={styles.newBadge}>{upper(t('programs.newTag'), lang)}</Text>}
                  {!plusOk && <Text style={styles.cardBadge}>{t('plus.badge')}</Text>}
                </View>
                <ProgramBar pct={pct} />
                <View style={styles.cardFoot}>
                  <Text style={styles.cardProgress}>{t('programs.progress', { done, total: p.dayCount })}</Text>
                  <Text style={styles.cardCta}>{plusOk ? `${label} →` : t('plus.unlock')}</Text>
                </View>
              </CalmPressable>
              </StaggerSection>
            );
          })}

          {/* Sıradaki program (15 Kasım 2026): abone devamın geldiğini görsün. Dokunulmaz; tarih yoksa "her ay" sözü. */}
          {upcoming && (
            <StaggerSection delay={Math.min(70 + sortedPrograms.length * 55, 420)}>
            <View style={styles.soonCard} accessible accessibilityLabel={`${t('programs.soonTag')}: ${upcoming.title}`}>
              <View style={styles.cardHead}>
                <Text style={[styles.cardIcon, styles.soonIcon]}>{upcoming.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.soonTag}>{upper(t('programs.soonTag'), lang)}</Text>
                  <Text style={styles.cardTitle}>{upcoming.title}</Text>
                  <Text style={styles.cardSub}>{upcoming.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.soonFoot}>
                {upcoming.releaseAt
                  ? t('programs.soonOn', { date: upcoming.releaseAt.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long' }) })
                  : t('programs.monthly')}
              </Text>
            </View>
            </StaggerSection>
          )}
        </View>
      </ScrollView>
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: {
          shadowColor: '#1D2A2F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  newBadge: {
    fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1.4, color: Colors.onAccent,
    backgroundColor: Colors.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden',
  },
  soonCard: {
    borderRadius: 24, padding: 20, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: Colors.tint(0.35), backgroundColor: Colors.tint(0.04),
  },
  soonIcon: { opacity: 0.6 },
  soonTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.sand, marginBottom: 4 },
  soonFoot: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  cardBadge: {
    fontFamily: Fonts.jost, fontSize: 11, letterSpacing: 1.4, color: Colors.sand,
    borderWidth: 1, borderColor: Colors.tint(0.4), borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, overflow: 'hidden',
  },
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  topBar: { paddingHorizontal: 16, paddingTop: 8, height: 48, justifyContent: 'center' },
  backBtn: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  backIcon: { fontSize: 26, color: Colors.sand2, marginTop: -3 },
  scroll: { padding: 24, paddingTop: 8, paddingBottom: 48 },
  title: { fontFamily: Fonts.cinzel, fontSize: 24, color: Colors.text, letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, letterSpacing: 0.3 },

  // Liste kartı
  card: { borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.overlay(0.07) },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  cardIcon: { fontSize: 30, color: Colors.sand2 },
  cardTitle: { fontFamily: Fonts.cinzel, fontSize: 17, color: Colors.text, letterSpacing: 0.3, marginBottom: 2 },
  cardSub: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2 },
  cardTrack: { height: 5, backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  cardFill: { height: '100%', backgroundColor: Colors.sand, borderRadius: 3 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProgress: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted },
  cardCta: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand2, letterSpacing: 0.5 },

  // Detay
  detailIcon: { fontSize: 44, color: Colors.sand2, textAlign: 'center' },
  detailTitle: { fontFamily: Fonts.cinzel, fontSize: 24, color: Colors.text, textAlign: 'center', letterSpacing: 0.4, marginTop: 8 },
  detailSub: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 4 },
  detailProgress: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.sand, textAlign: 'center', letterSpacing: 1, marginTop: 12 },
  finished: { fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.sand, textAlign: 'center', marginTop: 6 },

  // ─── Bitiş akışı ───
  finishBox: {
    marginTop: 18, backgroundColor: Colors.stone2, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: Colors.tint(0.18), gap: 16,
  },
  reflectWrap: { gap: 8 },
  reflectPrompt: { fontFamily: Fonts.cormorant, fontSize: 19, color: Colors.text, textAlign: 'center' },
  reflectHint: { fontFamily: Fonts.jostLight, fontSize: 13, color: Colors.muted, textAlign: 'center' },
  reflectInput: {
    marginTop: 4, minHeight: 96, backgroundColor: Colors.stone, borderRadius: 14, padding: 14,
    fontFamily: Fonts.jost, fontSize: 16, color: Colors.text,
    borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  reflectNote: { fontFamily: Fonts.jostLight, fontSize: 13, color: Colors.muted, textAlign: 'center' },
  reflectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  reflectSkip: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted },
  reflectBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 22 },
  reflectBtnOff: { opacity: 0.35 },
  reflectBtnText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.bg, letterSpacing: 0.4 },
  reflectSaved: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.sand2, textAlign: 'center', paddingVertical: 8 },
  reflectView: { fontFamily: Fonts.jostMedium, textDecorationLine: 'underline' },

  nextBtn: {
    backgroundColor: Colors.stone3, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.tint(0.22), gap: 4,
  },
  nextLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand },
  nextTitle: { fontFamily: Fonts.cormorant, fontSize: 20, color: Colors.text },

  allDoneBox: { gap: 10 },
  allDoneTitle: { fontFamily: Fonts.cormorant, fontSize: 20, color: Colors.text, textAlign: 'center' },
  allDoneBody: { fontFamily: Fonts.jostLight, fontSize: 14.5, lineHeight: 23, color: Colors.text2, textAlign: 'center' },
  practiceBtn: { marginTop: 4, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  practiceBtnText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.bg, letterSpacing: 0.4 },

  restart: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.faint, textAlign: 'center' },
  restartArmed: { color: Colors.sand },

  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.stone2,
    borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  dayRowLocked: { opacity: 0.55 },
  dayNum: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: Colors.tint(0.4),
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dayNumDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayNumLocked: { borderColor: Colors.overlay(0.12) },
  dayNumText: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand2 },
  dayNumTextDone: { color: Colors.stone },
  dayLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.5, color: Colors.muted, marginBottom: 2 },
  dayTitle: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.text },
  dayTitleLocked: { color: Colors.muted, fontFamily: Fonts.jost },
  dayTomorrow: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 18, color: Colors.sand2, marginTop: 4 },
  dayChevron: { fontSize: 20, color: Colors.stone4 },

  // Gün modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    width: '100%', backgroundColor: Colors.stone2, borderRadius: 28, padding: 28,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.tint(0.25),
  },
  modalClose: {
    position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3, zIndex: 2,
  },
  modalCloseText: { fontSize: 16, color: Colors.text2 },
  modalDayLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 8 },
  modalTitle: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  modalDivider: { width: 40, height: 2, backgroundColor: Colors.tint(0.4), borderRadius: 1, marginVertical: 18 },
  modalScroll: { alignSelf: 'stretch', maxHeight: 460, marginBottom: 20 },
  modalRead: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26, marginBottom: 18 },
  modalBox: {
    backgroundColor: Colors.tint(0.08), borderRadius: 16, borderWidth: 1,
    borderColor: Colors.tint(0.22), padding: 16, marginBottom: 14,
  },
  modalBoxLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 8 },
  modalBoxText: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text, lineHeight: 25 },
  modalAsk: { paddingHorizontal: 4 },
  modalAskText: { fontFamily: Fonts.cormorantItalic, fontSize: 19, color: Colors.sand3, lineHeight: 27 },
  modalBody: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand3, lineHeight: 26, textAlign: 'center', marginBottom: 26 },
  modalBtn: { width: '100%', backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  modalBtnDone: { backgroundColor: Colors.stone3, borderWidth: 1, borderColor: Colors.overlay(0.1) },
  modalBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },
  modalBtnTextDone: { color: Colors.muted },
  // Pratik ekranındakiyle birebir aynı — iki ekran aynı onayı göstermeli.
  modalDoneNote: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.sand, marginTop: 14 },
});
