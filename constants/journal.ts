import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Günlük yansıma deposu — tek yetki kaynağı.
 *
 * Anahtar biçimi `stoikos_journal_<Date.toDateString()>`, yani **günde tek
 * kayıt**. Bu dosyadan önce aynı sabit `app/(tabs)/practice.tsx` ve
 * `app/journal.tsx` içinde ayrı ayrı yazılıydı; program kapanış yansıması
 * üçüncü kullanıcı olunca buraya alındı. Üç kopya sessizce ayrışabilirdi ve
 * ayrıştığı gün yazılan yansımalar Yansımaların ekranında görünmez olurdu.
 */
export const JOURNAL_KEY = 'stoikos_journal_';

export const journalKeyFor = (d: Date = new Date()): string => JOURNAL_KEY + d.toDateString();

/**
 * Bugünün kaydına **ekler** — üzerine yazmaz.
 *
 * Gerekli, çünkü günde tek kayıt var: kullanıcı sabah günlük yansımasını
 * yazıp akşam bir programı bitirirse, üzerine yazan bir kaydetme sabahki
 * metni sessizce silerdi.
 */
export async function appendToJournalToday(text: string): Promise<void> {
  const body = text.trim();
  if (!body) return;
  const key = journalKeyFor();
  const cur = ((await AsyncStorage.getItem(key)) || '').trim();
  await AsyncStorage.setItem(key, cur ? `${cur}\n\n${body}` : body);
}
