import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { API_KEY_STORAGE } from '../setup';

const COMPLETED_KEY = 'stoikos_completed_';
const STREAK_KEY = 'stoikos_streak';

// Son 7 günün tarihlerini üret
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

function dayLabel(date: Date) {
  return ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()];
}

const ALL_EXERCISES = [
  { id: 'neg_vis', name: 'Negatif Görselleştirme', category: 'Sabah' },
  { id: 'intention', name: 'Sabah Niyeti', category: 'Sabah' },
  { id: 'memento', name: 'Memento Mori', category: 'Sabah' },
  { id: 'review', name: 'Günün Muhasebesi', category: 'Akşam' },
  { id: 'gratitude', name: 'Stoacı Şükran', category: 'Akşam' },
];

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
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View style={styles.chartWrap}>
      <Text style={styles.sectionLabel}>SON 7 GÜN</Text>
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
  const total7 = 7; // max completions per exercise in 7 days
  return (
    <View style={styles.breakdownWrap}>
      <Text style={styles.sectionLabel}>EGZERSİZ DAĞILIMI</Text>
      {ALL_EXERCISES.map((ex) => {
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
                  ex.category === 'Akşam' && styles.exFillEvening,
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
  const [streak, setStreak] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; count: number; isToday: boolean }[]>([]);
  const [exCounts, setExCounts] = useState<Record<string, number>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

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
        return { day: dayLabel(d), count: done.length, isToday: d.toDateString() === today };
      })
    );

    setWeekData(chartData);
    setTotalDone(total);
    setExCounts(counts);
  }

  async function resetKey() {
    Alert.alert(
      'API Key Sıfırla',
      'Mevcut key silinecek ve kurulum ekranına döneceksin.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(API_KEY_STORAGE);
            router.replace('/setup');
          },
        },
      ]
    );
  }

  const avgPerDay = weekData.length > 0
    ? (weekData.reduce((s, d) => s + d.count, 0) / 7).toFixed(1)
    : '0';

  const bestDay = weekData.reduce((best, d) => d.count > best.count ? d : best, { day: '-', count: 0, isToday: false });

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
            <Text style={styles.title}>İlerleme</Text>
            <Text style={styles.subtitle}>Dönüşümünü izle</Text>
          </View>

          {/* Stat boxes */}
          <View style={styles.statsRow}>
            <StatBox label="Günlük Seri" value={`${streak}`} sub="gün" />
            <StatBox label="Bu Hafta" value={`${totalDone}`} sub="pratik" />
            <StatBox label="Günlük Ort." value={avgPerDay} sub="pratik/gün" />
          </View>

          {/* Best day */}
          {bestDay.count > 0 && (
            <View style={styles.bestDayCard}>
              <Text style={styles.bestDayIcon}>⭐</Text>
              <View>
                <Text style={styles.bestDayLabel}>EN İYİ GÜN</Text>
                <Text style={styles.bestDayValue}>{bestDay.day} — {bestDay.count} pratik</Text>
              </View>
            </View>
          )}

          {/* Week chart */}
          {weekData.length > 0 && <WeekChart data={weekData} />}

          {/* Exercise breakdown */}
          <ExBreakdown counts={exCounts} />

          {/* Motivasyon alıntısı */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              "Küçük adımlar atılmaya devam edilirse, büyük mesafeler kat edilir."
            </Text>
            <Text style={styles.quoteAuthor}>— Marcus Aurelius</Text>
          </View>

          {/* API Key reset */}
          <TouchableOpacity style={styles.resetBtn} onPress={resetKey} activeOpacity={0.8}>
            <Text style={styles.resetText}>🔑 API Key Değiştir</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, right: 0, width: '70%', height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: Colors.stone2, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: { fontFamily: Fonts.cinzel, fontSize: 26, color: Colors.accent, marginBottom: 4 },
  statLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 1.5, color: Colors.muted, textAlign: 'center' },
  statSub: { fontFamily: Fonts.jost, fontSize: 9, color: Colors.stone4, marginTop: 2 },

  // Best day
  bestDayCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(212,146,74,0.08)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)', marginBottom: 20,
  },
  bestDayIcon: { fontSize: 22 },
  bestDayLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.sand, marginBottom: 3 },
  bestDayValue: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand2, letterSpacing: 0.3 },

  // Chart
  chartWrap: { backgroundColor: Colors.stone2, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2.5, color: Colors.muted, marginBottom: 16 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 18, height: 80, backgroundColor: Colors.stone3, borderRadius: 9, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.accent, borderRadius: 9 },
  barToday: { backgroundColor: Colors.sand },
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
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 14, color: Colors.sand3, lineHeight: 22, marginBottom: 8 },
  quoteAuthor: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted },

  // Reset
  resetBtn: {
    backgroundColor: Colors.stone2, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  resetText: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted, letterSpacing: 0.3 },
});
