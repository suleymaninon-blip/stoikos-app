import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';

const { width } = Dimensions.get('window');

export function BrandIntro({ onFinish }: { onFinish: () => void }) {
  const { t } = useLang();

  const glow = useRef(new Animated.Value(0)).current;
  const omegaOpacity = useRef(new Animated.Value(0)).current;
  const omegaScale = useRef(new Animated.Value(0.82)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameUp = useRef(new Animated.Value(14)).current;
  const lineW = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Ω + ışıltı belirir
      Animated.parallel([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(omegaOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(omegaScale, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // STOIKOS yazısı yükselerek belirir
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(nameUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // ince çizgi + alt başlık
      Animated.parallel([
        Animated.timing(lineW, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // bekle
      Animated.delay(650),
      // tüm ekran yumuşakça kaybolur
      Animated.timing(screenFade, { toValue: 0, duration: 550, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]} pointerEvents="none">
      {/* arka plan ışıltısı */}
      <Animated.View style={[styles.glowWrap, { opacity: glow }]}>
        <LinearGradient
          colors={['rgba(212,146,74,0.22)', 'rgba(196,169,106,0.06)', 'transparent']}
          style={styles.glow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* dev soluk Ω (dekor) */}
      <Animated.Text style={[styles.omegaFaint, { opacity: Animated.multiply(glow, 0.5) }]}>Ω</Animated.Text>

      {/* ana Ω */}
      <Animated.Text style={[styles.omega, { opacity: omegaOpacity, transform: [{ scale: omegaScale }] }]}>Ω</Animated.Text>

      {/* STOIKOS */}
      <Animated.Text style={[styles.name, { opacity: nameOpacity, transform: [{ translateY: nameUp }] }]}>
        STOIKOS
      </Animated.Text>

      {/* ince çizgi */}
      <View style={styles.lineRow}>
        <Animated.View style={[styles.line, { width: lineW.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) }]} />
        <Animated.Text style={[styles.star, { opacity: taglineOpacity }]}>✦</Animated.Text>
        <Animated.View style={[styles.line, { width: lineW.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) }]} />
      </View>

      {/* alt başlık */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>{t('setup.tagline')}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glowWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  glow: { width: width * 1.4, height: width * 1.4, borderRadius: width },
  omegaFaint: { position: 'absolute', fontFamily: Fonts.cinzel, fontSize: 240, color: 'rgba(196,169,106,0.05)', lineHeight: 260 },
  omega: { fontFamily: Fonts.cinzelBold, fontSize: 76, color: Colors.sand2, lineHeight: 84, marginBottom: 6 },
  name: { fontFamily: Fonts.cinzelBold, fontSize: 34, letterSpacing: 8, color: Colors.sand3, marginTop: -4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 14 },
  line: { height: 1, backgroundColor: 'rgba(196,169,106,0.4)' },
  star: { fontSize: 10, color: Colors.sand },
  tagline: { fontFamily: Fonts.jostLight, fontSize: 12, letterSpacing: 3, color: Colors.muted },
});
