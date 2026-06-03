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
  idleTitle?: string;   // "Bir an dur"
  tapHint?: string;     // "Dokun & başla"
  inhaleLabel?: string; // "Nefes al"
  exhaleLabel?: string; // "Nefes ver"
  soundLabel?: string;  // erişilebilirlik etiketi
  hapticLabel?: string; // erişilebilirlik etiketi (titreşim)
};

const HALF = 4500; // ms — nefes al / ver yarı döngüsü (orb, metin ve ses aynı ritim)

// Nefes orbu: dokununca YERİNDE 9 sn döngüye başlar (yeni ekran açmaz).
// Aktifken altındaki metin ritimle "Nefes al / Nefes ver" değişir; ses açıksa senkron çalar.
export default function BreathOrb({
  idleTitle = 'Bir an dur', tapHint = 'Dokun & başla',
  inhaleLabel = 'Nefes al', exhaleLabel = 'Nefes ver', soundLabel = 'Sakinleştirici ses',
  hapticLabel = 'Titreşim',
}: Props) {
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  const haloScale = useRef(new Animated.Value(0.9)).current;
  const textFade = useRef(new Animated.Value(1)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const phaseTimer = useRef<any>(null);

  const [isActive, setIsActive] = useState(false);
  const activeRef = useRef(false);
  const [phase, setPhase] = useState<'in' | 'out'>('in'); // yalnız aktifken anlamlı
  const phaseRef = useRef<'in' | 'out'>('in');

  const hapticsSupported = isHapticsSupported();
  const [hapticsOn, setHapticsOn] = useState(false);
  const hapticsOnRef = useRef(false);

  const soundSupported = isBreathSoundSupported();
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  // Ses tercihini yükle (yalnız ikon durumu için; varsayılan kapalı, otomatik başlamaz).
  useEffect(() => {
    if (!soundSupported) return;
    getSoundPref().then((on) => { setSoundOn(on); soundOnRef.current = on; });
  }, [soundSupported]);

  // Titreşim tercihini yükle (varsayılan AÇIK).
  useEffect(() => {
    if (!hapticsSupported) return;
    getHapticsPref().then((on) => { setHapticsOn(on); hapticsOnRef.current = on; });
  }, [hapticsSupported]);

  // Metin her değiştiğinde kısa yumuşak fade.
  useEffect(() => {
    textFade.setValue(0.35);
    Animated.timing(textFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [phase, isActive, textFade]);

  const stopAnimLoop = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.82, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.6, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(haloScale, { toValue: 0.9, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [scale, opacity, haloScale]);

  const startAnimLoop = useCallback(() => {
    scale.setValue(0.82); opacity.setValue(0.6); haloScale.setValue(0.9);
    const sec = (toScale: number, toOpacity: number, toHalo: number) =>
      Animated.parallel([
        Animated.timing(scale, { toValue: toScale, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: toOpacity, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(haloScale, { toValue: toHalo, duration: HALF, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]);
    loopRef.current = Animated.loop(Animated.sequence([
      sec(1.16, 1, 1.3),    // nefes al (büyür)
      sec(0.82, 0.6, 0.9),  // nefes ver (küçülür)
    ]));
    loopRef.current.start();
  }, [scale, opacity, haloScale]);

  const deactivate = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setIsActive(false);
    if (phaseTimer.current) { clearInterval(phaseTimer.current); phaseTimer.current = null; }
    stopAnimLoop();
    stopBreathSound();
    stopHaptics();
  }, [stopAnimLoop]);

  const activate = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsActive(true);
    phaseRef.current = 'in';
    setPhase('in');
    startAnimLoop();
    // Basış dokunuşu + ritmik titreşim (web: tek uzun desen / native: faz darbeleri).
    if (hapticsOnRef.current) { hapticTap(); startBreathHaptics(); }
    // Metin + titreşim ritmi: ilk faz 'in', 4.5 sn sonra 'out', sonra döngü.
    if (phaseTimer.current) clearInterval(phaseTimer.current);
    phaseTimer.current = setInterval(() => {
      const next = phaseRef.current === 'in' ? 'out' : 'in';
      phaseRef.current = next;
      setPhase(next);
      if (hapticsOnRef.current) hapticPhase(next);
    }, HALF);
    if (soundOnRef.current) startBreathSound();
  }, [startAnimLoop]);

  const toggleActive = useCallback(() => {
    if (activeRef.current) deactivate(); else activate();
  }, [activate, deactivate]);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    setSoundPref(next);
    // Ses yalnız egzersiz aktifken çalsın.
    if (next && activeRef.current) startBreathSound();
    else stopBreathSound();
  }, []);

  const toggleHaptics = useCallback(() => {
    const next = !hapticsOnRef.current;
    hapticsOnRef.current = next;
    setHapticsOn(next);
    setHapticsPref(next);
    if (next) hapticTap(); // açınca tek dokunuş onayı
    else stopHaptics();
  }, []);

  // Ekrandan çıkınca / arka plana atılınca egzersizi ve sesi durdur.
  useFocusEffect(useCallback(() => () => deactivate(), [deactivate]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') deactivate(); });
    return () => sub.remove();
  }, [deactivate]);
  useEffect(() => () => deactivate(), [deactivate]);

  const title = isActive ? (phase === 'in' ? inhaleLabel : exhaleLabel) : idleTitle;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={toggleActive} accessibilityRole="button">
        <View style={styles.orbWrap}>
          <Animated.View style={[styles.halo, { transform: [{ scale: haloScale }], opacity: Animated.multiply(opacity, 0.5) }]} />
          <Animated.View style={[styles.midRing, { transform: [{ scale }], opacity }]} />
          <Animated.View style={[styles.orbInner, { transform: [{ scale }], opacity }]}>
            <LinearGradient
              colors={['rgba(232,213,163,0.32)', 'rgba(194,168,120,0.12)', 'rgba(194,168,120,0.04)']}
              start={{ x: 0.3, y: 0.2 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.orbGradient}
            />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { opacity: textFade }]}>{title}</Animated.Text>
        {!isActive && <Text style={styles.sub}>{tapHint}</Text>}
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

      {/* Ses toggle — sağ üst (kartın kardeşi; tıklama egzersize yayılmaz) */}
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
  midRing: {
    position: 'absolute', width: ORB + 26, height: ORB + 26, borderRadius: (ORB + 26) / 2,
    borderWidth: 1, borderColor: 'rgba(216,196,154,0.16)', backgroundColor: 'rgba(216,196,154,0.04)',
  },
  orbInner: {
    width: ORB, height: ORB, borderRadius: ORB / 2, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(216,196,154,0.28)',
  },
  orbGradient: { flex: 1 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.sand2, marginBottom: 6, minHeight: 28 },
  sub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
});
