import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { Quote } from '../constants/quotes';

interface Props {
  quote: Quote;
}

export function QuoteCard({ quote }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>GÜNÜN ALINTISI</Text>
      <Text style={styles.bigQuote}>"</Text>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.author}>— {quote.author}, <Text style={styles.source}>{quote.source}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.stone2,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(196,169,106,0.2)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  label: {
    fontFamily: Fonts.jostMedium,
    fontSize: 10,
    letterSpacing: 2.5,
    color: Colors.sand,
    marginBottom: 14,
  },
  bigQuote: {
    fontFamily: Fonts.cormorant,
    fontSize: 80,
    lineHeight: 60,
    color: 'rgba(196,169,106,0.1)',
    position: 'absolute',
    top: 28,
    left: 14,
  },
  quoteText: {
    fontFamily: Fonts.cormorantItalic,
    fontSize: 17,
    lineHeight: 28,
    color: Colors.sand3,
    marginBottom: 14,
    zIndex: 1,
  },
  author: {
    fontFamily: Fonts.jost,
    fontSize: 11,
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  source: {
    fontStyle: 'italic',
  },
});
