import React, { useId, useMemo } from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../constants/themeContext';
import { TRACE_MOTIFS, TRACE_RGB } from '../constants/traces';
import { TRACE_IMAGES } from '../constants/traceImages';

/**
 * İzler sikkesi.
 * `earned` = döküm metal sikke (22 Kasım 2026, kullanıcının bronz kabartma örneği):
 *   kabarık kenar (ışık sol üstten), içe basılmış oluk, hafif kubbe yüz,
 *   motif kabartma (altında gölge, üstünde ışık kopyası). Metal tonu bronzdan
 *   programın rengine doğru %28 kayar; böylece her sikke kendi programını taşır.
 *   Yalnız gradyan + kopya yollar: react-native-svg'de filtre yok.
 * `locked` = kesik çizgili soluk yuva + soluk çizim ("henüz yürünmedi").
 * `soon`   = yayımlanmamış program, noktalı halka + programın glifi.
 */
export type TraceState = 'earned' | 'locked' | 'soon';

type RGB = [number, number, number];
const BRONZE: RGB = [156, 112, 72];
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const light = (c: RGB, t: number): RGB => c.map((v) => Math.round(v + (255 - v) * t)) as RGB;
const darkn = (c: RGB, t: number): RGB => c.map((v) => Math.round(v * (1 - t))) as RGB;
const css = (c: RGB, a = 1) => (a === 1 ? `rgb(${c.join(',')})` : `rgba(${c.join(',')},${a})`);

export default function TraceCoin({ pid, state, size = 64, glyph }: { pid: string; state: TraceState; size?: number; glyph?: string }) {
  const { C } = useTheme();
  const dark = C.isDark;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const m = TRACE_MOTIFS[pid];
  const rgb = (TRACE_RGB[pid] ?? [150, 145, 140]) as RGB;

  const metal = useMemo(() => {
    const base = mix(BRONZE, rgb, 0.28);
    return {
      hi: css(light(base, 0.6)),
      lite: css(light(base, 0.15)),
      mid: css(darkn(base, 0.12)),
      low: css(darkn(base, 0.42)),
      deep: css(darkn(base, 0.6)),
      faceLite: css(darkn(base, 0.18)),
      faceMid: css(darkn(base, 0.38)),
      faceLow: css(darkn(base, 0.58)),
      relief: css(light(base, 0.32)),
      reliefHi: css(light(base, 0.72), 0.95),
      reliefLo: css(darkn(base, 0.78), 0.9),
    };
  }, [rgb]);
  const faint = dark ? '#5E7189' : '#A3ADB0';
  const effective: TraceState = !m && state !== 'soon' ? 'soon' : state;

  const rim = `rim${uid}`, groove = `gr${uid}`, face = `fc${uid}`;

  // Motif: üç kat — gölge (sağ alt), ışık (sol üst), gövde.
  const layer = (dx: number, dy: number, color: string, w: number) => (
    <G transform={`translate(${23.76 + dx} ${23.76 + dy}) scale(0.82)`}>
      <Path d={m!.thick} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {!!m!.thin && <Path d={m!.thin} fill="none" stroke={color} strokeWidth={w * 0.5} strokeLinecap="round" strokeLinejoin="round" />}
      {!!m!.fill && <Path d={m!.fill} fill={color} stroke={color} strokeWidth={0.6} />}
    </G>
  );

  // Fotoğrafı olan sikke: altında aynı yumuşak gölge, üstünde fotoğraf.
  const photo = TRACE_IMAGES[pid];
  if (effective === 'earned' && photo) {
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
          <Circle cx={51} cy={52.5} r={46.5} fill="rgba(0,0,0,0.10)" />
          <Circle cx={50.6} cy={51.6} r={46.2} fill="rgba(0,0,0,0.14)" />
        </Svg>
        <Image source={photo} style={{ position: 'absolute', left: size * 0.03, top: size * 0.03, width: size * 0.94, height: size * 0.94 }} resizeMode="contain" />
      </View>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {effective === 'earned' && m && (
        <>
          <Defs>
            <LinearGradient id={rim} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
              <Stop offset="0" stopColor={metal.hi} />
              <Stop offset="0.45" stopColor={metal.mid} />
              <Stop offset="1" stopColor={metal.deep} />
            </LinearGradient>
            <LinearGradient id={groove} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
              <Stop offset="0" stopColor={metal.deep} />
              <Stop offset="1" stopColor={metal.lite} />
            </LinearGradient>
            <RadialGradient id={face} cx="0.4" cy="0.36" r="0.7">
              <Stop offset="0" stopColor={metal.faceLite} />
              <Stop offset="0.65" stopColor={metal.faceMid} />
              <Stop offset="1" stopColor={metal.faceLow} />
            </RadialGradient>
          </Defs>
          {/* Yumuşak gölge */}
          <Circle cx={51} cy={52.5} r={46.5} fill="rgba(0,0,0,0.10)" />
          <Circle cx={50.6} cy={51.6} r={46.2} fill="rgba(0,0,0,0.14)" />
          {/* Kabarık kenar, oluk, yüz */}
          <Circle cx={50} cy={50} r={46} fill={`url(#${rim})`} />
          <Circle cx={50} cy={50} r={40.2} fill={`url(#${groove})`} />
          <Circle cx={50} cy={50} r={38.6} fill={`url(#${face})`} />
          {/* Kenarda ışık */}
          <Path d="M11.5 38 A40 40 0 0 1 38 11.5" fill="none" stroke={metal.reliefHi} strokeWidth={1.3} strokeLinecap="round" opacity={0.75} />
          {/* Kabartma motif */}
          {layer(1.1, 1.3, metal.reliefLo, 3.2)}
          {layer(-0.55, -0.65, metal.reliefHi, 2.5)}
          {layer(0, 0, metal.relief, 2.6)}
        </>
      )}
      {effective === 'locked' && m && (
        <>
          <Circle cx={50} cy={50} r={45} fill="none" stroke={faint} strokeWidth={1.4} strokeDasharray="3 4" />
          <G transform="translate(23.76 23.76) scale(0.82)" opacity={0.55}>
            <Path d={m.thick} fill="none" stroke={faint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {!!m.fill && <Path d={m.fill} fill={faint} />}
          </G>
        </>
      )}
      {effective === 'soon' && (
        <>
          <Circle cx={50} cy={50} r={45} fill="none" stroke={faint} strokeWidth={1.2} strokeDasharray="1.5 5" strokeLinecap="round" />
          {!!glyph && <SvgText x={50} y={58} textAnchor="middle" fontSize={24} fill={faint}>{glyph}</SvgText>}
        </>
      )}
    </Svg>
  );
}
