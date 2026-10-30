import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hayat haftaları — memento mori duvar kağıdı (30 Ekim 2026; tasarım
 * https://claude.ai/artifact/59VknQFbGf1zGqT5v8cJEU). Her satır bir yıl, her nokta bir hafta.
 *
 * Geometri tek yerde: native önizleme/yakalama (components/WeeksWallpaper.tsx, react-native-svg)
 * ve web dışa aktarımı (constants/weeksCanvas.ts, <canvas>) aynı yolları kullanır.
 * Koordinatlar 390×844'lük tuvalde; dışa aktarım 1290×2796 (iPhone Pro Max, 3,3077 kat).
 * Izgara 262'den başlar: kilit ekranındaki saat üstte noktalara binmesin.
 *
 * Doğum tarihi yalnız cihazda (AsyncStorage `stoikos_weeks`); hiçbir yere gönderilmez.
 */
export const WP_W = 390;
export const WP_H = 844;
export const WP_OUT = { width: 1290, height: 2796 };

export type WeeksTheme = 'gold' | 'marble' | 'night' | 'parch';
export const WEEKS_THEMES: WeeksTheme[] = ['gold', 'marble', 'night', 'parch'];
export type WeeksPrefs = { year: number; month: number; life: 80 | 90; theme: WeeksTheme; numbers: boolean };

export const WEEKS_KEY = 'stoikos_weeks';
export const MIN_YEAR = 1930;
// Uygulama 18 yaş üstü için (kullanım koşulları §5).
export const maxBirthYear = () => new Date().getFullYear() - 18;
const DEFAULTS: WeeksPrefs = { year: 1990, month: 6, life: 80, theme: 'gold', numbers: true };

export async function loadWeeksPrefs(): Promise<{ prefs: WeeksPrefs; saved: boolean }> {
  try {
    const raw = await AsyncStorage.getItem(WEEKS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { prefs: { ...DEFAULTS, ...p }, saved: true };
    }
  } catch {}
  return { prefs: DEFAULTS, saved: false };
}

export async function saveWeeksPrefs(p: WeeksPrefs): Promise<void> {
  try { await AsyncStorage.setItem(WEEKS_KEY, JSON.stringify(p)); } catch {}
}

/** Zemin: düz renk + isteğe bağlı degrade (her iki çizici de aynı tanımı okur). */
export type WeeksPalette = {
  base: string;
  grad?: { kind: 'radial'; cx: number; cy: number; r: number; stops: [number, string, number][] }
       | { kind: 'linear'; stops: [number, string, number][] };
  vignette?: string;                     // parşömen kenar kararması
  veins?: string;                        // mermer damarları
  lived: string; rest: string; now: string; accent: string;
  muted: string; text: string; brand: string; clock: string;
};

export const PALETTES: Record<WeeksTheme, WeeksPalette> = {
  gold: {
    base: '#0a0908',
    grad: { kind: 'radial', cx: 0.5, cy: 0.55, r: 0.8, stops: [[0, '#1b1813', 1], [1, '#0a0908', 1]] },
    lived: '#d4b376', rest: '#6f6656', now: '#fff1cc', accent: '#d4b376', muted: '#a89c84', text: '#e8dcc4', brand: '#d8c49a', clock: 'rgba(250,244,230,0.95)',
  },
  marble: {
    base: '#121110',
    grad: { kind: 'linear', stops: [[0, '#1d1b18', 1], [0.6, '#141311', 1], [1, '#0f0e0c', 1]] },
    veins: '#a59a88',
    lived: '#ece4d4', rest: '#6b6357', now: '#ffffff', accent: '#ece4d4', muted: '#a39b8c', text: '#ece4d4', brand: '#d9d0bf', clock: 'rgba(250,248,242,0.95)',
  },
  night: {
    base: '#121a2b',
    grad: { kind: 'linear', stops: [[0, '#0b111d', 1], [0.55, '#121a2b', 1], [1, '#1a2438', 1]] },
    lived: '#c9d6ea', rest: '#3d4a63', now: '#ffffff', accent: '#9fb0c4', muted: '#8c9ab0', text: '#dbe3ef', brand: '#b9c6da', clock: 'rgba(240,245,252,0.95)',
  },
  parch: {
    base: '#ece2cb',
    vignette: '#7a6236',
    lived: '#2b241b', rest: '#b3a588', now: '#9a3b22', accent: '#9a3b22', muted: '#6e604a', text: '#3a3125', brand: '#5a4e3c', clock: 'rgba(40,32,22,0.9)',
  },
};

export const SWATCH: Record<WeeksTheme, [string, string]> = {
  gold: ['#f0dcae', '#a8843f'], marble: ['#6b6357', '#1a1816'], night: ['#2b3a5a', '#0c1220'], parch: ['#f3ead6', '#cdbd98'],
};

// Tek nokta = iki yay; binlerce noktayı tek yolda toplamak hem SVG'de hem canvas'ta hızlı.
const dot = (x: number, y: number, r: number) =>
  `M${(x - r).toFixed(2)} ${y.toFixed(2)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0`;

export type WeeksLayout = {
  total: number; lived: number;
  oldPath: string; recentPath: string; restPath: string;
  now: { x: number; y: number; r: number; halo: number };
  band: { x: number; y: number; w: number; h: number };
  decades: { label: string; y: number; right: number }[];
};

export function weeksLayout(p: WeeksPrefs, today = new Date()): WeeksLayout {
  const born = new Date(p.year, p.month - 1, 15);
  const cols = 52, rows = p.life, total = rows * cols;
  const lived = Math.max(0, Math.min(total - 1, Math.floor((today.getTime() - born.getTime()) / (7 * 864e5))));
  const step = Math.min(318 / (cols - 1), 470 / (rows - 1));
  const gw = step * (cols - 1), x0 = (WP_W - gw) / 2 + 6, y0 = 262;
  const r = step * 0.34;
  // Son on yıl daha parlak: geride kalan uzak yıllar hafifçe söner.
  const recentFrom = Math.max(0, lived - 52 * 10);
  const old: string[] = [], rec: string[] = [], rest: string[] = [];
  for (let i = 0; i < total; i++) {
    const x = x0 + (i % cols) * step, y = y0 + Math.floor(i / cols) * step;
    if (i < recentFrom) old.push(dot(x, y, r));
    else if (i < lived) rec.push(dot(x, y, r));
    else if (i > lived) rest.push(dot(x, y, r * 0.9));
  }
  const curRow = Math.floor(lived / cols);
  const decades = [];
  for (let d = 10; d < p.life; d += 10) decades.push({ label: String(d), y: y0 + d * step, right: x0 - 8 });
  return {
    total, lived,
    oldPath: old.join(''), recentPath: rec.join(''), restPath: rest.join(''),
    now: { x: x0 + (lived % cols) * step, y: y0 + curRow * step, r: r * 1.5, halo: r * 3.2 },
    band: { x: x0 - step * 0.7, y: y0 + curRow * step - step * 0.6, w: gw + step * 1.4, h: step * 1.2 },
    decades,
  };
}

/** Mermer damarları: sabit tohumlu, yumuşak eğriler (her çizimde aynı). */
export function marbleVeins(): { d: string; w: number; o: number }[] {
  let s = 31;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { d: string; w: number; o: number }[] = [];
  for (let v = 0; v < 7; v++) {
    let x = -20 + rnd() * 260, y = -40 + v * 130 + rnd() * 60;
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let k = 0; k < 6; k++) {
      const nx = x + 50 + rnd() * 50, ny = y + 40 + rnd() * 70;
      d += `Q${(x + (rnd() - 0.2) * 70).toFixed(1)} ${(y + (rnd() - 0.5) * 60 + 30).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      x = nx; y = ny;
    }
    out.push({ d, w: 0.6 + rnd() * 1.6, o: 0.12 + rnd() * 0.22 });
  }
  return out;
}

const SEP: Record<string, string> = { tr: '.', de: '.', es: '.', en: ',', ru: ' ', fr: ' ' };
export const groupNum = (n: number, lang: string) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, SEP[lang] ?? ',');
