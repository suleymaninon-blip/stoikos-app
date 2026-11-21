import React from 'react';
import { Text, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { CONCEPT_ICONS } from '../constants/conceptIcons';

/**
 * Kavram simgesi — gravür üslubunda SVG çizim (21 Kasım 2026, kullanıcı onayı; tasarım
 * https://claude.ai/artifact/C5zAkxaAvC9ZPMVFk4C8Zt). Eskiden yazı karakteriydi (♾ ⧗ ☉…): her telefonda
 * farklı çiziliyor, web'de ♾ daire içinde çıkıyordu. Çizimler `constants/conceptIcons.ts`'te
 * (üretim `scripts/brand/concept-icons.js`). `press` verilirse çizimin 0,8 px altına o renkte bir kopya
 * çizilir: kâğıda basılmış görünür. Çizimi olmayan kavramda yazı karakterine düşer.
 */
export function ConceptGlyph({
  latin, fallback, size, color, press, pressOpacity = 0.95,
}: {
  latin: string; fallback: string; size: number; color: string; press?: string; pressOpacity?: number;
}) {
  const p = CONCEPT_ICONS[latin];
  if (!p) return <Text style={{ fontSize: size * 0.7, color, textAlign: 'center' }}>{fallback + '︎'}</Text>;
  const layer = (c: string) => (
    <>
      <Path d={p.thin} stroke={c} strokeWidth={0.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={p.thick} stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {p.fill ? <Path d={p.fill} fill={c} /> : null}
    </>
  );
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {press ? <G opacity={pressOpacity} transform={`translate(0 ${(0.8 * 64) / size})`}>{layer(press)}</G> : null}
        {layer(color)}
      </Svg>
    </View>
  );
}
