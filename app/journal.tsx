import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { loadJournalEntries, JournalEntry } from '../constants/journal';
import { useLang, localeOf } from '../constants/i18n';

type Entry = JournalEntry;

export default function JournalScreen() {
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
        colors={['rgba(100,160,220,0.05)', 'transparent']}
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

        {entries.map((e) => (
          <View key={e.key} style={styles.entryCard}>
            <Text style={styles.entryDate}>{fmt(e.date)}</Text>
            <Text style={styles.entryText}>{e.text}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginTop: 4, marginBottom: 12 },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  header: { marginBottom: 22 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.2, lineHeight: 19 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
  emptyIcon: { fontSize: 36, color: Colors.muted, opacity: 0.5 },
  emptyText: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.muted, textAlign: 'center', lineHeight: 26, paddingHorizontal: 20 },

  entryCard: {
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(100,160,220,0.12)',
  },
  entryDate: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1, color: 'rgba(100,160,220,0.8)', marginBottom: 8, textTransform: 'capitalize' },
  entryText: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 25 },
});
