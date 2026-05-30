import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export const ELEVEN_KEY_STORAGE = 'stoikos_eleven_key';
export const ELEVEN_VOICE_STORAGE = 'stoikos_eleven_voice';

// ElevenLabs çok-dilli model — tek ses ile TR/EN/DE/RU konuşur
const MODEL = 'eleven_multilingual_v2';

// Seçilebilir hazır sesler (hepsi multilingual_v2 destekler)
export const VOICES: { id: string; name: string; desc: string }[] = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', desc: 'Sakin, derin erkek' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', desc: 'Sıcak kadın' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', desc: 'Güçlü erkek' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', desc: 'Yumuşak kadın' },
];
export const DEFAULT_VOICE = VOICES[0].id;

export async function getElevenKey(): Promise<string | null> {
  return AsyncStorage.getItem(ELEVEN_KEY_STORAGE);
}

export async function hasElevenKey(): Promise<boolean> {
  const k = await AsyncStorage.getItem(ELEVEN_KEY_STORAGE);
  return !!k;
}

// ArrayBuffer → base64 (Hermes'te btoa garanti değil, elle kodluyoruz)
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? B64[b2 & 63] : '=';
  }
  return out;
}

// ElevenLabs anahtarını doğrula (geçerli mi?)
export async function validateElevenKey(key: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': key },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Metni ElevenLabs ile sese çevirip yerel bir mp3 dosyası olarak döndürür.
// Anahtar yoksa null döner (çağıran taraf cihaz sesine düşer).
export async function synthesizeToFile(text: string): Promise<string | null> {
  const key = await AsyncStorage.getItem(ELEVEN_KEY_STORAGE);
  if (!key) return null;
  const voiceId = (await AsyncStorage.getItem(ELEVEN_VOICE_STORAGE)) || DEFAULT_VOICE;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status} ${detail.slice(0, 120)}`);
  }

  const buf = await res.arrayBuffer();
  const b64 = bytesToBase64(new Uint8Array(buf));
  const uri = `${FileSystem.cacheDirectory}stoikos-tts-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, b64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}
