import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { MoonIcon } from '../../components/Icons';
import { getTodaysQuote, getMoodQuote, MOOD_THEMES } from '../../constants/content';
import { getPrograms, getProgress, Program } from '../../constants/programs';
import { useLang, localeOf, upper } from '../../constants/i18n';
import { useStreak } from '../../hooks/useStreak';
import { MoodBloom, type MoodOrigin } from '../../components/MoodBloom';
import { QuoteCard } from '../../components/QuoteCard';
import BreathOrb from '../../components/BreathOrb';
import { FEATURES } from '../../constants/config';
import { FirstTip } from '../../components/FirstTip';

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
    <TouchableOpacity
      style={[styles.resume, { backgroundColor: tint(c, 0.08), borderColor: tint(c, 0.4) }]}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/programs', params: started ? { open: program.id, day: String(next) } : { open: program.id } })}
    >
      <View style={styles.resumeTop}>
        <Text style={[styles.resumeLabel, { color: tint(c, 1) }]}>{t(started ? 'home.resume' : 'home.startJourney')}</Text>
        {started && <Text style={styles.resumeDay}>{t('programs.dayOf', { n: next + 1, total: program.dayCount })}</Text>}
      </View>
      <View style={styles.resumeMain}>
        <View style={[styles.resumeIconBox, { backgroundColor: tint(c, 0.18) }]}>
          <Text style={[styles.resumeIcon, { color: tint(c, 1) }]}>{program.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resumeTitle}>{program.title}</Text>
          <Text style={styles.resumeStep}>{started ? day.title : program.subtitle}</Text>
        </View>
      </View>
      {started && (
        <View style={styles.resumeBar}>
          {program.days.map((_, i) => (
            <View key={i} style={[styles.resumeSeg, { backgroundColor: done.includes(i) ? tint(c, 1) : i === next ? tint(c, 0.4) : Colors.overlay(0.06) }]} />
          ))}
        </View>
      )}
      <Text style={[styles.resumeCta, { color: tint(c, 1) }]}>{t(started ? 'home.openStep' : 'home.startProgram')}</Text>
    </TouchableOpacity>
  );
}

// ── Bugün aklında ne var? — 3×3 duygu ızgarası; seçilen temadan bugünün sözü ──
// (11 Kasım 2026, kullanıcı seçimi C; tasarım https://claude.ai/artifact/DJVJ7UFJbmBz8iXJc3J3RQ.)
// Eski hâli 4-3-2 kırılan gri çiplerdi. Her temanın kendi rengi var: nokta o renkte, seçilen kutu o renkle dolar.
// İlk satır zor gelenler (kaygı, öfke, yas), sonraki iki satır aranan şeyler: MOOD_THEMES sırası bunu veriyor.
// [koyu temada, açık temada] — açık zeminde nokta ve dolu kutu için daha koyu ton (beyaz yazı okunsun).
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
  // Kutu kapalı durur (yalnız başlık + dokuz renkli noktadan küçük bir çiçek). Dokununca seçenekler aşağı doğru
  // açılmaz: ekranı kaplayan duygu çiçeği, dokunulan noktadan dönerek açılır (components/MoodBloom.tsx;
  // 13 Kasım 2026, kullanıcı: "nefes orbu gibi genişleyerek açılsa"). Seçince çiçek toplanır, söz kartta kalır.
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<MoodOrigin>(null);
  const budRef = useRef<View>(null);
  const openBloom = () => {
    const show = (o: MoodOrigin) => { setOrigin(o); setOpen(true); };
    if (!budRef.current) return show(null);
    budRef.current.measureInWindow((x, y, w, h) => show(Number.isFinite(x) && w > 0 ? { x: x + w / 2, y: y + h / 2 } : null));
  };
  const picked = mood ? getMoodQuote(mood, lang) : null;
  const colorOf = (m: string) => (MOOD_COLORS[m] ?? [Colors.sand, Colors.sand])[Colors.isDark ? 0 : 1];
  const onColor = Colors.isDark ? '#0F1824' : '#FFFFFF';
  return (
    <View style={styles.moodCard}>
      <Pressable
        onPress={openBloom}
        style={({ pressed }) => [styles.moodHead, pressed && styles.moodHeadPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t('mood.title')}
        accessibilityHint={t('mood.hint')}
      >
        <View style={styles.moodHeadText}>
          <Text style={styles.moodTitle}>{t('mood.title')}</Text>
          {!mood && <Text style={styles.moodHint}>{t('mood.hint')}</Text>}
        </View>
        {/* tomurcuk: dokuz renkli noktadan küçük bir çiçek; duygu çiçeği buradan açılır */}
        <View ref={budRef} collapsable={false} style={styles.moodBud}>
          {MOOD_THEMES.map((m, i) => {
            const a = -Math.PI / 2 + (i / MOOD_THEMES.length) * Math.PI * 2;
            return <View key={m} style={[styles.moodBudDot, { backgroundColor: colorOf(m), transform: [{ translateX: Math.cos(a) * 15 }, { translateY: Math.sin(a) * 15 }] }]} />;
          })}
        </View>
      </Pressable>
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
        <View style={styles.moodQuote}>
          <View style={styles.moodTagRow}>
            <View style={[styles.chipDot, { backgroundColor: colorOf(mood) }]} />
            <Text style={styles.moodTag}>{upper(t(`mood.${mood}`), lang)}</Text>
          </View>
          <Text style={styles.moodQuoteText}>{picked.quote.text}</Text>
          <Text style={styles.moodQuoteMeta}>
            — {picked.quote.author}
            {picked.quote.source && picked.quote.source !== picked.quote.author ? ` · ${picked.quote.source}` : ''}
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/wisdom', params: { mood } })} hitSlop={8} style={styles.moodLinkBtn}>
            <Text style={styles.moodLink}>{t('home.moodLink', { theme: t(`mood.${mood}`), n: picked.count })}</Text>
          </TouchableOpacity>
        </View>
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

  useFocusEffect(
    useCallback(() => {
      refresh();
      AsyncStorage.getItem(COMPLETED_KEY + new Date().toDateString()).then((raw) => {
        const done: string[] = raw ? JSON.parse(raw) : [];
        setPracticeDone(done.filter((id) => ALL_EXERCISE_IDS.includes(id)).length);
      });
      // Yarım kalan ilk program; yoksa başlanmamış ilk program; hepsi bittiyse kart yok.
      (async () => {
        const programs = getPrograms(lang);
        const all = await Promise.all(programs.map(async (p) => {
          const done = await getProgress(p.id);
          const next = p.days.findIndex((_, i) => !done.includes(i));
          return { program: p, done, next };
        }));
        const inProgress = all.find((x) => x.done.length > 0 && x.next >= 0);
        const fresh = all.find((x) => x.done.length === 0);
        const r = inProgress ?? fresh;
        setResume(r ? { ...r, next: Math.max(0, r.next), started: r.done.length > 0 } : null);
      })();
    }, [refresh, lang])
  );

  const quote = getTodaysQuote(lang);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rootRef = useRef<View>(null);
  const orbRef = useRef<View>(null);
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const today = new Date();
  const dateStr = today.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = today.getHours();
  const greeting = hour < 18 ? t('home.greetMorn') : t('home.greetEve');

  return (
    <SafeAreaView ref={rootRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(0.06), 'transparent']}
        style={styles.gradientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Selamlama + Ayarlar */}
          <View style={styles.headerRow}>
            <View style={styles.greetingBlock}>
              <Text style={styles.dateText}>{upper(dateStr, lang)}</Text>
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.gearBtn}
              hitSlop={10}
              accessibilityLabel={t('settings.title')}
            >
              <Text style={styles.gearIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Nefes çiçeği — bir dokunuşla başlar, bir dokunuşla biter (yeni ekran açmaz) */}
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

          {/* Kaldığın yer — program (alt menüde olmayan tek bölüm) */}
          {resume && <ResumeCard resume={resume} />}
          {/* Program listesine tek giriş (kart doğrudan programı açıyor; hepsi bitince kart da yok) */}
          <TouchableOpacity onPress={() => router.push('/programs')} style={styles.allPrograms} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8 }}>
            <Text style={styles.allProgramsText}>{t('home.allPrograms')}</Text>
          </TouchableOpacity>

          {/* Nasıl hissediyorsun? — eskiden Bilgelik'e giden bir satırdı */}
          <MoodPicker />

          {/* Günün alıntısı */}
          <QuoteCard quote={quote} />

          {/* Kısayollar — Günlük Pratik / Koç / Bilgelik kartları alt menünün kopyasıydı */}
          <View style={styles.shortcuts}>
            <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/practice')} activeOpacity={0.8}>
              <Text style={styles.shortcutLabel}>{upper(t('tabs.practice'), lang)}</Text>
              <Text style={styles.shortcutText}>{t('home.practiceShort', { done: practiceDone, total: ALL_EXERCISE_IDS.length })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shortcut} onPress={() => router.push('/coach')} activeOpacity={0.8}>
              <Text style={styles.shortcutLabel}>{upper(t('tabs.coach'), lang)}</Text>
              <Text style={styles.shortcutText}>{t('home.coachShort')}</Text>
            </TouchableOpacity>
          </View>
          {FEATURES.meydanOkuma && (
            <TouchableOpacity style={[styles.shortcut, { marginBottom: 24 }]} onPress={() => router.push('/challenge')} activeOpacity={0.8}>
              <Text style={styles.shortcutLabel}>{upper(t('ch.cardName'), lang)}</Text>
              <Text style={styles.shortcutText}>{t('ch.cardDesc')}</Text>
            </TouchableOpacity>
          )}

          {/* Baskısız süreklilik */}
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
                return (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      done && styles.dotDone,
                      isToday && done && styles.dotToday,
                    ]}
                  />
                );
              })}
            </View>
          </View>

        </Animated.View>
      </ScrollView>
      <FirstTip id="home" text={t('tip.home')} target={orbRef} container={rootRef} />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20, marginTop: 8 },
  greetingBlock: { flex: 1 },
  gearBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07), marginTop: 2 },
  gearIcon: { fontSize: 17, color: Colors.sand },
  dateText: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand, marginBottom: 8 },
  greetingText: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.text, letterSpacing: 0.3, lineHeight: 38 },

  resume: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 12, marginBottom: 16 },
  resumeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  resumeLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5 },
  resumeDay: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2 },
  resumeMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resumeIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resumeIcon: { fontSize: 22 },
  resumeTitle: { fontFamily: Fonts.cormorant, fontSize: 23, color: Colors.text, marginBottom: 2 },
  resumeStep: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, lineHeight: 21 },
  resumeBar: { flexDirection: 'row', gap: 6 },
  resumeSeg: { flex: 1, height: 5, borderRadius: 3 },
  resumeCta: { fontFamily: Fonts.jostMedium, fontSize: 15 },
  allPrograms: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 14, paddingVertical: 6, paddingHorizontal: 4 },
  allProgramsText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.sand, letterSpacing: 0.3 },

  moodCard: {
    backgroundColor: Colors.stone2, borderRadius: 22, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.overlay(0.05),
  },
  moodHead: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  moodHeadPressed: { opacity: 0.75 },
  moodHeadText: { flex: 1, gap: 6 },
  moodTitle: { fontFamily: Fonts.cormorant, fontSize: 23, color: Colors.text },
  moodHint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  moodBud: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.tint(0.08) },
  moodBudDot: { position: 'absolute', width: 9, height: 9, borderRadius: 4.5 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  moodTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moodTag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand },
  moodQuote: { borderTopWidth: 1, borderTopColor: Colors.tint(0.18), marginTop: 16, paddingTop: 14, gap: 8 },
  moodQuoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 21, lineHeight: 29, color: Colors.text },
  moodQuoteMeta: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  moodLinkBtn: { alignSelf: 'flex-start', minHeight: 40, justifyContent: 'center' },
  moodLink: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand2 },

  shortcuts: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  shortcut: {
    flex: 1, backgroundColor: Colors.stone2, borderRadius: 18, padding: 14, gap: 4,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  shortcutLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand },
  shortcutText: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text },

  continuity: { alignItems: 'center', paddingVertical: 8 },
  continuityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  continuityLabel: { fontFamily: Fonts.jost, fontSize: 14, letterSpacing: 1, color: Colors.muted },
  dots: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tint(0.18) },
  dotDone: { backgroundColor: Colors.tint(0.5) },
  dotToday: { backgroundColor: Colors.sand2, width: 9, height: 9, borderRadius: 4.5 },

});
