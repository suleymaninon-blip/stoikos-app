// Nefese senkron sakinleştirici ses — kodla üretilir (Web Audio), dosya/telif yok.
// Tüm çağrılar platform kontrolü + try/catch ile sarılıdır → native'de asla çökmez.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'stoikos_breath_sound';
const HALF = 4.5; // sn — nefes al / ver yarı döngüsü
const LO = 0.02;
const HI = 0.12;

const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};

export function isBreathSoundSupported(): boolean {
  try {
    return Platform.OS === 'web' && !!(w.AudioContext || w.webkitAudioContext);
  } catch {
    return false;
  }
}

export async function getSoundPref(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREF_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setSoundPref(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0');
  } catch {}
}

let ctx: any = null;
let master: any = null;
let timer: any = null;

// Master gain'i orb ritmiyle aynı: 4.5 sn yüksel (al), 4.5 sn alçal (ver), sonsuz.
function scheduleBreath() {
  if (!ctx || !master) return;
  try {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value || LO, 0.0001), now);
    master.gain.linearRampToValueAtTime(HI, now + HALF); // nefes al
    master.gain.linearRampToValueAtTime(LO, now + HALF * 2); // nefes ver
  } catch {}
  timer = setTimeout(scheduleBreath, HALF * 2 * 1000);
}

// Yalnızca kullanıcı dokunuşuyla çağrılmalı (tarayıcı autoplay kuralı).
export function startBreathSound(): void {
  if (!isBreathSoundSupported()) return;
  try {
    if (!ctx) {
      const AC = w.AudioContext || w.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = LO;

      // Sertliği alan yumuşak lowpass
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;

      // Katmanlı sıcak drone: taşıyıcı 110Hz + oktav 220Hz (%30) + beşli 165Hz (%15)
      const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 110;
      const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 220;
      const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = 165;
      const g2 = ctx.createGain(); g2.gain.value = 0.3;
      const g3 = ctx.createGain(); g3.gain.value = 0.15;

      osc1.connect(lp);
      osc2.connect(g2); g2.connect(lp);
      osc3.connect(g3); g3.connect(lp);
      lp.connect(master);
      master.connect(ctx.destination);
      osc1.start(); osc2.start(); osc3.start();
    }
    ctx.resume?.();
    if (timer) clearTimeout(timer);
    scheduleBreath();
  } catch {}
}

export function stopBreathSound(): void {
  try {
    if (timer) { clearTimeout(timer); timer = null; }
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4); // yumuşak kıs
    }
    const closing = ctx;
    ctx = null;
    master = null;
    if (closing) setTimeout(() => { try { closing.close(); } catch {} }, 500);
  } catch {}
}
