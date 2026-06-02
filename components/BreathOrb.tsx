import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../constants/theme';

type Props = {
  title?: string;
  sub?: string;
  onPress?: () => void;
};

// Klinik kanıtlı nefes orbu: 9 sn ritim (4.5 büyü / 4.5 küçül), sonsuz döngü.
// Katmanlı halka + gradient ile yumuşak derinlik. Dokununca tam nefes egzersizi.
export default function BreathOrb({ title = 'Bir an dur', sub = 'Daireyle birlikte nefes al · 9 saniye', onPress }: Props) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const haloScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.16, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(haloScale, { toValue: 1.3, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.82, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(haloScale, { toValue: 0.9, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity, haloScale]);

  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper style={styles.card} onPress={onPress}>
      <View style={styles.orbWrap}>
        {/* Dış hale — yavaş genişleyen yumuşak ışık */}
        <Animated.View style={[styles.halo, { transform: [{ scale: haloScale }], opacity: Animated.multiply(opacity, 0.5) }]} />
        {/* Orta katman */}
        <Animated.View style={[styles.midRing, { transform: [{ scale }], opacity }]} />
        {/* İç gradient daire */}
        <Animated.View style={[styles.orbInner, { transform: [{ scale }], opacity }]}>
          <LinearGradient
            colors={['rgba(232,213,163,0.32)', 'rgba(194,168,120,0.12)', 'rgba(194,168,120,0.04)']}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </Wrapper>
  );
}

const ORB = 124;
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(194,168,120,0.07)',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.14)',
    borderRadius: 32, paddingVertical: 36, paddingHorizontal: 24,
    alignItems: 'center', marginBottom: 32,
  },
  orbWrap: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  halo: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(216,196,154,0.08)',
  },
  midRing: {
    position: 'absolute', width: ORB + 26, height: ORB + 26, borderRadius: (ORB + 26) / 2,
    borderWidth: 1, borderColor: 'rgba(216,196,154,0.16)', backgroundColor: 'rgba(216,196,154,0.04)',
  },
  orbInner: {
    width: ORB, height: ORB, borderRadius: ORB / 2, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(216,196,154,0.28)',
  },
  orbGradient: { flex: 1 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.sand2, marginBottom: 6 },
  sub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
});
