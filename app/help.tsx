import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { authorName } from '../constants/content';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { CalmPressable } from '../components/CalmPressable';
import { StaggerSection } from '../components/StaggerSection';

/**
 * "Nasıl kullanılır?" (30 Ekim 2026; tasarım https://claude.ai/artifact/UWRr1CeHetGHuQXea6D414).
 * Ayarlar'dan açılır. Altı kart, her birinde uygulamanın kendi çizimleriyle küçük,
 * döngüyle oynayan bir canlandırma; dokununca büyür ve 3 adımlık açıklama çıkar.
 * Video yok: paket büyümez, altı dilde aynı çalışır, ekran değişince kolay güncellenir.
 * Animasyonlar yalnız transform/opacity (native driver); Hareketi Azalt açıkken durur (yarı açık tek kare).
 */
type Kind = 'breath' | 'practice' | 'programs' | 'coach' | 'wisdom' | 'journal';
const KINDS: Kind[] = ['breath', 'practice', 'programs', 'coach', 'wisdom', 'journal'];
const DUR: Record<Kind, number> = { breath: 6000, practice: 4000, programs: 7000, coach: 5000, wisdom: 6000, journal: 6000 };

function useLoop(duration: number, pingPong = false, reduced = false) {
  const v = useRef(new Animated.Value(reduced ? 0.6 : 0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(0.6);
      return;
    }
    v.setValue(0);
    const anim = pingPong
      ? Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      : Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
    const loop = Animated.loop(anim);
    loop.start();
    return () => loop.stop();
  }, [v, duration, pingPong, reduced]);
  return v;
}

function HelpAnim({ kind, big, reduced }: { kind: Kind; big: boolean; reduced: boolean }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const s = big ? 2 : 1;
  const box = big ? styles.animBig : styles.anim;
  const v = useLoop(DUR[kind], kind === 'breath' || kind === 'wisdom', reduced);

  if (kind === 'breath') {
    const r = 11 * s, size = 26 * s;
    return (
      <View style={box} aria-hidden>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <Animated.View
            key={a}
            style={[
              styles.petal,
              {
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                borderRadius: size / 2,
                transform: [
                  { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`${a}deg`, `${a + 60}deg`] }) },
                  { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -r] }) },
                  { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  }
  if (kind === 'practice') {
    const on = v.interpolate({ inputRange: [0, 0.24, 0.25, 0.74, 0.75, 1], outputRange: [0, 0, 1, 1, 0, 0] });
    const b = 22 * s;
    return (
      <View style={box} aria-hidden>
        <View style={[styles.cb, { left: 14 * s, top: big ? 56 : 24, width: b, height: b, borderRadius: 6 * s }]} />
        <Animated.View
          style={[
            styles.cbFill,
            { left: 14 * s, top: big ? 56 : 24, width: b, height: b, borderRadius: 6 * s, opacity: on },
          ]}
        >
          <Text style={[styles.cbTick, { fontSize: 14 * s }]}>✓</Text>
        </Animated.View>
        <View
          style={[
            styles.rowBar,
            { left: (14 + 30) * s, top: (big ? 56 : 24) + b / 2 - 3 * s, width: big ? 160 : 20, height: 6 * s, borderRadius: 3 * s },
          ]}
        />
      </View>
    );
  }
  if (kind === 'programs') {
    return (
      <View style={box} aria-hidden>
        <View style={[styles.days, big ? { left: 24, right: 24, top: 66, gap: 8 } : null]}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[styles.day, big ? { height: 18, borderRadius: 5 } : null]}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.dayOn,
                  {
                    borderRadius: big ? 5 : 3,
                    opacity: i === 0 ? 1 : v.interpolate({ inputRange: [0, i / 7, i / 7 + 0.001, 1], outputRange: [0, 0, 1, 1] }),
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (kind === 'coach') {
    const bubbles = [
      { left: true, w: big ? 150 : 38, top: big ? 28 : 16 },
      { left: false, w: big ? 180 : 44, top: big ? 62 : 34 },
      { left: true, w: big ? 120 : 30, top: big ? 96 : 52 },
    ];
    return (
      <View style={box} aria-hidden>
        {bubbles.map((b, k) => {
          const st = 0.05 + k * 0.18;
          return (
            <Animated.View
              key={k}
              style={[
                styles.bub,
                {
                  top: b.top,
                  width: b.w,
                  height: 12 * (big ? 1.7 : 1),
                  borderRadius: big ? 11 : 7,
                  backgroundColor: b.left ? Colors.stone4 : Colors.sand,
                  ...(b.left ? { left: big ? 24 : 10 } : { right: big ? 24 : 10 }),
                  opacity: v.interpolate({ inputRange: [0, st, st + 0.08, 0.85, 0.95, 1], outputRange: [0, 0, 1, 1, 0, 0] }),
                },
              ]}
            />
          );
        })}
      </View>
    );
  }
  if (kind === 'wisdom') {
    const names = [t('wisdom.all'), authorName('seneca', lang), authorName('marcus', lang), authorName('epictetus', lang), authorName('zeno', lang)];
    return (
      <View style={box} aria-hidden>
        <Animated.View
          style={[
            styles.wheel,
            {
              top: big ? 56 : 24,
              gap: big ? 14 : 6,
              transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: big ? [30, -110] : [4, -54] }) }],
            },
          ]}
        >
          {names.map((n, i) => (
            <View key={i} style={[styles.chip, i === 1 && styles.chipOn, big ? { paddingHorizontal: 16, paddingVertical: 8 } : null]}>
              <Text style={[styles.chipText, i === 1 && styles.chipTextOn, { fontSize: big ? 14 : 11 }]} numberOfLines={1}>
                {n}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  }
  // journal — satırlar yazılır, "Kaydedildi" belirir
  const widths = big ? [240, 200, 150] : [46, 38, 28];
  return (
    <View style={box} aria-hidden>
      {widths.map((w, k) => {
        const st = k * 0.12;
        return (
          <View
            key={k}
            style={{
              position: 'absolute',
              left: big ? 24 : 12,
              top: (big ? 34 : 16) + k * (big ? 22 : 10),
              width: w,
              height: big ? 9 : 5,
              overflow: 'hidden',
              borderRadius: 3,
            }}
          >
            <Animated.View
              style={[
                styles.line,
                { transform: [{ translateX: v.interpolate({ inputRange: [0, st, st + 0.15, 0.85, 1], outputRange: [-w, -w, 0, 0, -w] }) }] },
              ]}
            />
          </View>
        );
      })}
      <Animated.Text
        style={[
          styles.saved,
          big ? { left: 24, bottom: 16, fontSize: 13 } : null,
          { opacity: v.interpolate({ inputRange: [0, 0.4, 0.48, 0.85, 1], outputRange: [0, 0, 1, 1, 0] }) },
        ]}
      >
        {t('help.saved')}
      </Animated.Text>
    </View>
  );
}

// ── Açılan kart içeriğinin yumuşak girişi ──
function ExpandedBody({ reduced, children }: { reduced: boolean; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      anim.setValue(1);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, reduced]);

  return (
    <Animated.View
      style={{
        gap: 12,
        marginTop: 14,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ── Kart satırı (ok yumuşakça 90° döner) ──
function HelpCard({
  kind,
  expanded,
  reduced,
  onPress,
}: {
  kind: Kind;
  expanded: boolean;
  reduced: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const rot = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      rot.setValue(expanded ? 1 : 0);
      return;
    }
    Animated.timing(rot, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [expanded, rot, reduced]);

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <CalmPressable
      style={[styles.card, styles.cardShadow, expanded && styles.cardOpen]}
      onPress={onPress}
      accessibilityState={{ expanded }}
    >
      <View style={styles.cardHead}>
        {!expanded && <HelpAnim kind={kind} big={false} reduced={reduced} />}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.cardTitle}>{t(`help.${kind}.title`)}</Text>
          <Text style={styles.cardLine}>{t(`help.${kind}.line`)}</Text>
        </View>
        <Animated.Text style={[styles.chev, { transform: [{ rotate }] }]}>›</Animated.Text>
      </View>

      {expanded && (
        <ExpandedBody reduced={reduced}>
          <HelpAnim kind={kind} big reduced={reduced} />
          {[1, 2, 3].map((n) => (
            <View key={n} style={styles.step}>
              <Text style={styles.stepNo}>{n}</Text>
              <Text style={styles.stepText}>{t(`help.${kind}.s${n}`)}</Text>
            </View>
          ))}
        </ExpandedBody>
      )}
    </CalmPressable>
  );
}

export default function HelpScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const reduced = useReduceMotion();
  const [open, setOpen] = useState<Kind | null>('breath');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Küçük düğme kendi satırında: ScrollView içinde Pressable tam genişliğe yayılırdı. */}
        <View style={styles.backRow}>
          <CalmPressable
            onPress={() => router.back()}
            style={[styles.backBtn, styles.cardShadow]}
            accessibilityLabel={t('practice.close')}
            pressScale={0.94}
          >
            <Text style={styles.backIcon}>‹</Text>
          </CalmPressable>
        </View>

        <StaggerSection delay={0}>
          <Text style={styles.title}>{t('help.title')}</Text>
          <Text style={styles.subtitle}>{t('help.subtitle')}</Text>
        </StaggerSection>

        {KINDS.map((k, i) => (
          <StaggerSection key={k} delay={60 + i * 50}>
            <HelpCard
              kind={k}
              expanded={open === k}
              reduced={reduced}
              onPress={() => setOpen(open === k ? null : k)}
            />
          </StaggerSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 270 },
  scroll: { padding: 22, paddingBottom: 52 },

  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: {
          shadowColor: '#1D2A2F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  backBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  backRow: { flexDirection: 'row', marginTop: 4, marginBottom: 14 },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.text, lineHeight: 36 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted, lineHeight: 22, marginTop: 6, marginBottom: 20 },

  card: {
    backgroundColor: Colors.stone2, borderRadius: 22, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.tint(0.14),
  },
  cardOpen: {
    borderColor: Colors.tint(0.4),
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardTitle: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.text },
  cardLine: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 20, color: Colors.muted },
  chev: { fontFamily: Fonts.jostLight, fontSize: 24, lineHeight: 26, color: Colors.sand2, paddingHorizontal: 4 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNo: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.stone4, color: Colors.sand,
    fontFamily: Fonts.jostMedium, fontSize: 12, lineHeight: 24, textAlign: 'center', overflow: 'hidden',
  },
  stepText: { flex: 1, fontFamily: Fonts.jost, fontSize: 16, lineHeight: 24, color: Colors.text2 },

  anim: { width: 72, height: 72, borderRadius: 18, backgroundColor: Colors.stone3, overflow: 'hidden' },
  animBig: { width: '100%', height: 152, borderRadius: 18, backgroundColor: Colors.stone3, overflow: 'hidden' },
  petal: { position: 'absolute', left: '50%', top: '50%', backgroundColor: Colors.tint(0.32) },
  cb: { position: 'absolute', borderWidth: 2, borderColor: Colors.sand },
  cbFill: { position: 'absolute', backgroundColor: Colors.sand, alignItems: 'center', justifyContent: 'center' },
  cbTick: { color: Colors.bg, fontWeight: '700' },
  rowBar: { position: 'absolute', backgroundColor: Colors.faint },
  days: { position: 'absolute', left: 10, right: 10, top: 30, flexDirection: 'row', gap: 3 },
  day: { flex: 1, height: 10, borderRadius: 3, backgroundColor: Colors.stone4, overflow: 'hidden' },
  dayOn: { backgroundColor: '#4f9a76' },
  bub: { position: 'absolute' },
  wheel: { position: 'absolute', left: 0, flexDirection: 'row' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: Colors.stone4 },
  chipOn: { backgroundColor: Colors.sand, borderColor: Colors.sand },
  chipText: { fontFamily: Fonts.jostMedium, color: Colors.muted },
  chipTextOn: { color: Colors.bg },
  line: { width: '100%', height: '100%', backgroundColor: Colors.moon },
  saved: { position: 'absolute', left: 10, bottom: 7, fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
});
