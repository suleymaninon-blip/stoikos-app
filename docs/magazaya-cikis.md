# Mağazaya Çıkış — Yol Haritası

> Bu dosya, App Store ve Google Play'e çıkış sürecinin durumunu tutar.
> Alınan kararlar, kalan işler ve kolay unutulan tuzaklar burada.
> Genel proje bilgisi için `CLAUDE.md`.

## Alınan kararlar

| Konu | Karar |
|---|---|
| Para modeli | Freemium. İçerik bedava, **yalnız koç** abonelik. |
| Fiyat | **$6,99 / ay** |
| Dönem | Aylık birincil. Yıllık (~$49,99, %40 indirim) **eklenmedi** — istenirse eklenebilir, aylığı kaldırmadan. |
| Platform | **iOS + Android**, ikisi birden |
| Google hesap türü | **Kişisel** (kurumsal değil) |
| Hesap sahibi | **Eş adına** — kimlik doğrulaması, sözleşme onayı, banka hesabı ve vergi yükümlülüğü onun üzerinde |
| Yayınlanacak adres | **Ev adresi** (sanal ofis tercih edilmedi) |

## Şu an canlıda ne var

Kod tarafı hazır. Aşağıdakiler `main`'de ve yayında:

- **Ücretsiz kota** — `FREE_COACH_MESSAGES` (backend), KV'de `used:<userId>` ömür boyu sayacı, dolunca `402` + `quota_exceeded`. `GET /coach/quota?userId=` kalan hakkı döner. Hak yalnız başarılı yanıttan sonra düşer.
- **Ödeme duvarı arayüzü** — `components/Paywall.tsx`, koç başlığında kalan hak rozeti, hak bitince tek eylem butonu. 6 dilde.
- **Geçmiş kırpma** — `MAX_HISTORY_MESSAGES = 12` (backend, yetkili yer) + uygulama son 24 mesajı yükler. Maliyet mesaj başına sabitlendi.
- **Dil düzeltmesi** — backend 429'a `scope` (`minute`/`day`) ekledi, çeviriyi uygulama yapıyor. Eskiden tüm hata metinleri Türkçeydi.
- **Otomatik deploy** — `backend/` değişip `main`'e push edilince Worker deploy olur (`.github/workflows/deploy-backend.yml`, repo secret `CLOUDFLARE_API_TOKEN`).

## Kritik yol

**Google'ın 14 günlük kuralı takvimi belirliyor.** 13 Kasım 2023'ten sonra açılan **kişisel** Play hesapları, yayına çıkmadan önce **12 testçiyle 14 gün kesintisiz kapalı test** yapmak zorunda. Kurumsal hesaplar muaf — biz kişisel seçtik, yani bu şart bizde geçerli.

Sayaç, **build'i Play'e yükledikten sonra** başlıyor. Bu yüzden build'i erken almak gerekiyor:

```
1. Hesaplar (Apple + Google)        → 2-5 gün, onay bekler
2. EAS build (RevenueCat'siz olur)  → yarım gün
3. Play'e kapalı test yükle          → 14 GÜNLÜK SAYAÇ BAŞLAR
4. ⬇ Bu 14 gün beklerken yapılacaklar (paralel):
     - RevenueCat bağlama
     - Abonelik ürünlerini iki mağazada oluşturma
     - Ödeme ekranı zorunlu bilgileri
     - Ekran görüntüleri
5. Son build + gönderim              → 1-3 gün inceleme
```

14 günü boş geçirme; asıl iş o sırada yapılıyor. Ama sayacı geç başlatırsak sonda iki hafta kaybediyoruz.

## Kod tarafında kalan işler

Bunlar mağazaya çıkmadan **mutlaka** yapılacak:

### 1. `FREE_COACH_MESSAGES` = 50 → **5**
`backend/src/index.ts`. Şu an 50, çünkü test grubu sınırsız kullanıyordu ve 5'e indirmek onları satın alınabilir bir şey yokken duvara çarptırırdı. **Yayına çıkarken 5 yapılacak.**

### 2. Kullanım Koşulları (EULA) — **yok**
Apple, abonelik satan uygulamalarda hem gizlilik politikası hem **kullanım koşulları** bağlantısı istiyor. Gizlilik politikamız var (`public/gizlilik.html`, `public/privacy.html`), koşullar yok. Apple'ın hazır **standart EULA**'sı kullanılabilir; kendi metnini yazmak şart değil. Bu, sık görülen ret sebeplerinden.

### 3. Ödeme ekranı zorunlu bilgileri — **eksik**
Apple, ödeme ekranında şunların görünmesini şart koşuyor:
- Aboneliğin adı
- Süresi (aylık)
- Fiyatı ($6,99/ay)
- Gizlilik politikası **ve** kullanım koşulları bağlantıları

`components/Paywall.tsx`'te bunların hiçbiri yok — fiyat yeni belirlendi. RevenueCat bağlanırken eklenecek.

### 4. RevenueCat bağlama
- `hasActiveSubscription()` (backend) şimdilik KV stub'ı: `sub:<userId>` = `'1'` → sınırsız. Test hesabı işaretlemek için kullanılabilir.
- Gerçek doğrulama **sunucuda** yapılacak: `GET https://api.revenuecat.com/v1/subscribers/<userId>` → `entitlements.coach.expires_date`. Uygulamadan gelen "ben aboneyim" bilgisine güvenilmez.
- RevenueCat `appUserId` = bizim `userId` (aynı değer).
- Arayüzde tek bağlantı noktası: `Paywall`'a `onSubscribe` prop'u geçmek. Verilmediğinde buton "YAKINDA" durumunda kalıyor — kasten böyle, satın alınamayan bir butona "ABONE OL" yazmamak için.

### 5. Node sürümü (acil değil)
Her iki workflow da `node-version: 20` kullanıyor; GitHub bunu kullanımdan kaldırıyor ve işleri Node 24'e zorluyor. Uyarı düzeyinde, şimdilik çalışıyor. Fırsat olunca 22'ye çekilecek.

## Mağaza tarafında kalan işler

### Hesaplar

**Google Play — ✅ hesap açıldı** (5 Eylül 2026)
- Geliştirici adı: **stoikos** · Kişisel hesap · Hesap Kimliği `6149932770313324165`
- Sahip Google hesabı: `bilgeinon@gmail.com` (eş) — **kalıcı, değiştirilemez**
- $25 ödendi, ödeme profili bağlandı (Bireysel / Türkiye)
- ⏳ Kalan doğrulamalar:
  1. **Kimlik belgesi** — yüklendi/yüklenecek, Google onayı birkaç gün
  2. **Telefon doğrulama** — kimlik onayından *sonra* açılıyor
  3. **Android cihaz doğrulama** — Play Console mobil uygulamasına gerçek bir Android cihazdan giriş gerekiyor. **Elimizde Android telefon yok**, çözülecek.
- ⚠️ Bu üç doğrulama bitmeden **uygulama oluşturulamıyor** (Play Console'da "Uygulama oluştur" kilitli).

**Apple Developer — ⏳ henüz başlanmadı**
- developer.apple.com/programs/enroll, $99/yıl, Individual/Sole Proprietor, 2FA açık olmalı. Onay 24-48 saat.
- Google'ın onayını beklemeye gerek yok, paralel yürütülmeli.

### Android cihaz ihtiyacı (tek seferlik değil)

Android telefona birden fazla noktada ihtiyaç var — "sonra hallederiz" derken bunları hesaba kat:
1. Play Console cihaz doğrulaması (yukarıda)
2. 12 testçinin **hepsi** Android kullanıcısı olmalı
3. Build'i yayına vermeden kendin denemek

Emülatör 3. madde için iş görür ama **cihaz doğrulaması için gerçek cihaz gerekiyor**.

Bireysel/kişisel hesapta mağazada **yasal ad** görünüyor ("Stoikos" değil). Google, ücretli/abonelikli uygulamalarda **herkese açık fiziksel adres** yayınlıyor.

### Gereken varlıklar
- Uygulama simgesi — Apple 1024×1024, Play 512×512, saydamlık yok (`assets/icon.png` mevcut, boyut kontrol edilecek)
- iPhone ekran görüntüleri — 6.7" (1290×2796), en az 3
- Android ekran görüntüleri — telefon, en az 2
- Play öne çıkan görsel — 1024×500 (zorunlu)
- Gizlilik politikası bağlantısı — mevcut; `stoikos.app` altına taşımak daha iyi görünür
- Yaş sınırı anketi
- Kategori — öneri: Sağlık ve Fitness (birincil), Yaşam Tarzı (ikincil)

### 12 testçi
Android kullanan 12 kişi gerekiyor, Gmail adresleriyle. 14 gün boyunca **kesintisiz** kayıtlı kalmalılar; çıkıp giren sayılmıyor. Mevcut test grubundan Android kullananlar buraya yönlendirilebilir.

## Maliyet modeli

Geçmiş kırpma sonrası maliyet öngörülebilir:

| | Değer |
|---|---|
| Mesaj başına | ~$0,025 (sabit, konuşma uzunluğundan bağımsız) |
| Ağır kullanıcı (150 mesaj/ay) | ~$3,75 |
| $6,99'dan eline geçen (ilk yıl, %30 komisyon) | ~$4,89 |

Kırpma öncesi 50. mesaj ~$0,09, 100. mesaj ~$0,17 idi ve tavanı yoktu — ağır kullanıcı aylık ~$9 maliyet çıkarabiliyordu, yani abonelikten fazla.

$4,99'a inilirse eline $3,49 geçer ve ağır kullanıcıda zarar riski doğar. **$6,99'un altı önerilmiyor.**

Model kullanımı: koç `claude-sonnet-4-6`, hafıza özeti ve moderasyon `claude-haiku-4-5`. Sistem promptunun sabit kısmı cache'leniyor (hafıza bloğu ayrı, cache'i bozmasın diye).

⚠️ Sonnet 4.6'nın minimum cache eşiği 1024 token ve sabit promptumuz sınıra yakın. Yanıttaki `usage.cache_read_input_tokens` sıfır geliyorsa cache çalışmıyor demektir — o zaman ya prompta ekleme yapılır ya caching kaldırılır.

## Bağlantılar

- **Mağaza metinleri** (6 dil, karakter sınırları doğrulanmış, kopyala düğmeli):
  https://claude.ai/code/artifact/f17fb2ac-76fe-4c7f-a16b-8381f772d3fb
- Canlı web sürümü: https://suleymaninon-blip.github.io/stoikos-app
- Backend: https://stoikos-backend.stoikos-app.workers.dev
