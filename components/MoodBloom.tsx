import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { useAppDimensions } from '../constants/layout';
import { useReduceMotion } from '../hooks/useReduceMotion';

/**
 * Duygu çiçeği (13 Kasım 2026, kullanıcı: "aşağı doğru açılmasın, dokununca nefes orbu gibi genişleyerek açılsın").
 *
 * Ana ekrandaki "Bugün aklında ne var?" kutusuna dokununca ekranı kaplayan bir katman açılır: dokuz duygu,
 * dokunulan noktadan çıkıp dönerek açılan dokuz renkli taç yaprağı olur (nefes çiçeğinin dili). Birine dokununca
 * yapraklar yeniden ortada toplanır ve katman kapanır. Ortadaki düğme ya da boşluğa dokunmak da kapatır.
 *
 * Tek bir `bloom` değeri her şeyi sürer; yalnız transform/opacity (native driver). "Hareketi Azalt" açıksa
 * çiçek açılmış hâliyle belirir ve söner.
 *
 * İlk sürümde yapraklar düz renkli dairelerdi ve 0,6 sn'de açılıp 0,4 sn'de kapanıyordu; kullanıcı aynı gün:
 * "daha yavaş ve akıcı açılsın, kapanırken de aynı hızda; daireler çok basit duruyor". Şimdi açılış ve kapanış
 * aynı süre ve eğri (`BLOOM_MS`), yapraklar cam boncuk gibi: ışık vuran yüzey, yumuşak hale, ince parlak kenar;
 * arkada ince bir yörünge halkası ve ortada logodaki altın küre.
 */
const BLOOM_MS = 1150;
const BLOOM_EASE = Easing.inOut(Easing.cubic);

/** '#rrggbb' iki rengin karışımı (k: 0 → a, 1 → b). */
function mixHex(a: string, b: string, k: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => {
    const x = (pa >> sh) & 255, y = (pb >> sh) & 255;
    return Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  };
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

/** Tohumlu sözde rastgele: her taş her açılışta aynı biçimde çizilsin. */
function seeded(seed: number) {
  let s = seed * 97 + 13;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Düzensiz çakıl taşı biçimi: 8 noktadan geçen yumuşak kapalı eğri (merkez 0,0). */
function pebblePath(r: number, rnd: () => number): string {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (1 + (rnd() - 0.5) * 0.16) * (i % 2 ? 1 : 0.97);
    return [Math.cos(a) * rr * 1.06, Math.sin(a) * rr * 0.93];
  });
  const mid = (p: number[], q: number[]) => `${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
  let d = `M${mid(pts[0], pts[n - 1])}`;
  for (let i = 0; i < n; i++) d += ` Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mid(pts[i], pts[(i + 1) % n])}`;
  return d + 'Z';
}

/**
 * Tek taş — "deniz camı" (15 Kasım 2026, kullanıcı: deniz camı / cilalı taş görselleri, "çok rahatlatıcı olmaz mı";
 * üç yönden A seçildi). Buzlu, süte yakın pastel gövde; içten hafif ışık; minik kabarcıklar; yumuşak parlama;
 * altında gölge. Biçim her duygu için ayrı ama sabit (tohumlu). Yalnız react-native-svg'nin çizebildiği öğeler.
 */
function Petal({ id, seed, color, S, D, dark }: { id: string; seed: number; color: string; S: number; D: number; dark: boolean }) {
  const r = D / 2, c = S / 2;
  const rnd = seeded(seed);
  const rot = (rnd() - 0.5) * 50;
  const d = pebblePath(r, rnd);
  const core = mixHex(color, '#ffffff', 0.75), base = mixHex(color, '#ffffff', 0.45), edge = mixHex(color, '#ffffff', 0.2);
  const dots = Array.from({ length: 14 }, () => ({ x: (rnd() - 0.5) * r * 1.3, y: (rnd() - 0.4) * r * 1.2, r: 0.8 + rnd() * 1.4, o: 0.25 + rnd() * 0.35 }));
  return (
    <Svg width={S} height={S} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id={`${id}s`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#000000" stopOpacity={dark ? 0.32 : 0.22} />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${id}f`} cx="45%" cy="40%" r="70%">
          <Stop offset="0" stopColor={core} />
          <Stop offset="0.6" stopColor={base} />
          <Stop offset="1" stopColor={edge} />
        </RadialGradient>
        <RadialGradient id={`${id}g`} cx="62%" cy="70%" r="45%">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${id}h`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={c + 3} cy={c + r * 0.82} rx={r * 0.9} ry={r * 0.22} fill={`url(#${id}s)`} />
      <G transform={`translate(${c} ${c}) rotate(${rot.toFixed(1)})`}>
        <Path d={d} fill={`url(#${id}f)`} opacity={0.94} />
        <Path d={d} fill={`url(#${id}g)`} />
        {dots.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#ffffff" opacity={p.o} />)}
        <Ellipse cx={-r * 0.32} cy={-r * 0.42} rx={r * 0.42} ry={r * 0.16} fill={`url(#${id}h)`} transform={`rotate(-24 ${(-r * 0.32).toFixed(1)} ${(-r * 0.42).toFixed(1)})`} />
        <Path d={d} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.2} />
      </G>
    </Svg>
  );
}
export type MoodOrigin = { x: number; y: number } | null;

export function MoodBloom({
  visible, origin, moods, selected, colorOf, onColor, onPick, onClose,
}: {
  visible: boolean;
  origin: MoodOrigin;
  moods: string[];
  selected: string | null;
  colorOf: (m: string) => string;
  onColor: string;
  onPick: (m: string) => void;
  onClose: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const { t } = useLang();
  const { width, height } = useAppDimensions();
  const reduce = useReduceMotion();
  const bloom = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(false);
  const closing = useRef(false);

  // Ölçüler ekrana göre: dokuz yaprak tek halkada, aralarında küçük bir boşluk var (15 Kasım 2026'ya kadar
  // komşular üst üste biniyordu; telefonda kalabalık göründü). Halka çevresi 2πR/9 ≈ 0,234W > D.
  const W = Math.min(width, 430);
  const R = Math.round(W * 0.335);         // halkanın yarıçapı
  const D = Math.round(W * 0.215);         // yaprak çapı
  const CORE = Math.round(W * 0.26);       // ortadaki altın küre (halesiyle); kapatır
  const S = Math.round(D * 1.36);          // yaprağın halesiyle birlikte kapladığı kare
  const BOX = 2 * R + S;                   // çiçeğin kapladığı kare

  useEffect(() => {
    if (!visible) return;
    closing.current = false;
    setShown(true);
    bloom.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(bloom, { toValue: 1, duration: BLOOM_MS, easing: BLOOM_EASE, useNativeDriver: true }).start();
  }, [visible]);

  const close = (after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(bloom, { toValue: 0, duration: reduce ? 200 : BLOOM_MS, easing: BLOOM_EASE, useNativeDriver: true }).start(() => {
      setShown(false);
      after?.();
      onClose();
    });
  };

  if (!shown) return null;

  // Çiçek, dokunulan noktadan ekranın ortasına doğru süzülür.
  const cx = width / 2, cy = height * 0.5;
  const dx = origin ? origin.x - cx : 0, dy = origin ? origin.y - cy : 0;
  const n = moods.length;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => close()}>
      <View style={styles.root} accessibilityViewIsModal>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: bloom.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.9, 0.96] }) }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel={t('practice.close')} accessibilityRole="button" />

        <Animated.Text
          style={[styles.title, { top: cy - R - D / 2 - 76, opacity: bloom.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] }) }]}
          pointerEvents="none"
        >
          {t('mood.title')}
        </Animated.Text>

        <Animated.View
          pointerEvents="box-none"
          style={{
            position: 'absolute', left: cx - BOX / 2, top: cy - BOX / 2, width: BOX, height: BOX,
            transform: [
              { translateX: bloom.interpolate({ inputRange: [0, 1], outputRange: [dx, 0] }) },
              { translateY: bloom.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) },
              { rotate: bloom.interpolate({ inputRange: [0, 1], outputRange: ['-70deg', '0deg'] }) },
            ],
          }}
        >
          {/* ince yörünge halkası */}
          <Animated.View
            pointerEvents="none"
            style={[styles.orbit, { left: BOX / 2 - R, top: BOX / 2 - R, width: 2 * R, height: 2 * R, borderRadius: R, opacity: bloom.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] }), transform: [{ scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] }]}
          />
          {moods.map((m, i) => {
            const a = -Math.PI / 2 + (i / n) * Math.PI * 2;      // ilki tepede, saat yönünde
            const lo = i * 0.035, hi = Math.min(1, 0.66 + i * 0.035);
            const k = bloom.interpolate({ inputRange: [lo, hi], outputRange: [0, 1], extrapolate: 'clamp' });
            const c = colorOf(m);
            const ink = mixHex(c, '#14161c', 0.55);   // taş açık renkli; yazı her temada koyu
            const on = selected === m;
            const label = t(`mood.${m}`);
            return (
              <Animated.View
                key={m}
                pointerEvents="box-none"
                style={{
                  position: 'absolute', left: R, top: R, width: S, height: S,
                  opacity: k.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.9, 1] }),
                  transform: [
                    { translateX: k.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * R] }) },
                    { translateY: k.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * R] }) },
                    { scale: k.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) },
                  ],
                }}
              >
                {/* Hale yaprağın dışına taşar; dokunma alanı yalnız yaprağın kendisi olmalı, yoksa komşunun halesi dokunuşu yutar. */}
                <Petal id={`mb${i}`} seed={i + 1} color={c} S={S} D={D} dark={Colors.isDark} />
                <Pressable
                  onPress={() => { onPick(m); close(); }}
                  style={({ pressed }) => [styles.petal, { left: (S - D) / 2, top: (S - D) / 2, width: D, height: D, borderRadius: D / 2 }, pressed && styles.petalPressed]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                >
                  {on && <View pointerEvents="none" style={[styles.ring, { width: D + 8, height: D + 8, borderRadius: (D + 8) / 2, borderColor: c }]} />}
                  <Text
                    style={[styles.petalText, label.length > 8 && styles.petalTextLong, { color: ink, maxWidth: D - 6 }]}
                    numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}
                  >
                    {label}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}

          {/* ortadaki çekirdek: kapatır */}
          <Animated.View
            style={{
              position: 'absolute', left: BOX / 2 - CORE / 2, top: BOX / 2 - CORE / 2,
              opacity: bloom, transform: [{ scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }, { rotate: bloom.interpolate({ inputRange: [0, 1], outputRange: ['70deg', '0deg'] }) }],
            }}
          >
            <Pressable
              onPress={() => close()}
              style={({ pressed }) => [styles.core, { width: CORE, height: CORE, borderRadius: CORE / 2 }, pressed && styles.petalPressed]}
              accessibilityRole="button"
              accessibilityLabel={t('practice.close')}
            >
              <Svg width={CORE} height={CORE} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                  <RadialGradient id="mbCoreH" cx="50%" cy="50%" r="50%">
                    <Stop offset="0.55" stopColor="#e2b874" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#e2b874" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="mbCore" cx="42%" cy="36%" r="70%">
                    <Stop offset="0" stopColor="#f8ebc8" />
                    <Stop offset="0.45" stopColor="#d2b06c" />
                    <Stop offset="1" stopColor="#8a6a34" />
                  </RadialGradient>
                </Defs>
                <Circle cx={CORE / 2} cy={CORE / 2} r={CORE / 2} fill="url(#mbCoreH)" />
                <Circle cx={CORE / 2} cy={CORE / 2} r={CORE * 0.34} fill="url(#mbCore)" />
              </Svg>
              <View style={[styles.x, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.x, { transform: [{ rotate: '-45deg' }] }]} />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: Colors.bg },
  title: { position: 'absolute', left: 24, right: 24, textAlign: 'center', fontFamily: Fonts.cormorant, fontSize: 28, color: Colors.text },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: Colors.tint(0.22) },
  petal: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  petalPressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
  ring: { position: 'absolute', borderWidth: 2 },
  petalText: {
    fontFamily: Fonts.jostMedium, fontSize: 13.5, textAlign: 'center', letterSpacing: 0.2,
    textShadowColor: 'rgba(255,255,255,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  // En uzun etiketler (RU "Благодарность", DE "Dankbarkeit") yaprağa sığsın; web'de adjustsFontSizeToFit yok.
  petalTextLong: { fontSize: 11, letterSpacing: 0 },
  core: { alignItems: 'center', justifyContent: 'center' },
  x: { position: 'absolute', width: 16, height: 2, borderRadius: 1, backgroundColor: '#4a3a1c' },
});
