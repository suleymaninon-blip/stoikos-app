import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { loadJournalEntries, groupByMonth, JournalEntry } from '../constants/journal';
import { useLang, localeOf, upper } from '../constants/i18n';

type Entry = JournalEntry;

export default function JournalScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await loadJournalEntries();
        setEntries(list);
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.moonA(0.05), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t('journal.title')}</Text>
          <Text style={styles.subtitle}>{t('journal.subtitle')}</Text>
        </View>

        {loaded && entries.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>✎</Text>
            <Text style={styles.emptyText}>{t('journal.empty')}</Text>
          </View>
        )}

        {/* Ay ay: her ayın başında küçük bir özet (yazılan gün, kelime, en çok geçen kelimeler). Cihazda hesaplanır. */}
        {groupByMonth(entries, lang, localeOf(lang)).map((g) => (
          <View key={g.key}>
            <View style={styles.monthCard}>
              <Text style={styles.monthTitle}>{upper(g.date.toLocaleDateString(localeOf(lang), { month: 'long', year: 'numeric' }), lang)}</Text>
              <Text style={styles.monthStats}>
                {t('journal.monthStats').replace('{d}', String(g.stats.days)).replace('{w}', String(g.stats.words))}
              </Text>
              {g.stats.top.length > 0 && (
                <View style={styles.topRow}>
                  <Text style={styles.topLabel}>{t('journal.topWords')}</Text>
                  <View style={styles.topChips}>
                    {g.stats.top.map((w) => <View key={w} style={styles.topChip}><Text style={styles.topChipText}>{w}</Text></View>)}
                  </View>
                </View>
              )}
            </View>
            {g.entries.map((e) => (
              <View key={e.key} style={styles.entryCard}>
                <Text style={styles.entryDate}>{fmt(e.date)}</Text>
                <Text style={styles.entryText}>{e.text}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07), marginTop: 4, marginBottom: 12 },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  header: { marginBottom: 22 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.2, lineHeight: 19 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
  emptyIcon: { fontSize: 36, color: Colors.muted, opacity: 0.5 },
  emptyText: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.muted, textAlign: 'center', lineHeight: 26, paddingHorizontal: 20 },

  monthCard: {
    backgroundColor: Colors.tint(0.07), borderRadius: 16, padding: 16, marginBottom: 12, marginTop: 6,
    borderWidth: 1, borderColor: Colors.tint(0.16),
  },
  monthTitle: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand, marginBottom: 6 },
  monthStats: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, lineHeight: 22 },
  topRow: { marginTop: 12, gap: 8 },
  topLabel: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  topChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topChip: { backgroundColor: Colors.stone2, borderRadius: 14, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.overlay(0.08) },
  topChipText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text },
  entryCard: {
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.moonA(0.12),
  },
  entryDate: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1, color: Colors.moon, marginBottom: 8, textTransform: 'capitalize' },
  entryText: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 25 },
});
