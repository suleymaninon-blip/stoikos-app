import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, Animated, Easing, StyleSheet, ImageBackground, Platform } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import { PAPER } from './EmbossTile';

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
 * aynı süre ve eğri (`BLOOM_MS`); arkada ince bir yörünge halkası, ortada kapatma düğmesi (düz vurgu rengi).
 */
const BLOOM_MS = 1150;
const BLOOM_EASE = Easing.inOut(Easing.cubic);

/**
 * Düz (flat) yaprak — 15 Kasım 2026, kullanıcı: "tekrar flat design yapsak olur mu". Cam boncuk denemeleri
 * (kodla çizilen ve Gemini görselleri) bırakıldı; yaprak temanın kendi tonunda düz renkli bir daire, yazı
 * üstünde düz ve okunur (`onColor`). Gölge, degrade, görsel yok. Cam görselleri `docs/mood-cam/` altında duruyor.
 */
/**
 * Kâğıt madalyon (24 Kasım 2026, kullanıcı: "yine yuvarlak olacak ama kavram kartındaki gibi kraft kâğıt dokulu";
 * tasarım https://claude.ai/artifact/Nud66hVuE8yYwFjjutWZhe, seçenek A). Dokuz yaprak aynı krem kâğıt
 * (gecede lacivert kâğıt, doku çok soluk); kenar kabarık (üstü ışık, altı gölge), ortası basılmış; duygunun
 * rengi yalnız iç çemberdeki ince çizgide, küçük noktada ve yazıda. `EmbossTile` ile aynı ışık mantığı.
 * ⚠️ Gölge dıştaki View'da; dokuyu kırpan `overflow: 'hidden'` içteki katmanda (iOS'ta gölge silinmesin).
 */
function PaperDisc({ size, color, dark, id, children }: { size: number; color?: string; dark: boolean; id: string; children?: React.ReactNode }) {
  const styles = useStyles(makeStyles);
  const r = size / 2, inset = Math.max(6, size * 0.085);
  return (
    <View style={[styles.disc, { width: size, height: size, borderRadius: r }]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: r, overflow: 'hidden' }]}>
        <ImageBackground source={PAPER} resizeMode="repeat" style={StyleSheet.absoluteFill} imageStyle={{ opacity: dark ? 0.3 : 1 }} />
      </View>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgLinear id={`bev${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={dark ? 0.22 : 1} />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor={dark ? '#000000' : '#5c4d33'} stopOpacity={dark ? 0.5 : 0.28} />
          </SvgLinear>
          <SvgLinear id={`deb${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={dark ? '#000000' : '#5c4d33'} stopOpacity={dark ? 0.55 : 0.3} />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={dark ? 0.18 : 1} />
          </SvgLinear>
          <SvgLinear id={`face${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={dark ? 0.05 : 0.5} />
            <Stop offset="1" stopColor={dark ? '#000000' : '#8a7a5c'} stopOpacity={dark ? 0.16 : 0.08} />
          </SvgLinear>
        </Defs>
        {/* kabarık dış kenar */}
        <Circle cx={r} cy={r} r={r - 0.8} fill={`url(#face${id})`} stroke={`url(#bev${id})`} strokeWidth={1.5} />
        {/* basılmış iç yüz */}
        <Circle cx={r} cy={r} r={r - inset} fill={dark ? 'rgba(0,0,0,0.16)' : 'rgba(92,77,51,0.05)'} stroke={`url(#deb${id})`} strokeWidth={1.6} />
        {/* duygunun rengiyle ince süs çemberi */}
        {!!color && <Circle cx={r} cy={r} r={r - inset - 4} fill="none" stroke={color} strokeOpacity={dark ? 0.55 : 0.6} strokeWidth={1} />}
      </Svg>
      {children}
    </View>
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
                <Pressable
                  onPress={() => { onPick(m); close(); }}
                  style={({ pressed }) => [styles.petal, { left: (S - D) / 2, top: (S - D) / 2, width: D, height: D, borderRadius: D / 2 }, pressed && styles.petalPressed]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                >
                  {on && <View pointerEvents="none" style={[styles.ring, { width: D + 10, height: D + 10, borderRadius: (D + 10) / 2, borderColor: c }]} />}
                  <PaperDisc size={D} color={c} dark={Colors.isDark} id={m}>
                    <View pointerEvents="none" style={[styles.petalDot, { backgroundColor: c }]} />
                    <Text
                      style={[styles.petalText, label.length > 8 && styles.petalTextLong, { color: c, maxWidth: label.length > 11 ? D - 4 : D - 16 }]}
                      numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}
                    >
                      {label}
                    </Text>
                  </PaperDisc>
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
              <PaperDisc size={Math.round(CORE * 0.7)} dark={Colors.isDark} id="core">
                <View style={[styles.x, { transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.x, { transform: [{ rotate: '-45deg' }] }]} />
              </PaperDisc>
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
  disc: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.isDark ? Colors.stone3 : Colors.stone,
    ...Platform.select({
      ios: { shadowColor: Colors.isDark ? '#000' : '#3b3222', shadowOffset: { width: 0, height: 6 }, shadowOpacity: Colors.isDark ? 0.45 : 0.18, shadowRadius: 9 },
      android: { elevation: 5 },
      default: { boxShadow: Colors.isDark ? '0 1px 2px rgba(0,0,0,0.45), 0 7px 16px rgba(0,0,0,0.4)' : '0 1px 2px rgba(59,50,34,0.12), 0 7px 16px rgba(59,50,34,0.16)' } as any,
    }),
  },
  petalDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  petalText: {
    fontFamily: Fonts.jostMedium, fontSize: 13.5, textAlign: 'center', letterSpacing: 0.4,
  },
  // En uzun etiketler (RU "Благодарность", DE "Dankbarkeit") yaprağa sığsın; web'de adjustsFontSizeToFit yok.
  petalTextLong: { fontSize: 11, letterSpacing: -0.2 },
  core: { alignItems: 'center', justifyContent: 'center' },
  x: { position: 'absolute', width: 16, height: 2, borderRadius: 1, backgroundColor: Colors.sand },
});
