// Onboarding (tanıtım turu) durumu — bir kez gösterilir; istenirse tekrar tetiklenir.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDED_KEY = 'stoikos_onboarded';
export const TIP_KEY_PREFIX = 'stoikos_tip_';

type Listener = () => void;
const listeners = new Set<Listener>();

// _layout bunu dinler; çağrılınca onboarding yeniden gösterilir.
export function onReplayOnboarding(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

// İlerleme ekranındaki "Tanıtımı tekrar göster" butonu bunu çağırır.
export async function replayOnboarding(): Promise<void> {
  try { await AsyncStorage.removeItem(ONBOARDED_KEY); } catch {}
  // Tanıtım yeniden izlenince ilk kullanım ipuçları da yeniden çıksın.
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(TIP_KEY_PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {}
  listeners.forEach((l) => l());
}

// Tanıtım bitince haber ver: ilk kullanım ipuçları (components/FirstTip) ancak
// tanıtım kapandıktan sonra çıkar, yoksa ikisi üst üste biner.
const doneListeners = new Set<Listener>();
export function onOnboardingDone(l: Listener): () => void {
  doneListeners.add(l);
  return () => { doneListeners.delete(l); };
}
export function notifyOnboardingDone(): void {
  doneListeners.forEach((l) => l());
}
