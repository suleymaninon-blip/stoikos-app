import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, Animated, Easing, StyleSheet, Platform, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang, localeOf } from '../constants/i18n';
import { useAppDimensions } from '../constants/layout';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { DoneMark } from './DoneMark';
import { logBreathSession } from '../constants/breathLog';
import { REMINDERS_SUPPORTED, isTogetherReminderOn, setTogetherReminder } from '../constants/notify';
import { notify } from '../constants/dialog';
import {
  SESSION_SECONDS, NOW_MIN, TODAY_MIN, TogetherCounts,
  fetchTogether, joinTogether, recordTogetherEvening, hasStarted, minutesUntil,
} from '../constants/together';

/**
 * Birlikte nefes (15 Kasım 2026, kullanıcı seçimi A).
 * `TogetherCard`: ana ekranda 20:45–21:15 arası görünen davet. `TogetherModal`: canlı bir dakika —
 * nefes çiçeği (Sakin ritmi, 4,5 / 4,5), etrafında o an birlikte nefes alan her kişi için bir ışık.
 * Işıklar gerçek sayıdır, uydurma yok: az kişi varken az ışık. Sayı NOW_MIN'in altındaysa "şu an"
 * yerine bu akşamın toplamı, o da TODAY_MIN'in altındaysa sayısız bir cümle gösterilir.
 */
const HALF = 4500;
const MAX_LIGHTS = 120;

// ─── Ana ekran kartı ─────────────────────────────────────
export function TogetherCard({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const [now, setNow] = useState(() => new Date());
  const [counts, setCounts] = useState<TogetherCounts | null>(null);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20_000);
    fetchTogether().then(setCounts);
    if (REMINDERS_SUPPORTED) isTogetherReminderOn().then(setReminded);
    return () => clearInterval(id);
  }, []);

  const started = hasStarted(now);
  const remind = async () => {
    const ok = await setTogetherReminder(true, lang).catch(() => false);
    if (ok) setReminded(true);
    else notify(t('together.setTitle'), t('notify.denied'));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardLabel}>{t('together.title')}</Text>
        <Text style={styles.cardWhen}>{started ? t('together.live') : t('together.soon', { n: minutesUntil(now) })}</Text>
      </View>
      <Pressable onPress={onOpen} style={styles.cardBodyRow} accessibilityRole="button" accessibilityLabel={`${t('together.title')}. ${t('together.join')}`}>
        <MiniFlower />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardBody}>{started ? t('together.cardLive') : t('together.cardBody')}</Text>
          {!!counts && counts.yesterday >= TODAY_MIN && (
            <Text style={styles.cardSub}>{t('together.yesterday', { n: counts.yesterday.toLocaleString(localeOf(lang)) })}</Text>
          )}
        </View>
      </Pressable>
      <View style={styles.cardBtns}>
        <TouchableOpacity onPress={onOpen} style={styles.btnPri} activeOpacity={0.85} accessibilityRole="button">
          <Text style={styles.btnPriText}>{t('together.join')}</Text>
        </TouchableOpacity>
        {REMINDERS_SUPPORTED && !started && (
          <TouchableOpacity onPress={remind} disabled={reminded} style={[styles.btnGhost, reminded && { opacity: 0.6 }]} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.btnGhostText}>{reminded ? `${t('together.reminded')} ✓` : t('together.remind')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss} style={styles.btnLink} hitSlop={8} accessibilityRole="button">
          <Text style={styles.btnLinkText}>{t('together.later')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MiniFlower() {
  const { C: Colors } = useTheme();
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.2, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduce]);
  const S = 52, P = 26, SP = 10;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <Animated.View key={i} style={{
            position: 'absolute', width: P, height: P, borderRadius: P / 2, backgroundColor: Colors.petal(0.32),
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * SP] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * SP] }) },
            ],
          }} />
        );
      })}
    </View>
  );
}

// ─── Canlı dakika ────────────────────────────────────────
type Stage = 'ready' | 'live' | 'done';

export function TogetherModal({ visible, onClose, onComplete }: { visible: boolean; onClose: () => void; onComplete?: () => void }) {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const { t, lang } = useLang();
  const reduce = useReduceMotion();
  const { width, height } = useAppDimensions();
  const [stage, setStage] = useState<Stage>('ready');
  const [counts, setCounts] = useState<TogetherCounts | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [left, setLeft] = useState(SESSION_SECONDS);
  const [phaseIn, setPhaseIn] = useState(true);
  const [evening, setEvening] = useState(1);
  const [shown, setShown] = useState(0);
  const startedAt = useRef(0);
  const breath = useRef(new Animated.Value(0.45)).current;
  const twinkle = useRef([0, 1, 2].map(() => new Animated.Value(0.6))).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const BOX = Math.min(width - 32, 360, height * 0.48);
  const C = BOX / 2;
  const SIZE = BOX * 0.56, PETAL = SIZE * 0.44, SPREAD = SIZE * 0.2;

  // Işık konumları: tohumlu, çiçeğin etrafında bir halka.
  const lights = useMemo(() => {
    let s = 7;
    const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    return Array.from({ length: MAX_LIGHTS }, (_, i) => {
      const a = r() * Math.PI * 2, rr = BOX * (0.36 + r() * 0.13);
      return { x: C + Math.cos(a) * rr, y: C + Math.sin(a) * rr, d: 3 + r() * 3.2, g: i % 3 };
    });
  }, [BOX]);

  // Açılınca sıfırla, sayıyı getir, sesi tercihini oku.
  useEffect(() => {
    if (!visible) return;
    setStage('ready'); setLeft(SESSION_SECONDS); setShown(0); setLoaded(false);
    fetchTogether().then((c) => { setCounts(c); setLoaded(true); });
    const poll = setInterval(() => fetchTogether().then((c) => c && setCounts(c)), 10_000);
    // Dururken çiçek yavaşça nefes alır.
    if (!reduce) {
      loopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(breath, { toValue: 0.6, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0.4, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loopRef.current.start();
    }
    const tw = reduce ? null : Animated.parallel(twinkle.map((v, i) => Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 900 + i * 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.35, duration: 900 + i * 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]))));
    tw?.start();
    return () => { clearInterval(poll); loopRef.current?.stop(); tw?.stop(); };
  }, [visible]);

  // Gösterilecek sayı ve ışık sayısı
  const mode: 'now' | 'today' | 'none' | 'offline' =
    !counts ? (loaded ? 'offline' : 'none') : counts.now >= NOW_MIN ? 'now' : counts.today >= TODAY_MIN ? 'today' : 'none';
  const target = Math.min(MAX_LIGHTS, counts?.now ?? 0);
  useEffect(() => {
    if (shown === target) return;
    if (reduce) { setShown(target); return; }
    const id = setTimeout(() => setShown((s) => s + Math.sign(target - s) * Math.max(1, Math.round(Math.abs(target - s) * 0.12))), 70);
    return () => clearTimeout(id);
  }, [shown, target, reduce]);

  const finish = useCallback(async () => {
    loopRef.current?.stop();
    Animated.timing(breath, { toValue: 0, duration: 700, useNativeDriver: true }).start();
    await logBreathSession();
    setEvening(await recordTogetherEvening());
    setStage('done');
    onComplete?.();
    AccessibilityInfo.announceForAccessibility?.(t('home.breathDone'));
  }, [onComplete, t]);

  // Seans saati
  useEffect(() => {
    if (stage !== 'live') return;
    const id = setInterval(() => {
      const el = (Date.now() - startedAt.current) / 1000;
      setLeft(Math.max(0, Math.ceil(SESSION_SECONDS - el)));
      setPhaseIn((el * 1000) % (HALF * 2) < HALF);
      if (el >= SESSION_SECONDS) { clearInterval(id); finish(); }
    }, 250);
    return () => clearInterval(id);
  }, [stage, finish]);

  const start = () => {
    if (stage !== 'ready') return;
    startedAt.current = Date.now();
    setStage('live');
    loopRef.current?.stop();
    if (!reduce) {
      breath.setValue(0);
      loopRef.current = Animated.loop(Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: HALF, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: HALF, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loopRef.current.start();
    }
    joinTogether().then((c) => c && setCounts(c));
  };

  const close = () => { loopRef.current?.stop(); onClose(); };

  const rotate = breath.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '60deg'] });
  const petalScale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const flowerOpacity = stage === 'done' ? 0.18 : 1;

  const bigNumber = mode === 'now' ? counts!.now : mode === 'today' ? counts!.today : null;
  const countLabel = mode === 'now' ? t('together.nowCount') : mode === 'today' ? t('together.todayCount') : mode === 'offline' ? t('together.offline') : t('together.alone');
  const doneText = counts && counts.today >= TODAY_MIN ? t('together.doneWith', { n: counts.today.toLocaleString(localeOf(lang)) }) : t('together.doneSolo');
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, '0');

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.modal}>
        <TouchableOpacity onPress={close} style={styles.closeBtn} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('practice.close')}>
          <Text style={styles.closeX}>×</Text>
        </TouchableOpacity>
        <Text style={styles.top}>{t('together.title')} · 21:00</Text>

        <Pressable onPress={start} disabled={stage !== 'ready'} accessibilityRole="button" accessibilityLabel={t('together.tapStart')}
          style={{ width: BOX, height: BOX, alignSelf: 'center' }}>
          <View style={[StyleSheet.absoluteFill, { borderRadius: BOX / 2 }]} accessibilityLabel={t('together.lights')}>
            <View style={[styles.orbit, { left: C - BOX * 0.3, top: C - BOX * 0.3, width: BOX * 0.6, height: BOX * 0.6, borderRadius: BOX * 0.3 }]} />
            {lights.slice(0, shown).map((L, i) => (
              <Animated.View key={i} style={[styles.light, { left: L.x - L.d / 2, top: L.y - L.d / 2, width: L.d, height: L.d, borderRadius: L.d / 2, opacity: twinkle[L.g] }]} />
            ))}
          </View>
          <Animated.View style={{ position: 'absolute', left: C - SIZE / 2, top: C - SIZE / 2, width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', opacity: flowerOpacity, transform: [{ rotate }] }}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
              return (
                <Animated.View key={i} style={[styles.petal, {
                  width: PETAL, height: PETAL, borderRadius: PETAL / 2,
                  transform: [
                    { translateX: breath.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * SPREAD] }) },
                    { translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * SPREAD] }) },
                    { scale: petalScale },
                  ],
                }]}>
                  <LinearGradient colors={[Colors.petal(0.6), Colors.petal(0.34), Colors.petal(0.18)]} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.85, y: 0.95 }} style={{ flex: 1 }} />
                </Animated.View>
              );
            })}
          </Animated.View>
          {stage === 'done' && (
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
              <DoneMark size={Math.round(SIZE * 0.62)} />
            </View>
          )}
        </Pressable>

        {stage !== 'done' ? (
          <View style={styles.info} accessibilityLiveRegion="polite">
            <Text style={styles.phase}>{stage === 'live' ? (phaseIn ? t('home.breathIn') : t('home.breathOut')) : t('together.tapStart')}</Text>
            {bigNumber !== null && <Text style={styles.count}>{bigNumber.toLocaleString(localeOf(lang))}</Text>}
            <Text style={styles.countLabel}>{countLabel}</Text>
            <Text style={styles.timer}>{`${mm}:${ss}`}</Text>
            {!hasStarted() && stage === 'ready' && <Text style={styles.timer}>{t('together.soon', { n: minutesUntil() })}</Text>}
          </View>
        ) : (
          <View style={styles.info}>
            <Text style={styles.doneTitle}>{t('home.breathDone')}</Text>
            <Text style={styles.doneBody}>{doneText}</Text>
            <View style={styles.eveningChip}><Text style={styles.eveningText}>{t('together.evening', { n: evening })}</Text></View>
            <Text style={styles.timer}>{t('together.again')}</Text>
            <TouchableOpacity onPress={close} style={[styles.btnGhost, { marginTop: 10, alignSelf: 'center' }]} accessibilityRole="button">
              <Text style={styles.btnGhostText}>{t('practice.close')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  // kart
  card: {
    backgroundColor: Colors.stone2, borderRadius: 20, borderWidth: 1, borderColor: Colors.tint(0.18),
    padding: 16, marginBottom: 16, gap: 10,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.4, color: Colors.sand, textTransform: 'none' },
  cardWhen: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  cardBodyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardBody: { fontFamily: Fonts.jost, fontSize: 15, lineHeight: 22, color: Colors.text },
  cardSub: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.muted, marginTop: 2 },
  cardBtns: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  btnPri: { backgroundColor: Colors.sand, borderRadius: 999, paddingHorizontal: 18, minHeight: 40, justifyContent: 'center' },
  btnPriText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.onAccent },
  btnGhost: { borderWidth: 1, borderColor: Colors.overlay(0.14), borderRadius: 999, paddingHorizontal: 16, minHeight: 40, justifyContent: 'center' },
  btnGhostText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.text2 },
  btnLink: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 6, marginLeft: 'auto' },
  btnLinkText: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  // pencere
  modal: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', paddingHorizontal: 16 },
  closeBtn: { position: 'absolute', top: Platform.OS === 'web' ? 18 : 54, right: 18, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  closeX: { fontSize: 30, lineHeight: 32, color: Colors.muted },
  top: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.6, color: Colors.muted, textAlign: 'center', marginBottom: 6 },
  orbit: { position: 'absolute', borderWidth: 1, borderColor: Colors.tint(0.14) },
  light: { position: 'absolute', backgroundColor: Colors.moon },
  petal: { position: 'absolute', overflow: 'hidden', borderWidth: 1, borderColor: Colors.tint(0.2) },
  info: { alignItems: 'center', gap: 4, marginTop: 8, minHeight: 170 },
  phase: { fontFamily: Fonts.cormorant, fontSize: 26, color: Colors.text },
  count: { fontFamily: Fonts.cormorant, fontSize: 44, lineHeight: 50, color: Colors.text, marginTop: 4 },
  countLabel: { fontFamily: Fonts.jost, fontSize: 15, lineHeight: 22, color: Colors.text2, textAlign: 'center', maxWidth: 300 },
  timer: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 6 },
  doneTitle: { fontFamily: Fonts.cormorant, fontSize: 32, color: Colors.text },
  doneBody: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 24, color: Colors.text, textAlign: 'center', maxWidth: 300 },
  eveningChip: { marginTop: 10, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.tint(0.1) },
  eveningText: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.sand },
});
