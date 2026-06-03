// Özellik bayrakları (feature flags)
// Bir özelliği geçici olarak gizlemek için false yap — kod/dosyalar yerinde kalır.
export const FEATURES = {
  // Meydan Okuma (kendi Stoacı sözünü yaz & oyla):
  // Topluluk büyüyüp moderasyon altyapısı (AI ön-filtre + bildir + admin) hazır
  // olunca true yapılacak. Şimdilik kullanıcıya gizli; kod & backend duruyor.
  meydanOkuma: false,
};
