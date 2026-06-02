import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './i18n';

export const NOTIFY_STORAGE = 'stoikos_notify_enabled';

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
  const ok = await ensurePermission();
  if (!ok) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Günlük Hatırlatıcı',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  const tx = TEXTS[lang];

  await Notifications.scheduleNotificationAsync({
    content: { title: tx.morningT, body: tx.morningB },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0 },
  });
  await Notifications.scheduleNotificationAsync({
    content: { title: tx.eveningT, body: tx.eveningB },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
  });

  await AsyncStorage.setItem(NOTIFY_STORAGE, '1');
  return true;
}

export async function disableReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(NOTIFY_STORAGE, '0');
}

// Dil değişince, açıksa hatırlatıcıları yeni dille yeniden kur
export async function refreshRemindersLanguage(lang: Lang): Promise<void> {
  if (await isNotifyEnabled()) {
    await enableReminders(lang);
  }
}
