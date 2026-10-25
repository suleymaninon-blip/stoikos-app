import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useLang } from '../constants/i18n';
import { topUpReminders } from '../constants/notify';

/**
 * Bildirim takvimini taze tutar ve bildirime dokununca ilgili ekranı açar (yalnız iOS/Android).
 * - Uygulama açılınca, öne gelince ve dil değişince önümüzdeki 14 günün bildirimlerini yeniden kurar.
 * - Akşam bildirimi `data.url` taşır → Pratik ekranı açılır ve günlük kartına kaydırılır.
 */
export function ReminderSync() {
  const { lang, ready } = useLang();

  useEffect(() => {
    if (Platform.OS === 'web' || !ready) return;
    topUpReminders(lang);
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') topUpReminders(lang); });
    return () => sub.remove();
  }, [lang, ready]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (r: Notifications.NotificationResponse | null) => {
      const url = r?.notification.request.content.data?.url;
      if (typeof url !== 'string') return;
      // Aynı dokunuş bir sonraki açılışta tekrar işlenmesin.
      Notifications.clearLastNotificationResponseAsync?.().catch(() => {});
      setTimeout(() => router.push(url as any), 300);
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);

  return null;
}
