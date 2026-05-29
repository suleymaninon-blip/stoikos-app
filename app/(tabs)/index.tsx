import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';
import { getTodaysQuote } from '../../constants/quotes';
import { useStreak } from '../../hooks/useStreak';
import { QuoteCard } from '../../components/QuoteCard';
import { ModuleCard } from '../../components/ModuleCard';
import { StreakBar } from '../../components/StreakBar';

const MODULES = [
  { icon: '🌅', name: 'Günlük Pratik', desc: 'Sabah niyeti & akşam yansıması', route: '/practice', active: true },
  { icon: '⚡', name: 'AI Koç', desc: 'Stoacı rehberlik al', route: '/coach', active: false },
  { icon: '📖', name: 'Bilgelik', desc: 'Kavramlar & alıntılar', route: '/wisdom', active: false },
  { icon: '📊', name: 'İlerleme', desc: 'Dönüşüm takibi', route: '/progress', active: false },
];

export default function HomeScreen() {
  const { streak, weekDays } = useStreak();
  const quote = getTodaysQuote();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const hour = today.getHours();
  const greeting =
    hour < 12 ? 'Sabahın Bilgeliği' :
    hour < 17 ? 'Günün Bilgeliği' :
    'Akşamın Yansıması';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(212,146,74,0.07)', 'transparent']}
        style={styles.gradientTop}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Greeting */}
          <View style={styles.greetingBlock}>
            <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>

          {/* Quote */}
          <QuoteCard quote={quote} />

          {/* Modules */}
          <Text style={styles.sectionLabel}>MODÜLLER</Text>
          <View style={styles.modulesGrid}>
            <View style={styles.moduleRow}>
              <ModuleCard
                icon={MODULES[0].icon}
                name={MODULES[0].name}
                desc={MODULES[0].desc}
                active={MODULES[0].active}
                onPress={() => router.push(MODULES[0].route as any)}
                style={{ marginRight: 6 }}
              />
              <ModuleCard
                icon={MODULES[1].icon}
                name={MODULES[1].name}
                desc={MODULES[1].desc}
                active={MODULES[1].active}
                onPress={() => router.push(MODULES[1].route as any)}
                style={{ marginLeft: 6 }}
              />
            </View>
            <View style={styles.moduleRow}>
              <ModuleCard
                icon={MODULES[2].icon}
                name={MODULES[2].name}
                desc={MODULES[2].desc}
                active={MODULES[2].active}
                onPress={() => router.push(MODULES[2].route as any)}
                style={{ marginRight: 6 }}
              />
              <ModuleCard
                icon={MODULES[3].icon}
                name={MODULES[3].name}
                desc={MODULES[3].desc}
                active={MODULES[3].active}
                onPress={() => router.push(MODULES[3].route as any)}
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>

          {/* Streak */}
          <StreakBar streak={streak} weekDays={weekDays} />

          {/* Omega decoration */}
          <Text style={styles.omega}>Ω</Text>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.stone,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: 300,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  greetingBlock: {
    marginBottom: 24,
    marginTop: 8,
  },
  dateText: {
    fontFamily: Fonts.jostMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.sand,
    marginBottom: 4,
  },
  greetingText: {
    fontFamily: Fonts.cinzel,
    fontSize: 24,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: Fonts.jostMedium,
    fontSize: 10,
    letterSpacing: 2.5,
    color: Colors.muted,
    marginBottom: 14,
  },
  modulesGrid: {
    marginBottom: 20,
    gap: 12,
  },
  moduleRow: {
    flexDirection: 'row',
  },
  omega: {
    fontFamily: Fonts.cinzel,
    fontSize: 80,
    color: 'rgba(196,169,106,0.04)',
    textAlign: 'right',
    marginTop: 20,
    marginRight: -10,
  },
});
