// Orb nefes sesi — gerçek ses dosyası (assets/audio/breath-orb.m4a), expo-av ile.
// Native + web çalışır. Orb basılı tutulunca çalar (döngü), bırakılınca durur.
// Tüm çağrılar try/catch ile sarılı → ses yüklenemezse uygulama çökmez, sessiz geçer.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const PREF_KEY = 'stoikos_breath_sound';

// Ses her platformda destekleniyor (dosya tabanlı).
export function isBreathSoundSupported(): boolean {
  return true;
}

// Tercih: varsayılan AÇIK (anahtar yoksa true).
export async function getSoundPref(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(PREF_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true;
  }
}
export async function setSoundPref(on: boolean): Promise<void> {
  try { await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0'); } catch {}
}

let sound: Audio.Sound | null = null;
let loading = false;
let wantPlaying = false;      // kullanıcı şu an çalmasını istiyor mu (basılı mı)
let audioModeSet = false;

async function ensureLoaded(): Promise<void> {
  if (sound || loading) return;
  loading = true;
  try {
    if (!audioModeSet) {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true });
      audioModeSet = true;
    }
    const { sound: s } = await Audio.Sound.createAsync(
      require('../assets/audio/breath-orb.m4a'),
      { isLooping: true, volume: 0.85 }
    );
    sound = s;
  } catch {
    // yüklenemezse sessiz geç
  } finally {
    loading = false;
  }
  // Yükleme bitene kadar bırakılmışsa çalma
  if (wantPlaying && sound) {
    try { await sound.setPositionAsync(0); await sound.playAsync(); } catch {}
  }
}

export async function startBreathSound(): Promise<void> {
  wantPlaying = true;
  if (!sound) { await ensureLoaded(); return; }
  try { await sound.setPositionAsync(0); await sound.playAsync(); } catch {}
}

export async function stopBreathSound(): Promise<void> {
  wantPlaying = false;
  if (!sound) return;
  try { await sound.stopAsync(); } catch {}
}
