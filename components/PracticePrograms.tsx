import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Fonts } from '../constants/theme';
import { useStyles, useTheme, type Palette } from '../constants/themeContext';
import { localeOf, upper, useLang } from '../constants/i18n';
import { getPrograms, getProgress, getUpcoming, type Program } from '../constants/programs';
import { getTraces } from '../constants/traces';
import { CalmPressable } from './CalmPressable';
import { StaggerSection } from './StaggerSection';
import { PaperBg } from './PaperBg';

/**
 * Pratik → "Programlar" görünümü (23 Kasım 2026, kullanıcı: "Programlar menüsü alt menüde yok";
 * tasarım https://claude.ai/artifact/VVEhHjRXjEyhZyUJFBs8PW). Alt menüye altıncı sekme eklemek yerine
 * Pratik'in içinde Bugün | Programlar anahtarı. Üstte devam eden program, altında bütün yolculuklar
 * (devam eden → başlanmamış → biten), en sonda "Yakında". Dokununca bugünkü program ekranı açılır
 * (Plus kapısı ve gün penceresi orada); bu görünüm yalnız bir giriş.
 */
const tint = (color: string, a: number) => color.replace(/[\d.]+\)\s*$/, `${a})`);

type Row = { p: Program; done: number[] };

export default function PracticePrograms() {
  const styles = useStyles(makeStyles);
  const { C } = useTheme();
  const { t, lang } = useLang();
  const [rows, setRows] = useState<Row[]>([]);
  const [earned, setEarned] = useState(0);

  useFocusEffect(useCallback(() => {
    let live = true;
    (async () => {
      const programs = getPrograms(lang);
      const list = await Promise.all(programs.map(async (p) => ({ p, done: await getProgress(p.id) })));
      const rank = (r: Row) => (r.done.length > 0 && r.done.length < r.p.dayCount ? 0 : r.done.length === 0 ? 1 : 2);
      list.sort((a, b) => rank(a) - rank(b));
      const traces = await getTraces();
      if (!live) return;
      setRows(list);
      setEarned(programs.filter((p) => p.id in traces).length);
    })();
    return () => { live = false; };
  }, [lang]));

  if (!rows.length) return null;
  const current = rows.find((r) => r.done.length > 0 && r.done.length < r.p.dayCount);
  const upcoming = getUpcoming(lang);
  const open = (id: string, day?: number) =>
    router.push({ pathname: '/programs', params: day != null ? { open: id, day: String(day) } : { open: id } });

  let resume: React.ReactNode = null;
  if (current) {
    const { p, done } = current;
    let next = 0;
    while (done.includes(next) && next < p.dayCount - 1) next++;
    const c = p.color;
    resume = (
      <StaggerSection delay={60}>
        <Text style={styles.label}>{upper(t('home.resume'), lang)}</Text>
        <CalmPressable
          onPress={() => open(p.id, next)}
          style={[styles.resume, styles.cardShadow, { backgroundColor: tint(c, C.isDark ? 0.08 : 0.06), borderColor: tint(c, C.isDark ? 0.35 : 0.28) }]}
          accessibilityLabel={`${p.title}, ${t('programs.dayOf', { n: next + 1, total: p.dayCount })}`}
        >
          <PaperBg radius={24} />
          <View style={styles.resumeMain}>
            <View style={[styles.iconBox, styles.iconBoxBig, { backgroundColor: tint(c, 0.16) }]}>
              <Text style={[styles.iconBig, { color: tint(c, 1) }]}>{p.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle}>{p.title}</Text>
              <Text style={styles.resumeStep} numberOfLines={2}>{p.days[next].title}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: tint(c, 0.14) }]}>
              <Text style={[styles.pillText, { color: tint(c, 1) }]}>{t('programs.dayOf', { n: next + 1, total: p.dayCount })}</Text>
            </View>
          </View>
          <View style={styles.segs}>
            {p.days.map((_, i) => (
              <View key={i} style={[styles.seg, { backgroundColor: done.includes(i) ? tint(c, 1) : i === next ? tint(c, 0.42) : C.overlay(0.07) }]} />
            ))}
          </View>
          <View style={[styles.cta, { backgroundColor: C.accent }]}>
            <Text style={styles.ctaText}>{t('home.openStep')}</Text>
          </View>
        </CalmPressable>
      </StaggerSection>
    );
  }

  return (
    <View>
      {resume}

      <StaggerSection delay={140}>
        <View style={styles.listHead}>
          <Text style={styles.label}>{upper(t('practice.allJourneys', { n: rows.length }), lang)}</Text>
          <CalmPressable onPress={() => router.navigate({ pathname: '/(tabs)/progress', params: { focus: 'traces' } })} style={styles.tracesLink}>
            <Text style={styles.tracesLinkText}>{t('practice.tracesLink', { n: earned, total: rows.length })}</Text>
          </CalmPressable>
        </View>

        {rows.map(({ p, done }) => {
          const n = done.length;
          const finished = n >= p.dayCount;
          const c = p.color;
          const label = n === 0 ? t('programs.start') : finished ? t('programs.review') : t('programs.continue');
          return (
            <CalmPressable
              key={p.id}
              onPress={() => open(p.id)}
              style={[styles.row, styles.cardShadow]}
              accessibilityLabel={`${p.title}. ${t('programs.progress', { done: n, total: p.dayCount })}. ${label}`}
            >
              <PaperBg radius={20} />
              <View style={[styles.iconBox, { backgroundColor: tint(c, 0.16) }]}>
                <Text style={[styles.icon, { color: tint(c, 1) }]}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.rowTitleLine}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{p.title}</Text>
                  {p.isNew && n === 0 && <Text style={styles.newBadge}>{upper(t('programs.newTag'), lang)}</Text>}
                </View>
                <Text style={styles.rowSub} numberOfLines={1}>{p.subtitle}</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${Math.round((n / p.dayCount) * 100)}%`, backgroundColor: tint(c, 1) }]} />
                </View>
              </View>
              <Text style={[styles.rowCta, finished && { color: C.muted }]}>{label}</Text>
            </CalmPressable>
          );
        })}

        {upcoming && (
          <View style={styles.soon} accessible accessibilityLabel={`${t('programs.soonTag')}: ${upcoming.title}`}>
            <View style={styles.soonIcon}><Text style={styles.soonGlyph}>{upcoming.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.soonTag}>{upper(t('programs.soonTag'), lang)}</Text>
              <Text style={styles.rowTitle}>{upcoming.title}</Text>
              <Text style={styles.rowSub}>
                {upcoming.releaseAt
                  ? t('programs.soonOn', { date: upcoming.releaseAt.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long' }) })
                  : t('programs.monthly')}
              </Text>
            </View>
          </View>
        )}
      </StaggerSection>
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: { shadowColor: '#1D2A2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
        android: { elevation: 2 },
        default: {},
      }) ?? {}
    : {},
  label: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.8, color: Colors.muted, marginBottom: 10 },
  resume: { borderWidth: 1, borderRadius: 24, padding: 18, marginBottom: 26, gap: 14 },
  resumeMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeTitle: { fontFamily: Fonts.cormorant, fontSize: 24, lineHeight: 28, color: Colors.text },
  resumeStep: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 20, color: Colors.text2, marginTop: 2 },
  pill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  pillText: { fontFamily: Fonts.jostMedium, fontSize: 12 },
  segs: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  cta: { height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.onAccent },
  listHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  tracesLink: { minHeight: 28 },
  tracesLinkText: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.sand },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 76, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.stone4,
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, marginBottom: 10,
  },
  iconBox: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconBoxBig: { width: 48, height: 48, borderRadius: 15 },
  icon: { fontSize: 18 },
  iconBig: { fontSize: 21 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.text, flexShrink: 1 },
  rowSub: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 18, color: Colors.text2, marginTop: 2 },
  newBadge: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1, color: Colors.onAccent, backgroundColor: Colors.accent, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden' },
  bar: { height: 3, borderRadius: 2, backgroundColor: Colors.overlay(0.07), marginTop: 8, overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2 },
  rowCta: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.sand },
  soon: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.stone4, marginTop: 4,
  },
  soonIcon: { width: 42, height: 42, borderRadius: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.stone4, alignItems: 'center', justifyContent: 'center' },
  soonGlyph: { fontSize: 17, color: Colors.faint },
  soonTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1.6, color: Colors.sand, marginBottom: 2 },
});
