import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Bugünün adımı (24 Kasım 2026, kullanıcı: Kontrol Eleği'nin sonunda "şimdi ne yapayım?" boşluğu).
 * Netlik ekranında elindekilerden birine dokununca o günün adımı olur; Pratik → Bugün'ün başında
 * küçük bir kartta bekler, "Yaptım" ile işaretlenir. Yalnız cihazda, günde tek adım.
 * Anahtar `stoikos_focus_<Date.toDateString()>` (günlükle aynı gün biçimi; `stoikos_journal_` önekini kullanma).
 */
export type Focus = { text: string; done: boolean; from: 'sieve' };

const KEY = 'stoikos_focus_';
const keyFor = (d: Date = new Date()) => KEY + d.toDateString();

export async function getFocus(d: Date = new Date()): Promise<Focus | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(d));
    if (!raw) return null;
    const f = JSON.parse(raw);
    return f && typeof f.text === 'string' && f.text.trim() ? { text: f.text, done: !!f.done, from: 'sieve' } : null;
  } catch { return null; }
}

export async function setFocus(text: string | null): Promise<void> {
  if (!text || !text.trim()) { await AsyncStorage.removeItem(keyFor()); return; }
  await AsyncStorage.setItem(keyFor(), JSON.stringify({ text: text.trim(), done: false, from: 'sieve' }));
}

export async function setFocusDone(done: boolean): Promise<Focus | null> {
  const f = await getFocus();
  if (!f) return null;
  const next = { ...f, done };
  await AsyncStorage.setItem(keyFor(), JSON.stringify(next));
  return next;
}
