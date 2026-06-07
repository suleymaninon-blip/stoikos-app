// Onboarding (tanıtım turu) durumu — bir kez gösterilir; istenirse tekrar tetiklenir.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDED_KEY = 'stoikos_onboarded';

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
  listeners.forEach((l) => l());
}
