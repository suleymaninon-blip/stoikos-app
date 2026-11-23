import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View, AccessibilityInfo } from 'react-native';
import { Fonts } from '../constants/theme';
import { useStyles, useTheme, type Palette } from '../constants/themeContext';
import { localeOf, upper, useLang } from '../constants/i18n';
import { TRACE_RGB } from '../constants/traces';
import { useReduceMotion } from '../hooks/useReduceMotion';
import TraceCoin from './TraceCoin';
import { CalmPressable } from './CalmPressable';

/**
 * Sessiz mühür — bir programın yedinci günü bitince, yalnız sikke ilk kez
 * kazanıldığında açılır (22 Kasım 2026; tasarım
 * https://claude.ai/artifact/BDgiRmFzWyeSVGoUKayzio#play-Muhur).
 * Konfeti yok, ses yok: sikke hafifçe dönerek yerine oturur, arkasında bir
 * hale söner. Sikkeye dokununca yeniden oynar. Hareketi Azalt'ta son hâl.
 * "Devam et" bugünkü bitiş akışına (kapanış yansıması…) bırakır.
 */
interface Props {
  pid: string | null;
  programTitle: string;
  /** Sıradaki (bitmemiş) programın adı; yoksa tek düğme "Devam et" olur. */
  nextTitle?: string;
  /** Sıradaki programı açar (23 Kasım 2026, kullanıcı: "devam et deyince sıradaki programa geçmesi gerekmez mi"). */
  onNext?: () => void;
  /** Pencereyi kapatıp bitiş kartına (kapanış yansıması) bırakır. */
  onContinue: () => void;
  onSeeAll: () => void;
}

const COIN = 172;

export default function TraceSeal({ pid, programTitle, nextTitle, onNext, onContinue, onSeeAll }: Props) {
  const styles = useStyles(makeStyles);
  const { C } = useTheme();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const sheet = useRef(new Animated.Value(0)).current;
  const seal = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;

  const play = useCallback(() => {
    if (reduce) { [sheet, seal, text].forEach((v) => v.setValue(1)); halo.setValue(0); return; }
    seal.setValue(0); halo.setValue(0); text.setValue(0);
    Animated.parallel([
      Animated.timing(seal, { toValue: 1, duration: 1100, delay: 300, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      Animated.timing(halo, { toValue: 1, duration: 1500, delay: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(text, { toValue: 1, duration: 600, delay: 1200, useNativeDriver: true }),
    ]).start();
  }, [reduce, seal, halo, text, sheet]);

  useEffect(() => {
    if (!pid) return;
    sheet.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(sheet, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    play();
    AccessibilityInfo.announceForAccessibility?.(t('trace.coinTitle', { name: programTitle }));
  }, [pid]);

  if (!pid) return null;
  const rgb = (TRACE_RGB[pid] ?? [150, 145, 140]).join(',');
  const date = new Date().toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onContinue}>
      <View style={styles.scrim} />
      <Animated.View
        accessibilityViewIsModal
        style={[styles.sheet, { transform: [{ translateY: sheet.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}
      >
        <View style={styles.grab} />
        <Text style={styles.tag}>{upper(t('trace.sealTag'), lang)}</Text>

        <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={t('trace.replayA11y')} style={styles.coinBox}>
          <Animated.View
            pointerEvents="none"
            style={[styles.halo, {
              borderColor: `rgba(${rgb},0.6)`,
              opacity: halo.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.55, 0] }),
              transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] }) }],
            }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.haloFill, {
              backgroundColor: `rgba(${rgb},0.14)`,
              opacity: halo.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }),
              transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] }) }],
            }]}
          />
          <Animated.View style={{
            opacity: seal.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: seal.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              { rotate: seal.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '0deg'] }) },
            ],
          }}>
            <TraceCoin pid={pid} state="earned" size={COIN} />
          </Animated.View>
        </Pressable>

        <Animated.View style={[styles.texts, { opacity: text, transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
          <Text style={styles.title}>{t('trace.coinTitle', { name: programTitle })}</Text>
          <Text style={styles.motif}>{t(`trace.m.${pid}`)}</Text>
          <Text style={styles.date}>{t('trace.added', { date })}</Text>
        </Animated.View>

        <View style={styles.actions}>
          {nextTitle && onNext ? (
            <>
              <CalmPressable onPress={onNext} style={[styles.primary, { backgroundColor: C.accent }]}>
                <Text style={styles.primaryText} numberOfLines={1}>{t('trace.next', { name: nextTitle })}</Text>
              </CalmPressable>
              <Pressable onPress={onContinue} style={styles.link} accessibilityRole="button" hitSlop={6}>
                <Text style={styles.linkText}>{t('trace.reflectFirst')}</Text>
              </Pressable>
            </>
          ) : (
            <CalmPressable onPress={onContinue} style={[styles.primary, { backgroundColor: C.accent }]}>
              <Text style={styles.primaryText}>{t('trace.continue')}</Text>
            </CalmPressable>
          )}
          <Pressable onPress={onSeeAll} style={styles.link} accessibilityRole="button" hitSlop={6}>
            <Text style={styles.linkText}>{t('trace.seeAll')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,16,24,0.45)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingTop: 14, paddingHorizontal: 28, paddingBottom: 34, alignItems: 'center',
  },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.stone4 },
  tag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.2, color: Colors.sand, marginTop: 24 },
  coinBox: { width: 200, height: 200, marginTop: 18, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 178, height: 178, borderRadius: 89, borderWidth: 2 },
  haloFill: { position: 'absolute', width: 150, height: 150, borderRadius: 75 },
  texts: { alignItems: 'center', marginTop: 14 },
  title: { fontFamily: Fonts.cormorant, fontSize: 30, lineHeight: 35, color: Colors.text, textAlign: 'center' },
  motif: { fontFamily: Fonts.cormorantItalic, fontSize: 19, lineHeight: 26, color: Colors.sand2, textAlign: 'center', marginTop: 8 },
  date: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 12, textAlign: 'center' },
  actions: { alignSelf: 'stretch', alignItems: 'stretch', gap: 4, marginTop: 28 },
  primary: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.onAccent, paddingHorizontal: 16 },
  link: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  linkText: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.sand },
});
