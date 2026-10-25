// Özellik bayrakları (feature flags)
// Bir özelliği geçici olarak gizlemek için false yap — kod/dosyalar yerinde kalır.
// Destek / paylaşım / mağaza bilgileri (tek yerden düzenle)
export const APP_INFO = {
  supportEmail: 'support@stoikos.app',
  shareUrl: 'https://stoikos.app/app',                                  // web sürümü; mağazaya çıkınca store linkiyle güncelle
  storeUrl: { ios: '', android: '' },                                  // App Store / Play Store linkleri (yayında doldur)
  privacyUrl: 'https://stoikos.app/gizlilik.html',
  privacyUrlEn: 'https://stoikos.app/privacy.html',
  termsUrl: 'https://stoikos.app/terms.html',
  termsUrlEn: 'https://stoikos.app/terms-en.html',
  // Apple/Google abonelik yönetimi sayfaları (iptal, plan değişikliği) — App Store incelemesi bunu arıyor
  manageSubUrl: { ios: 'https://apps.apple.com/account/subscriptions', android: 'https://play.google.com/store/account/subscriptions' },
  instagramUrl: 'https://instagram.com/stoikos.app',
};

export const FEATURES = {
  // Meydan Okuma (kendi Stoacı sözünü yaz & oyla):
  // Topluluk büyüyüp moderasyon altyapısı (AI ön-filtre + bildir + admin) hazır
  // olunca true yapılacak. Şimdilik kullanıcıya gizli; kod & backend duruyor.
  meydanOkuma: false,
};

/**
 * ⚠️⚠️ GEÇİCİ — 24 Eylül 2026'da TEST İÇİN KAPATILDI. YAYINDAN ÖNCE `true` YAP.
 *
 * `false` iken istemci tarafındaki Plus kapıları uygulanmıyor: programlar ve
 * kavramların sesli anlatımı herkese açık oluyor. Sebebi şu: RevenueCat
 * bağlanmadığı için ödeme ekranındaki buton "YAKINDA" durumunda, yani test
 * eden kişi satın alarak da içeri giremiyor — kapı kapalıyken programlar hiç
 * denenemiyordu.
 *
 * Etkilediği yerler:
 *   - `app/programs.tsx`          → program kartları
 *   - `app/(tabs)/wisdom.tsx`     → kavram sesli anlatımı
 *
 * Koç bundan ETKİLENMEZ: onun kapısı sunucuda (`hasActiveSubscription`),
 * istemciden açılamaz. Yani bu bayrak gelir kaybı yaratmıyor, yalnızca
 * uygulamayla birlikte zaten gelen yerel içeriğin kilidini kaldırıyor.
 *
 * GERİ ALMA: burayı `true` yap, başka hiçbir yere dokunma.
 */
export const ENFORCE_PLUS_GATE = false;
