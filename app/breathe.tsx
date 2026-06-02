import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';

const PHASE_MS = 4000;

export default function BreatheScreen() {
  const { t } = useLang();
  const scale = useRef(new Animated.Value(0.7)).current;
  const [phase, setPhase] = useState(0); // 0 nefes al · 1 tut · 2 ver · 3 tut

  const phases = [t('breathe.inhale'), t('breathe.hold'), t('breathe.exhale'), t('breathe.hold')];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.32, duration: PHASE_MS, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(PHASE_MS),
        Animated.timing(scale, { toValue: 0.7, duration: PHASE_MS, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(PHASE_MS),
      ])
    );
    loop.start();
    const interval = setInterval(() => setPhase((p) => (p + 1) % 4), PHASE_MS);
    return () => { loop.stop(); clearInterval(interval); };
  }, [scale]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.close} onPress={() => router.back()} hitSlop={16}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.sub}>{t('breathe.sub')}</Text>

        <View style={styles.orbWrap}>
          <Animated.View style={[styles.halo, { transform: [{ scale }] }]} />
          <Animated.View style={[styles.orb, { transform: [{ scale }] }]}>
            <LinearGradient
              colors={['rgba(232,213,163,0.34)', 'rgba(194,168,120,0.12)', 'rgba(194,168,120,0.04)']}
              start={{ x: 0.3, y: 0.2 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.orbGradient}
            />
          </Animated.View>
          <Text style={styles.phase}>{phases[phase]}</Text>
        </View>

        <Text style={styles.hint}>{t('breathe.hint')}</Text>
      </View>
    </SafeAreaView>
  );
}

const ORB = 200;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  close: { position: 'absolute', top: 56, right: 24, zIndex: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: Fonts.jostLight, fontSize: 22, color: Colors.muted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { fontFamily: Fonts.jost, fontSize: 12, letterSpacing: 2, color: Colors.muted, marginBottom: 56, textTransform: 'uppercase' },
  orbWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: ORB + 70, height: ORB + 70, borderRadius: (ORB + 70) / 2, backgroundColor: 'rgba(216,196,154,0.05)' },
  orb: { width: ORB, height: ORB, borderRadius: ORB / 2, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(216,196,154,0.25)' },
  orbGradient: { flex: 1 },
  phase: { position: 'absolute', fontFamily: Fonts.cormorantItalic, fontSize: 26, color: Colors.sand2 },
  hint: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.faint, marginTop: 56, letterSpacing: 0.3 },
});
