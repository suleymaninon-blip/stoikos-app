import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, Animated, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';
import { useLang, DAY_LABELS, LANGUAGES } from '../../constants/i18n';
import { getExerciseNames } from '../../constants/content';
import { router } from 'expo-router';
import { isNotifyEnabled, enableReminders, disableReminders } from '../../constants/notify';
import { resetMemory, ADMIN_KEY_STORAGE } from '../../constants/api';

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
  const { t, lang, setLang } = useLang();
  const [streak, setStreak] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; count: number; isToday: boolean }[]>([]);
  const [exCounts, setExCounts] = useState<Record<string, number>>({});
  const [notifyOn, setNotifyOn] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStats();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [lang]);

  useEffect(() => { isNotifyEnabled().then(setNotifyOn); }, []);
  useEffect(() => { AsyncStorage.getItem(ADMIN_KEY_STORAGE).then((k) => k && setAdminKey(k)); }, []);

  async function openAdmin() {
    if (!adminKey.trim()) return;
    await AsyncStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    router.push('/challenge-admin');
  }

  async function toggleNotify() {
    if (notifyOn) {
      await disableReminders();
      setNotifyOn(false);
    } else {
      const ok = await enableReminders(lang);
      if (ok) setNotifyOn(true);
      else Alert.alert('Stoikos', t('notify.denied'));
    }
  }

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
  }

  function resetCoachMemory() {
    Alert.alert(
      t('memory.resetTitle'),
      t('memory.resetMsg'),
      [
        { text: t('progress.cancel'), style: 'cancel' },
        { text: t('progress.reset'), style: 'destructive', onPress: () => { resetMemory(); } },
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
            <Text style={styles.title}>{t('progress.title')}</Text>
            <Text style={styles.subtitle}>{t('progress.subtitle')}</Text>
          </View>

          {/* Dil seçici */}
          <View style={styles.langWrap}>
            <Text style={styles.langTitle}>{t('progress.langLabel')}</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => setLang(l.code)}
                  style={[styles.langChip, lang === l.code && styles.langChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Günlük hatırlatıcılar */}
          <TouchableOpacity style={styles.notifyCard} onPress={toggleNotify} activeOpacity={0.85}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifyTitle}>{t('notify.title')}</Text>
              <Text style={styles.notifyHint}>{t('notify.hint')}</Text>
            </View>
            <View style={[styles.toggle, notifyOn && styles.toggleOn]}>
              <View style={[styles.toggleKnob, notifyOn && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>

          {/* Stat boxes */}
          <View style={styles.statsRow}>
            <StatBox label={t('progress.streak')} value={`${streak}`} sub={t('progress.streakUnit')} />
            <StatBox label={t('progress.thisWeek')} value={`${totalDone}`} sub={t('progress.weekUnit')} />
            <StatBox label={t('progress.avg')} value={avgPerDay} sub={t('progress.avgUnit')} />
          </View>

          {/* Best day */}
          {bestDay.count > 0 && (
            <View style={styles.bestDayCard}>
              <Text style={styles.bestDayIcon}>⭐</Text>
              <View>
                <Text style={styles.bestDayLabel}>{t('progress.bestDay')}</Text>
                <Text style={styles.bestDayValue}>{t('progress.bestDayValue', { day: bestDay.day, count: bestDay.count })}</Text>
              </View>
            </View>
          )}

          {/* Week chart */}
          {weekData.length > 0 && <WeekChart data={weekData} />}

          {/* Exercise breakdown */}
          <ExBreakdown counts={exCounts} />

          {/* Motivasyon alıntısı */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{t('progress.motivQuote')}"</Text>
            <Text style={styles.quoteAuthor}>{t('progress.motivAuthor')}</Text>
          </View>

          {/* Koç hafızası sıfırla */}
          <TouchableOpacity style={styles.resetBtn} onPress={resetCoachMemory} activeOpacity={0.8}>
            <Text style={styles.resetText}>{t('memory.resetBtn')}</Text>
          </TouchableOpacity>

          {/* Yönetici — onay kuyruğu (yalnızca sahibi) */}
          <View style={styles.adminWrap}>
            <Text style={styles.adminTitle}>{t('admin.title')}</Text>
            <Text style={styles.adminHint}>{t('admin.hint')}</Text>
            <View style={styles.adminRow}>
              <TextInput
                style={styles.adminInput}
                placeholder={t('admin.placeholder')}
                placeholderTextColor={Colors.stone4}
                value={adminKey}
                onChangeText={setAdminKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={[styles.adminBtn, !adminKey.trim() && { opacity: 0.4 }]} onPress={openAdmin} disabled={!adminKey.trim()}>
                <Text style={styles.adminBtnText}>{t('admin.open')}</Text>
              </TouchableOpacity>
            </View>
          </View>

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

  // Dil seçici
  langWrap: { marginBottom: 20 },
  langTitle: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 10 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  langChipActive: { backgroundColor: 'rgba(212,146,74,0.18)', borderColor: Colors.accent },
  langFlag: { fontSize: 14 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
  langLabelActive: { color: Colors.accent },

  // Bildirim kartı
  notifyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(212,146,74,0.18)',
  },
  notifyTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand2, letterSpacing: 0.3, marginBottom: 4 },
  notifyHint: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, lineHeight: 16 },
  toggle: { width: 46, height: 27, borderRadius: 14, backgroundColor: Colors.stone4, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: Colors.accent },
  toggleKnob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#f0e8d5' },
  toggleKnobOn: { alignSelf: 'flex-end' },

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
  adminWrap: { marginTop: 18, backgroundColor: Colors.stone2, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  adminTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, marginBottom: 4 },
  adminHint: { fontFamily: Fonts.jost, fontSize: 10.5, color: Colors.muted, lineHeight: 15, marginBottom: 10 },
  adminRow: { flexDirection: 'row', gap: 8 },
  adminInput: { flex: 1, backgroundColor: Colors.stone3, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontFamily: Fonts.jost, fontSize: 12, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  adminBtn: { backgroundColor: Colors.stone4, borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  adminBtnText: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand2 },
});
