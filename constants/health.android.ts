import {
  getSdkStatus,
  initialize,
  insertRecords,
  requestPermission,
  SdkAvailabilityStatus,
  MindfulnessSessionType,
} from 'react-native-health-connect';

// Health Connect → MindfulnessSession (yeni bir veri türü; yalnız güncel Health Connect
// sürümlerinde var). Yalnız yazma izni istenir. Arayüz ve gerekçe: constants/health.ts.

export const HEALTH_SUPPORTED = true;

let ready = false;
async function ensure(): Promise<boolean> {
  if (ready) return true;
  try {
    if ((await getSdkStatus()) !== SdkAvailabilityStatus.SDK_AVAILABLE) return false;
    ready = await initialize();
    return ready;
  } catch { return false; }
}

export async function healthAvailable(): Promise<boolean> {
  return ensure();
}

export async function requestHealthWrite(): Promise<boolean> {
  if (!(await ensure())) return false;
  try {
    const granted = await requestPermission([{ accessType: 'write', recordType: 'MindfulnessSession' }]);
    return granted.some((p: any) => p.recordType === 'MindfulnessSession' && p.accessType === 'write');
  } catch { return false; }
}

export async function writeMindfulSession(start: Date, end: Date): Promise<void> {
  if (!(await ensure())) return;
  try {
    await insertRecords([{
      recordType: 'MindfulnessSession',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      mindfulnessSessionType: MindfulnessSessionType.BREATHING,
      title: 'Stoikos',
    } as any]);
  } catch {}
}
