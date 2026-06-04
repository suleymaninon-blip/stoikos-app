// Nefese senkron haptik (dokunsal) geri bildirim.
// Halka açılırken titreşim artar, kapanırken azalır. Tüm çağrılar güvenli sarılı.
//
// Platform notları:
// - Native (iOS/Android): expo-haptics → her faz için ayrık darbeler (gesture gerekmez).
// - Web Android Chrome: navigator.vibrate yalnız kullanıcı dokunuşu penceresinde
//   çalışır. Bu yüzden TÜM ritmi tek dokunuşta TEK uzun desen olarak gönderiyoruz;
//   OS deseni kendi çalar (sonraki setInterval çağrıları engellenmez).
// - Web iOS (Safari/PWA): navigator.vibrate YOK → desteklenmez, sessizce kapalı.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
const PREF_KEY = 'stoikos_breath_haptics';
const PHASE_MS = 4500;
const CYCLES = 30; // tek dokunuşta gönderilen web deseni ~ kaç nefes döngüsü kapsasın

function webVibrateOk(): boolean {
  try { return Platform.OS === 'web' && !!w.navigator && typeof w.navigator.vibrate === 'function'; } catch { return false; }
}

export function isHapticsSupported(): boolean {
  try {
    if (Platform.OS === 'web') return webVibrateOk();
    return !!(Haptics && Haptics.impactAsync);
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

// Tek faz deseni (on/gap çiftleri): 'in' artar, 'out' azalır.
// Güçlü "şişen" his için on-süreleri uzun, doruğa doğru neredeyse kesintisiz (yüksek duty).
function phasePattern(dir: 'in' | 'out'): number[] {
  const n = 12, slot = Math.floor(PHASE_MS / n); // ~375 ms
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const f = dir === 'in' ? i / (n - 1) : 1 - i / (n - 1); // 0..1 yoğunluk
    const on = Math.round(30 + f * (slot - 46));            // 30 ms .. neredeyse tüm slot
    arr.push(on, Math.max(slot - on, 16));
  }
  return arr;
}

// Çok döngülü uzun desen (web, tek dokunuşta gönderilir). startDir: mevcut nefes fazı.
function buildLoopPattern(startDir: 'in' | 'out'): number[] {
  const inP = phasePattern('in');
  const outP = phasePattern('out');
  const first = startDir === 'in' ? [...inP, ...outP] : [...outP, ...inP];
  const out: number[] = [];
  for (let c = 0; c < CYCLES; c++) out.push(...first);
  return out;
}

let timers: any[] = [];
function clearTimers() { timers.forEach((t) => clearTimeout(t)); timers = []; }

// Tek dokunuş (orba basıldığı an) — belirgin, "yakalayan" bir vuruş.
export function hapticTap(): void {
  if (!isHapticsSupported()) return;
  try {
    if (webVibrateOk()) w.navigator.vibrate(45);
    else if (Haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {}
}

// Parmak basıldığında çağrılır. startDir: o anki nefes fazı (rezonans için).
// Web: tüm ritmi tek desen olarak başlatır (gesture içinde olmalı).
// Native: mevcut fazın darbelerini başlatır (devamı hapticPhase ile).
export function startBreathHaptics(startDir: 'in' | 'out' = 'in'): void {
  if (!isHapticsSupported()) return;
  try {
    if (webVibrateOk()) {
      w.navigator.vibrate(0);
      w.navigator.vibrate(buildLoopPattern(startDir));
      return;
    }
    hapticPhase(startDir);
  } catch {}
}

// Yalnız NATIVE için faz darbeleri (web'de no-op — desen zaten çalıyor).
// Doruğa doğru SIKLAŞAN ve GÜÇLENEN darbeler → kesintisiz, seni saran bir uğultu.
export function hapticPhase(dir: 'in' | 'out'): void {
  if (Platform.OS === 'web') return;
  if (!Haptics || !Haptics.impactAsync) return;
  try {
    const S = Haptics.ImpactFeedbackStyle;
    const DUR = 4400;
    let t = 0;
    while (t < DUR) {
      const prog = t / DUR;
      const f = dir === 'in' ? prog : 1 - prog;            // 0..1 yoğunluk
      const style = f > 0.62 ? S.Heavy : f > 0.3 ? S.Medium : S.Light;
      timers.push(setTimeout(() => { try { Haptics.impactAsync(style); } catch {} }, t));
      // darbe aralığı: dipte ~340ms (seyrek), doruğa doğru ~55ms (yoğun uğultu)
      t += Math.round(340 - f * 285);
    }
  } catch {}
}

export function stopHaptics(): void {
  try {
    clearTimers();
    if (webVibrateOk()) w.navigator.vibrate(0);
  } catch {}
}
