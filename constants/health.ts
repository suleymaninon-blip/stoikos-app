/**
 * Sağlık uygulamasına farkındalık dakikası yazma — web / desteklenmeyen platform.
 *
 * iOS: `health.ios.ts` (Apple Health, HKCategoryTypeIdentifierMindfulSession).
 * Android: `health.android.ts` (Health Connect, MindfulnessSession).
 * Metro platform uzantısına göre doğru dosyayı seçer; web bu dosyayı alır ve hiçbir şey yapmaz.
 *
 * Yalnız YAZILIR, hiçbir sağlık verisi okunmaz. Yazılan kayıt kullanıcının kendi
 * Sağlık deposunda kalır, Stoikos sunucusuna gitmez.
 */
export const HEALTH_SUPPORTED = false;

export async function healthAvailable(): Promise<boolean> { return false; }

export async function requestHealthWrite(): Promise<boolean> { return false; }

export async function writeMindfulSession(_start: Date, _end: Date): Promise<void> {}
