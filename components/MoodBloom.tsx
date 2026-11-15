import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, Animated, Easing, StyleSheet } from 'react-native';

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
                  style={({ pressed }) => [styles.petal, { left: (S - D) / 2, top: (S - D) / 2, width: D, height: D, borderRadius: D / 2, backgroundColor: c }, pressed && styles.petalPressed]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                >
                  {on && <View pointerEvents="none" style={[styles.ring, { width: D + 8, height: D + 8, borderRadius: (D + 8) / 2, borderColor: c }]} />}
                  <Text
                    style={[styles.petalText, label.length > 8 && styles.petalTextLong, { color: onColor, maxWidth: D - 6 }]}
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
              <View pointerEvents="none" style={[styles.coreDot, { width: CORE * 0.62, height: CORE * 0.62, borderRadius: CORE * 0.31 }]} />
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
    fontFamily: Fonts.jostMedium, fontSize: 13.5, textAlign: 'center', letterSpacing: 0.4,
  },
  // En uzun etiketler (RU "Благодарность", DE "Dankbarkeit") yaprağa sığsın; web'de adjustsFontSizeToFit yok.
  petalTextLong: { fontSize: 11, letterSpacing: 0 },
  core: { alignItems: 'center', justifyContent: 'center' },
  coreDot: { position: 'absolute', backgroundColor: Colors.sand },
  x: { position: 'absolute', width: 16, height: 2, borderRadius: 1, backgroundColor: Colors.onAccent },
});
