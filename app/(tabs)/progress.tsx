import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { useLang, DAY_LABELS } from '../../constants/i18n';
import { getExerciseNames } from '../../constants/content';
import { router, useFocusEffect } from 'expo-router';
import StoikosMark from '../../components/StoikosMark';
import { BREATH_ID } from '../../constants/breathLog';
import { useStreak } from '../../hooks/useStreak';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { CalmPressable } from '../../components/CalmPressable';
import { StaggerSection } from '../../components/StaggerSection';
import { FirstTip } from '../../components/FirstTip';
import { SettingsIcon } from '../../components/Icons';
import TracesSection from '../../components/TracesSection';

const COMPLETED_KEY = 'stoikos_completed_';

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

// ─── Animated stat box ────────────────────────────────────
function StatBox({ label, value, sub, delay = 0 }: { label: string; value: string; sub?: string; delay?: number }) {
  const styles = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) { anim.setValue(1); slide.setValue(0); return; }
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [anim, slide, delay, reduce]);

  return (
    <Animated.View style={[styles.statBox, styles.cardShadow, { opacity: anim, transform: [{ translateY: slide }] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Animated.View>
  );
}

// ─── Bar chart ─────────────────────────────────────────────
// Çubuklar veri değişince yeniden büyür. 14 Kasım 2026'ya kadar animasyon yalnız ilk çizimde, o anki
// değerle çalışıyordu: egzersiz dağılımı veriler yüklenmeden çizildiği için sayılar "2/7" yazarken
// çubuklar hep boş kalıyordu (kullanıcının ekran görüntüsü), haftalık çubuklar da sekmeye dönünce güncellenmiyordu.
// "Hareketi Azalt"ta çubuk doğrudan yerine gelir.
function DayBar({ pct, index, isToday }: { pct: number; index: number; isToday: boolean }) {
  const styles = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(0)).current;
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) { anim.setValue(pct); return; }
    Animated.timing(anim, {
      toValue: pct,
      duration: 620,
      delay: index * 55,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, index, anim, reduce]);

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          isToday && styles.barToday,
          { height: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

function WeekChart({ data }: { data: { day: string; count: number; isToday: boolean }[] }) {
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View style={[styles.chartWrap, styles.cardShadow]}>
      <Text style={styles.sectionLabel}>{t('progress.last7')}</Text>
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <DayBar pct={d.count / max} index={i} isToday={d.isToday} />
            <Text style={[styles.barLabel, d.isToday && styles.barLabelToday]}>{d.day}</Text>
            <Text style={styles.barCount}>{d.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Exercise breakdown ────────────────────────────────────
function ExBar({ pct, evening }: { pct: number; evening: boolean }) {
  const styles = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(0)).current;
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) { anim.setValue(pct); return; }
    Animated.timing(anim, {
      toValue: pct,
      duration: 680,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, anim, reduce]);

  return (
    <View style={styles.exTrack}>
      <Animated.View
        style={[
          styles.exFill,
          evening && styles.exFillEvening,
          { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

function ExBreakdown({ counts }: { counts: Record<string, number> }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const total7 = 7; // max completions per exercise in 7 days
  // Nefes seansları (≥1 dk) da günün tamamlananlarına 'breath' olarak yazılıyor (constants/breathLog.ts).
  const exercises = [
    ...getExerciseNames(lang),
    { id: BREATH_ID, name: t('progress.breathRow'), category: 'morning' as const },
  ];
  return (
    <View style={[styles.breakdownWrap, styles.cardShadow]}>
      <Text style={styles.sectionLabel}>{t('progress.exBreakdown')}</Text>
      {exercises.map((ex, i) => {
        const count = Math.min(counts[ex.id] || 0, total7);
        const isLast = i === exercises.length - 1;
        return (
          <View key={ex.id} style={[styles.exRow, isLast && styles.exRowLast]}>
            <View style={styles.exRowHeader}>
              <Text style={styles.exRowName}>{ex.name}</Text>
              <Text style={styles.exRowCount}>{count}/7</Text>
            </View>
            <ExBar pct={count / total7} evening={ex.category === 'evening'} />
          </View>
        );
      })}
    </View>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function ProgressScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  // Süreklilik tek yerde hesaplanır (useStreak). Eskiden burada ham anahtar
  // okunuyordu; ana ekrana uğramadan gelen kişi bugünü sayılmamış görüyordu.
  const { streak, refresh: refreshStreak } = useStreak();
  const rootRef = useRef<View>(null);
  const statsTipRef = useRef<View>(null);
  const [totalDone, setTotalDone] = useState(0);
  const [totalMoments, setTotalMoments] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; count: number; isToday: boolean }[]>([]);
  const [exCounts, setExCounts] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // Sekmeler bağlı kalıyor; yalnız mount'ta yüklemek, ana ekranda bir nefes
  // bitirip buraya dönen kişiye hâlâ sıfır gösteriyordu.
  useFocusEffect(useCallback(() => { loadStats(); }, [lang]));

  async function loadStats() {
    refreshStreak();

    const days = getLast7Days();
    const today = new Date().toDateString();
    let total = 0;
    const counts: Record<string, number> = {};

    const chartData = await Promise.all(
      days.map(async (d) => {
        const key = COMPLETED_KEY + d.toDateString();
        const raw = await AsyncStorage.getItem(key);
        const done: string[] = raw ? JSON.parse(raw) : [];
        total += done.length;
        done.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
        return { day: DAY_LABELS[lang][d.getDay()], count: done.length, isToday: d.toDateString() === today };
      })
    );

    setWeekData(chartData);
    setTotalDone(total);
    setExCounts(counts);

    // Tüm zamanların toplamı — asla azalmayan "Toplam an"
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const compKeys = allKeys.filter((k) => k.startsWith(COMPLETED_KEY));
      const entries = await AsyncStorage.multiGet(compKeys);
      let allTotal = 0;
      entries.forEach(([, v]) => { if (v) { try { allTotal += JSON.parse(v).length; } catch {} } });
      setTotalMoments(allTotal);
    } catch {}
    setLoaded(true);
  }

  return (
    <SafeAreaView ref={rootRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* 1. Başlık + Ayarlar (en az 44x44 px) */}
        <StaggerSection delay={0}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('progress.title')}</Text>
              <CalmPressable
                onPress={() => router.push('/settings')}
                style={[styles.gearBtn, styles.cardShadow]}
                accessibilityLabel={t('settings.title')}
              >
                <SettingsIcon size={22} color={Colors.sand} />
              </CalmPressable>
            </View>
            <Text style={styles.subtitle}>{t('progress.subtitle')}</Text>
          </View>
        </StaggerSection>

        {/* İlk gün: sıfırlarla dolu bir sayfa yerine ne olacağını ve nereden başlanacağını söyle */}
        {loaded && totalMoments === 0 ? (
          <StaggerSection delay={90}>
            <View style={[styles.emptyCard, styles.cardShadow]}>
              <StoikosMark size={44} variant="line" color={Colors.sand} opacity={0.8} />
              <Text style={styles.emptyTitle}>{t('progress.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('progress.emptyBody')}</Text>
              <CalmPressable style={styles.emptyBtn} onPress={() => router.navigate('/')}>
                <Text style={styles.emptyBtnText}>{t('progress.emptyBreath')}</Text>
              </CalmPressable>
              <TouchableOpacity style={styles.emptyLink} onPress={() => router.navigate('/practice')} hitSlop={8}>
                <Text style={styles.emptyLinkText}>{t('progress.emptyPractice')} →</Text>
              </TouchableOpacity>
            </View>
          </StaggerSection>
        ) : (
          <>
            <View ref={statsTipRef} collapsable={false} style={styles.statsRow}>
              <StatBox label={t('progress.streak')} value={`${streak}`} delay={60} />
              <StatBox label={t('progress.thisWeek')} value={`${totalDone}`} delay={120} />
              <StatBox label={t('progress.totalMoments')} value={`${totalMoments}`} delay={180} />
            </View>

            {weekData.length > 0 && (
              <StaggerSection delay={200}>
                <WeekChart data={weekData} />
              </StaggerSection>
            )}

            <StaggerSection delay={280}>
              <ExBreakdown counts={exCounts} />
            </StaggerSection>
          </>
        )}

        {/* İzler (22 Kasım 2026): bitirilen her programın sikkesi */}
        <StaggerSection delay={310}>
          <TracesSection />
        </StaggerSection>

        {/* Yansımaların (2 Kasım 2026): günlük ve program yansımalarına Pratik'e gitmeden ulaşılsın */}
        <StaggerSection delay={340}>
          <CalmPressable
            style={[styles.journalRow, styles.cardShadow]}
            onPress={() => router.push('/journal')}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.journalRowTitle}>{t('journal.title')}</Text>
              <Text style={styles.journalRowHint}>{t('journal.rowHint')}</Text>
            </View>
            <Text style={styles.journalRowArrow}>›</Text>
          </CalmPressable>
        </StaggerSection>

        {/* 4. Nazik yansıma */}
        <StaggerSection delay={410}>
          <View style={[styles.quoteBox, styles.cardShadow]}>
            <Text style={styles.quoteText}>“{t('progress.motivQuote')}”</Text>
            <Text style={styles.quoteAuthor}>{t('progress.motivAuthor')}</Text>
            {totalMoments > 0 && <Text style={styles.reflectionSub}>{t('progress.reflectionSub')}</Text>}
          </View>
        </StaggerSection>

      </ScrollView>
      <FirstTip id="progress" text={t('tip.progress')} target={statsTipRef} container={rootRef} enabled={loaded && totalMoments > 0} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 270 },
  scroll: { padding: 24, paddingBottom: 52 },

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

  header: { marginBottom: 26, marginTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontFamily: Fonts.cormorantItalic, fontSize: 28, color: Colors.text, letterSpacing: 0.3, lineHeight: 34, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted, letterSpacing: 0.2, lineHeight: 21 },
  gearBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07), marginTop: 2,
  },

  journalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68,
    backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  journalRowTitle: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand2, letterSpacing: 0.3 },
  journalRowHint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 3, lineHeight: 18 },
  journalRowArrow: { fontFamily: Fonts.jostLight, fontSize: 24, color: Colors.sand },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statBox: {
    flex: 1, backgroundColor: Colors.stone2, borderRadius: 20, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  statValue: { fontFamily: Fonts.cinzel, fontSize: 28, color: Colors.sand2, marginBottom: 6 },
  statLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.2, color: Colors.muted, textAlign: 'center', lineHeight: 16 },
  statSub: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 2 },

  // Chart
  chartWrap: {
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 20, marginBottom: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  sectionLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.muted, marginBottom: 16 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 18, height: 80, backgroundColor: Colors.stone3, borderRadius: 9, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.tint(0.45), borderRadius: 9 },
  barToday: { backgroundColor: Colors.sand2 },
  barLabel: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 6 },
  barLabelToday: { color: Colors.sand },
  barCount: { fontFamily: Fonts.cinzel, fontSize: 15, color: Colors.text2, marginTop: 2 },

  // Exercise breakdown
  breakdownWrap: {
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 20, marginBottom: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  exRow: { marginBottom: 15 },
  exRowLast: { marginBottom: 0 },
  exRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  exRowName: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2 },
  exRowCount: { fontFamily: Fonts.cinzel, fontSize: 15, color: Colors.sand },
  exTrack: { height: 5, backgroundColor: Colors.stone3, borderRadius: 3, overflow: 'hidden' },
  exFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  exFillEvening: { backgroundColor: Colors.moonA(0.75) },

  // Boş durum
  emptyCard: {
    backgroundColor: Colors.stone2, borderRadius: 24, paddingVertical: 32, paddingHorizontal: 24, marginBottom: 18,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  emptyTitle: { fontFamily: Fonts.cormorantItalic, fontSize: 22, color: Colors.text, textAlign: 'center', marginTop: 16, marginBottom: 10 },
  emptyBody: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, textAlign: 'center', lineHeight: 23, marginBottom: 22 },
  emptyBtn: { backgroundColor: Colors.sand, borderRadius: 24, paddingVertical: 13, paddingHorizontal: 28 },
  emptyBtnText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.bg, letterSpacing: 0.4 },
  emptyLink: { marginTop: 16 },
  emptyLinkText: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.sand },

  // Quote
  quoteBox: {
    backgroundColor: Colors.tint(0.06), borderRadius: 20, padding: 20,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 20,
  },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.sand2, lineHeight: 30, marginBottom: 8 },
  quoteAuthor: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, marginBottom: 12 },
  reflectionSub: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 24 },
});
