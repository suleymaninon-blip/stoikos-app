import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './i18n';
import { getMorningNudge, getReflectionPromptFor } from './content';

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

  await scheduleDays(lang);
  await AsyncStorage.setItem(NOTIFY_STORAGE, '1');
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
  await Notifications.cancelAllScheduledNotificationsAsync();
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

/** Açıksa takvimi bugünden itibaren yeniden kurar (uygulama öne gelince ve dil değişince). İzin istemez. */
export async function topUpReminders(lang: Lang): Promise<void> {
  if (!REMINDERS_SUPPORTED || !(await isNotifyEnabled())) return;
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (perm.granted) await scheduleDays(lang);
  } catch {}
}

export async function disableReminders(): Promise<void> {
  if (REMINDERS_SUPPORTED) await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(NOTIFY_STORAGE, '0');
}

// Dil değişince, açıksa hatırlatıcıları yeni dille yeniden kur
export async function refreshRemindersLanguage(lang: Lang): Promise<void> {
  await topUpReminders(lang);
}
