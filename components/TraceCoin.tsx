import React, { useMemo } from 'react';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../constants/themeContext';
import { TRACE_MOTIFS, TRACE_RGB } from '../constants/traces';

/**
 * İzler sikkesi. `earned` = programın renginde, boncuklu kenar + gravür çizim;
 * `locked` = kesik çizgili soluk yuva + soluk çizim ("henüz yürünmedi");
 * `soon` = yayımlanmamış program, noktalı halka + programın glifi.
 * Renkler programın taban renginden, temaya göre koyulaştırılarak/açılarak türer.
 */
export type TraceState = 'earned' | 'locked' | 'soon';

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
};
// Kenar boncukları bir kez hesaplanır (48 küçük daire, tek Path).
const BEADS = Array.from({ length: 48 }, (_, i) => {
  const [x, y] = polar(42.6, i * 7.5);
  return `M${(x - 0.85).toFixed(2)} ${y.toFixed(2)}a0.85 0.85 0 1 0 1.7 0a0.85 0.85 0 1 0 -1.7 0`;
}).join('');

export default function TraceCoin({ pid, state, size = 64, glyph }: { pid: string; state: TraceState; size?: number; glyph?: string }) {
  const { C } = useTheme();
  const dark = C.isDark;
  const m = TRACE_MOTIFS[pid];
  const rgb = TRACE_RGB[pid] ?? [150, 145, 140];
  const colors = useMemo(() => {
    const ink = dark ? rgb.map((v) => Math.round(v + (255 - v) * 0.5)) : rgb.map((v) => Math.round(v * 0.52));
    return {
      ink: `rgb(${ink.join(',')})`,
      inkSoft: `rgba(${ink.join(',')},${dark ? 0.6 : 0.55})`,
      face: `rgba(${rgb.join(',')},${dark ? 0.2 : 0.16})`,
      shine: dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)',
      faint: dark ? '#5E7189' : '#A3ADB0',
    };
  }, [dark, rgb]);
  const effective: TraceState = !m && state !== 'soon' ? 'soon' : state;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {effective === 'earned' && m && (
        <>
          <Circle cx={50} cy={50} r={46} fill={colors.face} stroke={colors.ink} strokeWidth={2} />
          <Path d={BEADS} fill={colors.inkSoft} />
          <Circle cx={50} cy={50} r={39} fill="none" stroke={colors.inkSoft} strokeWidth={0.8} />
          <Path d="M14.6 35.5 A38 38 0 0 1 35.5 14.6" fill="none" stroke={colors.shine} strokeWidth={1.4} strokeLinecap="round" />
          <G transform="translate(23.76 23.76) scale(0.82)">
            <Path d={m.thick} fill="none" stroke={colors.ink} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />
            {!!m.thin && <Path d={m.thin} fill="none" stroke={colors.ink} strokeWidth={1.05} strokeLinecap="round" strokeLinejoin="round" />}
            {!!m.fill && <Path d={m.fill} fill={colors.ink} />}
          </G>
        </>
      )}
      {effective === 'locked' && m && (
        <>
          <Circle cx={50} cy={50} r={45} fill="none" stroke={colors.faint} strokeWidth={1.4} strokeDasharray="3 4" />
          <G transform="translate(23.76 23.76) scale(0.82)" opacity={0.55}>
            <Path d={m.thick} fill="none" stroke={colors.faint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {!!m.fill && <Path d={m.fill} fill={colors.faint} />}
          </G>
        </>
      )}
      {effective === 'soon' && (
        <>
          <Circle cx={50} cy={50} r={45} fill="none" stroke={colors.faint} strokeWidth={1.2} strokeDasharray="1.5 5" strokeLinecap="round" />
          {!!glyph && <SvgText x={50} y={58} textAnchor="middle" fontSize={24} fill={colors.faint}>{glyph}</SvgText>}
        </>
      )}
    </Svg>
  );
}
