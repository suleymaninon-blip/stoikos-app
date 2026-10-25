# Apple kurulumu — onaydan TestFlight'a

> Apple Developer onayı: 22 Ekim 2026 (hesap Bilge İnön adına, bireysel).
> Bu sayfadaki değerler koda yazılacak; **değiştirmeden** gir. Değiştirmek
> gerekirse önce Claude'a söyle.

## Sıra

1. Sözleşme, banka, vergi (abonelik satmanın ön şartı)
2. Süleyman'ı ekibe ekle (isteğe bağlı ama önerilir)
3. Paket kimliği (Bundle ID)
4. App Store Connect'te uygulama kaydı
5. Abonelik ürünleri
6. İki anahtar: EAS için API anahtarı, RevenueCat için uygulama içi satın alma anahtarı
7. → Claude: RevenueCat bağlantısı + ilk TestFlight derlemesi

---

## 1. Sözleşme, banka, vergi — önce bu
**App Store Connect → İş (Business)**
- **Ücretli Uygulamalar Sözleşmesi (Paid Apps Agreement)** → kabul et.
- **Banka hesabı** ekle: hesap **Bilge İnön adına** olmalı (geliştirici hesabı onun). Türk lirası IBAN olur.
- **Vergi formları**: ABD vergi formu **W-8BEN** (bireysel, ABD dışı). Türkiye–ABD vergi anlaşması kısmında "Turkey" seçilir.
- Durum **"Etkin / Active"** olana kadar abonelikler **test bile edilemez**. Onay birkaç saat–birkaç gün sürebilir; bu yüzden ilk iş.

## 2. Süleyman'ı ekibe ekle (önerilir)
**Kullanıcılar ve Erişim → +** → Süleyman'ın Apple kimliği (e-posta) → rol **Yönetici (Admin)**.
Böylece her işlem için Bilge Hanım'ın hesabına girmek gerekmez. (Sözleşme ve banka adımlarını yalnız hesap sahibi yapabilir.)

## 3. Paket kimliği
**developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → +** → **App IDs** → **App**
- Description: `Stoikos`
- Bundle ID: **Explicit** → `com.stoikos.app`
- Capabilities: Uygulama İçi Satın Alma (zaten açık) + **HealthKit** (25 Ekim 2026'dan beri; nefes seansları "Farkındalık dakikaları"na yazılıyor). EAS derleme sırasında yetenekleri kendisi eşitler; elle açmak gerekirse Identifiers → com.stoikos.app → HealthKit ✓. Push Notifications **gerekmez** — hatırlatıcılar cihazda yerel.

## 4. Uygulama kaydı
**App Store Connect → Uygulamalar → + → Yeni Uygulama**
| Alan | Değer |
|---|---|
| Platform | iOS |
| Ad | `Stoikos` — alınmışsa `Stoikos: Stoacı Bilgelik` |
| Birincil dil | Türkçe |
| Paket kimliği | `com.stoikos.app` |
| SKU | `stoikos-ios` |
| Kullanıcı erişimi | Tam erişim |

Mağaza metinleri ve ekran görüntüleri hazır (`docs/magazaya-cikis.md`, `store-assets/iphone-*.png`); yayın sayfası sonra doldurulur, TestFlight için gerekmez.

## 5. Abonelik ürünleri
**Uygulama → Para Kazanma (Monetization) → Abonelikler → Abonelik Grubu oluştur**
- Grup adı: **Stoikos Plus** · Görünen ad (TR): `Stoikos Plus` · (EN): `Stoikos Plus`

Gruba iki abonelik ekle:

| | Yıllık | Aylık |
|---|---|---|
| Referans adı | Stoikos Plus Yıllık | Stoikos Plus Aylık |
| **Ürün kimliği** | **`com.stoikos.app.plus.annual`** | **`com.stoikos.app.plus.monthly`** |
| Süre | 1 yıl | 1 ay |
| Fiyat | **49,99 USD** (diğer ülkeler Apple'ın eşdeğeriyle otomatik) | **6,99 USD** |
| Grup içi sıra (Level) | 1 (üstte) | 2 |
| Görünen ad TR / EN | Yıllık · Annual | Aylık · Monthly |
| Açıklama TR | Koç, tüm programlar ve sesli anlatım — yıllık | Koç, tüm programlar ve sesli anlatım — aylık |
| Açıklama EN | Coach, all programs and audio — yearly | Coach, all programs and audio — monthly |

**Giriş teklifi (Introductory Offer)** — her iki üründe: **Ücretsiz deneme, 2 hafta**, tüm ülkeler.

**İnceleme bilgisi** (her ürün için): ekran görüntüsü olarak `store-assets/iphone-7-plus.png`; not: "Stoikos Plus unlocks the AI coach, all guided programs and concept audio."

⚠️ Ürün kimlikleri bir kez kaydedilince **değiştirilemez ve silinse bile yeniden kullanılamaz** — yukarıdakileri harfi harfine gir.

## 6. İki anahtar
**a) EAS için App Store Connect API anahtarı** (derleme ve TestFlight'a yükleme)
Kullanıcılar ve Erişim → Entegrasyonlar → **App Store Connect API** → + → ad `EAS`, erişim **App Manager** → `.p8` indir (tek sefer), **Key ID** ve **Issuer ID**'yi not al → expo.dev → stoikos → Credentials → iOS → App Store Connect API Key → ekle. Ayrıntı: `docs/eas-build.md`.

**b) RevenueCat için Uygulama İçi Satın Alma anahtarı**
Kullanıcılar ve Erişim → Entegrasyonlar → **Uygulama İçi Satın Alma (In-App Purchase)** → + → ad `RevenueCat` → `.p8` indir, **Key ID**'yi not al. (Issuer ID a'daki ile aynı.)

Bu dosyaları sohbete **yapıştırma**; RevenueCat ve Expo panellerine kendin yükle. Claude'a yalnız "yüklendi" de.

## 7. Sonra Claude'un yapacakları
1. RevenueCat hesabı (revenuecat.com, ücretsiz başlangıç — Süleyman açar) → iOS uygulaması ekle (`com.stoikos.app`), 6b anahtarını yükle, **entitlement** `plus`, **offering** `default` (yıllık + aylık paket).
2. Uygulamaya `react-native-purchases`: ödeme ekranında gerçek fiyatlar (ülkeye göre), satın alma, geri yükleme, Kullanım Koşulları bağlantısı.
3. Sunucuda abonelik doğrulaması (RevenueCat REST), `WEEKLY_FREE_QUOTA = true`.
4. İlk **TestFlight** derlemesi → telefonda test (sandbox satın alma, bildirimler, ses, ikon).
5. En son `ENFORCE_PLUS_GATE = true` → mağaza incelemesine gönderim.

## App Gizliliği (Uygulama Gizliliği) anketi — yayın sayfasında sorulacak
Gizlilik politikası 1.1 ile uyumlu cevaplar:
- **Takip (Tracking):** Hayır.
- **Toplanan veriler:**
  - *Kullanıcı İçeriği → Diğer kullanıcı içeriği* (koç mesajları, rızayla yansımalar): Uygulama işlevi · kimlikle **ilişkilendirilmez** · takip için değil.
  - *Tanımlayıcılar → Kullanıcı Kimliği* (cihazda üretilen rastgele kimlik): Uygulama işlevi · ilişkilendirilmez.
  - *Satın Almalar → Satın alma geçmişi* (abonelik durumu, RevenueCat): Uygulama işlevi · ilişkilendirilmez.
- Konum, kişiler, sağlık, finans, tarama geçmişi, reklam verisi: **toplanmıyor**.
  - Sağlık: Uygulama Apple Sağlık'a yalnız *yazıyor* (farkındalık dakikaları), hiçbir sağlık verisi okumuyor ve yazdığı veri cihazdan çıkmıyor → "Sağlık ve Fitness" verisi **toplanmıyor** olarak işaretlenir. Mağaza açıklamasında ve gizlilik politikası 1.2'de HealthKit kullanımı belirtildi (Apple şartı).
- Gizlilik politikası adresi: `https://stoikos.app/privacy.html` (TR sayfa: `/gizlilik.html`).
