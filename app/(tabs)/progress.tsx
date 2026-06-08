import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';
import { useLang, DAY_LABELS } from '../../constants/i18n';
import { getExerciseNames } from '../../constants/content';
import { router } from 'expo-router';

const COMPLETED_KEY = 'stoikos_completed_';
const STREAK_KEY = 'stoikos_streak';

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

// ─── Animated stat box ────────────────────────────────────
function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statBox, { opacity: anim }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Animated.View>
  );
}

// ─── Bar chart ─────────────────────────────────────────────
function WeekChart({ data }: { data: { day: string; count: number; isToday: boolean }[] }) {
  const { t } = useLang();
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View style={styles.chartWrap}>
      <Text style={styles.sectionLabel}>{t('progress.last7')}</Text>
      <View style={styles.bars}>
        {data.map((d, i) => {
          const heightPct = d.count / max;
          const barAnim = useRef(new Animated.Value(0)).current;
          useEffect(() => {
            Animated.timing(barAnim, {
              toValue: heightPct,
              duration: 600,
              delay: i * 60,
              useNativeDriver: false,
            }).start();
          }, []);
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    d.isToday && styles.barToday,
                    { height: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, d.isToday && styles.barLabelToday]}>{d.day}</Text>
              <Text style={styles.barCount}>{d.count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Exercise breakdown ────────────────────────────────────
function ExBreakdown({ counts }: { counts: Record<string, number> }) {
  const { t, lang } = useLang();
  const total7 = 7; // max completions per exercise in 7 days
  const exercises = getExerciseNames(lang);
  return (
    <View style={styles.breakdownWrap}>
      <Text style={styles.sectionLabel}>{t('progress.exBreakdown')}</Text>
      {exercises.map((ex) => {
        const count = counts[ex.id] || 0;
        const pct = count / total7;
        const barAnim = useRef(new Animated.Value(0)).current;
        useEffect(() => {
          Animated.timing(barAnim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
        }, []);
        return (
          <View key={ex.id} style={styles.exRow}>
            <View style={styles.exRowHeader}>
              <Text style={styles.exRowName}>{ex.name}</Text>
              <Text style={styles.exRowCount}>{count}/7</Text>
            </View>
            <View style={styles.exTrack}>
              <Animated.View
                style={[
                  styles.exFill,
                  ex.category === 'evening' && styles.exFillEvening,
                  { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function ProgressScreen() {
  const { t, lang } = useLang();
  const [streak, setStreak] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [totalMoments, setTotalMoments] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; count: number; isToday: boolean }[]>([]);
  const [exCounts, setExCounts] = useState<Record<string, number>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [lang]);

  async function loadStats() {
    const streakVal = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0');
    setStreak(streakVal);

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
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(196,169,106,0.05)', 'transparent']}
        style={styles.grad}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('progress.title')}</Text>
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                style={styles.gearBtn}
                hitSlop={10}
                accessibilityLabel={t('settings.title')}
              >
                <Text style={styles.gearIcon}>⚙</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>{t('progress.subtitle')}</Text>
          </View>

          {/* Stat boxes — sakin, rekabetsiz */}
          <View style={styles.statsRow}>
            <StatBox label={t('progress.streak')} value={`${streak}`} />
            <StatBox label={t('progress.thisWeek')} value={`${totalDone}`} />
            <StatBox label={t('progress.totalMoments')} value={`${totalMoments}`} />
          </View>

          {/* Week chart */}
          {weekData.length > 0 && <WeekChart data={weekData} />}

          {/* Exercise breakdown */}
          <ExBreakdown counts={exCounts} />

          {/* Nazik yansıma */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>“{t('progress.motivQuote')}”</Text>
            <Text style={styles.quoteAuthor}>{t('progress.motivAuthor')}</Text>
            <Text style={styles.reflectionSub}>{t('progress.reflectionSub')}</Text>
          </View>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, right: 0, width: '70%', height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 26, marginTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.2, lineHeight: 19 },
  gearBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginTop: 2 },
  gearIcon: { fontSize: 17, color: Colors.sand },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: Colors.stone2, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: { fontFamily: Fonts.cinzel, fontSize: 28, color: Colors.sand2, marginBottom: 6 },
  statLabel: { fontFamily: Fonts.jostMedium, fontSize: 8.5, letterSpacing: 1.2, color: Colors.muted, textAlign: 'center', lineHeight: 12 },
  statSub: { fontFamily: Fonts.jost, fontSize: 9, color: Colors.stone4, marginTop: 2 },

  // Chart
  chartWrap: { backgroundColor: Colors.stone2, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2.5, color: Colors.muted, marginBottom: 16 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 18, height: 80, backgroundColor: Colors.stone3, borderRadius: 9, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: 'rgba(194,168,120,0.45)', borderRadius: 9 },
  barToday: { backgroundColor: Colors.sand2 },
  barLabel: { fontFamily: Fonts.jost, fontSize: 9, color: Colors.muted, marginTop: 6 },
  barLabelToday: { color: Colors.sand },
  barCount: { fontFamily: Fonts.cinzel, fontSize: 10, color: Colors.text2, marginTop: 2 },

  // Exercise breakdown
  breakdownWrap: { backgroundColor: Colors.stone2, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  exRow: { marginBottom: 14 },
  exRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  exRowName: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2 },
  exRowCount: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.sand },
  exTrack: { height: 4, backgroundColor: Colors.stone3, borderRadius: 2, overflow: 'hidden' },
  exFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  exFillEvening: { backgroundColor: 'rgba(100,160,220,0.7)' },

  // Quote
  quoteBox: {
    backgroundColor: 'rgba(196,169,106,0.06)', borderRadius: 16, padding: 18,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 20,
  },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.sand2, lineHeight: 27, marginBottom: 8 },
  quoteAuthor: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, marginBottom: 12 },
  reflectionSub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2, lineHeight: 19 },
});
