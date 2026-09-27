// Orb nefes sesi — assets/audio/breath-orb.mp3, expo-av ile.
// Native + web çalışır. Orb basılı tutulunca çalar (döngü), bırakılınca durur.
// Tüm çağrılar try/catch ile sarılı → ses yüklenemezse uygulama çökmez, sessiz geçer.
//
// ⚠️ Eskiden `breath-orb.m4a` idi ve SES ÇIKMIYORDU. Sebep: o dosya aslında bir
// VİDEO'ydu — adı .m4a yapılmış, içinde 960×540 H.264 izi (10 fps, 2 kb/s
// yer tutucu) + AAC ses izi olan bir MP4. Tarayıcının `<audio>` öğesi böyle bir
// dosyayı çözemiyor: "DEMUXER_ERROR_NO_SUPPORTED_STREAMS". Ses izi çıkarılıp
// MP3'e alındı; dosya 5,7 MB → 2,7 MB'a da indi. Uygulamadaki 72 anlatım
// dosyası da MP3 ve sorunsuz çalışıyor, yani biçim kanıtlı.
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
      require('../assets/audio/breath-orb.mp3'),
      // shouldPlay: kullanıcı hâlâ basılı tutuyorsa oluşturma anında başlasın.
      // Kavram anlatımındaki çalışan desen bu (constants/audio.ts) — sesi
      // oluşturup SONRA ayrıca play() çağırmak iOS'ta reddediliyor.
      { isLooping: true, volume: 0.85, shouldPlay: wantPlaying }
    );
    sound = s;
  } catch {
    // yüklenemezse sessiz geç
  } finally {
    loading = false;
  }
}

/**
 * Sesi önceden yükle — orb ekrana gelince çağrılır, dokunma sırasında DEĞİL.
 *
 * Sebep: dosya 2,7 MB. İlk basışta indirilmeye başlanırsa iOS Safari'nin
 * verdiği dokunma yetkisi indirme bitene kadar düşüyor ve `play()`
 * reddediliyor (sessizce, çünkü aşağıdaki catch'ler yutuyor). Önceden
 * yüklenince basış anında yapılacak tek iş `playAsync()` kalıyor.
 */
export async function prepareBreathSound(): Promise<void> {
  await ensureLoaded();
}

export async function startBreathSound(): Promise<void> {
  wantPlaying = true;
  // ⚠️ Buradan önce await KOYMA. iOS Safari, kullanıcı hareketiyle aynı
  // görev içinde çağrılmayan play()'i reddediyor; araya giren her await
  // yetkiyi düşürüyor. (setPositionAsync(0) de bu yüzden kaldırıldı —
  // stopAsync zaten konumu sıfırlıyor, gereksizdi.)
  if (sound) {
    try { await sound.playAsync(); } catch {}
    return;
  }
  await ensureLoaded();   // shouldPlay ile oluşturulur, ayrıca play gerekmez
}

export async function stopBreathSound(): Promise<void> {
  wantPlaying = false;
  if (!sound) return;
  try { await sound.stopAsync(); } catch {}
}
