import React from 'react';
import { View, StyleSheet, ImageBackground, Platform, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinear, Path, Rect, Stop } from 'react-native-svg';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';

// Kâğıt dokusu (scripts/brand/make-paper.py): 160 px döşenen, saydam zeminli hafif benekler.
export const PAPER = require('../assets/paper.png');

// Kabartma simge kartı (21 Kasım 2026, kullanıcı: "o hissi alamıyorum" → iki katlı yapıldı):
// dışta kabarık çerçeve (üstü ışık, altı gölge), içte köşeleri oyulmuş, basılmış (çökük) pano
// (iç kenarın üstü gölge, altı ışık). Göz bu "yükselen dış, çöken iç" farkını kabartma okuyor.
const TILE_W = 92, TILE_H = 118, TILE_R = 14, PANEL_IN = 9, NOTCH = 8;
/** Köşeleri içe oyulmuş dikdörtgen (oyuk yarıçapı n). */
function notched(x: number, y: number, w: number, h: number, n: number) {
  const r = x + w, b = y + h;
  return `M${x + n} ${y} H${r - n} A${n} ${n} 0 0 0 ${r} ${y + n} V${b - n} A${n} ${n} 0 0 0 ${r - n} ${b} H${x + n} A${n} ${n} 0 0 0 ${x} ${b - n} V${y + n} A${n} ${n} 0 0 0 ${x + n} ${y} Z`;
}
const PANEL = notched(PANEL_IN, PANEL_IN, TILE_W - PANEL_IN * 2, TILE_H - PANEL_IN * 2, NOTCH);
const PANEL_LINE = notched(PANEL_IN + 4, PANEL_IN + 4, TILE_W - (PANEL_IN + 4) * 2, TILE_H - (PANEL_IN + 4) * 2, NOTCH - 2);

/** Kabartma simge kartı — kavram ve filozof pencerelerinde ortak (21 Kasım 2026). İçine simge konur. */
export function EmbossTile({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.tile, style]}>
      <ImageBackground source={PAPER} resizeMode="repeat" style={[StyleSheet.absoluteFill, styles.tileClip]} imageStyle={{ opacity: Colors.isDark ? 0.3 : 1 }} />
      <Svg width={TILE_W} height={TILE_H} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* yüzey: üstü biraz açık, altı biraz koyu */}
          <SvgLinear id="tileFace" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.isDark ? '#ffffff' : '#ffffff'} stopOpacity={Colors.isDark ? 0.06 : 0.55} />
            <Stop offset="1" stopColor={Colors.isDark ? '#000000' : '#8a7a5c'} stopOpacity={Colors.isDark ? 0.18 : 0.1} />
          </SvgLinear>
          {/* dış kenar: üstte ışık, altta gölge (kabarık) */}
          <SvgLinear id="tileBevel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={Colors.isDark ? 0.22 : 1} />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor={Colors.isDark ? '#000000' : '#5c4d33'} stopOpacity={Colors.isDark ? 0.5 : 0.28} />
          </SvgLinear>
          {/* iç kenar: üstte gölge, altta ışık (basılmış) */}
          <SvgLinear id="tileDeboss" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.isDark ? '#000000' : '#5c4d33'} stopOpacity={Colors.isDark ? 0.55 : 0.3} />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity={Colors.isDark ? 0.18 : 1} />
          </SvgLinear>
        </Defs>
        <Rect x={0.75} y={0.75} width={TILE_W - 1.5} height={TILE_H - 1.5} rx={TILE_R} fill="url(#tileFace)" stroke="url(#tileBevel)" strokeWidth={1.5} />
        <Path d={PANEL} fill={Colors.isDark ? 'rgba(0,0,0,0.16)' : 'rgba(92,77,51,0.05)'} stroke="url(#tileDeboss)" strokeWidth={1.6} />
        <Path d={PANEL_LINE} fill="none" stroke={Colors.tint(Colors.isDark ? 0.3 : 0.35)} strokeWidth={0.8} />
      </Svg>
      {children}
    </View>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  // Kabartma simge kartı: dış gölge ikili (yakın + yumuşak) ki kart zeminden kalksın.
  tile: {
    alignSelf: 'center', width: TILE_W, height: TILE_H, borderRadius: TILE_R,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    backgroundColor: Colors.isDark ? Colors.stone3 : Colors.stone2,
    ...Platform.select({
      ios: { shadowColor: Colors.isDark ? '#000' : '#3b3222', shadowOffset: { width: 0, height: 7 }, shadowOpacity: Colors.isDark ? 0.5 : 0.2, shadowRadius: 12 },
      android: { elevation: 6 },
      default: { boxShadow: Colors.isDark ? '0 1px 2px rgba(0,0,0,0.5), 0 8px 18px rgba(0,0,0,0.45)' : '0 1px 2px rgba(59,50,34,0.14), 0 8px 18px rgba(59,50,34,0.18)' } as any,
    }),
  },
  tileClip: { borderRadius: TILE_R, overflow: 'hidden' },
});
