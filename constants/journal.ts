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
    // Aynı önekle başlayan ama günlük olmayan anahtarlar var (ör. koç rızası `stoikos_journal_coach_consent` = '1').
    // 14 Kasım 2026'ya kadar bunlar "1 Ocak 1970 — 1" diye bir yansıma gibi listeleniyor ve dışa aktarılıyordu.
    if (isNaN(date.getTime())) continue;
    list.push({ key: k, date, text });
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

// ─── Ay özeti (14 Kasım 2026) ──────────────────────────────
// Kullanıcı: "kaydedince küçük bir onay + ayda bir 'bu ay en çok şunu yazdın' özeti, ikisini de yap."
// Hepsi cihazda hesaplanır; yazılar hiçbir yere gitmez. "En çok geçen kelimeler" basit bir sayımdır:
// 4 harften kısa ve çok sık kullanılan bağlaç/zamir türü kelimeler atılır, en az iki kez geçenler alınır.
const STOP: Record<string, string> = {
  tr: 'ama fakat ancak belki bile bunu buna bunun böyle çünkü daha değil diye gibi hala hâlâ hangi hatta hepsi için ile ilgili kadar kendi kendime kendimi nasıl neden olan olarak oldu olduğu olur onun onlar sanki sonra şekilde şimdi şöyle tüm üzere vardı veya yine yoksa zaten bana beni benim bende sana seni senin bugün dün yarın bazı birkaç biraz çok',
  en: 'about after again also because been before being both cannot could does doing down each from have having here into just more most much myself only other over same should some such than that their them then there these they this those through today very were what when where which while will with would your yours yesterday tomorrow really still even',
  de: 'aber alle auch dann dass dein deine denn dich diese dieser doch durch eine einem einen einer eines euch haben habe hatte heute hier ihre immer jetzt kann kein keine mein meine mich mehr nach nicht noch oder schon sein seine sich sind über unter viel viele weil wenn werden wieder wird wurde gestern morgen',
  ru: 'более будет буду была были было быть вами весь всего всех даже если есть ещё зачем здесь либо меня мной мне может можно надо него неё нему ними опять потом почему просто раза себя сейчас сегодня вчера завтра свой свою свои своей себе так также там тебя тебе тогда того тоже только чего чтобы этим этих этого этой этом этот эту',
  fr: 'alors après aussi avant avec avoir bien cela cette comme dans depuis donc elle elles encore entre être faire fait leur leurs mais même mieux moins notre nous parce pour plus quand quel quelle sans sera sont tous tout toute très trop vers votre vous hier demain aujourd était avais avait',
  es: 'algo ante antes aquí cada como cual cuando desde donde ella ellas ellos entre esta este esto estos estas estar está hace hacia hasta mucho muchos nada nosotros nuestra nuestro otra otro para pero poco porque puede sido sobre solo también tanto tiene todo todos tras unos usted hoy ayer mañana estaba había',
};
const stopSets: Record<string, Set<string>> = {};
const stopFor = (lang: string) => stopSets[lang] || (stopSets[lang] = new Set((STOP[lang] || STOP.en).split(' ')));

export type MonthStats = { days: number; words: number; top: string[] };
export const monthKeyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

export function statsOf(entries: JournalEntry[], lang: string, locale: string): MonthStats {
  const stop = stopFor(lang);
  const freq = new Map<string, number>();
  let words = 0;
  for (const e of entries) {
    const tokens = e.text.toLocaleLowerCase(locale).match(/\p{L}+/gu) || [];
    words += tokens.length;
    for (const w of tokens) if (w.length >= 4 && !stop.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  }
  const top = [...freq.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([w]) => w);
  return { days: entries.length, words, top };
}

/** Kayıtları aya göre gruplar (yeniden eskiye); her grubun özeti hazır gelir. */
export function groupByMonth(entries: JournalEntry[], lang: string, locale: string): { key: string; date: Date; entries: JournalEntry[]; stats: MonthStats }[] {
  const groups: { key: string; date: Date; entries: JournalEntry[] }[] = [];
  for (const e of entries) {
    const k = monthKeyOf(e.date);
    const g = groups[groups.length - 1];
    if (g && g.key === k) g.entries.push(e);
    else groups.push({ key: k, date: e.date, entries: [e] });
  }
  return groups.map((g) => ({ ...g, stats: statsOf(g.entries, lang, locale) }));
}

/** Bu ayın özeti (kaydetme onayında gösterilir). */
export async function thisMonthStats(lang: string, locale: string): Promise<MonthStats> {
  const k = monthKeyOf(new Date());
  return statsOf((await loadJournalEntries()).filter((e) => monthKeyOf(e.date) === k), lang, locale);
}
