import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';

interface Props {
  streak: number;
  weekDays: boolean[];
}

export function StreakBar({ streak, weekDays }: Props) {
  const styles = useStyles(makeStyles);
  const { t } = useLang();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.flame}>🔥</Text>
        <View>
          <Text style={styles.label}>{t('home.streak')}</Text>
          <Text style={styles.count}>{streak}</Text>
        </View>
      </View>
      <View style={styles.dots}>
        {weekDays.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              filled && styles.dotFilled,
              i === 6 && filled && styles.dotToday,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: {
    backgroundColor: Colors.stone2,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.overlay(0.06),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flame: {
    fontSize: 24,
  },
  label: {
    fontFamily: Fonts.jostMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.muted,
    marginBottom: 2,
  },
  count: {
    fontFamily: Fonts.cinzel,
    fontSize: 24,
    color: Colors.accent,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.stone4,
  },
  dotFilled: {
    backgroundColor: Colors.accent,
  },
  dotToday: {
    backgroundColor: Colors.sand,
    shadowColor: Colors.sand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
