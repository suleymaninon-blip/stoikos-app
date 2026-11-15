// Nefes seansları — süre tercihi ve İlerleme'ye kayıt.
//
// Tamamlanan bir seans, günlük pratik egzersizleriyle aynı yere yazılır:
// `stoikos_completed_<Date.toDateString()>` listesine `breath` kimliği.
// Böylece süreklilik (hooks/useStreak.ts), "Son 7 gün" grafiği ve
// "Toplam an" (app/(tabs)/progress.tsx) nefesi kendiliğinden sayar.
// Liste bir küme gibi tutulur: günde kaç seans yapılırsa yapılsın bir kez sayılır.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportPulse } from './stoa';

export const BREATH_ID = 'breath';
const COMPLETED_KEY = 'stoikos_completed_';
const DURATION_KEY = 'stoikos_breath_duration';

/** Seçilebilir süreler (saniye). 0 = süresiz (elle bitirilir). */
export const BREATH_DURATIONS = [60, 180, 300, 0] as const;
export type BreathDuration = (typeof BREATH_DURATIONS)[number];
const DEFAULT_DURATION: BreathDuration = 60;

/** Bir seansın İlerleme'ye sayılması için en az süre (saniye). */
export const MIN_LOGGED_SECONDS = 60;

export async function getBreathDuration(): Promise<BreathDuration> {
  try {
    const raw = await AsyncStorage.getItem(DURATION_KEY);
    const v = Number(raw);
    return raw !== null && (BREATH_DURATIONS as readonly number[]).includes(v) ? (v as BreathDuration) : DEFAULT_DURATION;
  } catch {
    return DEFAULT_DURATION;
  }
}

export async function setBreathDuration(d: BreathDuration): Promise<void> {
  try { await AsyncStorage.setItem(DURATION_KEY, String(d)); } catch {}
}

/** Bugünün tamamlananlarına nefesi ekle (zaten varsa dokunma). */
export async function logBreathSession(): Promise<void> {
  reportPulse('breath');   // Stoa'nın nabzı: günde bir kez sayılır
  try {
    const key = COMPLETED_KEY + new Date().toDateString();
    const raw = await AsyncStorage.getItem(key);
    const done: string[] = raw ? JSON.parse(raw) : [];
    if (done.includes(BREATH_ID)) return;
    await AsyncStorage.setItem(key, JSON.stringify([...done, BREATH_ID]));
  } catch {}
}

/**
 * Nefes ritmi (15 Kasım 2026, kullanıcı seçimi B: kartın sol üst köşesinde "Sakin ▾" düğmesi).
 * Çiçek aynı kalır, yalnız temposu değişir. `in` açar, `out` kapatır, `hold` açık bekler,
 * `holdOut` kapalı bekler. Süreler milisaniye.
 */
export type BreathRhythm = 'calm' | 'sleep' | 'box';
export type BreathPhaseKind = 'in' | 'out' | 'hold' | 'holdOut';
export const BREATH_RHYTHMS: Record<BreathRhythm, [BreathPhaseKind, number][]> = {
  calm: [['in', 4500], ['out', 4500]],                              // ~6,7 nefes/dk — eski tek ritim
  sleep: [['in', 4000], ['hold', 7000], ['out', 8000]],               // 4-7-8: uzun veriş yatıştırır
  box: [['in', 4000], ['hold', 4000], ['out', 4000], ['holdOut', 4000]], // kutu nefesi
};
export const RHYTHM_IDS: BreathRhythm[] = ['calm', 'sleep', 'box'];
const RHYTHM_KEY = 'stoikos_breath_rhythm';

export async function getBreathRhythm(): Promise<BreathRhythm> {
  try {
    const raw = await AsyncStorage.getItem(RHYTHM_KEY);
    return raw && (RHYTHM_IDS as string[]).includes(raw) ? (raw as BreathRhythm) : 'calm';
  } catch {
    return 'calm';
  }
}

export async function setBreathRhythm(r: BreathRhythm): Promise<void> {
  try { await AsyncStorage.setItem(RHYTHM_KEY, r); } catch {}
}
