import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './i18n';
import { getMorningNudge, getReflectionPromptFor } from './content';

export const NOTIFY_STORAGE = 'stoikos_notify_enabled';

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

// Günlük sabah (09:00) ve akşam (21:00) hatırlatıcıları kur
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
  const now = new Date();
  for (let i = 0; i < SCHEDULE_DAYS; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const morning = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    const evening = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 21, 0);
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
