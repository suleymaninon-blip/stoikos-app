import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { Quote } from '../constants/content';
import { useLang } from '../constants/i18n';
import { PHILOSOPHER_ICONS } from '../constants/philosopherIcons';
import { ConceptGlyph } from './ConceptGlyph';
import { PaperBg } from './PaperBg';

interface Props {
  quote: Quote;
}

/** Ana ekrandaki günün sözü. 21 Kasım 2026: Bilgelik'teki söz kartlarıyla aynı dil (kâğıt, sönen ayırıcı, yazarın gravür çizimi). */
export function QuoteCard({ quote }: Props) {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const { t } = useLang();
  const glyph = PHILOSOPHER_ICONS[quote.authorId];
  return (
    <View style={styles.card}>
      <PaperBg radius={20} />
      {/* Tırnak başlığın yanında: eskiden mutlak konumluydu ve başlığın altına giriyordu. */}
      <View style={styles.labelRow}>
        <Text style={styles.bigQuote} aria-hidden>“</Text>
        <Text style={styles.label}>{t('home.quoteLabel')}</Text>
      </View>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <LinearGradient
        colors={['transparent', Colors.tint(0.4), 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={styles.divider}
      />
      <View style={styles.metaRow}>
        {glyph ? <ConceptGlyph latin={quote.authorId} fallback="" paths={glyph} size={32} color={Colors.sand2} /> : null}
        <Text style={styles.author}>
          — {quote.author}
          {quote.source && quote.source !== quote.author
            ? <Text style={styles.source}>, {quote.source}</Text>
            : null}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  card: {
    // Açık temada krem "kâğıt" (Bilgelik ile aynı), koyuda yüzey rengi
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.tint(0.2),
    marginBottom: 16,
    overflow: 'hidden',
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  label: {
    fontFamily: Fonts.jostMedium,
    fontSize: 12,
    letterSpacing: 2.5,
    color: Colors.sand,
  },
  bigQuote: {
    fontFamily: Fonts.cormorant,
    fontSize: 40,
    lineHeight: 40,
    height: 24,
    color: Colors.tint(0.45),
  },
  quoteText: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 20,
    lineHeight: 29,
    color: Colors.sand3,
    marginBottom: 12,
    zIndex: 1,
  },
  divider: { height: 1, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  author: {
    flex: 1,
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  source: {
    fontStyle: 'italic',
  },
});
