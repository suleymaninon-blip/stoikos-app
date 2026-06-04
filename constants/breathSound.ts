// Yaz patikası atmosferi — kodla üretilir (Web Audio), dosya/telif yok.
// Gelip giden hafif esinti + selvi/yaprak hışırtısı. Nefesle çok hafif yükselip alçalır.
// Tüm çağrılar platform kontrolü + try/catch ile sarılı → native'de asla çökmez.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_KEY = 'stoikos_breath_sound';
const HALF = 4.5;      // sn — nefesle çok hafif swell
const BR_LO = 0.085;   // nefes ver dibi
const BR_HI = 0.135;   // nefes al doruğu

const w: any = typeof globalThis !== 'undefined' ? (globalThis as any) : {};

export function isBreathSoundSupported(): boolean {
  try {
    return Platform.OS === 'web' && !!(w.AudioContext || w.webkitAudioContext);
  } catch {
    return false;
  }
}

export async function getSoundPref(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(PREF_KEY)) === '1'; } catch { return false; }
}
export async function setSoundPref(on: boolean): Promise<void> {
  try { await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0'); } catch {}
}

let ctx: any = null;
let master: any = null;
let timer: any = null;

// Döngülenebilir gürültü tamponu. type: 'brown' (yumuşak/derin) | 'white' (hışırtı)
function makeNoise(c: any, type: 'brown' | 'white'): any {
  const len = Math.floor(c.sampleRate * 3);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
  } else {
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.55;
  }
  return buf;
}

// LFO (alçak frekans osilatör) → bir AudioParam'a derinlikle ekle.
function addLFO(c: any, param: any, freq: number, depth: number): void {
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = depth;
  osc.connect(g);
  g.connect(param);
  osc.start();
}

// Nefesle çok hafif master swell (orb ile bağ): 4.5 sn yüksel / 4.5 sn alçal.
function scheduleBreath() {
  if (!ctx || !master) return;
  try {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value || BR_LO, 0.0001), now);
    master.gain.linearRampToValueAtTime(BR_HI, now + HALF);
    master.gain.linearRampToValueAtTime(BR_LO, now + HALF * 2);
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
      master.connect(ctx.destination);

      // ── Esinti zarfı (gelip giden rüzgâr) — iki yavaş LFO ile organik gust ──
      const gust = ctx.createGain();
      gust.gain.value = 0.55;
      addLFO(ctx, gust.gain, 0.06, 0.33);   // ~16 sn periyot
      addLFO(ctx, gust.gain, 0.097, 0.16);  // ~10 sn periyot
      gust.connect(master);

      // ── Katman 1: rüzgârın gövdesi (havalı esinti) — kahverengi gürültü + lowpass ──
      const wind = ctx.createBufferSource();
      wind.buffer = makeNoise(ctx, 'brown');
      wind.loop = true;
      const windLp = ctx.createBiquadFilter();
      windLp.type = 'lowpass'; windLp.frequency.value = 560; windLp.Q.value = 0.4;
      const windG = ctx.createGain(); windG.gain.value = 0.5;
      addLFO(ctx, windLp.frequency, 0.05, 120); // esintiyle filtre hafif açılır/kapanır
      wind.connect(windLp); windLp.connect(windG); windG.connect(gust);
      wind.start();

      // ── Katman 2: selvi/yaprak hışırtısı — beyaz gürültü + bandpass + flutter ──
      const leaf = ctx.createBufferSource();
      leaf.buffer = makeNoise(ctx, 'white');
      leaf.loop = true;
      const leafHp = ctx.createBiquadFilter();
      leafHp.type = 'highpass'; leafHp.frequency.value = 1600;
      const leafBp = ctx.createBiquadFilter();
      leafBp.type = 'bandpass'; leafBp.frequency.value = 3900; leafBp.Q.value = 0.5;
      const leafG = ctx.createGain(); leafG.gain.value = 0.14;
      // yaprakların titreşimi — iki uyumsuz LFO ile doğal flutter
      const flut = ctx.createGain(); flut.gain.value = 0.6;
      addLFO(ctx, flut.gain, 5.3, 0.22);
      addLFO(ctx, flut.gain, 8.9, 0.13);
      addLFO(ctx, leafBp.frequency, 0.13, 700); // hışırtının tınısı yavaşça gezinir
      leaf.connect(leafHp); leafHp.connect(leafBp); leafBp.connect(leafG);
      leafG.connect(flut); flut.connect(gust);
      leaf.start();

      // ── Çok hafif sıcak gövde (uzaktaki derin hava) ──
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 68;
      const subG = ctx.createGain(); subG.gain.value = 0.025;
      sub.connect(subG); subG.connect(master);
      sub.start();
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
      master.gain.linearRampToValueAtTime(0, now + 0.6); // yumuşak kıs
    }
    const closing = ctx;
    ctx = null;
    master = null;
    if (closing) setTimeout(() => { try { closing.close(); } catch {} }, 700);
  } catch {}
}
