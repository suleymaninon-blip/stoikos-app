// ── Sakin / huzur paleti (STOIKOS-SAKIN-TASARIM-SPEC) ──
// Zemin yumuşak/koyu, METİN kontrastı yüksek tutuldu (okunabilirlik şart).

/**
 * Renk paletleri (2 Kasım 2026, test edenler: "çok kasvetli, içeride durmak istemiyorum").
 * Kullanıcı Ayarlar → Görünüm'den seçer; varsayılan Otomatik (gündüz Ege, akşam Gece mavisi).
 * Tasarım: https://claude.ai/artifact/BPif3C9QxLu7j8wfNjgB7Y — gerekçe: parlaklık hoşnutluğu,
 * doygunluk uyarılmayı artırır; mavi/mavi-yeşil/yeşil en sevilen tonlar (Valdez & Mehrabian 1994,
 * Palmer & Schloss 2010). Kırmızı yalnız uyarılarda.
 *
 * Anahtar adları eski tek paletten kalma (sand = ana vurgu, stone* = yüzeyler) ki ekran kodu
 * değişmesin. Ekranlar renkleri `useTheme()` / `useStyles(makeStyles)` ile alır
 * (constants/themeContext.tsx); sabit `Colors` yalnız temadan bağımsız yerler içindir.
 */
export type ThemeId = 'classic' | 'ege' | 'zeytin' | 'gece';

export interface Palette {
  id: ThemeId;
  isDark: boolean;
  bg: string; stone: string; stone2: string; stone3: string; stone4: string;
  sand: string; sand2: string; sand3: string; goldWarm: string; accent: string;
  text: string; text2: string; muted: string; faint: string;
  moon: string; success: string;
  /** Vurgu rengindeki düğmenin üstündeki yazı. */
  onAccent: string;
  /** Eski `rgba(255,255,255,a)` ince çizgi/yüzey: koyuda beyaz, açıkta mürekkep. */
  overlay: (a: number) => string;
  /** Eski altın saydamlıkları: vurgu renginin saydam hâli. */
  tint: (a: number) => string;
  /** Akşam aksanının saydam hâli. */
  moonA: (a: number) => string;
  /** Nefes çiçeğinin taç yaprakları. */
  petal: (a: number) => string;
  /** Uyarı/silme yazısı. */
  danger: string;
}

const rgba = (rgb: string, k = 1) => (a: number) => `rgba(${rgb},${Math.min(1, +(a * k).toFixed(3))})`;

export const PALETTES: Record<ThemeId, Palette> = {
  classic: {
    id: 'classic', isDark: true,
    bg: '#14120e', stone: '#1c1915', stone2: '#211d18', stone3: '#25201a', stone4: '#2e2a22',
    sand: '#c2a878', sand2: '#d8c49a', sand3: '#f5edd8', goldWarm: '#c9a876', accent: '#c9a876',
    text: '#ece4d4', text2: '#cabfa8', muted: '#8a8070', faint: '#5a5348',
    moon: '#9fb0c4', success: '#4caf6e', onAccent: '#14120e',
    overlay: rgba('255,255,255'), tint: rgba('196,169,106'), moonA: rgba('159,176,196'),
    petal: rgba('248,210,150'), danger: '#e3a08f',
  },
  ege: {
    id: 'ege', isDark: false,
    bg: '#F5F1E8', stone: '#FBF8F2', stone2: '#FFFFFF', stone3: '#EFEADF', stone4: '#E2DCCF',
    sand: '#2B7476', sand2: '#236264', sand3: '#1D2A2F', goldWarm: '#2B7476', accent: '#2B7476',
    text: '#1D2A2F', text2: '#3E4F55', muted: '#5B6A70', faint: '#727F84',
    moon: '#3C5D86', success: '#2E8B57', onAccent: '#FFFFFF',
    overlay: rgba('29,42,47', 1.5), tint: rgba('43,116,118', 1.2), moonA: rgba('60,93,134', 1.2),
    petal: rgba('58,147,150', 1.1), danger: '#A8452F',
  },
  zeytin: {
    id: 'zeytin', isDark: false,
    bg: '#F4F1E9', stone: '#FAF8F2', stone2: '#FFFFFF', stone3: '#EDEAE0', stone4: '#E0DBCC',
    sand: '#55704A', sand2: '#4A6340', sand3: '#262A20', goldWarm: '#55704A', accent: '#55704A',
    text: '#262A20', text2: '#474D3E', muted: '#5F6557', faint: '#777D6F',
    moon: '#4F5A85', success: '#3E8A4F', onAccent: '#FFFFFF',
    overlay: rgba('38,42,32', 1.5), tint: rgba('85,112,74', 1.2), moonA: rgba('79,90,133', 1.2),
    petal: rgba('111,143,98', 1.1), danger: '#A8452F',
  },
  gece: {
    id: 'gece', isDark: true,
    bg: '#141D2A', stone: '#18222F', stone2: '#1D2938', stone3: '#223042', stone4: '#2C3B4F',
    sand: '#86BDD0', sand2: '#9CCADB', sand3: '#EAF0F6', goldWarm: '#86BDD0', accent: '#86BDD0',
    text: '#EAF0F6', text2: '#C4D0DC', muted: '#9AA9BA', faint: '#73859A',
    moon: '#B9B4E0', success: '#5CC08A', onAccent: '#0F1824',
    overlay: rgba('255,255,255'), tint: rgba('134,189,208'), moonA: rgba('185,180,224'),
    petal: rgba('150,205,222'), danger: '#F0A898',
  },
};

/** Temadan bağımsız yerler (marka kartı, paylaşım görseli) için klasik palet. */
export const Colors = PALETTES.classic;

// Spec'in semantik isimleriyle birebir erişim (yeni bileşenler için)
export const colors = {
  bgDeep: '#14120e',
  bgSoft: '#1c1915',
  surface: '#211d18',
  surface2: '#25201a',
  gold: '#c2a878',
  goldSoft: '#d8c49a',
  goldWarm: '#c9a876',
  text: '#ece4d4',
  textSoft: '#cabfa8',
  textDim: '#8a8070',
  textFaint: '#5a5348',
  moon: '#9fb0c4',
};

export const Fonts = {
  cinzel: 'Cinzel_400Regular',
  cinzelBold: 'Cinzel_600SemiBold',
  cormorant: 'CormorantGaramond_400Regular',
  cormorantItalic: 'CormorantGaramond_400Regular_Italic',
  jost: 'Jost_400Regular',
  jostMedium: 'Jost_500Medium',
  jostLight: 'Jost_300Light',
};

/**
 * Yazı tipi setleri (2 Kasım 2026; araştırma: Wallace vd. 2022 — en hızlı okunan yazı tipi kişiden
 * kişiye değişir, bu yüzden seçim kullanıcıda). Ekranlar hep `Fonts.*` (klasik adlar) yazar;
 * `useStyles` stil tablosundaki aileyi seçili setin karşılığıyla değiştirir (themeContext.tsx).
 * Klasik'te Cinzel'de Kiril yok: Rusçada başlıklar Cormorant Garamond'a düşer.
 */
export type FontSetId = 'klasik' | 'kitap' | 'yumusak';
export const FONT_SETS: FontSetId[] = ['klasik', 'kitap', 'yumusak'];
export const FONT_MAP: Record<FontSetId, Record<string, string>> = {
  klasik: {},
  kitap: {
    Cinzel_400Regular: 'Literata_600SemiBold', Cinzel_600SemiBold: 'Literata_700Bold',
    CormorantGaramond_400Regular: 'Literata_400Regular', CormorantGaramond_400Regular_Italic: 'Literata_400Regular_Italic',
    Jost_400Regular: 'SourceSans3_400Regular', Jost_500Medium: 'SourceSans3_600SemiBold', Jost_300Light: 'SourceSans3_300Light',
  },
  yumusak: {
    Cinzel_400Regular: 'Nunito_700Bold', Cinzel_600SemiBold: 'Nunito_800ExtraBold',
    CormorantGaramond_400Regular: 'Lora_500Medium', CormorantGaramond_400Regular_Italic: 'Lora_500Medium_Italic',
    Jost_400Regular: 'Nunito_400Regular', Jost_500Medium: 'Nunito_600SemiBold', Jost_300Light: 'Nunito_300Light',
  },
};
export const RU_DISPLAY_FALLBACK: Record<string, string> = {
  Cinzel_400Regular: 'CormorantGaramond_400Regular', Cinzel_600SemiBold: 'CormorantGaramond_400Regular',
};
export type TextSize = 'normal' | 'large';
export const TEXT_SCALE: Record<TextSize, number> = { normal: 1, large: 1.15 };

