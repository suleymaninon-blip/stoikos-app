import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable, TouchableOpacity, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import {
  isBreathSoundSupported, getSoundPref, setSoundPref,
  startBreathSound, stopBreathSound,
} from '../constants/breathSound';

type Props = {
  title?: string;
  sub?: string;
  onPress?: () => void;
  soundLabel?: string; // erişilebilirlik / etiket (çok dilli)
};

// Klinik kanıtlı nefes orbu: 9 sn ritim (4.5 büyü / 4.5 küçül), sonsuz döngü.
// Katmanlı halka + gradient ile yumuşak derinlik. Dokununca tam nefes egzersizi.
// Opsiyonel: nefese senkron, varsayılan kapalı sakinleştirici ses (yalnız web).
export default function BreathOrb({ title = 'Bir an dur', sub = 'Daireyle birlikte nefes al · 9 saniye', onPress, soundLabel = 'Sakinleştirici ses' }: Props) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const haloScale = useRef(new Animated.Value(0.9)).current;

  const soundSupported = isBreathSoundSupported();
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

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

  // Kalıcı tercihi yükle (varsayılan kapalı). Tercih açıksa en iyi çabayla başlat.
  useEffect(() => {
    if (!soundSupported) return;
    getSoundPref().then((on) => {
      setSoundOn(on);
      soundOnRef.current = on;
      if (on) startBreathSound();
    });
  }, [soundSupported]);

  // Ekrandan çıkınca sesi durdur, geri dönünce tercih açıksa devam et.
  useFocusEffect(
    useCallback(() => {
      if (soundOnRef.current) startBreathSound();
      return () => stopBreathSound();
    }, [])
  );

  // Uygulama arka plana geçince ses dursun (pil & nezaket).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') stopBreathSound();
      else if (soundOnRef.current) startBreathSound();
    });
    return () => sub.remove();
  }, []);

  // Bileşen tamamen kalkarsa sesi kapat.
  useEffect(() => () => stopBreathSound(), []);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    setSoundPref(next);
    if (next) startBreathSound();
    else stopBreathSound();
  }, []);

  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper style={styles.card} onPress={onPress}>
      {soundSupported && (
        <TouchableOpacity
          style={styles.soundBtn}
          onPress={toggleSound}
          hitSlop={10}
          accessibilityRole="switch"
          accessibilityState={{ checked: soundOn }}
          accessibilityLabel={soundLabel}
        >
          <Text style={[styles.soundIcon, soundOn && styles.soundIconOn]}>{soundOn ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
      )}

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
  soundBtn: {
    position: 'absolute', top: 14, right: 16, zIndex: 5,
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(194,168,120,0.08)',
  },
  soundIcon: { fontSize: 15, opacity: 0.55 },
  soundIconOn: { opacity: 1 },
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
