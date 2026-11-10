import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { useReduceMotion } from '../hooks/useReduceMotion';
import StoikosMark from './StoikosMark';

/**
 * Koç düşünürken bekleme (10 Kasım 2026, seçenek A · Nefes küresi; tasarım
 * https://claude.ai/artifact/6MXQ5EJyQ9SQoWcQVUAKPj). Ana ekrandaki nefes çiçeğinin minyatürü
 * balonun içinde 4,5 sn açılır / 4,5 sn kapanır, yanında "nefes al… / nefes ver…". Bekleme uzadıkça
 * altta ipuçları: 2,5 sn, 8 sn, 20 sn. `closing` olunca çiçek içe toplanıp kaybolur (260 ms), sonra
 * cevap balonu açılır. "Hareketi Azalt" açıksa yalnız yumuşak bir soluklaşma.
 * Yalnız transform/opacity (native driver).
 */
export const WAIT_CLOSE_MS = 260;
const HALF = 4500;
const PETALS = [0, 60, 120, 180, 240, 300];
const HINTS: [number, string][] = [[2500, 'coach.waitHint1'], [8000, 'coach.waitHint2'], [20000, 'coach.waitHint3']];

export function CoachWaiting({ closing }: { closing: boolean }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const reduce = useReduceMotion();

  const breath = useRef(new Animated.Value(0)).current;   // 0 = kapalı, 1 = açık çiçek
  const label = useRef(new Animated.Value(0)).current;    // 0 = "al", 1 = "ver"
  const appear = useRef(new Animated.Value(0)).current;   // giriş / çıkış
  const shrink = useRef(new Animated.Value(1)).current;   // çıkışta içe toplanma
  const hintOp = useRef(new Animated.Value(0)).current;
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 280, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const ease = Easing.inOut(Easing.sin);
    const loop = reduce
      ? Animated.loop(Animated.sequence([
          Animated.timing(breath, { toValue: 1, duration: 1500, easing: ease, useNativeDriver: true }),
          Animated.timing(breath, { toValue: 0.4, duration: 1500, easing: ease, useNativeDriver: true }),
        ]))
      : Animated.loop(Animated.sequence([
          Animated.parallel([
            Animated.timing(breath, { toValue: 1, duration: HALF, easing: ease, useNativeDriver: true }),
            Animated.timing(label, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(breath, { toValue: 0, duration: HALF, easing: ease, useNativeDriver: true }),
            Animated.timing(label, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]));
    loop.start();
    const timers = HINTS.map(([ms, key]) => setTimeout(() => {
      hintOp.setValue(0);
      setHint(key);
      Animated.timing(hintOp, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, ms));
    return () => { loop.stop(); timers.forEach(clearTimeout); };
  }, [reduce]);

  useEffect(() => {
    if (!closing) return;
    const ease = Easing.in(Easing.cubic);
    Animated.parallel([
      Animated.timing(appear, { toValue: 0, duration: WAIT_CLOSE_MS, easing: ease, useNativeDriver: true }),
      Animated.timing(shrink, { toValue: 0.6, duration: WAIT_CLOSE_MS, easing: ease, useNativeDriver: true }),
    ]).start();
  }, [closing]);

  const flower = reduce
    ? { opacity: breath, transform: [{ scale: 0.75 }] }
    : {
        transform: [
          { scale: breath.interpolate({ inputRange: [0, 1], outputRange: [0.48, 1] }) },
          { rotate: breath.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '60deg'] }) },
        ],
      };
  const bubble = {
    opacity: appear,
    transform: [
      { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) },
      { scale: shrink },
    ],
  };

  return (
    <View style={styles.wrap} accessible accessibilityLabel={t('coach.thinkingA11y')} accessibilityLiveRegion="polite">
      <View style={styles.labelRow}>
        <StoikosMark size={12} variant="line" color={Colors.sand} />
        <Text style={styles.label}>STOIKOS</Text>
      </View>
      <Animated.View style={[styles.bubble, bubble]}>
        <View style={styles.flowerBox}>
          <Animated.View style={[StyleSheet.absoluteFill, flower]}>
            {PETALS.map((deg) => (
              <View key={deg} style={[styles.petal, { backgroundColor: Colors.petal(0.42), transform: [{ rotate: `${deg}deg` }, { translateX: 9 }] }]} />
            ))}
          </Animated.View>
        </View>
        {reduce ? (
          <Text style={styles.say}>{t('coach.thinking')}</Text>
        ) : (
          <View style={styles.sayBox}>
            <Animated.Text style={[styles.say, styles.sayAbs, { opacity: label.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>{t('coach.breathIn')}</Animated.Text>
            <Animated.Text style={[styles.say, styles.sayAbs, { opacity: label }]}>{t('coach.breathOut')}</Animated.Text>
          </View>
        )}
      </Animated.View>
      {hint && !closing && <Animated.Text style={[styles.hint, { opacity: hintOp }]}>{t(hint)}</Animated.Text>}
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  wrap: { alignItems: 'flex-start', marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.sand },
  bubble: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.tint(0.09), borderRadius: 18, borderBottomLeftRadius: 5,
    paddingVertical: 12, paddingLeft: 12, paddingRight: 18, borderWidth: 1, borderColor: Colors.tint(0.18),
  },
  flowerBox: { width: 48, height: 48 },
  petal: { position: 'absolute', left: 13, top: 13, width: 22, height: 22, borderRadius: 11 },
  sayBox: { width: 96, height: 24, justifyContent: 'center' },
  sayAbs: { position: 'absolute', left: 0 },
  say: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.text2 },
  hint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 8, marginLeft: 4 },
});
