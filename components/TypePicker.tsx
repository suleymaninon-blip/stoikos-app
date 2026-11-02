import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts, FONT_SETS, FONT_MAP, type FontSetId, type TextSize } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { loadFontSet } from '../constants/fontLoader';
import { useLang } from '../constants/i18n';

/**
 * Yazı tipi seti ve yazı boyutu seçici (Ayarlar → Görünüm). Her kartta "Aa" örneği kendi setinin
 * başlık yazı tipiyle çizilir; örnekler görünsün diye setlerin dosyaları seçici açılınca yüklenir.
 */
const sampleFamily = (id: FontSetId) => FONT_MAP[id][Fonts.cinzel] ?? Fonts.cinzel;
const bodyFamily = (id: FontSetId) => FONT_MAP[id][Fonts.jost] ?? Fonts.jost;

export function TypePicker() {
  const { font, setFont, textSize, setTextSize, C } = useTheme();
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(FONT_SETS.map(loadFontSet)).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  return (
    <View style={{ gap: 14, alignSelf: 'stretch' }}>
      <View style={styles.row} accessibilityRole="radiogroup">
        {FONT_SETS.map((id) => {
          const on = font === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setFont(id)}
              style={[styles.card, on && styles.cardOn]}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
            >
              {/* Örnek harfler stil tablosundan geçmez: her kart kendi setini gösterir. */}
              <Text style={[styles.sample, { fontFamily: loaded ? sampleFamily(id) : undefined, color: on ? C.sand2 : C.text }]}>Aa</Text>
              <Text style={[styles.name, { fontFamily: loaded ? bodyFamily(id) : undefined }, on && { color: C.sand2 }]}>{t(`font.${id}`)}</Text>
              <Text style={styles.desc} numberOfLines={2}>{t(`font.${id}D`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sizeRow}>
        <Text style={styles.sizeLabel}>{t('size.title')}</Text>
        {(['normal', 'large'] as TextSize[]).map((s) => {
          const on = textSize === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setTextSize(s)}
              style={[styles.chip, on && styles.chipOn]}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{t(`size.${s}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14,
    backgroundColor: Colors.stone2, borderWidth: 1.5, borderColor: Colors.overlay(0.07),
  },
  cardOn: { borderColor: Colors.sand, backgroundColor: Colors.tint(0.08) },
  sample: { fontSize: 30, lineHeight: 38 },
  name: { fontSize: 15, color: Colors.text },
  desc: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center', lineHeight: 16 },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2 },
  chip: { minWidth: 84, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.stone4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  chipOn: { backgroundColor: Colors.sand, borderColor: Colors.sand },
  chipText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2 },
  chipTextOn: { color: Colors.onAccent, fontFamily: Fonts.jostMedium },
});
