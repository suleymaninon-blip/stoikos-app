import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from './api';

/**
 * Birlikte nefes (15 Kasım 2026, kullanıcı seçimi A; tasarım https://claude.ai/artifact/V4xax78WTfrjRFWpafRbU6).
 * Her akşam 21:00'de (kişinin kendi saatiyle) uygulamayı kullanan herkes aynı anda bir dakika nefes alır.
 * Sunucu yalnız toplam sayar; kimlik gönderilmez. Aynı gün ikinci kez katılan yeniden sayılmaz
 * (cihazdaki `stoikos_together_<gün>` bayrağı).
 */
export const TOGETHER_HOUR = 21;
/** Kart 20:45'te görünür, 21:15'te kaybolur; 21:00'den önce geri sayım, sonra "Katıl". */
export const CARD_FROM = TOGETHER_HOUR * 60 - 15;
export const CARD_UNTIL = TOGETHER_HOUR * 60 + 15;
export const SESSION_SECONDS = 60;
/** "Şu an N kişi" bu sayının altında gösterilmez (boş oda moral bozar); yerine bu akşamın toplamı. */
export const NOW_MIN = 50;
/** Akşam toplamı da bunun altındaysa sayı hiç yazılmaz. */
export const TODAY_MIN = 20;

const JOINED_PREFIX = 'stoikos_together_';
const DAYS_KEY = 'stoikos_together_days';

export type TogetherCounts = { now: number; today: number; yesterday: number };

const pad = (n: number) => String(n).padStart(2, '0');
/** Yerel tarih, YYYY-MM-DD. */
export function localDay(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const prevDay = (d = new Date()) => localDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));

/** Günün dakikası (00:00'dan beri). */
export const minuteOfDay = (d = new Date()) => d.getHours() * 60 + d.getMinutes();
export const inCardWindow = (d = new Date()) => { const m = minuteOfDay(d); return m >= CARD_FROM && m < CARD_UNTIL; };
export const hasStarted = (d = new Date()) => minuteOfDay(d) >= TOGETHER_HOUR * 60;
/** 21:00'e kalan dakika (yukarı yuvarlanmış); başladıysa 0. */
export const minutesUntil = (d = new Date()) => Math.max(0, Math.ceil((TOGETHER_HOUR * 3600 - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds())) / 60));

export async function fetchTogether(): Promise<TogetherCounts | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/together?day=${localDay()}&prev=${prevDay()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/** Katılır (bugün ilk kezse sayılır) ve güncel sayıları döner. */
export async function joinTogether(): Promise<TogetherCounts | null> {
  const day = localDay();
  const key = JOINED_PREFIX + day;
  try {
    if (await AsyncStorage.getItem(key)) return fetchTogether();
    const res = await fetch(`${BACKEND_URL}/together/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day, prev: prevDay() }),
    });
    if (!res.ok) return null;
    await AsyncStorage.setItem(key, '1');
    return await res.json();
  } catch { return null; }
}

/** Bir dakikayı tamamlayınca: bu akşamı kaydeder, kaçıncı akşam olduğunu döner. */
export async function recordTogetherEvening(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(DAYS_KEY);
    const days: string[] = raw ? JSON.parse(raw) : [];
    const today = localDay();
    if (!days.includes(today)) days.push(today);
    await AsyncStorage.setItem(DAYS_KEY, JSON.stringify(days.slice(-400)));
    return days.length;
  } catch { return 1; }
}
