import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { useTheme } from '../constants/themeContext';
import { PAPER } from './EmbossTile';

/**
 * Kartın arkasında kâğıt dokusu (21 Kasım 2026; Bilgelik, Pratik, Ana kartları). Açık temada belirgin,
 * koyuda çok soluk. Kartın ilk çocuğu olmalı. `radius` kartın köşe yarıçapı: doku köşelerde kendini kırpar,
 * böylece kartın kendisine `overflow: 'hidden'` gerekmez — iOS'ta `overflow: hidden` kartın gölgesini siler.
 */
export function PaperBg({ radius = 0, opacityDark = 0.15 }: { radius?: number; opacityDark?: number }) {
  const { C: Colors } = useTheme();
  return (
    <ImageBackground
      source={PAPER}
      resizeMode="repeat"
      style={[StyleSheet.absoluteFill, radius ? { borderRadius: radius, overflow: 'hidden' } : null]}
      imageStyle={{ opacity: Colors.isDark ? opacityDark : 1 }}
    />
  );
}
