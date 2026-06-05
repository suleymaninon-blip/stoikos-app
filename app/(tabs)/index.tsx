import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';
import { getTodaysQuote } from '../../constants/content';
import { useLang, localeOf } from '../../constants/i18n';
import { useStreak } from '../../hooks/useStreak';
import { QuoteCard } from '../../components/QuoteCard';
import BreathOrb from '../../components/BreathOrb';
import { FEATURES } from '../../constants/config';

const COMPLETED_KEY = 'stoikos_completed_';
const ALL_EXERCISE_IDS = ['neg_vis', 'intention', 'memento', 'review', 'gratitude'];

// ── Dikey modül satırı (yan yana rekabet eden kart yok) ──
function ModuleRow({ icon, name, desc, onPress }: { icon: string; name: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.rowIconBox}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{name}</Text>
        <Text style={styles.rowDesc}>{desc}</Text>
      </View>
      <Text style={styles.rowArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { t, lang } = useLang();
  const { streak, weekDays, refresh } = useStreak();
  const [, setPracticeProgress] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      AsyncStorage.getItem(COMPLETED_KEY + new Date().toDateString()).then((raw) => {
        const done: string[] = raw ? JSON.parse(raw) : [];
        setPracticeProgress(done.length / ALL_EXERCISE_IDS.length);
      });
    }, [refresh])
  );

  const quote = getTodaysQuote(lang);
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(194,168,120,0.06)', 'transparent']}
        style={styles.gradientTop}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Selamlama */}
          <View style={styles.greetingBlock}>
            <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>

          {/* Nefes orbu — dokununca YERİNDE egzersiz başlar (yeni ekran açmaz) */}
          <BreathOrb
            idleTitle={t('home.breathTitle')}
            tapHint={t('home.breathTap')}
            inhaleLabel={t('home.breathIn')}
            exhaleLabel={t('home.breathOut')}
            soundLabel={t('breathSound.label')}
            hapticLabel={t('breathHaptic.label')}
          />

          {/* Günün alıntısı */}
          <QuoteCard quote={quote} />

          {/* BUGÜN — dikey modül listesi */}
          <Text style={styles.sectionLabel}>{t('home.today')}</Text>
          <View style={styles.list}>
            <ModuleRow icon="☀" name={t('home.mod.practice.name')} desc={t('home.mod.practice.desc')} onPress={() => router.push('/practice')} />
            <ModuleRow icon="◎" name={t('home.mod.coach.name')} desc={t('home.mod.coach.desc')} onPress={() => router.push('/coach')} />
            <ModuleRow icon="◈" name={t('home.mod.wisdom.name')} desc={t('home.mod.wisdom.desc')} onPress={() => router.push('/wisdom')} />
            <ModuleRow icon="♥" name={t('mood.title')} desc={t('mood.rowDesc')} onPress={() => router.push('/wisdom')} />
            <ModuleRow icon="❖" name={t('programs.cardName')} desc={t('programs.cardDesc')} onPress={() => router.push('/programs')} />
            {FEATURES.meydanOkuma && (
              <ModuleRow icon="✦" name={t('ch.cardName')} desc={t('ch.cardDesc')} onPress={() => router.push('/challenge')} />
            )}
          </View>

          {/* Baskısız süreklilik */}
          <View style={styles.continuity}>
            <Text style={styles.continuityLabel}>
              🌙 {t('home.continuity')} · {streak} {t('progress.streakUnit')}
            </Text>
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

          <Text style={styles.omega}>Ω</Text>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradientTop: { position: 'absolute', top: 0, right: 0, width: '70%', height: 300 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },

  greetingBlock: { marginBottom: 28, marginTop: 8 },
  dateText: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 2.5, color: Colors.sand, marginBottom: 8 },
  greetingText: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.text, letterSpacing: 0.3, lineHeight: 38 },

  sectionLabel: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 2.5, color: Colors.muted, marginBottom: 16, marginTop: 6 },


  list: { gap: 12, marginBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.stone2, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.10)',
  },
  rowIconBox: {
    width: 46, height: 46, borderRadius: 16,
    backgroundColor: 'rgba(194,168,120,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: 20, color: Colors.sand2 },
  rowName: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand2, letterSpacing: 0.4, marginBottom: 3 },
  rowDesc: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2, lineHeight: 17 },
  rowArrow: { fontFamily: Fonts.jostLight, fontSize: 20, color: Colors.sand },

  continuity: { alignItems: 'center', paddingVertical: 8 },
  continuityLabel: { fontFamily: Fonts.jost, fontSize: 12, letterSpacing: 1, color: Colors.muted, marginBottom: 14 },
  dots: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(194,168,120,0.18)' },
  dotDone: { backgroundColor: 'rgba(194,168,120,0.5)' },
  dotToday: { backgroundColor: Colors.sand2, width: 9, height: 9, borderRadius: 4.5 },

  omega: { fontFamily: Fonts.cinzel, fontSize: 80, color: 'rgba(194,168,120,0.04)', textAlign: 'right', marginTop: 24, marginRight: -10 },
});
