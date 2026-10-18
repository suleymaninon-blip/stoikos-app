import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, View, Text, StyleSheet, Pressable, TouchableOpacity, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { SoundIcon } from './Icons';
import {
  isBreathSoundSupported, getSoundPref, setSoundPref,
  startBreathSound, stopBreathSound,
} from '../constants/breathSound';
import {
  BREATH_DURATIONS, BreathDuration, MIN_LOGGED_SECONDS,
  getBreathDuration, setBreathDuration, logBreathSession,
} from '../constants/breathLog';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  idleTitle?: string;   // dururken başlık: "Bir an dur"
  tapHint?: string;     // dururken alt satır: "Başlamak için dokun"
  stopHint?: string;    // çalışırken alt satır: "Bitirmek için dokun"
  countLabel?: string;  // "{n} nefes" — çalışırken ve bitince
  inhaleLabel?: string; // "Nefes al"
  exhaleLabel?: string; // "Nefes ver"
  soundLabel?: string;
  minuteLabel?: string;   // "{n} dk" — süre seçici ve özet
  noLimitLabel?: string;  // "Süresiz" — ∞ seçeneğinin erişilebilirlik adı
  onComplete?: () => void; // seans İlerleme'ye işlendiğinde (ana ekran sürekliliği yenilesin)
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
  minuteLabel = '{n} dk',
  noLimitLabel = 'Süresiz',
  onComplete,
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
  const [summary, setSummary] = useState<string | null>(null);

  // Seans süresi (Ekim 2026): 1 / 3 / 5 dk ya da süresiz. Süre bitince çiçek kendiliğinden kapanır.
  const [duration, setDuration] = useState<BreathDuration>(60);
  const durationRef = useRef<BreathDuration>(60);
  const [remaining, setRemaining] = useState(0);
  const startedAt = useRef(0);
  const ring = useRef(new Animated.Value(0)).current; // 0..1 — geçen sürenin oranı (halka)
  useEffect(() => { getBreathDuration().then((d) => { setDuration(d); durationRef.current = d; }); }, []);
  const chooseDuration = useCallback((d: BreathDuration) => {
    setDuration(d); durationRef.current = d; setBreathDuration(d);
  }, []);

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

    // Süre: kalan saniye, halka ve otomatik bitiş.
    startedAt.current = Date.now();
    const dur = durationRef.current;
    ring.setValue(0);
    if (dur > 0) {
      setRemaining(dur);
      Animated.timing(ring, { toValue: 1, duration: dur * 1000, easing: Easing.linear, useNativeDriver: false }).start();
      timers.current.push(setInterval(() => {
        setRemaining(Math.max(0, Math.ceil(dur - (Date.now() - startedAt.current) / 1000)));
      }, 500));
      timers.current.push(setTimeout(() => stopRef.current(true), dur * 1000));
    }
  }, [breath, live, ring]);

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
    ring.stopAnimation();
    Animated.timing(ring, { toValue: 0, duration: 600, useNativeDriver: false }).start();

    const elapsed = (Date.now() - startedAt.current) / 1000;
    // En az 1 dakikalık seans İlerleme'ye ve sürekliliğe sayılır (süre dolsa da, elle bitse de).
    if (elapsed >= MIN_LOGGED_SECONDS) logBreathSession().then(() => onComplete?.());

    if (showSummary) {
      const parts: string[] = [];
      const mins = Math.floor((elapsed + 1) / 60); // süre dolunca 59,9 sn'yi 1 dk say
      if (mins >= 1) parts.push(minuteLabel.replace('{n}', String(mins)));
      if (countRef.current > 0) parts.push(countLabel.replace('{n}', String(countRef.current)));
      if (parts.length) {
        setSummary(`✦ ${parts.join(' · ')}`);
        timers.current.push(setTimeout(() => setSummary(null), 5000));
      }
    }
  }, [breath, live, ring, startIdle, onComplete, minuteLabel, countLabel]);
  const stopRef = useRef(stop);
  stopRef.current = stop;

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
  const countText = count > 0 ? countLabel.replace('{n}', String(count)) : '';
  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  const sub = active
    ? (duration > 0
        ? [clock, countText || stopHint].join(' · ')
        : [stopHint, countText].filter(Boolean).join(' · '))
    : summary ?? tapHint;

  // Kalan süre halkası (yalnız süreli seansta)
  const RING_R = SIZE / 2 - 3;
  const RING_C = 2 * Math.PI * RING_R;
  const ringOffset = ring.interpolate({ inputRange: [0, 1], outputRange: [RING_C, 0] });

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
          {active && duration > 0 && (
            <Svg width={SIZE} height={SIZE} style={styles.ring} pointerEvents="none">
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={RING_R} stroke="rgba(216,196,154,0.10)" strokeWidth={2} fill="none" />
              <AnimatedCircle
                cx={SIZE / 2} cy={SIZE / 2} r={RING_R}
                stroke="#d4b376" strokeOpacity={0.85} strokeWidth={2.5} strokeLinecap="round" fill="none"
                strokeDasharray={`${RING_C} ${RING_C}`}
                strokeDashoffset={ringOffset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            </Svg>
          )}
          <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: flowerScale }] }]} />
          <Animated.View style={[styles.flower, { opacity: flowerOpacity, transform: [{ rotate }, { scale: flowerScale }] }]}>
            {petals}
          </Animated.View>
        </View>

        <Animated.Text style={[styles.title, { opacity: textFade }]}>{title}</Animated.Text>
        <Text style={styles.sub}>{sub}</Text>

        {/* Egzersizde gizlenmiyor, yalnız sönüyor: kart boyu değişip alttaki içerik zıplamasın. */}
        {(
          <View style={[styles.durRow, active && styles.durRowHidden]} pointerEvents={active ? 'none' : 'auto'}>
            {BREATH_DURATIONS.map((d) => {
              const on = d === duration;
              return (
                <Pressable
                  key={d}
                  onPress={() => chooseDuration(d)}
                  hitSlop={6}
                  style={[styles.durChip, on && styles.durChipOn]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={d === 0 ? noLimitLabel : minuteLabel.replace('{n}', String(d / 60))}
                >
                  <Text style={[styles.durText, on && styles.durTextOn]}>
                    {d === 0 ? '∞' : minuteLabel.replace('{n}', String(d / 60))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
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
  ring: { position: 'absolute', top: 0, left: 0 },
  durRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  durRowHidden: { opacity: 0 },
  durChip: {
    minWidth: 46, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.16)',
  },
  durChipOn: { backgroundColor: 'rgba(194,168,120,0.14)', borderColor: 'rgba(216,196,154,0.42)' },
  durText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
  durTextOn: { color: Colors.sand2 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 23, color: Colors.sand2, marginBottom: 6, minHeight: 30 },
  sub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3, minHeight: 16 },
});
