import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../constants/theme';

/**
 * Arayüz ikonları — emoji yerine.
 *
 * Emoji kendi renginde çiziliyor ve renklendirilemiyor; sıcak altın-taş
 * paletinin içinde yabancı duruyordu (Pratik ekranında sabah `☀` metin glifi
 * olduğu için altın, akşam `🌙` emoji olduğu için parlak sarı çıkıyordu —
 * aynı ekranda iki farklı görsel dil). Bunlar `color` prop'unu alıyor,
 * dolayısıyla palete uyuyor ve platformdan bağımsız aynı görünüyor.
 *
 * `PhilosopherSymbol` ile aynı üslup: 24×24 viewBox, ince çizgi, yuvarlak uç.
 */

const SW = 1.5;

interface IconProps {
  size?: number;
  color?: string;
}

const base = (color: string) => ({
  stroke: color,
  strokeWidth: SW,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

/** Sabah — çekirdek + sekiz ışın. */
export function SunIcon({ size = 24, color = Colors.sand }: IconProps) {
  const b = base(color);
  const rIn = 6.8;
  const rOut = 9.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="4.2" {...b} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        return (
          <Line
            key={deg}
            x1={(12 + dx * rIn).toFixed(2)}
            y1={(12 + dy * rIn).toFixed(2)}
            x2={(12 + dx * rOut).toFixed(2)}
            y2={(12 + dy * rOut).toFixed(2)}
            {...b}
          />
        );
      })}
    </Svg>
  );
}

/** Akşam — hilal. Dış yay r=8,5, iç yay r=8; ince bir ay bırakır. */
export function MoonIcon({ size = 24, color = Colors.sand }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 15.5 4.2 A 8.5 8.5 0 1 0 15.5 19.8 A 8 8 0 0 1 15.5 4.2 Z" {...base(color)} />
    </Svg>
  );
}

/** Nefes orbunun ses düğmesi. `on=false` iken hoparlörün yanına çarpı gelir. */
export function SoundIcon({ size = 24, color = Colors.sand, on = true }: IconProps & { on?: boolean }) {
  const b = base(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Hoparlör: sol kutu + koni */}
      <Path d="M 4 9.5 H 7.6 L 12.2 5.4 V 18.6 L 7.6 14.5 H 4 Z" {...b} />
      {on ? (
        <>
          <Path d="M 15.4 9.4 A 3.4 3.4 0 0 1 15.4 14.6" {...b} />
          <Path d="M 17.8 6.6 A 7.2 7.2 0 0 1 17.8 17.4" {...b} />
        </>
      ) : (
        <>
          <Line x1="15.6" y1="9.6" x2="20.4" y2="14.4" {...b} />
          <Line x1="20.4" y1="9.6" x2="15.6" y2="14.4" {...b} />
        </>
      )}
    </Svg>
  );
}

/** Sesli anlatım çalarken — yuvarlatılmış kare. */
export function StopIcon({ size = 24, color = Colors.sand }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 7.5 7.5 H 16.5 V 16.5 H 7.5 Z" {...base(color)} />
    </Svg>
  );
}

/** Pratik ekranında sabah/akşam ayrımı tek yerden gelsin diye. */
export type DayPart = 'morning' | 'evening';

export function DayPartIcon({ part, size, color }: { part: DayPart } & IconProps) {
  return part === 'morning'
    ? <SunIcon size={size} color={color} />
    : <MoonIcon size={size} color={color} />;
}
