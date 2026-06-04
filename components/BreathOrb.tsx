import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable, TouchableOpacity, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import {
  isBreathSoundSupported, getSoundPref, setSoundPref,
  startBreathSound, stopBreathSound,
} from '../constants/breathSound';
import {
  isHapticsSupported, getHapticsPref, setHapticsPref,
  hapticTap, hapticPhase, startBreathHaptics, stopHaptics,
} from '../constants/breathHaptics';

type Props = {
  idleTitle?: string;   // (kullanılmıyor; geriye dönük uyum)
  tapHint?: string;     // "Parmağını tut & hisset"
  inhaleLabel?: string; // "Nefes al"
  exhaleLabel?: string; // "Nefes ver"
  soundLabel?: string;
  hapticLabel?: string;
};

const HALF = 4500; // ms — nefes al / ver yarı döngüsü (orb, metin, renk ve titreşim aynı ritim)

// Orb her zaman yumuşakça nefes alıp verir.
// Parmağını BASILI TUTUNCA: nefesle rezone renk parlaması + titreşim.
// Parmağını çekince: renk normale döner, titreşimsiz nefes devam eder.
export default function BreathOrb({
  tapHint = 'Parmağını tut & hisset',
  inhaleLabel = 'Nefes al', exhaleLabel = 'Nefes ver',
  soundLabel = 'Sakinleştirici ses', hapticLabel = 'Titreşim',
}: Props) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const haloScale = useRef(new Animated.Value(0.9)).current;
  const pulse = useRef(new Animated.Value(0)).current;     // 0 (tam ver) .. 1 (tam al)
  const hold = useRef(new Animated.Value(0)).current;      // 0 (bırak) .. 1 (basılı)
  const textFade = useRef(new Animated.Value(1)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const phaseTimer = useRef<any>(null);
  const phaseRef = useRef<'in' | 'out'>('in');
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  const [held, setHeld] = useState(false);
  const heldRef = useRef(false);

  const hapticsSupported = isHapticsSupported();
  const [hapticsOn, setHapticsOn] = useState(false);
  const hapticsOnRef = useRef(false);

  const soundSupported = isBreathSoundSupported();
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  // Tercihleri yükle.
  useEffect(() => {
    if (hapticsSupported) getHapticsPref().then((on) => { setHapticsOn(on); hapticsOnRef.current = on; });
  }, [hapticsSupported]);
  useEffect(() => {
    if (soundSupported) getSoundPref().then((on) => { setSoundOn(on); soundOnRef.current = on; });
  }, [soundSupported]);

  // Sürekli nefes animasyonu (her zaman çalışır).
  useEffect(() => {
    const sec = (s: number, o: number, h: number, p: number) =>
      Animated.parallel([
        Animated.timing(scale, { toValue: s, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: o, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(haloScale, { toValue: h, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: p, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]);
    loopRef.current = Animated.loop(Animated.sequence([
      sec(1.16, 1, 1.3, 1),     // nefes al (büyür, parlaklık artar)
      sec(0.82, 0.6, 0.9, 0),   // nefes ver (küçülür, parlaklık azalır)
    ]));
    loopRef.current.start();

    // Faz takibi (metin + native titreşim ritmi). 'in' ile başlar.
    phaseRef.current = 'in';
    phaseTimer.current = setInterval(() => {
      const next = phaseRef.current === 'in' ? 'out' : 'in';
      phaseRef.current = next;
      setPhase(next);
      if (heldRef.current && hapticsOnRef.current) hapticPhase(next); // native: faz darbeleri
    }, HALF);

    return () => {
      loopRef.current?.stop();
      if (phaseTimer.current) clearInterval(phaseTimer.current);
    };
  }, [scale, opacity, haloScale, pulse]);

  // Metin değişiminde kısa fade.
  useEffect(() => {
    textFade.setValue(0.4);
    Animated.timing(textFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [phase, textFade]);

  // ── Basılı tutma ──
  const onPressIn = useCallback(() => {
    if (heldRef.current) return;
    heldRef.current = true;
    setHeld(true);
    Animated.timing(hold, { toValue: 1, duration: 320, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    if (hapticsOnRef.current) { hapticTap(); startBreathHaptics(phaseRef.current); }
  }, [hold]);

  const onPressOut = useCallback(() => {
    if (!heldRef.current) return;
    heldRef.current = false;
    setHeld(false);
    Animated.timing(hold, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    stopHaptics();
  }, [hold]);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    setSoundPref(next);
    if (next) startBreathSound(); else stopBreathSound();
  }, []);

  const toggleHaptics = useCallback(() => {
    const next = !hapticsOnRef.current;
    hapticsOnRef.current = next;
    setHapticsOn(next);
    setHapticsPref(next);
    if (next) hapticTap();
    else stopHaptics();
  }, []);

  // Ekrandan çıkınca / arka planda: ses + titreşim dursun, basılı durum sıfırlansın.
  const cleanupLive = useCallback(() => {
    heldRef.current = false; setHeld(false);
    hold.setValue(0);
    stopHaptics(); stopBreathSound();
  }, [hold]);
  useFocusEffect(useCallback(() => () => cleanupLive(), [cleanupLive]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') cleanupLive(); });
    return () => sub.remove();
  }, [cleanupLive]);

  const title = phase === 'in' ? inhaleLabel : exhaleLabel;
  // Renk parlaması: yalnız basılıyken görünür, nefesle (pulse) rezone eder.
  const glow = Animated.multiply(hold, pulse);

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.card}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        delayLongPress={99999}
        accessibilityRole="button"
        accessibilityLabel={tapHint}
      >
        <View style={styles.orbWrap}>
          <Animated.View style={[styles.halo, { transform: [{ scale: haloScale }], opacity: Animated.multiply(opacity, 0.5) }]} />
          {/* Basılıyken nefesle parlayan sıcak dış hale */}
          <Animated.View style={[styles.holdHalo, { transform: [{ scale: haloScale }], opacity: glow }]} />
          <Animated.View style={[styles.midRing, { transform: [{ scale }], opacity }]} />
          <Animated.View style={[styles.orbInner, { transform: [{ scale }], opacity }]}>
            <LinearGradient
              colors={['rgba(232,213,163,0.32)', 'rgba(194,168,120,0.12)', 'rgba(194,168,120,0.04)']}
              start={{ x: 0.3, y: 0.2 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.orbGradient}
            />
            {/* Basılıyken nefesle parlayan canlı altın katman */}
            <Animated.View style={[styles.holdGlow, { opacity: glow }]} />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { opacity: textFade }]}>{title}</Animated.Text>
        {!held && <Text style={styles.sub}>{tapHint}</Text>}
      </Pressable>

      {/* Titreşim toggle — sol üst (kartın kardeşi) */}
      {hapticsSupported && (
        <TouchableOpacity
          style={styles.hapticBtn}
          onPress={toggleHaptics}
          hitSlop={10}
          accessibilityRole="switch"
          accessibilityState={{ checked: hapticsOn }}
          accessibilityLabel={hapticLabel}
        >
          <Text style={[styles.soundIcon, hapticsOn && styles.soundIconOn]}>📳</Text>
        </TouchableOpacity>
      )}

      {/* Ses toggle — sağ üst (kartın kardeşi) */}
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
    </View>
  );
}

const ORB = 124;
const styles = StyleSheet.create({
  wrap: { marginBottom: 32, position: 'relative' },
  card: {
    backgroundColor: 'rgba(194,168,120,0.07)',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.14)',
    borderRadius: 32, paddingVertical: 36, paddingHorizontal: 24,
    alignItems: 'center',
  },
  soundBtn: {
    position: 'absolute', top: 14, right: 16, zIndex: 5,
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(194,168,120,0.08)',
  },
  hapticBtn: {
    position: 'absolute', top: 14, left: 16, zIndex: 5,
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
  holdHalo: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(245,205,120,0.30)',
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
  holdGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(245,205,120,0.6)' },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.sand2, marginBottom: 6, minHeight: 28 },
  sub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
});
