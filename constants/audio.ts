import { Audio } from 'expo-av';
import { AUDIO } from './audioManifest';

let current: Audio.Sound | null = null;

// Bu içerik için önceden üretilmiş ses var mı?
export function hasAudio(key: string): boolean {
  return AUDIO[key] != null;
}

export async function stopAudio(): Promise<void> {
  if (current) {
    try { await current.stopAsync(); await current.unloadAsync(); } catch {}
    current = null;
  }
}

// Gömülü mp3'ü çal; bittiğinde veya ses yoksa onDone çağrılır
export async function playAudio(key: string, onDone: () => void): Promise<void> {
  await stopAudio();
  const mod = AUDIO[key];
  if (mod == null) { onDone(); return; }
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(mod as any, { shouldPlay: true });
    current = sound;
    sound.setOnPlaybackStatusUpdate((st: any) => {
      if (st.isLoaded && st.didJustFinish) {
        onDone();
        sound.unloadAsync().catch(() => {});
        if (current === sound) current = null;
      }
    });
  } catch {
    onDone();
  }
}
