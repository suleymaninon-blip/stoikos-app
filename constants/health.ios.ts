import {
  isHealthDataAvailableAsync,
  requestAuthorization,
  saveCategorySample,
} from '@kingstinct/react-native-healthkit';

// Apple Health → "Farkındalık dakikaları". Yalnız yazma izni istenir (toShare), okuma yok.
// Arayüz ve gerekçe: constants/health.ts.
const MINDFUL = 'HKCategoryTypeIdentifierMindfulSession' as const;

export const HEALTH_SUPPORTED = true;

export async function healthAvailable(): Promise<boolean> {
  try { return await isHealthDataAvailableAsync(); } catch { return false; }
}

export async function requestHealthWrite(): Promise<boolean> {
  try { return await requestAuthorization({ toShare: [MINDFUL] }); } catch { return false; }
}

export async function writeMindfulSession(start: Date, end: Date): Promise<void> {
  try {
    // Farkındalık kaydının değeri yoktur: HKCategoryValueNotApplicable = 0.
    await saveCategorySample(MINDFUL, 0 as any, start, end);
  } catch {}
}
