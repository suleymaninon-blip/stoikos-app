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

/**
 * Son hata — TEŞHİS İÇİN.
 *
 * Bu modüldeki catch'ler sessizdi ve bu bir sorunu iki hafta gizledi
 * (bkz. CLAUDE.md, .m4a/video olayı). Sessiz başarısızlık, olmayan bir
 * özellikten daha kötü: kullanıcı da geliştirici de neyin bozulduğunu
 * göremiyor. Artık hata saklanıyor ve orb altında küçük bir satırda
 * gösteriliyor.
 */
let lastError: string | null = null;
let lastStatus: string | null = null;

/** Orb altında gösterilen teşhis satırı: hata varsa o, yoksa oynatma durumu. */
export function getBreathSoundDiag(): string | null { return lastError ?? lastStatus; }

/**
 * Çalmaya başladıktan kısa süre sonra gerçekten ses çıkıp çıkmadığını yakalar.
 * Hata YOKKEN de sessizlik olabiliyor (iOS sessizce reddedebiliyor), o yüzden
 * "hata yok" tek başına yeterli bilgi değil.
 */
function probe(s: Audio.Sound): void {
  setTimeout(async () => {
    try {
      const st: any = await s.getStatusAsync();
      if (!st?.isLoaded) { lastStatus = 'yüklenmedi'; return; }
      lastStatus = st.isPlaying
        ? `çalıyor · ${(st.positionMillis / 1000).toFixed(1)}sn · ses ${st.volume}`
        : `duraklatıldı · ${(st.positionMillis / 1000).toFixed(1)}sn`;
    } catch (e) { note('getStatus', e); }
  }, 900);
}

function note(where: string, e: unknown): void {
  const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  lastError = `${where} → ${msg}`.slice(0, 160);
}

const SOURCE = require('../assets/audio/breath-orb.mp3');

/**
 * Sesi çalmaya başla.
 *
 * ⚠️ iOS Safari kuralı — bu fonksiyonun biçimi kazara değil:
 * bir ses öğesi, ömründe EN AZ BİR KEZ kullanıcı dokunuşu içinde play()
 * çağrılmadıysa iOS onu kalıcı olarak reddediyor. Bu yüzden öğe mount'ta
 * DEĞİL, ilk basışın içinde `shouldPlay: true` ile oluşturuluyor —
 * kavramların sesli anlatımında (constants/audio.ts) çalıştığı kanıtlanmış
 * desen bu. Bir kez böyle açıldıktan sonra sonraki basışlarda düz
 * `playAsync()` yetiyor.
 *
 * (Önceki bir deneme sesi mount'ta ön yüklüyordu; dosyayı indirme sorununu
 * çözüyor ama öğe hiçbir dokunuş içinde doğmadığı için iOS'ta sesi tümden
 * susturuyordu. Ön yükleme yapılacaksa ses öğesi değil, yalnız DOSYA
 * önbelleğe alınmalı.)
 */
export async function startBreathSound(): Promise<void> {
  wantPlaying = true;

  if (sound) {
    try { lastError = null; await sound.playAsync(); probe(sound); } catch (e) { note('playAsync', e); }
    return;
  }
  if (loading) return;

  loading = true;
  lastError = null;
  try {
    if (!audioModeSet) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true });
      } catch (e) {
        // Web'de bu çağrı desteklenmeyebilir; ses üretimini engellememeli.
        note('setAudioMode', e);
      }
      audioModeSet = true;
    }
    const { sound: s } = await Audio.Sound.createAsync(
      SOURCE,
      { isLooping: true, volume: 0.85, shouldPlay: true },
    );
    sound = s;
    probe(s);
    // Yükleme biterken kullanıcı bırakmışsa hemen sustur.
    if (!wantPlaying) { try { await s.pauseAsync(); } catch {} }
  } catch (e) {
    note('createAsync', e);
  } finally {
    loading = false;
  }
}

export async function stopBreathSound(): Promise<void> {
  wantPlaying = false;
  if (!sound) return;
  try { await sound.stopAsync(); } catch (e) { note('stopAsync', e); }
}
