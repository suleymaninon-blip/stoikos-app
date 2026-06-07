import { Platform } from 'react-native';

/**
 * Web'de service worker'ı kaydeder ve yeni sürüm gelince açık sekmeyi
 * BİR KEZ otomatik yeniler. Native'de (Expo Go) hiçbir şey yapmaz.
 *
 * Akış: sw.js ağ-öncelikli olduğu için tarayıcı her gezinmede yeni sürümü
 * fark eder → installing worker 'installed' olur → eski bir SW kontrol
 * ediyorsa (yani gerçek bir güncelleme) sayfayı yenileriz. İlk kurulumda
 * controller olmadığı için yenileme yapılmaz (gereksiz reload yok).
 */
export function registerServiceWorker() {
  if (Platform.OS !== 'web') return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const base = process.env.EXPO_BASE_URL || '';
  const swUrl = `${base}/sw.js`;

  let reloaded = false;
  const reloadOnce = () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          // Yeni worker kuruldu VE zaten bir worker kontrol ediyordu → bu bir
          // güncelleme (ilk kurulum değil). Açık sekmeyi taze sürüme yenile.
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            reloadOnce();
          }
        });
      });
      // Sayfa açıkken arada güncelleme var mı diye periyodik kontrol
      reg.update().catch(() => {});
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    }).catch(() => {
      // sessiz geç — SW kaydı başarısızsa uygulama yine de çalışır
    });
  });
}
