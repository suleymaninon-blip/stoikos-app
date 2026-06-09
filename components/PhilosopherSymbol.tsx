import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const GOLD = '#d8c49a';
const GOLD_DIM = '#c2a878';

interface Props {
  id: string;
  size?: number;
  dim?: boolean;
}

// Tüm semboller: viewBox 24x24, ince çizgi, altın, yuvarlak hatlı.
export default function PhilosopherSymbol({ id, size = 24, dim = false }: Props) {
  const stroke = dim ? GOLD_DIM : GOLD;
  const sw = 1.5;
  const sc = 'round' as const;
  const sj = 'round' as const;
  const base = { stroke, strokeWidth: sw, strokeLinecap: sc, strokeLinejoin: sj, fill: 'none' as const };

  const inner: React.ReactNode = (() => {
    switch (id) {

      // 1. Marcus Aurelius — Defne Tacı (yay şeklinde çelenk, üstte açık)
      case 'marcus':
        return (
          <>
            {/* Sol dal: sol-alttan yukarı merkeze */}
            <Path d="M 4 19 C 2 12 5 6 12 3" {...base} />
            {/* Sağ dal: sağ-alttan yukarı merkeze */}
            <Path d="M 20 19 C 22 12 19 6 12 3" {...base} />
            {/* Sol yaprak 1 (alt) */}
            <Path d="M 5.5 16 C 3 15.5 2.5 13 4.5 12.5" {...base} />
            {/* Sol yaprak 2 (orta) */}
            <Path d="M 4.5 11.5 C 2.5 10.5 2.5 8 4.5 8" {...base} />
            {/* Sol yaprak 3 (üst) */}
            <Path d="M 6 6.5 C 4.5 5.5 5 3.5 7 4" {...base} />
            {/* Sağ yaprak 1 (alt) */}
            <Path d="M 18.5 16 C 21 15.5 21.5 13 19.5 12.5" {...base} />
            {/* Sağ yaprak 2 (orta) */}
            <Path d="M 19.5 11.5 C 21.5 10.5 21.5 8 19.5 8" {...base} />
            {/* Sağ yaprak 3 (üst) */}
            <Path d="M 18 6.5 C 19.5 5.5 19 3.5 17 4" {...base} />
          </>
        );

      // 2. Epiktetos — Kırık Zincir
      case 'epictetus':
        return (
          <>
            {/* Sol halka (tam) */}
            <Path d="M 2 12 C 2 8.5 7 8.5 7 12 C 7 15.5 2 15.5 2 12" {...base} />
            {/* Sağ halka (tam) */}
            <Path d="M 17 12 C 17 8.5 22 8.5 22 12 C 22 15.5 17 15.5 17 12" {...base} />
            {/* Ortadaki kırık halka — alt yay + iki kopuk uç */}
            <Path d="M 7 12 C 7 15.5 17 15.5 17 12" {...base} />
            <Path d="M 7 12 C 7 9.5 9.5 8.5 11.2 8.5" {...base} />
            <Path d="M 12.8 8.5 C 14.5 8.5 17 9.5 17 12" {...base} />
            {/* Kopma boşluğu: 11.2→12.8 (Path yok, boş bırakılıyor) */}
          </>
        );

      // 3. Seneca — Yazı Tüyü
      case 'seneca':
        return (
          <>
            {/* Tüy sapı */}
            <Path d="M 16 19 L 8 5" {...base} />
            {/* Uç kıvrımı */}
            <Path d="M 8 5 C 7 4 6 5 7 6.5" {...base} />
            {/* Sağ tüy telcikleri */}
            <Path d="M 14.5 16.5 C 16.5 15.5 17.5 13 16 12" {...base} />
            <Path d="M 12.5 13.5 C 14.5 12 15 10 13.5 9" {...base} />
            <Path d="M 10.5 10.5 C 12 9 12 7.5 11 7" {...base} />
            {/* Sol tüy telcikleri */}
            <Path d="M 14.5 16.5 C 12.5 17.5 11.5 16 13 14.5" {...base} />
            <Path d="M 12.5 13.5 C 10.5 14.5 9.5 13.5 11 12" {...base} />
            <Path d="M 10.5 10.5 C 8.5 11.5 8 10.5 9 9.5" {...base} />
          </>
        );

      // 4. Musonius Rufus — Patika
      case 'musonius':
        return (
          <>
            {/* Yolun sol kenarı (geniş tabandan ufukta daralır) */}
            <Path d="M 3 21 L 10 7" {...base} />
            {/* Yolun sağ kenarı */}
            <Path d="M 21 21 L 14 7" {...base} />
            {/* Ufuk çizgisi */}
            <Path d="M 9 7 L 15 7" {...base} />
            {/* Yol üstündeki ufka doğru perspektif çizgileri */}
            <Path d="M 6 16 L 18 16" {...base} strokeOpacity="0.5" />
          </>
        );

      // 5. Zenon — Dalga
      case 'zeno':
        return (
          <>
            {/* Deniz dalgası — tek zarif S eğrisi */}
            <Path
              d="M 2 13 C 5 8 8 8 10 13 C 12 18 15 18 17 13 C 19 8 22 8 22 13"
              {...base}
            />
            {/* Dalganın köpüklü tepe kıvrımı */}
            <Path d="M 6 10 C 7 8.5 9 9 9 10.5" {...base} strokeOpacity="0.6" />
          </>
        );

      // 6. Kleanthes — Amfora
      case 'cleanthes':
        return (
          <>
            {/* Amfora gövdesi (sol) */}
            <Path d="M 9 19 C 5 19 4 14 6 10 C 7 8 9 7 12 7" {...base} />
            {/* Amfora gövdesi (sağ) */}
            <Path d="M 15 19 C 19 19 20 14 18 10 C 17 8 15 7 12 7" {...base} />
            {/* Taban */}
            <Path d="M 8 19 L 16 19" {...base} />
            {/* Boyun */}
            <Path d="M 10 7 L 10 5 C 10 4.5 14 4.5 14 5 L 14 7" {...base} />
            {/* Ağız kenarı */}
            <Path d="M 9 5 L 15 5" {...base} />
            {/* Sol kulp */}
            <Path d="M 9 8.5 C 6 8.5 6 13 9 13" {...base} />
            {/* Sağ kulp */}
            <Path d="M 15 8.5 C 18 8.5 18 13 15 13" {...base} />
          </>
        );

      // 7. Khrysippos — Papirüs Tomarı
      case 'chrysippus':
        return (
          <>
            {/* Tomar yüzeyi */}
            <Path d="M 7 8 L 17 8 L 17 16 L 7 16" {...base} />
            {/* Sol rulo (kıvrık uç) */}
            <Path d="M 7 8 C 4.5 8 4.5 16 7 16" {...base} />
            {/* Sağ rulo (kıvrık uç) */}
            <Path d="M 17 8 C 19.5 8 19.5 16 17 16" {...base} />
            {/* Sol iç kıvrım gölgesi */}
            <Path d="M 7 8 C 6 9.5 6 14.5 7 16" {...base} strokeOpacity="0.45" />
            {/* Metin satırları */}
            <Path d="M 10 10.5 L 17 10.5" {...base} strokeOpacity="0.6" />
            <Path d="M 9.5 12.5 L 17 12.5" {...base} strokeOpacity="0.6" />
            <Path d="M 10 14.5 L 16 14.5" {...base} strokeOpacity="0.6" />
          </>
        );

      // 8. Hierokles — Eş Merkezli Halkalar
      case 'hierocles':
        return (
          <>
            {/* Merkez nokta */}
            <Circle cx="12" cy="12" r="1" fill={stroke} stroke="none" />
            {/* İç halka */}
            <Circle cx="12" cy="12" r="3.5" {...base} />
            {/* Orta halka */}
            <Circle cx="12" cy="12" r="6.5" {...base} />
            {/* Dış halka */}
            <Circle cx="12" cy="12" r="9.5" {...base} strokeOpacity="0.5" />
          </>
        );

      // 9. Cato — Sütun
      case 'cato':
        return (
          <>
            {/* Üst başlık */}
            <Rect x="6" y="4" width="12" height="2.5" rx="0.5" {...base} />
            {/* Gövde sol & sağ kenar */}
            <Path d="M 8.5 6.5 L 8.5 18" {...base} />
            <Path d="M 15.5 6.5 L 15.5 18" {...base} />
            {/* Dikey yiv çizgileri (fluting) */}
            <Path d="M 10.5 6.5 L 10.5 18" {...base} strokeOpacity="0.45" />
            <Path d="M 12 6.5 L 12 18" {...base} strokeOpacity="0.45" />
            <Path d="M 13.5 6.5 L 13.5 18" {...base} strokeOpacity="0.45" />
            {/* Alt taban */}
            <Rect x="6.5" y="18" width="11" height="2" rx="0.5" {...base} />
          </>
        );

      // 10. Posidonius — Takımyıldız
      case 'posidonius':
        return (
          <>
            {/* Yıldız bağlantı çizgileri */}
            <Line x1="12" y1="4" x2="19" y2="9" {...base} strokeOpacity="0.6" />
            <Line x1="19" y1="9" x2="16" y2="17" {...base} strokeOpacity="0.6" />
            <Line x1="16" y1="17" x2="7" y2="18" {...base} strokeOpacity="0.6" />
            <Line x1="7" y1="18" x2="4" y2="11" {...base} strokeOpacity="0.6" />
            <Line x1="4" y1="11" x2="12" y2="4" {...base} strokeOpacity="0.6" />
            <Line x1="12" y1="4" x2="16" y2="17" {...base} strokeOpacity="0.35" />
            <Line x1="19" y1="9" x2="7" y2="18" {...base} strokeOpacity="0.35" />
            {/* Yıldızlar (küçük dolu daireler) */}
            <Circle cx="12" cy="4"  r="1.5" fill={stroke} stroke="none" />
            <Circle cx="19" cy="9"  r="1.5" fill={stroke} stroke="none" />
            <Circle cx="16" cy="17" r="1.5" fill={stroke} stroke="none" />
            <Circle cx="7"  cy="18" r="1.5" fill={stroke} stroke="none" />
            <Circle cx="4"  cy="11" r="1.5" fill={stroke} stroke="none" />
          </>
        );

      default:
        // Bilinmeyen filozof — geçici: basit daire içi X
        return (
          <>
            <Circle cx="12" cy="12" r="8" {...base} strokeOpacity="0.5" />
            <Path d="M 8 8 L 16 16 M 16 8 L 8 16" {...base} strokeOpacity="0.5" />
          </>
        );
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {inner}
    </Svg>
  );
}
