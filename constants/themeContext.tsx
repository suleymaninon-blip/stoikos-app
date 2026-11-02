import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PALETTES, FONT_SETS, FONT_MAP, RU_DISPLAY_FALLBACK, TEXT_SCALE,
  type Palette, type ThemeId, type FontSetId, type TextSize,
} from './theme';
import { loadFontSet } from './fontLoader';
import { useLang } from './i18n';

/**
 * Görünüm seçimi (2 Kasım 2026): renk teması, yazı tipi seti ve yazı boyutu.
 * `auto` tema = gündüz Ege, akşam Gece mavisi (07:00–19:00 arası gündüz).
 * Seçimler cihazda: `stoikos_theme`, `stoikos_font`, `stoikos_text_size`. Ekranlar:
 *   const { C } = useTheme();                 // satır içi renkler
 *   const styles = useStyles(makeStyles);     // makeStyles = (Colors: Palette) => StyleSheet.create({...})
 * useStyles stil tablosunda yazı ailelerini seçili sete çevirir ve boyutu ölçekler; ekran kodu
 * hep klasik `Fonts.*` adlarını yazar.
 */
export type ThemeMode = 'auto' | ThemeId;
export const THEME_MODES: ThemeMode[] = ['auto', 'ege', 'zeytin', 'gece', 'classic'];
const KEY = 'stoikos_theme';
const FONT_KEY = 'stoikos_font';
const SIZE_KEY = 'stoikos_text_size';
const DAY_FROM = 7, DAY_TO = 19;

export const resolveTheme = (mode: ThemeMode, d = new Date()): ThemeId =>
  mode === 'auto' ? (d.getHours() >= DAY_FROM && d.getHours() < DAY_TO ? 'ege' : 'gece') : mode;

type Ctx = {
  C: Palette; mode: ThemeMode; setMode: (m: ThemeMode) => void; ready: boolean;
  font: FontSetId; setFont: (f: FontSetId) => void;
  textSize: TextSize; setTextSize: (t: TextSize) => void;
};
const ThemeCtx = createContext<Ctx>({
  C: PALETTES[resolveTheme('auto')], mode: 'auto', setMode: () => {}, ready: false,
  font: 'klasik', setFont: () => {}, textSize: 'normal', setTextSize: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [ready, setReady] = useState(false);
  const [id, setId] = useState<ThemeId>(resolveTheme('auto'));
  const [font, setFontState] = useState<FontSetId>('klasik');
  const [textSize, setTextSizeState] = useState<TextSize>('normal');

  // Yazı tipi ancak dosyaları yüklenince uygulanır (yoksa bir an sistem yazı tipi görünür).
  const applyFont = (f: FontSetId) => {
    loadFontSet(f).then(() => setFontState(f)).catch(() => setFontState('klasik'));
  };

  useEffect(() => {
    AsyncStorage.multiGet([KEY, FONT_KEY, SIZE_KEY])
      .then(([[, m], [, f], [, t]]) => {
        if (m && (THEME_MODES as string[]).includes(m)) setModeState(m as ThemeMode);
        if (f && (FONT_SETS as string[]).includes(f) && f !== 'klasik') applyFont(f as FontSetId);
        if (t === 'large') setTextSizeState('large');
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Otomatikte saat sınırını geçince ve uygulama öne gelince yeniden hesapla.
  useEffect(() => {
    const update = () => setId(resolveTheme(mode));
    update();
    if (mode !== 'auto') return;
    const t = setInterval(update, 60_000);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') update(); });
    return () => { clearInterval(t); sub.remove(); };
  }, [mode]);

  const C = PALETTES[id];

  // Web: sayfa zemini ve tarayıcı çubuğu rengi temaya uysun (kaydırma sonunda koyu şerit kalmasın).
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.body.style.backgroundColor = C.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', C.bg);
  }, [C]);

  const value = useMemo<Ctx>(() => ({
    C, mode, ready, font, textSize,
    setMode: (m) => { setModeState(m); AsyncStorage.setItem(KEY, m).catch(() => {}); },
    setFont: (f) => { AsyncStorage.setItem(FONT_KEY, f).catch(() => {}); applyFont(f); },
    setTextSize: (t) => { setTextSizeState(t); AsyncStorage.setItem(SIZE_KEY, t).catch(() => {}); },
  }), [C, mode, ready, font, textSize]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

const QUOTE_FAMILIES = ['CormorantGaramond_400Regular', 'CormorantGaramond_400Regular_Italic'];

/** Stil tablosundaki yazı ailesini sete çevirir, boyutu ölçekler. Değişiklik yoksa tabloyu aynen döndürür. */
function adapt<T>(raw: T, map: Record<string, string>, scale: number, quoteBoost: number): T {
  if (!Object.keys(map).length && scale === 1 && quoteBoost === 1) return raw;
  const out: any = {};
  for (const k of Object.keys(raw as any)) {
    const v = (raw as any)[k];
    if (!v || typeof v !== 'object' || Array.isArray(v) || typeof v.fontFamily !== 'string' && typeof v.fontSize !== 'number') { out[k] = v; continue; }
    const fam: string | undefined = v.fontFamily;
    const k2 = scale * (fam && QUOTE_FAMILIES.includes(fam) ? quoteBoost : 1);
    const s: any = { ...v };
    if (fam && map[fam]) s.fontFamily = map[fam];
    if (k2 !== 1 && typeof v.fontSize === 'number') {
      s.fontSize = Math.round(v.fontSize * k2 * 2) / 2;
      if (typeof v.lineHeight === 'number') s.lineHeight = Math.round(v.lineHeight * k2);
    }
    out[k] = s;
  }
  return out;
}

/** Tema/yazı tipi/boyut değişince yeniden kurulan stil tablosu. `make` modül düzeyinde tanımlı olmalı. */
export function useStyles<T>(make: (C: Palette) => T): T {
  const { C, font, textSize } = useTheme();
  const { lang } = useLang();
  return useMemo(() => {
    const map = font === 'klasik' && lang === 'ru' ? RU_DISPLAY_FALLBACK : FONT_MAP[font];
    // Klasik'te Cormorant'ın küçük harfleri kısa: bir boy büyük (araştırma notu, CLAUDE.md).
    const quoteBoost = font === 'klasik' ? 1.06 : 1;
    return adapt(make(C), map, TEXT_SCALE[textSize], quoteBoost);
  }, [C, make, font, textSize, lang]);
}

export type { Palette };
