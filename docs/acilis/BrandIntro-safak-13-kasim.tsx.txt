import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinear, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { appDimensions } from '../constants/layout';
import { Fonts } from '../constants/theme';
import { useTheme } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { MARK_CENTER, MARK_PATH, MARK_PATH_LEN, MARK_VIEWBOX } from './StoikosMark';

/**
 * Açılış — "Şafak" (13 Kasım 2026, kullanıcı seçimi C; üç seçeneğin videosu sohbette gösterildi).
 *
 * Gece lacivertinden gün doğumuna, oradan uygulamanın kendi zeminine. Nefes çiçeğinin altı yaprağı
 * aşağıdan yükselirken dönerek toplanır ve logodaki küre olur (küre güneş gibi doğar); Ω kavisi küreyi
 * sararak çizilir; STOIKOS harf harf belirir; ince çizgi ve okunur bir alt başlık gelir.
 *
 * Eskisi siyah-altın zeminde sırayla beliren üç öğeydi: hareket yoktu, alt başlık koyu zeminde okunmuyordu
 * ve siyahtan krem uygulamaya sert bir atlama oluyordu (test edenler: "çok kasvetli").
 *
 * - Sonu temanın zeminine iner (açık temada fildişi, gece mavisinde lacivert): renk atlaması yok.
 * - Dokununca atlanır. "Hareketi Azalt" açıksa yalnız son hâl belirir ve söner.
 * - Kavis çizimi hariç her şey transform/opacity (native driver); kavis `strokeDashoffset` (JS).
 */
const { width, height } = appDimensions();
const AnimatedPath = Animated.createAnimatedComponent(Path);

const MARK = 150;                      // işaretin ekrandaki boyutu
const K = MARK / 640;                  // viewBox birimi → piksel
const PETAL = 112 * 2 * K;             // yaprak çapı
const SPREAD = 150 * K;                // açık çiçekte yaprak merkezinin uzaklığı
const GLOW = Math.round(Math.min(width * 1.5, 560));
const RISE = Math.round(height * 0.36); // kürenin doğduğu derinlik
const SPEED = 0.85;                    // tasarımdaki zamanlamanın hızlandırılmış hâli (her açılışta oynuyor)
const ms = (t: number) => Math.round(t * SPEED);
const LETTERS = 'STOIKOS'.split('');
const ANGLES = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2);

export function BrandIntro({ onFinish }: { onFinish: () => void }) {
  const { t } = useLang();
  const { C } = useTheme();
  const reduce = useReduceMotion();

  const dawn = useRef(new Animated.Value(0)).current;       // gün doğumu katmanı
  const day = useRef(new Animated.Value(0)).current;        // temanın zemini
  const glow = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;       // 0 = aşağıda, 1 = yerinde
  const conv = useRef(new Animated.Value(0)).current;       // yapraklar: 0 = açık, 1 = toplanmış
  const petalsIn = useRef(new Animated.Value(0)).current;
  const petalsOut = useRef(new Animated.Value(1)).current;
  const orb = useRef(new Animated.Value(0)).current;
  const arc = useRef(new Animated.Value(0)).current;
  const letters = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const hair = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  const leave = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(exit, { toValue: 1, duration: 520, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => onFinish());
  };

  useEffect(() => {
    const io = Easing.inOut(Easing.cubic), o = Easing.out(Easing.cubic);
    const tm = (v: Animated.Value, at: number, dur: number, easing = io, native = true, to = 1) =>
      Animated.timing(v, { toValue: to, delay: ms(at), duration: ms(dur), easing, useNativeDriver: native });
    if (reduce) {
      [dawn, day, glow, rise, conv, orb, arc, hair, tag, ...letters].forEach((v) => v.setValue(1));
      petalsOut.setValue(0);
      const id = setTimeout(leave, 1400);
      return () => clearTimeout(id);
    }
    Animated.parallel([
      tm(dawn, 350, 1100), tm(day, 1300, 1100), tm(glow, 150, 900, o),
      tm(rise, 300, 1900), tm(conv, 600, 900),
      tm(petalsIn, 150, 450, o), tm(petalsOut, 1300, 350, o, true, 0),
      tm(orb, 1150, 400, o), tm(arc, 1400, 1000, io, false),
      ...letters.map((v, i) => tm(v, 1900 + i * 75, 520, o)),
      tm(hair, 2550, 600), tm(tag, 2750, 600, o),
    ]).start();
    const id = setTimeout(leave, ms(4100));
    return () => clearTimeout(id);
  }, [reduce]);

  const ink = C.text, soft = C.text2;
  const gold = C.isDark ? ['#f4e2b8', '#d4b376', '#9a7b44'] : ['#d9b876', '#b8944f', '#8a6a34'];
  const riseY = rise.interpolate({ inputRange: [0, 1], outputRange: [RISE, 0] });

  return (
    <Animated.View
      style={[styles.container, { opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={leave} accessibilityRole="button" accessibilityLabel="Stoikos">
        {/* gece → gün doğumu → temanın zemini */}
        <LinearGradient colors={['#101826', '#1b2740', '#2c3550']} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: dawn }]}>
          <LinearGradient colors={['#2b3a63', '#7a6f9c', '#e0a184', '#ffd9a0']} locations={[0, 0.38, 0.68, 1]} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: day, backgroundColor: C.bg }]} />

        <View style={styles.center} pointerEvents="none">
          <View style={styles.mark}>
            {/* ışıltı küreyle birlikte yükselir */}
            <Animated.View style={[styles.glow, { opacity: glow, transform: [{ translateY: riseY }] }]}>
              <Svg width={GLOW} height={GLOW}>
                <Defs>
                  <RadialGradient id="introGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#e2aa5a" stopOpacity="0.34" />
                    <Stop offset="0.56" stopColor="#e2aa5a" stopOpacity="0.1" />
                    <Stop offset="1" stopColor="#e2aa5a" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#introGlow)" />
              </Svg>
            </Animated.View>

            {/* nefes çiçeği: altı yaprak dönerek toplanır */}
            <Animated.View
              style={[styles.markFill, {
                opacity: Animated.multiply(petalsIn, petalsOut),
                transform: [{ translateY: riseY }, { rotate: conv.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '60deg'] }) }],
              }]}
            >
              {ANGLES.map((a, i) => (
                <Animated.View
                  key={i}
                  style={[styles.petal, {
                    transform: [
                      { translateX: conv.interpolate({ inputRange: [0, 1], outputRange: [Math.cos(a) * SPREAD, 0] }) },
                      { translateY: conv.interpolate({ inputRange: [0, 1], outputRange: [Math.sin(a) * SPREAD, 0] }) },
                    ],
                  }]}
                />
              ))}
            </Animated.View>
            {/* küre */}
            <Animated.View style={[styles.markFill, { opacity: orb, transform: [{ translateY: riseY }] }]}>
              <Svg width={MARK} height={MARK} viewBox={MARK_VIEWBOX}>
                <Defs>
                  <RadialGradient id="introOrb" cx="42%" cy="36%" r="70%">
                    <Stop offset="0" stopColor="#f8ebc8" />
                    <Stop offset="0.45" stopColor="#d2b06c" />
                    <Stop offset="1" stopColor={C.isDark ? '#6e5530' : '#8a6a34'} />
                  </RadialGradient>
                </Defs>
                <Circle cx={MARK_CENTER.x} cy={MARK_CENTER.y} r={128} fill="url(#introOrb)" />
              </Svg>
            </Animated.View>
            {/* Ω kavisi küreyi sararak çizilir */}
            <Animated.View style={[styles.markFill, { opacity: arc.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] }) }]}>
              <Svg width={MARK} height={MARK} viewBox={MARK_VIEWBOX}>
                <Defs>
                  <SvgLinear id="introArc" x1="0" y1="250" x2="0" y2="760" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={gold[0]} />
                    <Stop offset="0.45" stopColor={gold[1]} />
                    <Stop offset="1" stopColor={gold[2]} />
                  </SvgLinear>
                </Defs>
                <AnimatedPath
                  d={MARK_PATH}
                  fill="none"
                  stroke="url(#introArc)"
                  strokeWidth={34}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={MARK_PATH_LEN}
                  strokeDashoffset={arc.interpolate({ inputRange: [0, 1], outputRange: [MARK_PATH_LEN, 0] })}
                />
              </Svg>
            </Animated.View>
          </View>

          {/* STOIKOS, harf harf */}
          <View style={styles.word}>
            {LETTERS.map((ch, i) => (
              <Animated.Text
                key={i}
                style={[styles.letter, { color: ink, opacity: letters[i], transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}
              >
                {ch}
              </Animated.Text>
            ))}
          </View>
          <Animated.View style={[styles.hair, { opacity: hair, transform: [{ scaleX: hair }] }]} />
          <Animated.Text style={[styles.tagline, { color: soft, opacity: tag }]}>{t('setup.tagline')}</Animated.Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 999, backgroundColor: '#101826' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.06 },
  glow: { position: 'absolute', width: GLOW, height: GLOW, left: (MARK - GLOW) / 2, top: (MARK - GLOW) / 2 },
  mark: { width: MARK, height: MARK },
  markFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  petal: {
    position: 'absolute', width: PETAL, height: PETAL, borderRadius: PETAL / 2,
    // viewBox'ta küre merkezi karenin tam ortasında değil (y 477, orta 482): yapraklar küreyle aynı noktaya toplansın
    left: (MARK - PETAL) / 2, top: (MARK - PETAL) / 2 + (MARK_CENTER.y - 482) * K,
    backgroundColor: 'rgba(226,190,120,0.42)', borderWidth: 1, borderColor: 'rgba(251,238,203,0.45)',
  },
  word: { flexDirection: 'row', marginTop: 22 },
  letter: { fontFamily: Fonts.cinzelBold, fontSize: 33, marginHorizontal: 5 },
  hair: { width: 110, height: StyleSheet.hairlineWidth * 2, backgroundColor: 'rgba(180,140,70,0.7)', marginTop: 20 },
  tagline: { fontFamily: Fonts.cormorantItalic, fontSize: 19, letterSpacing: 0.4, marginTop: 14 },
});
