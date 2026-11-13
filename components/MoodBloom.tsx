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

  // Ölçüler ekrana göre: dokuz yaprak tek halkada, komşular hafifçe üst üste biner.
  const W = Math.min(width, 430);
  const R = Math.round(W * 0.31);          // halkanın yarıçapı
  const D = Math.round(W * 0.275);         // yaprak çapı
  const CORE = Math.round(W * 0.17);       // ortadaki kapatma düğmesi
  const BOX = 2 * R + D;                   // çiçeğin kapladığı kare

  useEffect(() => {
    if (!visible) return;
    closing.current = false;
    setShown(true);
    bloom.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(bloom, { toValue: 1, duration: 640, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [visible]);

  const close = (after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(bloom, { toValue: 0, duration: reduce ? 160 : 380, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
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
          style={[styles.title, { top: cy - BOX / 2 - 64, opacity: bloom.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] }) }]}
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
                style={{
                  position: 'absolute', left: R, top: R, width: D, height: D,
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
                  style={({ pressed }) => [
                    styles.petal, { width: D, height: D, borderRadius: D / 2, backgroundColor: c },
                    on && { borderWidth: 3, borderColor: onColor }, pressed && styles.petalPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={label}
                >
                  <Text
                    style={[styles.petalText, label.length > 9 && styles.petalTextLong, { color: onColor }]}
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
              style={[styles.core, { width: CORE, height: CORE, borderRadius: CORE / 2 }]}
              accessibilityRole="button"
              accessibilityLabel={t('practice.close')}
            >
              <View style={[styles.x, { backgroundColor: Colors.text2, transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.x, { backgroundColor: Colors.text2, transform: [{ rotate: '-45deg' }] }]} />
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
  petal: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  petalPressed: { opacity: 0.85, transform: [{ scale: 0.95 }] },
  petalText: { fontFamily: Fonts.jostMedium, fontSize: 15, textAlign: 'center' },
  // En uzun etiketler (RU "Благодарность", DE "Dankbarkeit") yaprağa sığsın; web'de adjustsFontSizeToFit yok.
  petalTextLong: { fontSize: 12 },
  core: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.1) },
  x: { position: 'absolute', width: 18, height: 2, borderRadius: 1 },
});
