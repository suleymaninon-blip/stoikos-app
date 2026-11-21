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
 * Açılış — "Şafak" (13 Kasım 2026; 21 Kasım 2026 kemer, hale ve yıldız tozu güncellemeleri).
 *
 * Gece lacivertinden gün doğumuna, oradan temanın kendi zeminine iner.
 * - Dokununca atlanır; `onFinish` her durumda yalnızca bir kez çağrılır.
 * - "Hareketi Azalt" açıksa yalnız son hâl görünür ve süre sonunda kapanır.
 * - `strokeDashoffset` için `useNativeDriver: false`, `transform`/`opacity` için `useNativeDriver: true`.
 *
 * 21 Kasım 2026 (kullanıcının Gemini videosunun zamanlaması): Stoa kapısı (tek kemer), küçük doğup
 * yükselirken açılan ve dönerek küreye toplanan nefes çiçeği, sırayla açılan üç hale halkası + kayan
 * parıltılar, 46 yıldız tozu. Kullanıcı bu sade sürümü, sonradan eklenen beş efektli/çift kemerli
 * sürüme tercih etti (o sürüm commit 2a6e16b). Değerlerin sıfırlanması ve benzersiz gradyan adları
 * kullanıcının dış aracından korundu.
 */
const { width, height } = appDimensions();
const AnimatedPath = Animated.createAnimatedComponent(Path);

const MARK = 150;                      // işaretin ekrandaki boyutu
const K = MARK / 640;                  // viewBox birimi → piksel
const PETAL = 112 * 2 * K;             // yaprak çapı
const SPREAD = 150 * K;                // açık çiçekte yaprak merkezinin uzaklığı
const GLOW = Math.round(Math.min(width * 1.5, 560));
const RISE = Math.round(height * 0.36); // kürenin doğduğu derinlik
const SPEED = 0.85;
const ms = (t: number) => Math.round(t * SPEED);
const LETTERS = 'STOIKOS'.split('');
const ANGLES = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2);

// Stoa kapısı: küre ve yazının etrafında ince altın kemer, tepeden iki yana çizilir, aşağıda söner.
const ARCH_R = Math.round(Math.min(width * 0.34, 136));
const ARCH_W = ARCH_R * 2;
const ARCH_H = Math.round(Math.min(height * 0.56, 470));
const ARCH_PAD = 4;                                   // çizgi kenarda kesilmesin
const ARCH_LEN = (Math.PI * ARCH_R) / 2 + (ARCH_H - ARCH_R);
const ARCH_L = `M${ARCH_R + ARCH_PAD} ${ARCH_PAD} A${ARCH_R} ${ARCH_R} 0 0 0 ${ARCH_PAD} ${ARCH_R + ARCH_PAD} V${ARCH_H + ARCH_PAD}`;
const ARCH_RT = `M${ARCH_R + ARCH_PAD} ${ARCH_PAD} A${ARCH_R} ${ARCH_R} 0 0 1 ${ARCH_W + ARCH_PAD} ${ARCH_R + ARCH_PAD} V${ARCH_H + ARCH_PAD}`;

// İçeriğin (işaret + yazı + alt başlık ≈ 272 px) tepesinden 74 px yukarıda başlar.
const ARCH_TOP = Math.round(height / 2 - height * 0.03 - 136 - 74);

// Hale: küreden dışa sırayla açılan üç halka. Dış iki halka yazının hizasına iniyor:
// parıltıları yalnız üst yarıda gezsin, STOIKOS'un üstünden geçmesin.
const RINGS = [
  { r: 94, at: 2300, op: 0.42, from: -90, to: 260, len: 0.16 },
  { r: 118, at: 2500, op: 0.28, from: -20, to: -200, len: 0.12 },
  { r: 142, at: 2700, op: 0.18, from: -200, to: -30, len: 0.09 },
];
const HALO = 2 * 142 + 8;

// Yıldız tozu: sabit tohumlu 46 zerre; gece gökyüzünde baştan var, iki kez parıldar, yavaşça yükselir.
const DUST = (() => {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 46 }, () => ({
    x: Math.round(12 + rnd() * (width - 24)),
    y: Math.round(height * 0.06 + rnd() * (ARCH_TOP + ARCH_H * 0.75 - height * 0.06)),
    r: 0.7 + rnd() * 1.3,
    p: rnd() * 0.3,
    o: 0.35 + rnd() * 0.55,
  }));
})();

export function BrandIntro({ onFinish }: { onFinish: () => void }) {
  const { t } = useLang();
  const { C } = useTheme();
  const reduce = useReduceMotion();

  const dawn = useRef(new Animated.Value(0)).current;
  const day = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const conv = useRef(new Animated.Value(0)).current;
  const petalsIn = useRef(new Animated.Value(0)).current;
  const bloom = useRef(new Animated.Value(0)).current;
  const petalsOut = useRef(new Animated.Value(1)).current;
  const orb = useRef(new Animated.Value(0)).current;
  const arc = useRef(new Animated.Value(0)).current;
  const letters = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const hair = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const arch = useRef(new Animated.Value(0)).current;
  const rings = useRef(RINGS.map(() => new Animated.Value(0))).current;
  const shine = useRef(new Animated.Value(0)).current;
  const dust = useRef(new Animated.Value(0)).current;
  const done = useRef(false);
  const exitAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const leave = () => {
    if (done.current) return;
    done.current = true;
    exitAnimRef.current?.stop();
    exitAnimRef.current = Animated.timing(exit, {
      toValue: 1,
      duration: 520,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    exitAnimRef.current.start(() => onFinish());
  };

  useEffect(() => {
    done.current = false;
    exit.setValue(0);

    const allNativeValues = [
      dawn, day, glow, rise, conv, petalsIn, bloom, petalsOut, orb,
      hair, tag, dust, shine, ...letters, ...rings,
    ];
    allNativeValues.forEach((v) => v.stopAnimation());
    arch.stopAnimation();
    arc.stopAnimation();

    if (reduce) {
      [dawn, day, glow, rise, bloom, conv, orb, hair, tag, ...letters, ...rings].forEach((v) => v.setValue(1));
      dust.setValue(1);
      shine.setValue(0);
      petalsOut.setValue(0);
      arch.setValue(1);
      arc.setValue(1);

      const id = setTimeout(leave, 1400);
      return () => {
        clearTimeout(id);
        exitAnimRef.current?.stop();
      };
    }

    dawn.setValue(0);
    day.setValue(0);
    glow.setValue(0);
    rise.setValue(0);
    conv.setValue(0);
    petalsIn.setValue(0);
    bloom.setValue(0);
    petalsOut.setValue(1);
    orb.setValue(0);
    arc.setValue(0);
    arch.setValue(0);
    dust.setValue(0);
    shine.setValue(0);
    hair.setValue(0);
    tag.setValue(0);
    letters.forEach((v) => v.setValue(0));
    rings.forEach((v) => v.setValue(0));

    const io = Easing.inOut(Easing.cubic);
    const o = Easing.out(Easing.cubic);
    const tm = (v: Animated.Value, at: number, dur: number, easing = io, native = true, to = 1) =>
      Animated.timing(v, { toValue: to, delay: ms(at), duration: ms(dur), easing, useNativeDriver: native });

    // Çiçek küçük doğar, yükselirken açılır, dönerek küreye toplanır; küre yerine oturunca Ω, halkalar, yazı.
    const mainAnim = Animated.parallel([
      tm(glow, 150, 900, o),
      tm(dawn, 300, 1600),
      tm(day, 2300, 1300),
      tm(arch, 250, 1100, io, false),
      tm(dust, 0, 4200, Easing.linear),
      tm(petalsIn, 100, 400, o),
      tm(bloom, 100, 1200, o),
      tm(rise, 200, 2000),
      tm(conv, 1300, 650),
      tm(petalsOut, 1850, 300, o, true, 0),
      tm(orb, 1700, 350, o),
      tm(arc, 2050, 800, io, false),
      ...rings.map((v, i) => tm(v, RINGS[i].at, 1000, o)),
      tm(shine, 2300, 2600, io),
      ...letters.map((v, i) => tm(v, 2700 + i * 90, 520, o)),
      tm(hair, 3350, 600),
      tm(tag, 3550, 600, o),
    ]);

    mainAnim.start();
    const id = setTimeout(leave, ms(4700));

    return () => {
      clearTimeout(id);
      mainAnim.stop();
      exitAnimRef.current?.stop();
    };
  }, [reduce]);

  const ink = C.text;
  const soft = C.text2;
  const gold = C.isDark ? ['#f4e2b8', '#d4b376', '#9a7b44'] : ['#d9b876', '#b8944f', '#8a6a34'];
  // Altınlar açık temada biraz koyu, koyuda biraz açık: iki zeminde de görünsün.
  const archColor = C.isDark ? '#e6cc94' : '#b8944f';
  const haloColor = C.isDark ? '#f0d9a4' : '#b8944f';
  const dustColor = C.isDark ? '#f6e7c2' : '#c9a25e';
  const riseY = rise.interpolate({ inputRange: [0, 1], outputRange: [RISE, 0] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
        },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={leave} accessibilityRole="button" accessibilityLabel="Stoikos">
        {/* gece → gün doğumu → temanın zemini */}
        <LinearGradient colors={['#101826', '#1b2740', '#2c3550']} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: dawn }]}>
          <LinearGradient colors={['#2b3a63', '#7a6f9c', '#e0a184', '#ffd9a0']} locations={[0, 0.38, 0.68, 1]} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: day, backgroundColor: C.bg }]} />

        {/* Stoa kapısı: tepeden iki yana çizilir, aşağıda söner */}
        <View style={styles.arch} pointerEvents="none">
          <Svg width={ARCH_W + ARCH_PAD * 2} height={ARCH_H + ARCH_PAD * 2}>
            <Defs>
              <SvgLinear id="brandIntroArchGrad" x1="0" y1="0" x2="0" y2={ARCH_H} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={archColor} stopOpacity="0.85" />
                <Stop offset="0.6" stopColor={archColor} stopOpacity="0.5" />
                <Stop offset="1" stopColor={archColor} stopOpacity="0" />
              </SvgLinear>
            </Defs>
            {[ARCH_L, ARCH_RT].map((d) => (
              <AnimatedPath
                key={d}
                d={d}
                fill="none"
                stroke="url(#brandIntroArchGrad)"
                strokeWidth={1.3}
                strokeLinecap="round"
                strokeDasharray={ARCH_LEN}
                strokeDashoffset={arch.interpolate({ inputRange: [0, 1], outputRange: [ARCH_LEN, 0] })}
              />
            ))}
          </Svg>
        </View>

        {/* Yıldız tozu */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {DUST.map((d, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dust,
                {
                  left: d.x,
                  top: d.y,
                  width: d.r * 2,
                  height: d.r * 2,
                  borderRadius: d.r,
                  backgroundColor: dustColor,
                  opacity: dust.interpolate({
                    inputRange: [0, d.p, d.p + 0.08, d.p + 0.22, d.p + 0.34, d.p + 0.46, 1],
                    outputRange: [0, 0, d.o, d.o * 0.3, d.o, d.o * 0.5, d.o * 0.45],
                  }),
                  transform: [{ translateY: dust.interpolate({ inputRange: [0, d.p, 1], outputRange: [6, 6, -14] }) }],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.center} pointerEvents="none">
          <View style={styles.mark}>
            {/* ışıltı küreyle birlikte yükselir */}
            <Animated.View style={[styles.glow, { opacity: glow, transform: [{ translateY: riseY }] }]}>
              <Svg width={GLOW} height={GLOW}>
                <Defs>
                  <RadialGradient id="brandIntroGlowGrad" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor="#e2aa5a" stopOpacity="0.34" />
                    <Stop offset="0.56" stopColor="#e2aa5a" stopOpacity="0.1" />
                    <Stop offset="1" stopColor="#e2aa5a" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={GLOW} height={GLOW} fill="url(#brandIntroGlowGrad)" />
              </Svg>
            </Animated.View>

            {/* nefes çiçeği: küçük doğar, açılır (-30° → 0°), dönerek toplanır (+60°) */}
            <Animated.View
              style={[
                styles.markFill,
                {
                  opacity: Animated.multiply(petalsIn, petalsOut),
                  transform: [
                    { translateY: riseY },
                    { scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                    { rotate: Animated.add(bloom, conv).interpolate({ inputRange: [0, 1, 2], outputRange: ['-30deg', '0deg', '60deg'] }) },
                  ],
                },
              ]}
            >
              {ANGLES.map((a, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.petal,
                    {
                      transform: [
                        { translateX: conv.interpolate({ inputRange: [0, 1], outputRange: [Math.cos(a) * SPREAD, 0] }) },
                        { translateY: conv.interpolate({ inputRange: [0, 1], outputRange: [Math.sin(a) * SPREAD, 0] }) },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* hale halkaları + kayan parıltılar */}
            {RINGS.map((g, i) => {
              const c = 2 * Math.PI * g.r;
              return (
                <React.Fragment key={g.r}>
                  <Animated.View
                    style={[
                      styles.halo,
                      {
                        opacity: rings[i],
                        transform: [{ translateY: riseY }, { scale: rings[i].interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) }],
                      },
                    ]}
                  >
                    <Svg width={HALO} height={HALO}>
                      <Circle cx={HALO / 2} cy={HALO / 2} r={g.r} fill="none" stroke={haloColor} strokeOpacity={g.op} strokeWidth={1} />
                    </Svg>
                  </Animated.View>
                  {!reduce && (
                    <Animated.View
                      style={[
                        styles.halo,
                        {
                          opacity: Animated.multiply(rings[i], shine.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 0.9, 0] })),
                          transform: [{ translateY: riseY }, { rotate: shine.interpolate({ inputRange: [0, 1], outputRange: [`${g.from}deg`, `${g.to}deg`] }) }],
                        },
                      ]}
                    >
                      <Svg width={HALO} height={HALO}>
                        <Circle cx={HALO / 2} cy={HALO / 2} r={g.r} fill="none" stroke={haloColor} strokeOpacity={Math.min(1, g.op * 2.2)} strokeWidth={1.6}
                          strokeLinecap="round" strokeDasharray={`${c * g.len} ${c}`} />
                      </Svg>
                    </Animated.View>
                  )}
                </React.Fragment>
              );
            })}

            {/* küre */}
            <Animated.View style={[styles.markFill, { opacity: orb, transform: [{ translateY: riseY }] }]}>
              <Svg width={MARK} height={MARK} viewBox={MARK_VIEWBOX}>
                <Defs>
                  <RadialGradient id="brandIntroOrbGrad" cx="42%" cy="36%" r="70%">
                    <Stop offset="0" stopColor="#f8ebc8" />
                    <Stop offset="0.45" stopColor="#d2b06c" />
                    <Stop offset="1" stopColor={C.isDark ? '#6e5530' : '#8a6a34'} />
                  </RadialGradient>
                </Defs>
                <Circle cx={MARK_CENTER.x} cy={MARK_CENTER.y} r={128} fill="url(#brandIntroOrbGrad)" />
              </Svg>
            </Animated.View>

            {/* Ω kavisi küreyi sararak çizilir */}
            <Animated.View style={[styles.markFill, { opacity: arc.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] }) }]}>
              <Svg width={MARK} height={MARK} viewBox={MARK_VIEWBOX}>
                <Defs>
                  <SvgLinear id="brandIntroArcGrad" x1="0" y1="250" x2="0" y2="760" gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={gold[0]} />
                    <Stop offset="0.45" stopColor={gold[1]} />
                    <Stop offset="1" stopColor={gold[2]} />
                  </SvgLinear>
                </Defs>
                <AnimatedPath
                  d={MARK_PATH}
                  fill="none"
                  stroke="url(#brandIntroArcGrad)"
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
                style={[
                  styles.letter,
                  {
                    color: ink,
                    opacity: letters[i],
                    transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                  },
                ]}
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
  arch: { position: 'absolute', left: (width - ARCH_W) / 2 - ARCH_PAD, top: ARCH_TOP - ARCH_PAD },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.06 },
  // Halka ve yapraklar işaretin küre merkezine oturur (viewBox'ta merkez y 477, kare ortası 482).
  glow: { position: 'absolute', width: GLOW, height: GLOW, left: (MARK - GLOW) / 2, top: (MARK - GLOW) / 2 },
  mark: { width: MARK, height: MARK },
  halo: { position: 'absolute', width: HALO, height: HALO, left: (MARK - HALO) / 2, top: (MARK - HALO) / 2 + (MARK_CENTER.y - 482) * K },
  dust: { position: 'absolute' },
  markFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  petal: {
    position: 'absolute',
    width: PETAL,
    height: PETAL,
    borderRadius: PETAL / 2,
    left: (MARK - PETAL) / 2,
    top: (MARK - PETAL) / 2 + (MARK_CENTER.y - 482) * K,
    backgroundColor: 'rgba(226,190,120,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(251,238,203,0.45)',
  },
  word: { flexDirection: 'row', marginTop: 22 },
  letter: { fontFamily: Fonts.cinzelBold, fontSize: 33, marginHorizontal: 5 },
  hair: { width: 110, height: StyleSheet.hairlineWidth * 2, backgroundColor: 'rgba(180,140,70,0.7)', marginTop: 20 },
  tagline: { fontFamily: Fonts.cormorantItalic, fontSize: 19, letterSpacing: 0.4, marginTop: 14 },
});
