import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HEALTH_SUPPORTED, healthAvailable, requestHealthWrite, writeMindfulSession } from './health';

/**
 * Nefes seanslarını Sağlık uygulamasına (Apple Health / Health Connect) yazma tercihi.
 * (25 Ekim 2026, rekabet analizi: rakip kullanıcıları istiyor.)
 *
 * - Varsayılan KAPALI. İzin ilk açılışta değil, ilk ≥1 dk'lık nefes seansından SONRA
 *   tek dokunuşluk bir kartla istenir (BreathOrb → HealthAsk) ve bir kez sorulur.
 * - Ayarlar'dan açılıp kapatılabilir. Yalnız yazılır, okunmaz; Stoikos sunucusuna gitmez.
 */
const SYNC_KEY = 'stoikos_health_sync';
const ASKED_KEY = 'stoikos_health_asked';

export { HEALTH_SUPPORTED };

export async function isHealthSyncOn(): Promise<boolean> {
  if (!HEALTH_SUPPORTED) return false;
  return (await AsyncStorage.getItem(SYNC_KEY)) === '1';
}

/** Açarken izni ister; izin yoksa false döner ve tercih kapalı kalır. */
export async function setHealthSync(on: boolean): Promise<boolean> {
  if (!HEALTH_SUPPORTED) return false;
  await AsyncStorage.setItem(ASKED_KEY, '1');
  if (!on) { await AsyncStorage.setItem(SYNC_KEY, '0'); return true; }
  const ok = (await healthAvailable()) && (await requestHealthWrite());
  await AsyncStorage.setItem(SYNC_KEY, ok ? '1' : '0');
  return ok;
}

/** Seans sonrası izin kartı gösterilmeli mi? (desteklenen cihaz, henüz sorulmamış) */
export async function shouldAskHealth(): Promise<boolean> {
  if (!HEALTH_SUPPORTED) return false;
  if (await AsyncStorage.getItem(ASKED_KEY)) return false;
  return healthAvailable();
}

export async function markHealthAsked(): Promise<void> {
  await AsyncStorage.setItem(ASKED_KEY, '1');
}

/** Tercih açıksa seansı yazar. */
export async function logMindfulSession(start: Date, end: Date): Promise<void> {
  if (await isHealthSyncOn()) await writeMindfulSession(start, end);
}

export { writeMindfulSession };

/** Kullanıcıya gösterilen Sağlık uygulaması adı. */
export function healthAppName(lang: string): string {
  if (Platform.OS === 'android') return 'Health Connect';
  const ios: Record<string, string> = { tr: 'Sağlık', en: 'Apple Health', de: 'Health', ru: 'Здоровье', fr: 'Santé', es: 'Salud' };
  return ios[lang] ?? 'Apple Health';
}
