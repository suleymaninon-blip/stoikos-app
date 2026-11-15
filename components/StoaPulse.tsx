import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Ellipse, Line } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang, localeOf } from '../constants/i18n';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { ONBOARDED_KEY, onOnboardingDone } from '../constants/onboarding';
import {
  Pulse, PULSE_MIN, COUNTRY_MIN, CENTROIDS, fetchPulse, countryNamer,
  claimMember, isFounder, memberWelcomeSeen, markMemberWelcomeSeen,
} from '../constants/stoa';

/**
 * Stoa'nın nabzı (15 Kasım 2026, topluluk 1. aşama; tasarım https://claude.ai/artifact/RAc3JRxKeVESNW9FiiJmHv).
 * `PulseRow`: ana ekranda selamlamanın altında tek satır. `PulseSheet`: dokununca alttan açılan ayrıntı.
 * `MemberWelcome`: üyelik numarasını ilk alınca bir kez gösterilen pencere.
 * Sayılar küçükken gösterilmez (eşikler `constants/stoa.ts`).
 */

// ─── Nabız satırı ─────────────────────────────────────────
export function PulseRow({ refreshKey }: { refreshKey?: number }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [open, setOpen] = useState(false);
  const beat = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchPulse().then(setPulse); }, [refreshKey]);
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(beat, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce]);

  if (!pulse || pulse.countries < COUNTRY_MIN) return null;
  const loc = localeOf(lang);
  const text = pulse.active >= PULSE_MIN
    ? t('stoa.pulseMany', { n: pulse.active.toLocaleString(loc), c: pulse.countries })
    : t('stoa.pulseFew', { c: pulse.countries });

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setOpen(true)} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`${text}. ${t('stoa.pulseA11y')}`}>
        <View style={styles.beatBox}>
          <Animated.View style={[styles.beatRing, { opacity: beat.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: beat.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.7] }) }] }]} />
          <View style={styles.beatDot} />
        </View>
        <Text style={styles.rowText} numberOfLines={2}>{text}</Text>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
      <PulseSheet visible={open} pulse={pulse} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── Ayrıntı ──────────────────────────────────────────────
function PulseSheet({ visible, pulse, onClose }: { visible: boolean; pulse: Pulse; onClose: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const loc = localeOf(lang);
  const many = pulse.active >= PULSE_MIN;
  const name = countryNamer(loc);
  const shown = name ? pulse.top.slice(0, 6).map(name) : [];
  const rest = pulse.countries - shown.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBg} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('practice.close')} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.sheetTitle}>{t('stoa.today')}</Text>
        {many ? (
          <View style={styles.stats}>
            {(['breath', 'program', 'journal'] as const).map((k) => (
              <View key={k} style={styles.stat}>
                <Text style={styles.statV}>{pulse[k].toLocaleString(loc)}</Text>
                <Text style={styles.statL}>{t(`stoa.${k}`)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.stat, { paddingVertical: 14 }]}><Text style={styles.early}>{t('stoa.early')}</Text></View>
        )}
        <Globe codes={pulse.top} />
        <Text style={styles.countries}>
          {shown.length ? shown.join(' · ') : t('stoa.countriesN', { n: pulse.countries })}
          {shown.length > 0 && rest > 0 ? `\n${t('stoa.more', { n: rest })}` : ''}
        </Text>
        <Text style={styles.privacy}>{t('stoa.privacy')}</Text>
      </View>
    </Modal>
  );
}

function Globe({ codes }: { codes: string[] }) {
  const { C: Colors } = useTheme();
  const W = 230, H = 118, cx = W / 2, cy = H / 2, rx = W / 2 - 4, ry = H / 2 - 4;
  const lineC = Colors.tint(0.22);
  return (
    <View style={{ alignItems: 'center' }} accessible={false}>
      <Svg width={W} height={H}>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={lineC} strokeWidth={1} fill="none" />
        {[-0.66, -0.33, 0.33, 0.66].map((k) => (
          <Ellipse key={k} cx={cx} cy={cy} rx={Math.abs(rx * k)} ry={ry} stroke={lineC} strokeWidth={1} fill="none" />
        ))}
        <Line x1={cx} y1={cy - ry} x2={cx} y2={cy + ry} stroke={lineC} strokeWidth={1} />
        {[-60, -30, 0, 30, 60].map((la) => {
          const y = cy - (la / 90) * ry, w = rx * Math.cos((la * Math.PI) / 180);
          return <Line key={la} x1={cx - w} y1={y} x2={cx + w} y2={y} stroke={lineC} strokeWidth={1} />;
        })}
        {codes.map((cc) => {
          const p = CENTROIDS[cc];
          if (!p) return null;
          const [lo, la] = p;
          return <Circle key={cc} cx={cx + rx * (lo / 180) * Math.cos((la * Math.PI) / 180) * 0.98} cy={cy - (la / 90) * ry} r={3.6} fill={Colors.sand} />;
        })}
      </Svg>
    </View>
  );
}

// ─── Üyelik ───────────────────────────────────────────────
/** Ana ekranda bir kez: numara alınınca (tanıtım bittiyse) "Stoa'ya hoş geldin" penceresi. */
export function MemberWelcome() {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const [no, setNo] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;

  const tryShow = useCallback(async () => {
    const n = await claimMember();
    if (!n) return;
    setNo(n);
    const [ob, seen] = await Promise.all([AsyncStorage.getItem(ONBOARDED_KEY).catch(() => null), memberWelcomeSeen()]);
    if (ob && !seen) setVisible(true);
  }, []);
  useEffect(() => { tryShow(); return onOnboardingDone(() => setTimeout(tryShow, 600)); }, [tryShow]);
  useEffect(() => {
    if (!visible) return;
    if (reduce) { pop.setValue(1); return; }
    Animated.spring(pop, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
  }, [visible, reduce]);

  const close = () => { setVisible(false); markMemberWelcomeSeen(); };
  if (!no) return null;
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close}>
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>{t('stoa.welcome')}</Text>
        <Animated.View style={[styles.medal, { opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
          <View style={styles.medalRing2} />
          <Text style={styles.medalLabel}>{t('stoa.memberNo')}</Text>
          <Text style={styles.medalNo} accessibilityLabel={`${t('stoa.memberNo')} ${no}`}>{no.toLocaleString(localeOf(lang))}</Text>
        </Animated.View>
        {isFounder(no) && (
          <View style={styles.badge}><Text style={styles.badgeText}>✧ {t('stoa.founder')}</Text></View>
        )}
        <Text style={styles.welcomeBody}>{t('stoa.joined')}</Text>
        <TouchableOpacity onPress={close} style={styles.startBtn} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.startText}>{t('stoa.start')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44,
    backgroundColor: Colors.tint(0.08), borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14,
  },
  beatBox: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  beatDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.sand },
  beatRing: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.sand },
  rowText: { flex: 1, fontFamily: Fonts.jost, fontSize: 13.5, lineHeight: 19, color: Colors.text2 },
  chev: { fontSize: 18, color: Colors.muted },
  sheetBg: { flex: 1, backgroundColor: 'rgba(10,15,22,0.38)' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 34, gap: 12,
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.overlay(0.16), marginBottom: 4 },
  sheetTitle: { fontFamily: Fonts.cormorant, fontSize: 26, color: Colors.text },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.08), borderRadius: 14, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  statV: { fontFamily: Fonts.cormorant, fontSize: 26, color: Colors.text },
  statL: { fontFamily: Fonts.jost, fontSize: 12, lineHeight: 16, color: Colors.muted, textAlign: 'center' },
  early: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 21, color: Colors.text2, textAlign: 'center' },
  countries: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text2, textAlign: 'center' },
  privacy: { fontFamily: Fonts.jost, fontSize: 12, lineHeight: 17, color: Colors.muted, textAlign: 'center' },
  welcome: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  welcomeTitle: { fontFamily: Fonts.cormorant, fontSize: 32, color: Colors.text, textAlign: 'center' },
  medal: { width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: Colors.tint(0.35), alignItems: 'center', justifyContent: 'center' },
  medalRing2: { position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 71, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.tint(0.25) },
  medalLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.5, color: Colors.muted },
  medalNo: { fontFamily: Fonts.cormorant, fontSize: 56, lineHeight: 64, color: Colors.text },
  badge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.tint(0.12) },
  badgeText: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.sand },
  welcomeBody: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 24, color: Colors.text2, textAlign: 'center', maxWidth: 300 },
  startBtn: { backgroundColor: Colors.sand, borderRadius: 999, paddingHorizontal: 30, minHeight: 46, justifyContent: 'center', marginTop: 4 },
  startText: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.onAccent },
});
