/**
 * Stoikos web service worker — otomatik güncelleme.
 *
 * Amaç: test edenlerin "eski sürüm cache'te kaldı" derdini bitirmek.
 *  - HTML/navigation istekleri AĞ-ÖNCELİKLİ → index.html her zaman taze gelir,
 *    dolayısıyla en güncel JS bundle hash'ine yönlenir (bayat sürüm kalmaz).
 *  - Hash'li statik varlıklar (immutable) cache-first → hızlı + çevrimdışı çalışır.
 *  - install'da skipWaiting + activate'te clients.claim → yeni sürüm anında devralır.
 *  - Yeni sürüm gelince eski cache'ler silinir.
 *
 * Yeni dağıtımda otomatik güncelleme zaten çalışır; istersen elle tetiklemek için
 * VERSION'ı artırman yeterli (eski cache'leri de temizler).
 */
const VERSION = 'stoikos-v1';

self.addEventListener('install', () => {
  // Bekleme yapma, hemen aktif olmaya hazırlan.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Sayfa gezinmesi (HTML) → ağdan al, çevrimdışıysa cache'e düş.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Aynı origin'den hash'li varlıklar → cache-first (değişmez), yoksa ağdan çek + cache'le.
  if (new URL(req.url).origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      const cache = await caches.open(VERSION);
      cache.put(req, fresh.clone());
      return fresh;
    })());
  }
});
