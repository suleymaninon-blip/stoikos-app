import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTheme } from '../constants/themeContext';

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
export function SunIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
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
export function MoonIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 15.5 4.2 A 8.5 8.5 0 1 0 15.5 19.8 A 8 8 0 0 1 15.5 4.2 Z" {...base(color)} />
    </Svg>
  );
}

/** Nefes orbunun ses düğmesi. `on=false` iken hoparlörün yanına çarpı gelir. */
export function SoundIcon({ size = 24, color: colorProp, on = true }: IconProps & { on?: boolean }) {
  const color = colorProp ?? useTheme().C.sand;
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
export function StopIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 7.5 7.5 H 16.5 V 16.5 H 7.5 Z" {...base(color)} />
    </Svg>
  );
}

/** Gizlilik — asma kilit (Ayarlar'daki 🔒 emojisinin yerine). */
export function LockIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 6 11 H 18 V 20 H 6 Z" {...base(color)} />
      <Path d="M 8.5 11 V 8 A 3.5 3.5 0 0 1 15.5 8 V 11" {...base(color)} />
    </Svg>
  );
}

/** Pratik ekranında sabah/akşam ayrımı tek yerden gelsin diye. */
export type DayPart = 'morning' | 'evening';

/** Paylaş (sağ üst ok) ve zarf: `↗` ve `✉` glifleri iOS'ta renkli emoji çiziliyordu (15 Kasım 2026, Ayarlar ekran görüntüsü). */
export function ShareArrowIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 7 17 L 17 7" {...base(color)} />
      <Path d="M 9 7 H 17 V 15" {...base(color)} />
    </Svg>
  );
}

export function MailIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 4 6.5 H 20 V 17.5 H 4 Z" {...base(color)} />
      <Path d="M 4.5 7 L 12 13 L 19.5 7" {...base(color)} />
    </Svg>
  );
}

/** Kalp: `♥` iOS'ta kırmızı emoji çizilebiliyor; dolu/boş SVG. */
export function HeartIcon({ size = 24, color: colorProp, filled = false }: IconProps & { filled?: boolean }) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 12 19.5 C 6 15.5 4 12.5 4 9.6 A 4.1 4.1 0 0 1 12 8 A 4.1 4.1 0 0 1 20 9.6 C 20 12.5 18 15.5 12 19.5 Z" {...base(color)} fill={filled ? color : 'none'} />
    </Svg>
  );
}

export function StarIcon({ size = 24, color: colorProp }: IconProps) {
  const color = colorProp ?? useTheme().C.sand;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 12 4 L 14.4 9.2 L 20 9.9 L 15.9 13.7 L 17 19.3 L 12 16.5 L 7 19.3 L 8.1 13.7 L 4 9.9 L 9.6 9.2 Z" {...base(color)} />
    </Svg>
  );
}

export function DayPartIcon({ part, size, color }: { part: DayPart } & IconProps) {
  return part === 'morning'
    ? <SunIcon size={size} color={color} />
    : <MoonIcon size={size} color={color} />;
}
