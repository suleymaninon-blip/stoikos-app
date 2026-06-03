// Nefese senkron haptik (dokunsal) geri bildirim.
// Halka açılırken titreşim artar, kapanırken azalır. Tüm çağrılar güvenli sarılı.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
const PREF_KEY = 'stoikos_breath_haptics';
const PHASE_MS = 4500;

function webVibrateOk(): boolean {
  try { return Platform.OS === 'web' && !!w.navigator && typeof w.navigator.vibrate === 'function'; } catch { return false; }
}

export function isHapticsSupported(): boolean {
  try {
    if (Platform.OS === 'web') return webVibrateOk();
    return !!(Haptics && Haptics.impactAsync); // native (iOS/Android)
  } catch {
    return false;
  }
}

// Varsayılan AÇIK (kullanıcı istedi) — kapatılabilir, kalıcı.
export async function getHapticsPref(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(PREF_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}
export async function setHapticsPref(on: boolean): Promise<void> {
  try { await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0'); } catch {}
}

let timers: any[] = [];
function clearTimers() { timers.forEach((t) => clearTimeout(t)); timers = []; }

// Web titreşim deseni: ~4.4 sn boyunca on/gap çiftleri; 'in' artar, 'out' azalır.
function buildWebPattern(dir: 'in' | 'out'): number[] {
  const n = 9, slot = Math.floor(PHASE_MS / n); // ~500ms
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const f = dir === 'in' ? i / (n - 1) : 1 - i / (n - 1); // 0..1 yoğunluk
    const on = Math.round(12 + f * 180);                    // 12..192 ms titreşim
    const gap = Math.max(slot - on, 40);
    arr.push(on, gap);
  }
  return arr;
}

// Tek dokunuş (orba basıldığı an).
export function hapticTap(): void {
  if (!isHapticsSupported()) return;
  try {
    if (webVibrateOk()) w.navigator.vibrate(18);
    else if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

// Bir nefes fazı için rampalı titreşim. dir: 'in' (artan) / 'out' (azalan).
export function hapticPhase(dir: 'in' | 'out'): void {
  if (!isHapticsSupported()) return;
  try {
    if (webVibrateOk()) {
      w.navigator.vibrate(0);
      w.navigator.vibrate(buildWebPattern(dir));
      return;
    }
    if (Haptics) {
      // Native: artan/azalan şiddette ayrık darbeler (~4.4 sn'ye yayılı)
      const S = Haptics.ImpactFeedbackStyle;
      const seq: Array<[number, any]> = dir === 'in'
        ? [[0, S.Light], [1400, S.Light], [2500, S.Medium], [3400, S.Medium], [4200, S.Heavy]]
        : [[0, S.Heavy], [800, S.Medium], [1800, S.Medium], [3000, S.Light], [4100, S.Light]];
      for (const [t, style] of seq) {
        timers.push(setTimeout(() => { try { Haptics.impactAsync(style); } catch {} }, t));
      }
    }
  } catch {}
}

export function stopHaptics(): void {
  try {
    clearTimers();
    if (webVibrateOk()) w.navigator.vibrate(0);
  } catch {}
}
