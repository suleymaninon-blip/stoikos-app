import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { MoonIcon } from '../../components/Icons';
import { getTodaysQuote, getMoodQuote, MOOD_THEMES } from '../../constants/content';
import { getPrograms, getProgress, Program } from '../../constants/programs';
import { useLang, localeOf, upper } from '../../constants/i18n';
import { useStreak } from '../../hooks/useStreak';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { StaggerSection } from '../../components/StaggerSection';
import { CalmPressable } from '../../components/CalmPressable';
import { MoodBloom, type MoodOrigin } from '../../components/MoodBloom';
import { QuoteCard } from '../../components/QuoteCard';
import { PaperBg } from '../../components/PaperBg';
import BreathOrb from '../../components/BreathOrb';
import { FEATURES } from '../../constants/config';
import { FirstTip } from '../../components/FirstTip';
import { TogetherCard, TogetherModal } from '../../components/TogetherBreath';
import { PulseRow, MemberWelcome } from '../../components/StoaPulse';
import { inCardWindow, localDay } from '../../constants/together';

const COMPLETED_KEY = 'stoikos_completed_';
const ALL_EXERCISE_IDS = ['neg_vis', 'intention', 'memento', 'review', 'gratitude'];

// Program rengi rgba(r,g,b,0.18) olarak tutuluyor; kartın çerçevesi ve yazısı
// için aynı rengin başka opaklıkları gerekiyor.
const tint = (color: string, a: number) => color.replace(/[\d.]+\)\s*$/, `${a})`);

// next: ilk tamamlanmamış gün (aradaki bir günün işareti geri alınmış olabilir; sayı yetmez)
type Resume = { program: Program; done: number[]; next: number; started: boolean };

// ── Kaldığın yer: yarım kalan program, yoksa başlanmamış ilk program ──
// Alt menüde olmayan tek bölüm; eskiden listenin en sonundaydı (22 Ekim 2026).
function ResumeCard({ resume }: { resume: Resume }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const { program, done, next, started } = resume;
  const day = program.days[Math.min(next, program.dayCount - 1)];
  const c = program.color;

  return (
    <CalmPressable
      style={[
        styles.resume,
        styles.cardShadow,
        { backgroundColor: tint(c, Colors.isDark ? 0.08 : 0.06), borderColor: tint(c, Colors.isDark ? 0.35 : 0.28) },
      ]}
      onPress={() =>
        router.push({
          pathname: '/programs',
          params: started ? { open: program.id, day: String(next) } : { open: program.id },
        })
      }
    >
      <PaperBg radius={24} />
      <View style={styles.resumeTop}>
        <Text style={[styles.resumeLabel, { color: tint(c, 1) }]}>
          {t(started ? 'home.resume' : 'home.startJourney')}
        </Text>
        {started && (
          <View style={[styles.dayPill, { backgroundColor: tint(c, 0.14) }]}>
            <Text style={[styles.resumeDay, { color: tint(c, 1) }]}>
              {t('programs.dayOf', { n: next + 1, total: program.dayCount })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.resumeMain}>
        <View style={[styles.resumeIconBox, { backgroundColor: tint(c, 0.16) }]}>
          <Text style={[styles.resumeIcon, { color: tint(c, 1) }]}>{program.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resumeTitle}>{program.title}</Text>
          <Text style={styles.resumeStep} numberOfLines={2}>
            {started ? day.title : program.subtitle}
          </Text>
        </View>
      </View>

      {started && (
        <View style={styles.resumeBar}>
          {program.days.map((_, i) => (
            <View
              key={i}
              style={[
                styles.resumeSeg,
                {
                  backgroundColor: done.includes(i)
                    ? tint(c, 1)
                    : i === next
                    ? tint(c, 0.42)
                    : Colors.overlay(0.07),
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Metinlerde ok zaten var ("Bugünkü adımı aç →"); ayrıca ok çizilmez. */}
      <Text style={[styles.resumeCta, { color: tint(c, 1) }]}>
        {t(started ? 'home.openStep' : 'home.startProgram')}
      </Text>
    </CalmPressable>
  );
}

// ── Bugün aklında ne var? — seçilen temadan bugünün sözü ──
// (11 Kasım 2026, kullanıcı seçimi C; tasarım https://claude.ai/artifact/DJVJ7UFJbmBz8iXJc3J3RQ.)
// Her temanın kendi rengi var. İlk üçü zor gelenler (kaygı, öfke, yas), sonrakiler aranan şeyler: MOOD_THEMES sırası.
// [koyu temada, açık temada] — açık zeminde daha koyu ton (beyaz yazı okunsun).
const MOOD_COLORS: Record<string, [string, string]> = {
  kaygi: ['#B9B4E0', '#6F66BD'], ofke: ['#E89A72', '#B5532A'], yas: ['#8FAEDB', '#4A72B2'],
  kabul: ['#9AD3B0', '#3F8A62'], kontrol: ['#86BDD0', '#32809A'], 'ic-huzur': ['#7CCFC4', '#258577'],
  cesaret: ['#E8BE6A', '#A06C0C'], sukran: ['#E2B4C4', '#B25A7C'], sadelik: ['#C4CF96', '#74842F'],
};

function MoodPicker() {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const { t, lang } = useLang();
  const [mood, setMood] = useState<string | null>(null);
  // Kutu kapalı durur (yalnız başlık + dokuz renkli noktadan küçük bir çiçek). Dokununca ekranı kaplayan
  // duygu çiçeği dokunulan noktadan dönerek açılır (components/MoodBloom.tsx; 13 Kasım 2026, kullanıcı:
  // "nefes orbu gibi genişleyerek açılsa"). Seçince çiçek toplanır, söz kartta kalır.
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<MoodOrigin>(null);
  const budRef = useRef<View>(null);
  const reduce = useReduceMotion();

  // Tomurcuğun çok yavaş, huzurlu dönüşü ("Hareketi Azalt"ta durur)
  const budSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { budSpin.setValue(0); return; }
    const loop = Animated.loop(
      Animated.timing(budSpin, {
        toValue: 1,
        duration: 36000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [budSpin, reduce]);

  const spinInterpolate = budSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Seçilen duygu sözünün yumuşak açılışı
  const quoteFade = useRef(new Animated.Value(0)).current;
  const quoteSlide = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    if (mood && reduce) { quoteFade.setValue(1); quoteSlide.setValue(0); return; }
    if (mood) {
      quoteFade.setValue(0);
      quoteSlide.setValue(8);
      Animated.parallel([
        Animated.timing(quoteFade, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(quoteSlide, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [mood, quoteFade, quoteSlide, reduce]);

  const openBloom = () => {
    const show = (o: MoodOrigin) => { setOrigin(o); setOpen(true); };
    if (!budRef.current) return show(null);
    budRef.current.measureInWindow((x, y, w, h) =>
      show(Number.isFinite(x) && w > 0 ? { x: x + w / 2, y: y + h / 2 } : null)
    );
  };

  const picked = mood ? getMoodQuote(mood, lang) : null;
  const colorOf = (m: string) => (MOOD_COLORS[m] ?? [Colors.sand, Colors.sand])[Colors.isDark ? 0 : 1];
  const onColor = Colors.isDark ? '#0F1824' : '#FFFFFF';

  return (
    <View style={[styles.moodCard, styles.cardShadow]}>
      <PaperBg radius={24} />
      <CalmPressable
        onPress={openBloom}
        style={styles.moodHead}
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('mood.title')}
        accessibilityHint={t('mood.hint')}
      >
        <View style={styles.moodHeadText}>
          <Text style={styles.moodTitle}>{t('mood.title')}</Text>
          {!mood && <Text style={styles.moodHint}>{t('mood.hint')}</Text>}
        </View>

        <View ref={budRef} collapsable={false} style={styles.moodBud}>
          <Animated.View style={[styles.moodBudInner, { transform: [{ rotate: spinInterpolate }] }]}>
            {MOOD_THEMES.map((m, i) => {
              const a = -Math.PI / 2 + (i / MOOD_THEMES.length) * Math.PI * 2;
              return (
                <View
                  key={m}
                  style={[
                    styles.moodBudDot,
                    {
                      backgroundColor: colorOf(m),
                      transform: [{ translateX: Math.cos(a) * 15 }, { translateY: Math.sin(a) * 15 }],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
        </View>
      </CalmPressable>

      <MoodBloom
        visible={open}
        origin={origin}
        moods={MOOD_THEMES}
        selected={mood}
        colorOf={colorOf}
        onColor={onColor}
        onPick={(m) => setMood(mood === m ? null : m)}
        onClose={() => setOpen(false)}
      />

      {mood && picked && (
        <Animated.View style={[styles.moodQuote, { opacity: quoteFade, transform: [{ translateY: quoteSlide }] }]}>
          <View style={styles.moodTagRow}>
            <View style={[styles.chipDot, { backgroundColor: colorOf(mood) }]} />
            <Text style={styles.moodTag}>{upper(t(`mood.${mood}`), lang)}</Text>
          </View>
          <Text style={styles.moodQuoteText}>{picked.quote.text}</Text>
          <Text style={styles.moodQuoteMeta}>
            — {picked.quote.author}
            {picked.quote.source && picked.quote.source !== picked.quote.author ? ` · ${picked.quote.source}` : ''}
          </Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/wisdom', params: { mood } })}
            hitSlop={8}
            style={styles.moodLinkBtn}
          >
            <Text style={styles.moodLink}>
              {t('home.moodLink', { theme: t(`mood.${mood}`), n: picked.count })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const { streak, weekDays, refresh } = useStreak();
  const [practiceDone, setPracticeDone] = useState(0);
  const [resume, setResume] = useState<Resume | null>(null);

  // Birlikte nefes (15 Kasım 2026): kart 20:45–21:15 arası; "Bu akşam değil" o günlük gizler.
  // Bildirime dokununca `/?together=1` ile pencere doğrudan açılır.
  const [pulseKey, setPulseKey] = useState(0);
  const [togetherOpen, setTogetherOpen] = useState(false);
  const [togetherCard, setTogetherCard] = useState(false);
  const params = useLocalSearchParams<{ together?: string }>();

  const checkTogether = useCallback(async () => {
    if (!inCardWindow()) { setTogetherCard(false); return; }
    const skipped = await AsyncStorage.getItem('stoikos_together_skip_' + localDay()).catch(() => null);
    setTogetherCard(!skipped);
  }, []);

  useEffect(() => {
    checkTogether();
    const id = setInterval(checkTogether, 30_000);
    return () => clearInterval(id);
  }, [checkTogether]);

  useEffect(() => {
    if (params.together) {
      setTogetherOpen(true);
      router.setParams({ together: undefined } as any);
    }
  }, [params.together]);

  const skipTogether = () => {
    setTogetherCard(false);
    AsyncStorage.setItem('stoikos_together_skip_' + localDay(), '1').catch(() => {});
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
      setPulseKey((k) => k + 1);
      AsyncStorage.getItem(COMPLETED_KEY + new Date().toDateString()).then((raw) => {
        const done: string[] = raw ? JSON.parse(raw) : [];
        setPracticeDone(done.filter((id) => ALL_EXERCISE_IDS.includes(id)).length);
      });
      // Yarım kalan ilk program; yoksa başlanmamış ilk program; hepsi bittiyse kart yok.
      (async () => {
        const programs = getPrograms(lang);
        const all = await Promise.all(
          programs.map(async (p) => {
            const done = await getProgress(p.id);
            const next = p.days.findIndex((_, i) => !done.includes(i));
            return { program: p, done, next };
          })
        );
        const inProgress = all.find((x) => x.done.length > 0 && x.next >= 0);
        const fresh = all.find((x) => x.done.length === 0);
        const r = inProgress ?? fresh;
        setResume(r ? { ...r, next: Math.max(0, r.next), started: r.done.length > 0 } : null);
      })();
    }, [refresh, lang])
  );

  // Bugünün süreklilik noktası hafifçe nefes alır — yalnız bugün bir şey yapıldıysa (boş noktanın atması
  // "henüz yapmadın" baskısına döner; bölüm bilerek baskısız). "Hareketi Azalt"ta durur.
  const reduceMotion = useReduceMotion();
  const doneToday = weekDays.length > 0 && !!weekDays[weekDays.length - 1];
  const todayPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!doneToday || reduceMotion) { todayPulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(todayPulse, { toValue: 1.25, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(todayPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [todayPulse, doneToday, reduceMotion]);

  const quote = getTodaysQuote(lang);
  const rootRef = useRef<View>(null);
  const orbRef = useRef<View>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = today.getHours();
  const greeting = hour < 18 ? t('home.greetMorn') : t('home.greetEve');

  return (
    <SafeAreaView ref={rootRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.08 : 0.09), 'transparent']}
        style={styles.gradientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Selamlama + Ayarlar; altında Stoa'nın nabzı (sayı küçükse gizli) */}
        <StaggerSection delay={0}>
          <View style={styles.headerRow}>
            <View style={styles.greetingBlock}>
              <Text style={styles.dateText}>{upper(dateStr, lang)}</Text>
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>
            <CalmPressable
              onPress={() => router.push('/settings')}
              style={[styles.gearBtn, styles.cardShadow]}
              accessibilityLabel={t('settings.title')}
            >
              <Text style={styles.gearIcon}>⚙</Text>
            </CalmPressable>
          </View>
          <PulseRow refreshKey={pulseKey} />
        </StaggerSection>

        {/* 2. Nefes çiçeği — bir dokunuşla başlar, bir dokunuşla biter (yeni ekran açmaz) */}
        <StaggerSection delay={90}>
          <View ref={orbRef} collapsable={false}>
            <BreathOrb
              idleTitle={t('home.breathTitle')}
              tapHint={t('home.breathTap')}
              stopHint={t('home.breathStop')}
              countLabel={t('home.breathCount')}
              minuteLabel={t('home.breathMin')}
              noLimitLabel={t('home.breathNoLimit')}
              doneLabel={t('home.breathDone')}
              onComplete={refresh}
              inhaleLabel={t('home.breathIn')}
              exhaleLabel={t('home.breathOut')}
              soundLabel={t('breathSound.label')}
            />
          </View>
          {togetherCard && <TogetherCard onOpen={() => setTogetherOpen(true)} onDismiss={skipTogether} />}
        </StaggerSection>

        {/* 3. Kaldığın yer — program; altında program listesine tek giriş */}
        <StaggerSection delay={180}>
          {resume && <ResumeCard resume={resume} />}
          <TouchableOpacity
            onPress={() => router.push('/programs')}
            style={styles.allPrograms}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8 }}
          >
            <Text style={styles.allProgramsText}>{t('home.allPrograms')}</Text>
          </TouchableOpacity>
        </StaggerSection>

        {/* 4. Nasıl hissediyorsun? */}
        <StaggerSection delay={260}>
          <MoodPicker />
        </StaggerSection>

        {/* 5. Günün alıntısı */}
        <StaggerSection delay={340}>
          <QuoteCard quote={quote} />
        </StaggerSection>

        {/* 6. Kısayollar — eski Günlük Pratik / Koç / Bilgelik kartları alt menünün kopyasıydı */}
        <StaggerSection delay={420}>
          <View style={styles.shortcuts}>
            <CalmPressable
              style={[styles.shortcut, styles.cardShadow]}
              onPress={() => router.push('/practice')}
            >
              <PaperBg radius={20} />
              <Text style={styles.shortcutLabel}>{upper(t('tabs.practice'), lang)}</Text>
              <Text style={styles.shortcutText}>
                {t('home.practiceShort', { done: practiceDone, total: ALL_EXERCISE_IDS.length })}
              </Text>
            </CalmPressable>
            <CalmPressable
              style={[styles.shortcut, styles.cardShadow]}
              onPress={() => router.push('/coach')}
            >
              <PaperBg radius={20} />
              <Text style={styles.shortcutLabel}>{upper(t('tabs.coach'), lang)}</Text>
              <Text style={styles.shortcutText}>{t('home.coachShort')}</Text>
            </CalmPressable>
          </View>
          {FEATURES.meydanOkuma && (
            <CalmPressable
              style={[styles.shortcut, styles.cardShadow, { marginBottom: 24 }]}
              onPress={() => router.push('/challenge')}
            >
              <Text style={styles.shortcutLabel}>{upper(t('ch.cardName'), lang)}</Text>
              <Text style={styles.shortcutText}>{t('ch.cardDesc')}</Text>
            </CalmPressable>
          )}
        </StaggerSection>

        {/* 7. Baskısız süreklilik */}
        <StaggerSection delay={500}>
          <View style={styles.continuity}>
            <View style={styles.continuityRow}>
              <MoonIcon size={15} color={Colors.sand} />
              <Text style={styles.continuityLabel}>
                {t('home.continuity')} · {streak} {t('progress.streakUnit')}
              </Text>
            </View>
            <View style={styles.dots}>
              {weekDays.map((done, i) => {
                const isToday = i === weekDays.length - 1;
                if (isToday) {
                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.dot,
                        done && styles.dotDone,
                        done && styles.dotToday,
                        { transform: [{ scale: todayPulse }] },
                      ]}
                    />
                  );
                }
                return <View key={i} style={[styles.dot, done && styles.dotDone]} />;
              })}
            </View>
          </View>
        </StaggerSection>
      </ScrollView>

      <MemberWelcome />
      <TogetherModal visible={togetherOpen} onClose={() => setTogetherOpen(false)} onComplete={refresh} />
      <FirstTip id="home" text={t('tip.home')} target={orbRef} container={rootRef} />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 52 },

  // Açık temalarda kartlara çok yumuşak derinlik
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

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, marginTop: 8 },
  greetingBlock: { flex: 1 },
  gearBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07), marginTop: 2,
  },
  gearIcon: { fontSize: 17, color: Colors.sand },
  dateText: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand, marginBottom: 8 },
  greetingText: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.text, letterSpacing: 0.3, lineHeight: 38 },

  resume: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 14, marginBottom: 14 },
  resumeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  resumeLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5 },
  dayPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  resumeDay: { fontFamily: Fonts.jostMedium, fontSize: 12 },
  resumeMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resumeIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  resumeIcon: { fontSize: 22 },
  resumeTitle: { fontFamily: Fonts.cormorant, fontSize: 23, color: Colors.text, marginBottom: 2 },
  resumeStep: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, lineHeight: 21 },
  resumeBar: { flexDirection: 'row', gap: 6 },
  resumeSeg: { flex: 1, height: 5, borderRadius: 3 },
  resumeCta: { fontFamily: Fonts.jostMedium, fontSize: 15, marginTop: 2 },
  allPrograms: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 18, paddingVertical: 6, paddingHorizontal: 4 },
  allProgramsText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.sand, letterSpacing: 0.3 },

  // Kartlar açık temada krem "kâğıt" + doku (Bilgelik/Pratik ile aynı, 21 Kasım 2026); koyuda yüzey rengi.
  moodCard: {
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 24, padding: 20, marginBottom: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  moodHead: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  moodHeadText: { flex: 1, gap: 6 },
  moodTitle: { fontFamily: Fonts.cormorant, fontSize: 23, color: Colors.text },
  moodHint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  moodBud: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.tint(0.08),
  },
  moodBudInner: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  moodBudDot: { position: 'absolute', width: 9, height: 9, borderRadius: 4.5 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  moodTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodTag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand },
  moodQuote: { borderTopWidth: 1, borderTopColor: Colors.tint(0.16), marginTop: 16, paddingTop: 16, gap: 8 },
  moodQuoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 21, lineHeight: 29, color: Colors.text },
  moodQuoteMeta: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  moodLinkBtn: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center' },
  moodLink: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand2 },

  shortcuts: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  shortcut: {
    flex: 1, backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 20, padding: 16, gap: 6,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  shortcutLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand },
  shortcutText: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text, lineHeight: 21 },

  continuity: { alignItems: 'center', paddingVertical: 10 },
  continuityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  continuityLabel: { fontFamily: Fonts.jost, fontSize: 14, letterSpacing: 1, color: Colors.muted },
  dots: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tint(0.18) },
  dotDone: { backgroundColor: Colors.tint(0.55) },
  dotToday: { backgroundColor: Colors.sand2, width: 10, height: 10, borderRadius: 5 },
});
