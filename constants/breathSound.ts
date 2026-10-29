// Orb nefes sesi — assets/audio/breath-orb.mp3, expo-av ile.
// Native + web çalışır. Nefes çiçeği başlayınca çalar (döngü), bitince durur (dokun-başlat / dokun-bitir).
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
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

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
let wantPlaying = false;      // kullanıcı şu an çalmasını istiyor mu (egzersiz sürüyor mu)
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

/** Son hata — teşhis için saklanıyor. Sessiz catch'ler bu modülde iki ayrı
 *  hatayı haftalarca gizledi; bir daha sessizce yutulmasın. */
export function getBreathSoundError(): string | null { return lastError; }

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
// Web: expo-av yerine doğrudan <audio>. expo-av'nin createAsync'i web'de play() sözünü
// bekleyerek çözülüyor; ses çalarken bile `sound` boş kalabiliyordu ve durdur'a basınca
// stopBreathSound erken dönüyor, ses çalmaya devam ediyordu (29 Ekim 2026: "başlatıyorum
// ama kapatamıyorum"). Burada play()/pause() dokunuşun içinde, eşzamanlı çağrılıyor —
// iOS kuralı için de en güvenli yol.
let webAudio: HTMLAudioElement | null = null;

function webSourceUri(): string {
  return Asset.fromModule(SOURCE).uri;
}

export async function startBreathSound(): Promise<void> {
  wantPlaying = true;

  if (Platform.OS === 'web') {
    try {
      if (!webAudio) {
        webAudio = new window.Audio(webSourceUri());
        webAudio.loop = true;
        webAudio.volume = 0.85;
      }
      lastError = null;
      const p = webAudio.play();
      if (p) p.then(() => { if (!wantPlaying) webAudio?.pause(); }).catch((e) => note('play', e));
    } catch (e) { note('webAudio', e); }
    return;
  }

  if (sound) {
    try { lastError = null; await sound.playAsync(); } catch (e) { note('playAsync', e); }
    return;
  }
  if (loading) return;

  loading = true;
  lastError = null;
  try {
    if (!audioModeSet) {
      try {
        // staysActiveInBackground: telefon kilitlenince nefes sesi kesilmesin (app.json → UIBackgroundModes: audio).
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true, staysActiveInBackground: true });
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
  if (Platform.OS === 'web') {
    if (webAudio) { webAudio.pause(); webAudio.currentTime = 0; }
    return;
  }
  if (!sound) return;
  try { await sound.stopAsync(); } catch (e) { note('stopAsync', e); }
}
