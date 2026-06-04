// Nefese senkron sakinleştirici ses — kodla üretilir (Web Audio), dosya/telif yok.
// Tüm çağrılar platform kontrolü + try/catch ile sarılıdır → native'de asla çökmez.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'stoikos_breath_sound';
const HALF = 4.5; // sn — nefes al / ver yarı döngüsü
// Yumuşak nefes-dalgası: gürültü seviyesi ve filtre kesimi nefesle açılıp kapanır.
const LO = 0.0;     // nefes ver dibi (neredeyse sessiz)
const HI = 0.075;   // nefes al doruğu (hafif "şşş" dalgası)
const CUT_LO = 180; // Hz — verirken kapalı/yumuşak
const CUT_HI = 620; // Hz — alırken hafif açılır (havalı)

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
let lp: any = null;
let timer: any = null;

// ~3 sn'lik kahverengi (brown) gürültü tamponu — yumuşak, "dalga/nefes" dokusu.
function makeBrownNoise(c: any): any {
  const len = Math.floor(c.sampleRate * 3);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.2; // seviye
  }
  return buf;
}

// Gürültü seviyesi + filtre kesimi orb ritmiyle: 4.5 sn aç (al), 4.5 sn kıs (ver).
function scheduleBreath() {
  if (!ctx || !master) return;
  try {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value || 0.0001, 0.0001), now);
    master.gain.linearRampToValueAtTime(HI, now + HALF);      // nefes al → açılır
    master.gain.linearRampToValueAtTime(0.0001, now + HALF * 2); // nefes ver → kısılır
    if (lp) {
      lp.frequency.cancelScheduledValues(now);
      lp.frequency.setValueAtTime(lp.frequency.value || CUT_LO, now);
      lp.frequency.linearRampToValueAtTime(CUT_HI, now + HALF);
      lp.frequency.linearRampToValueAtTime(CUT_LO, now + HALF * 2);
    }
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
      master.gain.value = 0.0001;

      // Nefesle açılıp kapanan yumuşak lowpass
      lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = CUT_LO;
      lp.Q.value = 0.7;

      // Ana doku: döngüye alınmış kahverengi gürültü ("şşş" / dalga / nefes)
      const src = ctx.createBufferSource();
      src.buffer = makeBrownNoise(ctx);
      src.loop = true;

      // Sıcaklık/gövde için çok hafif düşük sinüs (~62 Hz), kalıcı düşük seviye
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 62;
      const subG = ctx.createGain(); subG.gain.value = 0.05;

      src.connect(lp);
      lp.connect(master);
      sub.connect(subG); subG.connect(master);
      master.connect(ctx.destination);
      src.start(); sub.start();
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
    lp = null;
    if (closing) setTimeout(() => { try { closing.close(); } catch {} }, 500);
  } catch {}
}
