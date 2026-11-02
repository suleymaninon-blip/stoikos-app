import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts, PALETTES, type ThemeId } from '../constants/theme';
import { useTheme, useStyles, THEME_MODES, type ThemeMode, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';

/**
 * Görünüm seçici (Ayarlar ve tanıtım). Her seçenekte paletin kendi renkleriyle küçük bir örnek:
 * zemin, kart ve vurgu. Otomatik'te gündüz (Ege) ve akşam (Gece mavisi) yan yana.
 */
function Swatch({ id }: { id: ThemeId }) {
  const P = PALETTES[id];
  return (
    <View style={[sw.box, { backgroundColor: P.bg, borderColor: P.overlay(0.12) }]}>
      <View style={[sw.card, { backgroundColor: P.stone2 }]} />
      <View style={[sw.dot, { backgroundColor: P.accent }]} />
    </View>
  );
}

export function ThemePicker() {
  const { mode, setMode } = useTheme();
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {THEME_MODES.map((m: ThemeMode, i) => {
        const on = mode === m;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[styles.row, i > 0 && styles.rowBorder]}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
          >
            <View style={styles.swatches}>
              {m === 'auto' ? (<><Swatch id="ege" /><Swatch id="gece" /></>) : <Swatch id={m} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, on && styles.nameOn]}>{t(`theme.${m}`)}</Text>
              <Text style={styles.desc}>{t(`theme.${m}D`)}</Text>
            </View>
            <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const sw = StyleSheet.create({
  box: { width: 26, height: 34, borderRadius: 7, borderWidth: 1, padding: 4, justifyContent: 'space-between', overflow: 'hidden' },
  card: { height: 10, borderRadius: 3 },
  dot: { width: 10, height: 10, borderRadius: 5, alignSelf: 'flex-end' },
});

const makeStyles = (Colors: Palette) => StyleSheet.create({
  list: {
    alignSelf: 'stretch', backgroundColor: Colors.stone2, borderRadius: 16, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.overlay(0.06) },
  swatches: { width: 58, flexDirection: 'row', gap: 4 },
  name: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text },
  nameOn: { color: Colors.sand2 },
  desc: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.sand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.sand },
});
