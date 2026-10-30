import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { localeOf, type Lang } from '../constants/i18n';
import { WP_W, WP_H, PALETTES, weeksLayout, marbleVeins, groupNum, type WeeksPrefs } from '../constants/lifeWeeks';
import StoikosMark from './StoikosMark';

/**
 * Hayat haftaları duvar kağıdı, 390×844 mantıksal boyutta. Önizlemede ölçeklenir,
 * native'de `captureRef(..., { width: 1290, height: 2796 })` ile resme çevrilir.
 * `clock` yalnız önizleme içindir: kilit ekranının saatini taklit eder, resme girmez.
 * Web dışa aktarımı aynı geometriyi canvas'a çizer (constants/weeksCanvas.ts).
 */
export const WeeksWallpaper = forwardRef<View, {
  prefs: WeeksPrefs; lang: Lang; t: (k: string) => string; clock?: boolean;
}>(function WeeksWallpaper({ prefs, lang, t, clock }, ref) {
  const P = PALETTES[prefs.theme];
  const L = useMemo(() => weeksLayout(prefs), [prefs.year, prefs.month, prefs.life]);
  const veins = useMemo(() => (P.veins ? marbleVeins() : []), [P.veins]);
  const id = `wk${prefs.theme}`;
  const stat = prefs.numbers
    ? `MEMENTO MORI · ${groupNum(L.lived, lang)} / ${groupNum(L.total, lang)} ${t('wp.weeksUpper')}`
    : 'MEMENTO MORI';
  const now = new Date();

  return (
    <View ref={ref} collapsable={false} style={[styles.root, { backgroundColor: P.base }]}>
      <Svg width={WP_W} height={WP_H} style={StyleSheet.absoluteFill}>
        <Defs>
          {P.grad?.kind === 'radial' && (
            <RadialGradient id={`${id}g`} cx={`${P.grad.cx * 100}%`} cy={`${P.grad.cy * 100}%`} r={`${P.grad.r * 100}%`}>
              {P.grad.stops.map(([o, c, a]) => <Stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
            </RadialGradient>
          )}
          {P.grad?.kind === 'linear' && (
            <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
              {P.grad.stops.map(([o, c, a]) => <Stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
            </LinearGradient>
          )}
          {P.vignette && (
            <RadialGradient id={`${id}v`} cx="50%" cy="50%" r="75%">
              <Stop offset="0.55" stopColor={P.vignette} stopOpacity={0} />
              <Stop offset="1" stopColor={P.vignette} stopOpacity={0.35} />
            </RadialGradient>
          )}
        </Defs>
        {P.grad && <Rect width={WP_W} height={WP_H} fill={`url(#${id}g)`} />}
        {veins.map((v, i) => (
          <Path key={i} d={v.d} fill="none" stroke={P.veins} strokeOpacity={v.o} strokeWidth={v.w} strokeLinecap="round" />
        ))}
        {P.vignette && <Rect width={WP_W} height={WP_H} fill={`url(#${id}v)`} />}

        <Rect x={L.band.x} y={L.band.y} width={L.band.w} height={L.band.h} rx={3} fill={P.accent} fillOpacity={0.07} />
        <Path d={L.oldPath} fill={P.lived} fillOpacity={0.55} />
        <Path d={L.recentPath} fill={P.lived} fillOpacity={0.95} />
        <Path d={L.restPath} fill="none" stroke={P.rest} strokeWidth={0.7} />
        <Circle cx={L.now.x} cy={L.now.y} r={L.now.r} fill={P.now} />
        <Circle cx={L.now.x} cy={L.now.y} r={L.now.halo} fill="none" stroke={P.now} strokeOpacity={0.55} strokeWidth={1} />
      </Svg>

      {L.decades.map((d) => (
        <Text key={d.label} style={[styles.decade, { width: d.right, top: d.y - 6, color: P.muted }]}>{d.label}</Text>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.stat, { color: P.muted }]}>{stat}</Text>
        <Text style={[styles.caption, { color: P.text }]}>{t('wp.caption')}</Text>
      </View>
      <View style={styles.brandRow}>
        <StoikosMark size={13} variant="line" color={P.brand} />
        <Text style={[styles.brand, { color: P.brand }]}>STOIKOS</Text>
      </View>

      {clock && (
        <View style={styles.clock} pointerEvents="none">
          <Text style={[styles.clockDate, { color: P.clock }]}>
            {now.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={[styles.clockTime, { color: P.clock }]}>
            {`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { width: WP_W, height: WP_H, overflow: 'hidden' },
  decade: { position: 'absolute', left: 0, textAlign: 'right', fontFamily: Fonts.jost, fontSize: 9, letterSpacing: 1 },
  footer: { position: 'absolute', left: 0, right: 0, top: 750, alignItems: 'center', gap: 4 },
  stat: { fontFamily: Fonts.jost, fontSize: 11, letterSpacing: 3 },
  caption: { fontFamily: Fonts.cormorantItalic, fontSize: 17, textAlign: 'center', paddingHorizontal: 24 },
  brandRow: { position: 'absolute', left: 0, right: 0, top: 806, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.7 },
  brand: { fontFamily: Fonts.cinzel, fontSize: 10, letterSpacing: 4 },
  clock: { position: 'absolute', left: 0, right: 0, top: 70, alignItems: 'center' },
  clockDate: { fontFamily: Fonts.jostMedium, fontSize: 18 },
  clockTime: { fontFamily: Fonts.jostLight, fontSize: 96, lineHeight: 104, letterSpacing: -2 },
});
