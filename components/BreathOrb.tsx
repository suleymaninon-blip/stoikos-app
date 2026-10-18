import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable, TouchableOpacity, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { SoundIcon } from './Icons';
import {
  isBreathSoundSupported, getSoundPref, setSoundPref,
  startBreathSound, stopBreathSound,
} from '../constants/breathSound';

type Props = {
  idleTitle?: string;   // dururken başlık: "Bir an dur"
  tapHint?: string;     // dururken alt satır: "Başlamak için dokun"
  stopHint?: string;    // çalışırken alt satır: "Bitirmek için dokun"
  countLabel?: string;  // "{n} nefes" — çalışırken ve bitince
  inhaleLabel?: string; // "Nefes al"
  exhaleLabel?: string; // "Nefes ver"
  soundLabel?: string;
};

/**
 * Nefes çiçeği — Apple Watch'taki Farkındalık > Nefes uygulamasından esinlenildi.
 *
 * Altı saydam "taç yaprağı" üst üste biniyor: nefes verirken merkezde tek bir
 * küçük daireye toplanıyor, nefes alırken dışa açılıp dönerek bir çiçeğe
 * dönüşüyor. Saydamlıklar üst üste bindiği için merkez kendiliğinden parlıyor.
 *
 * Etkileşim (Ekim 2026'da değişti): eskiden BASILI TUTUNCA çalışıyordu;
 * kullanıcı parmağını ekranda tutmak zorunda kalıyordu. Şimdi bir kez DOKUN →
 * başlar, tekrar DOKUN → biter. Dururken çiçek kapalı ve çok hafif "yaşıyor".
 *
 * ⚠️ Ses: startBreathSound() dokunma işleyicisinin İÇİNDE, araya await
 * girmeden çağrılmalı — iOS Safari kuralı (bkz. constants/breathSound.ts).
 */
const HALF = 4500;   // ms — nefes al / ver yarı döngüsü (~6,7 nefes/dk)
const PREP = 900;    // ms — başlarken çiçeğin önce kapandığı hazırlık
const PETALS = 6;
const SIZE = 210;    // çiçeğin kutusu
const PETAL = 96;    // yaprak çapı
const SPREAD = 48;   // tam açıkken yaprak merkezinin çiçek merkezine uzaklığı

export default function BreathOrb({
  idleTitle = 'Bir an dur',
  tapHint = 'Başlamak için dokun',
  stopHint = 'Bitirmek için dokun',
  countLabel = '{n} nefes',
  inhaleLabel = 'Nefes al', exhaleLabel = 'Nefes ver',
  soundLabel = 'Sakinleştirici ses',
}: Props) {
  const breath = useRef(new Animated.Value(0)).current;   // 0 = kapalı (verilmiş), 1 = tam açık (alınmış)
  const live = useRef(new Animated.Value(0)).current;     // 0 = dururken, 1 = egzersizde (parlaklık)
  const textFade = useRef(new Animated.Value(1)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timers = useRef<any[]>([]);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [summary, setSummary] = useState<number | null>(null);

  const soundSupported = isBreathSoundSupported();
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  useEffect(() => {
    if (soundSupported) getSoundPref().then((on) => { setSoundOn(on); soundOnRef.current = on; });
  }, [soundSupported]);

  const clearTimers = () => { timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); }); timers.current = []; };

  // Dururken: çiçek yarı açık, yavaşça nefes alıyor — davetkâr, canlı (Apple Watch'taki gibi).
  const startIdle = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 0.5, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0.3, duration: 3600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loopRef.current.start();
  }, [breath]);

  useEffect(() => {
    startIdle();
    return () => { loopRef.current?.stop(); clearTimers(); };
  }, [startIdle]);

  useEffect(() => {
    textFade.setValue(0.35);
    Animated.timing(textFade, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [phase, active, textFade]);

  // ── Başlat / bitir ──
  const start = useCallback(() => {
    activeRef.current = true;
    setActive(true);
    setSummary(null);
    setCount(0);
    countRef.current = 0;
    setPhase('out'); // hazırlık: çiçek önce kapanır
    if (soundOnRef.current) startBreathSound(); // dokunuşun içinde, await yok (iOS)

    loopRef.current?.stop();
    Animated.timing(live, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Önce kısaca tamamen kapan (PREP), sonra döngü: al (HALF) → ver (HALF).
    const cycle = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: HALF, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0, duration: HALF, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loopRef.current = Animated.sequence([
      Animated.timing(breath, { toValue: 0, duration: PREP, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      cycle,
    ]);
    loopRef.current.start();

    clearTimers();
    timers.current.push(setTimeout(() => {
      if (!activeRef.current) return;
      setPhase('in');
      let half = 0;
      timers.current.push(setInterval(() => {
        half += 1;
        setPhase(half % 2 === 0 ? 'in' : 'out');
        if (half % 2 === 0) { countRef.current += 1; setCount(countRef.current); } // her tam ver bittiğinde bir nefes
      }, HALF));
    }, PREP));
  }, [breath, live]);

  const stop = useCallback((showSummary = true) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setActive(false);
    clearTimers();
    stopBreathSound();
    loopRef.current?.stop();
    Animated.timing(live, { toValue: 0, duration: 900, useNativeDriver: true }).start();
    Animated.timing(breath, { toValue: 0.3, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      .start(() => { if (!activeRef.current) startIdle(); });
    if (showSummary) {
      if (countRef.current > 0) {
        setSummary(countRef.current);
        timers.current.push(setTimeout(() => setSummary(null), 4500));
      }
    }
  }, [breath, live, startIdle]);

  const onPress = useCallback(() => {
    if (activeRef.current) stop(); else start();
  }, [start, stop]);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    setSoundPref(next);
    if (!next) stopBreathSound();
    else if (activeRef.current) startBreathSound();
  }, []);

  // Ekrandan çıkınca / arka planda: egzersiz sessizce biter.
  useFocusEffect(useCallback(() => () => stop(false), [stop]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') stop(false); });
    return () => sub.remove();
  }, [stop]);

  // ── Çiçek ──
  const rotate = breath.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '60deg'] });
  const flowerScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.06] });
  const petalScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const flowerOpacity = live.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const haloOpacity = Animated.multiply(live, breath.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.42] }));

  const petals = Array.from({ length: PETALS }, (_, i) => {
    const a = (i / PETALS) * Math.PI * 2 - Math.PI / 2;
    const tx = breath.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * SPREAD] });
    const ty = breath.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * SPREAD] });
    return (
      <Animated.View
        key={i}
        style={[styles.petal, { transform: [{ translateX: tx }, { translateY: ty }, { scale: petalScale }] }]}
      >
        <LinearGradient
          colors={i % 2 === 0
            ? ['rgba(255,236,196,0.62)', 'rgba(224,184,112,0.38)', 'rgba(160,120,60,0.20)']
            : ['rgba(248,210,150,0.56)', 'rgba(212,160,92,0.34)', 'rgba(140,100,48,0.18)']}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.85, y: 0.95 }}
          style={styles.petalFill}
        />
      </Animated.View>
    );
  });

  const title = active ? (phase === 'in' ? inhaleLabel : exhaleLabel) : idleTitle;
  const sub = active
    ? `${stopHint}${count > 0 ? ` · ${countLabel.replace('{n}', String(count))}` : ''}`
    : summary != null
      ? `✦ ${countLabel.replace('{n}', String(summary))}`
      : tapHint;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.card, active && styles.cardActive]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={active ? stopHint : tapHint}
      >
        <View style={styles.flowerBox}>
          <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: flowerScale }] }]} />
          <Animated.View style={[styles.flower, { opacity: flowerOpacity, transform: [{ rotate }, { scale: flowerScale }] }]}>
            {petals}
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { opacity: textFade }]}>{title}</Animated.Text>
        <Text style={styles.sub}>{sub}</Text>
      </Pressable>

      {soundSupported && (
        <TouchableOpacity
          style={styles.soundBtn}
          onPress={toggleSound}
          hitSlop={10}
          accessibilityRole="switch"
          accessibilityState={{ checked: soundOn }}
          accessibilityLabel={soundLabel}
        >
          <View style={[styles.soundIcon, soundOn && styles.soundIconOn]}>
            <SoundIcon size={17} on={soundOn} color={Colors.sand} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 32, position: 'relative' },
  card: {
    backgroundColor: 'rgba(194,168,120,0.07)',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.14)',
    borderRadius: 32, paddingVertical: 30, paddingHorizontal: 24,
    alignItems: 'center',
  },
  cardActive: { backgroundColor: 'rgba(194,168,120,0.10)', borderColor: 'rgba(194,168,120,0.24)' },
  soundBtn: {
    position: 'absolute', top: 14, right: 16, zIndex: 5,
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(194,168,120,0.08)',
  },
  soundIcon: { opacity: 0.55 },
  soundIconOn: { opacity: 1 },
  flowerBox: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  halo: {
    position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    backgroundColor: 'rgba(240,196,120,0.22)',
  },
  flower: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  petal: {
    position: 'absolute', width: PETAL, height: PETAL, borderRadius: PETAL / 2, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(250,228,180,0.22)',
  },
  petalFill: { flex: 1 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 23, color: Colors.sand2, marginBottom: 6, minHeight: 30 },
  sub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3, minHeight: 16 },
});
