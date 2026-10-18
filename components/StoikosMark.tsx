import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

/**
 * Stoikos işareti — "Nefes orbu + Ω" (Ekim 2026, taslak A).
 *
 * Ω'nın kavisi, uygulamanın nefes orbunun halkası; içinde altın küre, dışında
 * bir nefes dalgası. Uygulama ikonu, açılış, ödeme ekranı, paylaşım kartı ve
 * sitedeki logo hep bu çizimden gelir — biçimi değiştirirken
 * `website/index.html` içindeki <symbol id="mark"> ile
 * `scripts/brand/icons.js`'i de güncelle.
 *
 * Koordinatlar ikonun 1024'lük tuvalinden; viewBox işareti ortalayan kare.
 *
 *  variant="full" → altın kavis + küre + dalga (logo olarak)
 *  variant="line" → yalnız kavis ve ayaklar, tek renk (filigran, düğme içi, küçük etiket)
 */
export const MARK_VIEWBOX = '192 162 640 640';
export const MARK_PATH = 'M296 688 H415 A232 232 0 1 1 609 688 H728';
export const MARK_PATH_LEN = 1500; // çizim animasyonu için yaklaşık uzunluk (119 + 1258 + 119)
export const MARK_CENTER = { x: 512, y: 477 };

let seq = 0;

export default function StoikosMark({
  size,
  variant = 'full',
  color = '#d4b376',
  opacity = 1,
}: {
  size: number;
  variant?: 'full' | 'line';
  color?: string;
  opacity?: number;
}) {
  // react-native-web'de gradyan kimlikleri belge genelinde; her örnek kendi kimliğini alsın.
  const id = React.useMemo(() => `sm${++seq}`, []);
  // Küçük boyutta çizgi 1,6 pikselin altına düşmesin.
  const stroke = Math.max(34, (640 * 1.6) / size);

  return (
    <Svg width={size} height={size} viewBox={MARK_VIEWBOX} opacity={opacity}>
      {variant === 'full' && (
        <Defs>
          <LinearGradient id={`${id}g`} x1="0" y1="250" x2="0" y2="760" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#f4e2b8" />
            <Stop offset="0.45" stopColor="#d4b376" />
            <Stop offset="1" stopColor="#9a7b44" />
          </LinearGradient>
          <RadialGradient id={`${id}o`} cx="42%" cy="36%" r="70%">
            <Stop offset="0" stopColor="#f6e6c0" />
            <Stop offset="0.45" stopColor="#cfae6c" />
            <Stop offset="1" stopColor="#6e5530" />
          </RadialGradient>
          <RadialGradient id={`${id}w`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#e2b874" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#e2b874" stopOpacity="0" />
          </RadialGradient>
        </Defs>
      )}
      {variant === 'full' && (
        <>
          <Circle cx={MARK_CENTER.x} cy={MARK_CENTER.y} r={292} fill="none" stroke="#d4b376" strokeOpacity={0.13} strokeWidth={Math.max(3, stroke / 10)} />
          <Circle cx={MARK_CENTER.x} cy={MARK_CENTER.y} r={200} fill={`url(#${id}w)`} />
          <Circle cx={MARK_CENTER.x} cy={MARK_CENTER.y} r={128} fill={`url(#${id}o)`} />
        </>
      )}
      <Path
        d={MARK_PATH}
        fill="none"
        stroke={variant === 'full' ? `url(#${id}g)` : color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
