import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './i18n';
import { getMorningNudge, getReflectionPromptFor } from './content';
import { loadActiveDays } from './lifeWeeks';

export const NOTIFY_STORAGE = 'stoikos_notify_enabled';

/**
 * Hatırlatıcı saatleri kullanıcının (30 Ekim 2026; önce sabit 09:00 / 21:00'dı).
 * Dakika cinsinden gece yarısından itibaren saklanır; Ayarlar'da 15'er dakikalık
 * adımlarla değişir. Sabah 05:00–12:00, akşam 17:00–23:45 arası.
 */
export type ReminderKind = 'morning' | 'evening';
const TIME_KEY: Record<ReminderKind, string> = { morning: 'stoikos_notify_morning', evening: 'stoikos_notify_evening' };
const DEFAULT_MIN: Record<ReminderKind, number> = { morning: 9 * 60, evening: 21 * 60 };
export const TIME_RANGE: Record<ReminderKind, [number, number]> = { morning: [5 * 60, 12 * 60], evening: [17 * 60, 23 * 60 + 45] };
export const TIME_STEP = 15;

export async function getReminderTimes(): Promise<Record<ReminderKind, number>> {
  const out = { ...DEFAULT_MIN };
  try {
    const [m, e] = await AsyncStorage.multiGet([TIME_KEY.morning, TIME_KEY.evening]);
    const pm = Number(m[1]), pe = Number(e[1]);
    if (m[1] !== null && Number.isFinite(pm)) out.morning = pm;
    if (e[1] !== null && Number.isFinite(pe)) out.evening = pe;
  } catch {}
  return out;
}

/** Saati kaydeder; hatırlatıcılar açıksa takvimi yeni saatle yeniden kurar. */
export async function setReminderTime(kind: ReminderKind, minutes: number, lang: Lang): Promise<void> {
  const [lo, hi] = TIME_RANGE[kind];
  const v = Math.min(hi, Math.max(lo, Math.round(minutes / TIME_STEP) * TIME_STEP));
  await AsyncStorage.setItem(TIME_KEY[kind], String(v));
  await topUpReminders(lang);
}

export const formatTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Zamanlanmış yerel bildirim WEB'DE YOK.
 *
 * Tarayıcıların "her gün 09:00'da bildirim gönder" diye bir API'si bulunmuyor
 * (Notification Triggers önerisi terk edildi); expo-notifications da bu yüzden
 * scheduleNotificationAsync / cancelAllScheduledNotificationsAsync'i web'de
 * desteklemiyor — çağrılınca FIRLATIYOR ("... is not available on web").
 * Önceden bu hata Onboarding'de boş bir catch'le yutuluyor, Ayarlar'da hiç
 * yakalanmıyordu: kullanıcı düğmeye basıyor, hiçbir şey olmuyordu.
 * Mobil uygulamada (iOS/Android) sorunsuz çalışır.
 */
export const REMINDERS_SUPPORTED = Platform.OS !== 'web';

// Bildirim metinleri (4 dil)
const TEXTS: Record<Lang, { morningT: string; morningB: string; eveningT: string; eveningB: string }> = {
  tr: {
    morningT: 'Sabah Niyeti 🌅',
    morningB: 'Bugün yalnızca kontrolündekine odaklan. Birkaç dakikanı ayır.',
    eveningT: 'Akşamın Yansıması 🌙',
    eveningB: 'Günü değerlendir: nerede iyiydin, nerede daha iyi olabilirdin?',
  },
  en: {
    morningT: 'Morning Intention 🌅',
    morningB: 'Focus only on what is in your control today. Take a few minutes.',
    eveningT: 'Evening Reflection 🌙',
    eveningB: 'Review your day: where were you good, where could you improve?',
  },
  de: {
    morningT: 'Morgenvorsatz 🌅',
    morningB: 'Konzentriere dich heute nur auf das, was in deiner Macht steht.',
    eveningT: 'Abendreflexion 🌙',
    eveningB: 'Lass den Tag Revue passieren: Wo warst du gut, wo könntest du besser sein?',
  },
  ru: {
    morningT: 'Утренний настрой 🌅',
    morningB: 'Сегодня сосредоточься только на том, что в твоей власти.',
    eveningT: 'Вечернее размышление 🌙',
    eveningB: 'Подведи итоги дня: где был хорош, где можно лучше?',
  },
  fr: {
    morningT: 'Intention du matin 🌅',
    morningB: "Concentre-toi aujourd'hui sur ce qui est en ton pouvoir. Prends quelques minutes.",
    eveningT: 'Réflexion du soir 🌙',
    eveningB: 'Repense à ta journée : où as-tu bien agi, où aurais-tu pu mieux faire ?',
  },
  es: {
    morningT: 'Intención de la mañana 🌅',
    morningB: 'Hoy concéntrate solo en lo que está en tu poder. Tómate unos minutos.',
    eveningT: 'Reflexión de la tarde 🌙',
    eveningB: 'Repasa tu día: ¿dónde estuviste bien, dónde podrías mejorar?',
  },
};

// Uygulama önplandayken de bildirim göster
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function isNotifyEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(NOTIFY_STORAGE)) === '1';
}

async function ensurePermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Günlük sabah ve akşam hatırlatıcılarını kullanıcının seçtiği saatlerde kur
export async function enableReminders(lang: Lang): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  const ok = await ensurePermission();
  if (!ok) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Günlük Hatırlatıcı',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await AsyncStorage.setItem(NOTIFY_STORAGE, '1');
  await scheduleAll(lang);
  return true;
}

/**
 * Her gün DEĞİŞEN bildirimler (25 Ekim 2026). Eskiden iki DAILY tetikleyici her gün aynı cümleyi
 * gönderiyordu; birkaç günde okunmaz olur. Artık önümüzdeki SCHEDULE_DAYS gün için tek tek tarihli
 * bildirim kuruluyor: sabah o günün kavramı/pratiği ya da kısa bir söz, akşam o günün yansıma sorusu
 * (Pratik'teki soruyla aynı). Akşam bildirimine dokununca Pratik → günlük açılır (_layout → ReminderSync).
 * iOS en çok 64 bekleyen bildirime izin veriyor: 14 gün × 2 = 28. Uygulama her öne geldiğinde
 * `topUpReminders` takvimi yeniden kurar; kullanıcı iki hafta açmasa son gün yine eski sabit metne düşmez,
 * yalnız bildirimler biter (bu da "uygulamayı açmayan" kullanıcıyı bombardımana tutmamak demek).
 */
const SCHEDULE_DAYS = 14;
export const EVENING_URL = '/practice?focus=journal';

async function scheduleDays(lang: Lang): Promise<void> {
  const tx = TEXTS[lang] ?? TEXTS.en;
  const times = await getReminderTimes();
  const now = new Date();
  for (let i = 0; i < SCHEDULE_DAYS; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const morning = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(times.morning / 60), times.morning % 60);
    const evening = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(times.evening / 60), times.evening % 60);
    if (morning > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: tx.morningT, body: getMorningNudge(lang, day) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: morning },
      });
    }
    if (evening > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title: tx.eveningT, body: getReflectionPromptFor(lang, day), data: { url: EVENING_URL } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: evening },
      });
    }
  }
}

/**
 * Hayat haftaları: her pazar 20:30 (30 Ekim 2026). iPhone duvar kağıdını uygulama değiştiremiyor;
 * kullanıcı yeni haftayla resmi yeniden kaydetsin diye hatırlatılır. Günlük hatırlatıcılardan bağımsız
 * bir tercih; dokununca oluşturucu açılır.
 * Metin geriye değil ileriye bakar ("bir hafta daha doldu" moral bozuyordu): o hafta uygulamada bir şey
 * yapıldıysa kaç gün yapıldığını söyler ve yeni halkayı eklemeye çağırır; boş geçtiyse suçlamaz,
 * yeni haftaya bakar. Bildirim içeriği kurulurken sabitlendiği için yalnız ilk pazar sayıyı taşır;
 * sonrakiler nötr metinle kurulur. Uygulama her açıldığında takvim yeniden kurulduğundan sayı tazelenir.
 */
export const WEEKS_REMINDER_KEY = 'stoikos_weeks_sunday';
export const WEEKS_URL = '/wallpaper';
const ruDays = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'день' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'дня' : 'дней');
const WEEKS_TEXT: Record<Lang, { t: string; active: (n: number) => string; idle: string }> = {
  tr: { t: 'Hayat haftaları', active: (n) => `Bu hafta ${n} gün pratik yaptın. Yeni halkanı duvar kağıdına ekle.`, idle: 'Yeni bir hafta başlıyor. Ona ne katacaksın?' },
  en: { t: 'Life in weeks', active: (n) => `You practiced on ${n} ${n === 1 ? 'day' : 'days'} this week. Add your new ring to your wallpaper.`, idle: 'A new week begins. What will you put into it?' },
  de: { t: 'Leben in Wochen', active: (n) => `Diese Woche hast du an ${n} ${n === 1 ? 'Tag' : 'Tagen'} geübt. Füge deinem Hintergrund den neuen Ring hinzu.`, idle: 'Eine neue Woche beginnt. Was wirst du ihr geben?' },
  ru: { t: 'Жизнь в неделях', active: (n) => `На этой неделе ты практиковал(а) ${n} ${ruDays(n)}. Добавь новое кольцо на обои.`, idle: 'Начинается новая неделя. Что ты в неё вложишь?' },
  fr: { t: 'La vie en semaines', active: (n) => `Cette semaine, tu as pratiqué ${n} jour${n > 1 ? 's' : ''}. Ajoute ton nouvel anneau à ton fond d’écran.`, idle: 'Une nouvelle semaine commence. Qu’y mettras-tu ?' },
  es: { t: 'La vida en semanas', active: (n) => `Esta semana practicaste ${n} ${n === 1 ? 'día' : 'días'}. Añade tu nuevo anillo al fondo de pantalla.`, idle: 'Empieza una nueva semana. ¿Qué pondrás en ella?' },
};

/** Önümüzdeki pazarlar 20:30 (bugün pazarsa ve saat geçmediyse bugün de). */
function nextSundays(count: number, now = new Date()): Date[] {
  const out: Date[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((7 - now.getDay()) % 7), 20, 30);
  if (d <= now) d.setDate(d.getDate() + 7);
  for (let i = 0; i < count; i++) out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i * 7, 20, 30));
  return out;
}

async function scheduleWeeks(lang: Lang): Promise<void> {
  const w = WEEKS_TEXT[lang] ?? WEEKS_TEXT.en;
  const sundays = nextSundays(3);
  // İlk pazarın haftası: pazartesi 00:00 → pazar
  const first = sundays[0];
  const monday = new Date(first.getFullYear(), first.getMonth(), first.getDate() - 6);
  const days = (await loadActiveDays()).filter((d) => d >= monday && d <= first).length;
  for (let i = 0; i < sundays.length; i++) {
    const body = i === 0 && days > 0 ? w.active(days) : w.idle;
    await Notifications.scheduleNotificationAsync({
      content: { title: w.t, body, data: { url: WEEKS_URL } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: sundays[i] },
    });
  }
}

export async function isWeeksReminderOn(): Promise<boolean> {
  return (await AsyncStorage.getItem(WEEKS_REMINDER_KEY)) === '1';
}

/** Pazar hatırlatmasını açar/kapatır. Açarken izin ister; verilmezse false döner. */
export async function setWeeksReminder(on: boolean, lang: Lang): Promise<boolean> {
  if (!REMINDERS_SUPPORTED) return false;
  if (on && !(await ensurePermission())) return false;
  await AsyncStorage.setItem(WEEKS_REMINDER_KEY, on ? '1' : '0');
  await scheduleAll(lang);
  return true;
}

/** Bütün takvimi baştan kurar: açıksa 14 günlük sabah/akşam + açıksa pazar hatırlatması. */
async function scheduleAll(lang: Lang): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (await isNotifyEnabled()) await scheduleDays(lang);
  if (await isWeeksReminderOn()) await scheduleWeeks(lang);
}

/** Açıksa takvimi bugünden itibaren yeniden kurar (uygulama öne gelince ve dil değişince). İzin istemez. */
export async function topUpReminders(lang: Lang): Promise<void> {
  if (!REMINDERS_SUPPORTED) return;
  if (!(await isNotifyEnabled()) && !(await isWeeksReminderOn())) return;
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (perm.granted) await scheduleAll(lang);
  } catch {}
}

/** Tüm verileri silerken: günlük ve pazar hatırlatmalarının hepsini kaldırır. */
export async function cancelAllReminders(): Promise<void> {
  await AsyncStorage.multiSet([[NOTIFY_STORAGE, '0'], [WEEKS_REMINDER_KEY, '0']]);
  if (REMINDERS_SUPPORTED) await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function disableReminders(lang: Lang = 'tr'): Promise<void> {
  await AsyncStorage.setItem(NOTIFY_STORAGE, '0');
  if (REMINDERS_SUPPORTED) await scheduleAll(lang);
}

// Dil değişince, açıksa hatırlatıcıları yeni dille yeniden kur
export async function refreshRemindersLanguage(lang: Lang): Promise<void> {
  await topUpReminders(lang);
}
