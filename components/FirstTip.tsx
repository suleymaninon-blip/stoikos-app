import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../constants/theme';
import { useLang, upper } from '../constants/i18n';
import { ONBOARDED_KEY, TIP_KEY_PREFIX, onOnboardingDone } from '../constants/onboarding';

/**
 * İlk kullanım ipucu (30 Ekim 2026; tasarım https://claude.ai/artifact/UWRr1CeHetGHuQXea6D414).
 *
 * Bir ekrana ilk girişte, `target` öğesinin çevresi aydınlık kalacak şekilde ekranı
 * karartır ve altta/üstte tek cümlelik bir kart gösterir. "Anladım" deyince
 * `stoikos_tip_<id>` yazılır ve bir daha çıkmaz. Tanıtım (onboarding) açıkken
 * çıkmaz; tanıtım bitince ya da "Tanıtımı tekrar göster" sonrası yeniden denenir.
 *
 * Kullanım: ekranın kök View'ına `ref={container}`, hedefe `ref={target}`
 * (`collapsable={false}`) ver ve bu bileşeni kök View'ın son çocuğu olarak koy.
 */
type Rect = { x: number; y: number; w: number; h: number; cw: number; ch: number };
const PAD = 6;
const CARD_H = 210; // ipucu kartının yaklaşık yüksekliği (yerleşim kararı için)

export function FirstTip({ id, text, target, container, enabled = true }: {
  id: string;
  text: string;
  target: React.RefObject<View | null>;
  container: React.RefObject<View | null>;
  enabled?: boolean;
}) {
  const { t, lang } = useLang();
  const [rect, setRect] = useState<Rect | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  const tryShow = useCallback(async () => {
    if (!enabled) return;
    try {
      const [ob, seen] = await Promise.all([AsyncStorage.getItem(ONBOARDED_KEY), AsyncStorage.getItem(TIP_KEY_PREFIX + id)]);
      if (ob !== '1' || seen) return;
    } catch { return; }
    // Ekran yerleşsin (yazı tipleri, kartlar), sonra ölç.
    setTimeout(() => {
      const c = container.current, el = target.current;
      if (!c || !el) return;
      c.measureInWindow((cx, cy, cw, ch) => {
        el.measureInWindow((x, y, w, h) => {
          if (!w || !h) return;
          setRect({ x: x - cx, y: y - cy, w, h, cw, ch });
        });
      });
    }, 700);
  }, [enabled, id, container, target]);

  useEffect(() => {
    tryShow();
    return onOnboardingDone(tryShow);
  }, [tryShow]);

  useEffect(() => {
    if (!rect) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [rect, pulse]);

  if (!rect) return null;

  const dismiss = () => {
    setRect(null);
    AsyncStorage.setItem(TIP_KEY_PREFIX + id, '1').catch(() => {});
  };

  const top = Math.max(0, rect.y - PAD), left = Math.max(0, rect.x - PAD);
  const bottom = rect.y + rect.h + PAD, right = Math.min(rect.cw, rect.x + rect.w + PAD);
  // Kart sığdığı tarafa: önce alt, sonra üst. İkisine de sığmazsa altta kalır ve
  // hedefin yalnız alt kenarına biner (hedefin üstü — asıl gösterilen yer — açık kalır).
  const spaceBelow = rect.ch - bottom, spaceAbove = top;
  const cardBelow = spaceBelow >= CARD_H || spaceAbove < CARD_H;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
      <View style={[styles.dim, { left: 0, right: 0, top: 0, height: top }]} />
      <View style={[styles.dim, { left: 0, right: 0, top: bottom, bottom: 0 }]} />
      <View style={[styles.dim, { left: 0, width: left, top, height: bottom - top }]} />
      <View style={[styles.dim, { left: right, right: 0, top, height: bottom - top }]} />
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { left, top, width: right - left, height: bottom - top, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]}
      />
      <View accessibilityRole="alert" style={[styles.card, cardBelow ? { bottom: 24 } : { top: 24 }]}>
        <Text style={styles.label}>{upper(t('tip.label'), lang)}</Text>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.once}>{t('tip.once')}</Text>
        <TouchableOpacity onPress={dismiss} style={styles.btn} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.btnText}>{t('tip.gotIt')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: 'rgba(10,8,6,0.68)' },
  ring: { position: 'absolute', borderRadius: 20, borderWidth: 2, borderColor: Colors.sand2 },
  card: {
    position: 'absolute', left: 20, right: 20, padding: 20, borderRadius: 22, gap: 10,
    backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(194,168,120,0.4)',
  },
  label: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand },
  text: { fontFamily: Fonts.jost, fontSize: 17, lineHeight: 25, color: Colors.text },
  once: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.muted },
  btn: { alignSelf: 'flex-end', minHeight: 44, paddingHorizontal: 22, borderRadius: 14, backgroundColor: Colors.sand, justifyContent: 'center' },
  btnText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.bg },
});
