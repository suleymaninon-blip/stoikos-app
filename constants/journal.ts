import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';

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

export type JournalEntry = { key: string; date: Date; text: string };

/** Tüm günlük kayıtları, yeniden eskiye. Yansımaların ekranı ve dışa aktarma aynı listeyi kullanır. */
export async function loadJournalEntries(): Promise<JournalEntry[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(JOURNAL_KEY));
  const pairs = await AsyncStorage.multiGet(keys);
  const list: JournalEntry[] = [];
  for (const [k, v] of pairs) {
    const text = (v || '').trim();
    if (!text) continue;
    const date = new Date(k.slice(JOURNAL_KEY.length));
    list.push({ key: k, date: isNaN(date.getTime()) ? new Date(0) : date, text });
  }
  list.sort((a, b) => b.date.getTime() - a.date.getTime());
  return list;
}

/**
 * Günlüğü düz metin olarak dışa aktarır (30 Ekim 2026).
 *
 * Hesap yok, veriler yalnız cihazda: uygulama silinirse günlük gider. Rakip
 * stoic. da aynı modelde ve kullanıcıya düzenli dışa aktarmayı öneriyor;
 * "kaybolan günlük" rakiplerin 1★ sebeplerinden biriydi. Native'de paylaşım
 * sayfası açılır (Notlar, Posta, Mesajlar…), web'de .txt indirilir.
 * Dönüş: 'empty' (kayıt yok) | 'shared' | 'downloaded'.
 */
export async function exportJournal(title: string, locale: string): Promise<'empty' | 'shared' | 'downloaded'> {
  const entries = await loadJournalEntries();
  if (!entries.length) return 'empty';
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const body = `${title}\n\n` + entries.map((e) => `— ${fmt(e.date)} —\n${e.text}`).join('\n\n') + '\n';

  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') return 'empty';
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `stoikos-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return 'downloaded';
  }
  await Share.share({ title, message: body });
  return 'shared';
}
