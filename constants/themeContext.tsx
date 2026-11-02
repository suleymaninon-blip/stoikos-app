import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES, type Palette, type ThemeId } from './theme';

/**
 * Görünüm seçimi (2 Kasım 2026). `auto` = gündüz Ege, akşam Gece mavisi (07:00–19:00 arası gündüz).
 * Seçim cihazda `stoikos_theme`. Ekranlar:
 *   const { C } = useTheme();                 // satır içi renkler
 *   const styles = useStyles(makeStyles);     // makeStyles = (Colors: Palette) => StyleSheet.create({...})
 */
export type ThemeMode = 'auto' | ThemeId;
export const THEME_MODES: ThemeMode[] = ['auto', 'ege', 'zeytin', 'gece', 'classic'];
const KEY = 'stoikos_theme';
const DAY_FROM = 7, DAY_TO = 19;

export const resolveTheme = (mode: ThemeMode, d = new Date()): ThemeId =>
  mode === 'auto' ? (d.getHours() >= DAY_FROM && d.getHours() < DAY_TO ? 'ege' : 'gece') : mode;

type Ctx = { C: Palette; mode: ThemeMode; setMode: (m: ThemeMode) => void; ready: boolean };
const ThemeCtx = createContext<Ctx>({ C: PALETTES[resolveTheme('auto')], mode: 'auto', setMode: () => {}, ready: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [ready, setReady] = useState(false);
  const [id, setId] = useState<ThemeId>(resolveTheme('auto'));

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => { if (v && (THEME_MODES as string[]).includes(v)) setModeState(v as ThemeMode); })
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
    C, mode, ready,
    setMode: (m) => { setModeState(m); AsyncStorage.setItem(KEY, m).catch(() => {}); },
  }), [C, mode, ready]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

/** Tema değişince yeniden kurulan stil tablosu. `make` modül düzeyinde tanımlı olmalı. */
export function useStyles<T>(make: (C: Palette) => T): T {
  const { C } = useTheme();
  return useMemo(() => make(C), [C, make]);
}

export type { Palette };
