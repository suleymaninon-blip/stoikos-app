// Özellik bayrakları (feature flags)
// Bir özelliği geçici olarak gizlemek için false yap — kod/dosyalar yerinde kalır.
// Destek / paylaşım / mağaza bilgileri (tek yerden düzenle)
export const APP_INFO = {
  supportEmail: 'support@stoikos.app',
  shareUrl: 'https://suleymaninon-blip.github.io/stoikos-app',         // mağazaya çıkınca store linkiyle güncelle
  storeUrl: { ios: '', android: '' },                                  // App Store / Play Store linkleri (yayında doldur)
  privacyUrl: 'https://suleymaninon-blip.github.io/stoikos-app/gizlilik.html', // gizlilik politikası (public/gizlilik.html)
};

export const FEATURES = {
  // Meydan Okuma (kendi Stoacı sözünü yaz & oyla):
  // Topluluk büyüyüp moderasyon altyapısı (AI ön-filtre + bildir + admin) hazır
  // olunca true yapılacak. Şimdilik kullanıcıya gizli; kod & backend duruyor.
  meydanOkuma: false,
};
