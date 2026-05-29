import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

interface Props {
  icon: string;
  name: string;
  desc: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ModuleCard({ icon, name, desc, active, onPress, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.activeCard, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.stone2,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flex: 1,
  },
  activeCard: {
    borderColor: 'rgba(196,169,106,0.4)',
    backgroundColor: Colors.stone3,
  },
  icon: {
    fontSize: 22,
    marginBottom: 10,
  },
  name: {
    fontFamily: Fonts.cinzel,
    fontSize: 11,
    color: Colors.sand2,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  desc: {
    fontFamily: Fonts.jost,
    fontSize: 10,
    color: Colors.muted,
    lineHeight: 15,
  },
});
