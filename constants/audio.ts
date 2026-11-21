import { Audio } from 'expo-av';
import { AUDIO } from './audioManifest';

let current: Audio.Sound | null = null;
// Her çal/durdur isteği bu sayacı artırır. Ses dosyası yüklenirken (createAsync sürerken) durdurma ya da
// yeni bir çalma istenirse, yüklenen ses "eski" kalır ve hemen kapatılır.
// 21 Kasım 2026 (kullanıcı: "ses başlıyor ama kapanmıyor, menüden çıksam da devam ediyor"): eskiden
// yükleme sırasında durdurmaya basılınca `current` henüz boş olduğu için hiçbir şey durmuyor, ses birazdan
// başlıyordu; iki hızlı dokunuşta da ilk ses `current`'tan düşüp sahipsiz kalıyor, hiç kapatılamıyordu.
let gen = 0;

// Bu içerik için önceden üretilmiş ses var mı?
export function hasAudio(key: string): boolean {
  return AUDIO[key] != null;
}

export async function stopAudio(): Promise<void> {
  gen++;
  const s = current;
  current = null;
  if (s) {
    try { await s.stopAsync(); } catch {}
    try { await s.unloadAsync(); } catch {}
  }
}

// Gömülü mp3'ü çal; bittiğinde veya ses yoksa onDone çağrılır
export async function playAudio(key: string, onDone: () => void): Promise<void> {
  await stopAudio();
  const my = ++gen;
  const mod = AUDIO[key];
  if (mod == null) { onDone(); return; }
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(mod as any, { shouldPlay: true });
    if (my !== gen) {
      // Yüklenirken durdurma ya da başka bir çalma istendi: bu sesi hemen kapat.
      try { await sound.stopAsync(); } catch {}
      try { await sound.unloadAsync(); } catch {}
      return;
    }
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
