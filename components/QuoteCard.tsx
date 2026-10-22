import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { Quote } from '../constants/content';
import { useLang } from '../constants/i18n';

interface Props {
  quote: Quote;
}

export function QuoteCard({ quote }: Props) {
  const { t } = useLang();
  return (
    <View style={styles.card}>
      {/* Tırnak başlığın yanında: eskiden mutlak konumluydu ve başlığın altına giriyordu. */}
      <View style={styles.labelRow}>
        <Text style={styles.bigQuote} aria-hidden>“</Text>
        <Text style={styles.label}>{t('home.quoteLabel')}</Text>
      </View>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.author}>
        — {quote.author}
        {quote.source && quote.source !== quote.author
          ? <Text style={styles.source}>, {quote.source}</Text>
          : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.stone2,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,169,106,0.2)',
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
    color: 'rgba(196,169,106,0.45)',
  },
  quoteText: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 20,
    lineHeight: 29,
    color: Colors.sand3,
    marginBottom: 14,
    zIndex: 1,
  },
  author: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  source: {
    fontStyle: 'italic',
  },
});
