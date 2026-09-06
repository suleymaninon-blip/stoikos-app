# Mağazaya Çıkış — Yol Haritası

> Bu dosya, App Store ve Google Play'e çıkış sürecinin durumunu tutar.
> Alınan kararlar, kalan işler ve kolay unutulan tuzaklar burada.
> Genel proje bilgisi için `CLAUDE.md`.
>
> **Ürünün kendisine ve pazara dair değerlendirme:
> `docs/urun-degerlendirmesi.md`** — atıf riski, ücretsiz kota tasarımı,
> yıllık plan gerekçesi, rakipler ve fiyat verisi. Aşağıdaki 5–8. maddeler
> oradan geliyor.

## Alınan kararlar

| Konu | Karar |
|---|---|
| Para modeli | Freemium. **Stoikos Plus** = koç + tüm programlar + sesli anlatım. Alıntılar, kavramlar, filozoflar, nefes ve günlük pratik hep ücretsiz. (6 Eyl 2026'da yalnız-koç modelinden genişletildi; gerekçe `docs/urun-degerlendirmesi.md`.) |
| Deneme | **14 gün ücretsiz** — mağazanın introductory offer'ı, makbuza bağlı, uygulamada sayılmıyor |
| Dönem | **Aylık $6,99 + Yıllık $49,99** (%40 tasarruf, ayda $4,17). Ödeme ekranında yıllık önseçili. |
| Platform | **iOS + Android**, ikisi birden |
| Google hesap türü | **Kişisel** (kurumsal değil) |
| Hesap sahibi | **Eş adına** — kimlik doğrulaması, sözleşme onayı, banka hesabı ve vergi yükümlülüğü onun üzerinde |
| Yayınlanacak adres | **Ev adresi** (sanal ofis tercih edilmedi) |

## Şu an canlıda ne var

Kod tarafı hazır. Aşağıdakiler `main`'de ve yayında:

- **Ücretsiz kota** — `FREE_COACH_MESSAGES` (backend), KV'de `used:<userId>` ömür boyu sayacı, dolunca `402` + `quota_exceeded`. `GET /coach/quota?userId=` kalan hakkı döner. Hak yalnız başarılı yanıttan sonra düşer.
- **Ödeme duvarı arayüzü** — `components/Paywall.tsx`, koç başlığında kalan hak rozeti, hak bitince tek eylem butonu. 6 dilde. (Canlıdaki sürüm hâlâ yalnız-koç metniyle; Plus paketi dalda bekliyor.)
- **Geçmiş kırpma** — `MAX_HISTORY_MESSAGES = 12` (backend, yetkili yer) + uygulama son 24 mesajı yükler. Maliyet mesaj başına sabitlendi.
- **Dil düzeltmesi** — backend 429'a `scope` (`minute`/`day`) ekledi, çeviriyi uygulama yapıyor. Eskiden tüm hata metinleri Türkçeydi.
- **Otomatik deploy** — `backend/` değişip `main`'e push edilince Worker deploy olur (`.github/workflows/deploy-backend.yml`, repo secret `CLOUDFLARE_API_TOKEN`).

## ⚠️ Dalda bekleyen, canlıda OLMAYAN değişiklikler

Aşağıdakiler `claude/stoikosta-wnVG4` dalında; `main`'e **birleştirilmedi**,
dolayısıyla ne web sürümünde ne Worker'da canlı değil.

| Değişiklik | Dosya |
|---|---|
| Koç promptunda uydurma atıf yasağı | `backend/src/index.ts` |
| Atıf dili yumuşatıldı (künyede uyarlama işareti) | `constants/content.ts` |
| Kullanım koşulları (EULA), TR + EN | `public/terms.html`, `public/terms-en.html` |
| Ödeme ekranında fiyat/süre/koşullar | `components/Paywall.tsx`, `constants/i18n.tsx` |
| **Stoikos Plus paketi + kapılar** | `constants/entitlement.tsx`, `app/programs.tsx`, `app/(tabs)/wisdom.tsx`, `backend/src/index.ts` |
| Mağaza görselleri ve üretim betikleri | `store-assets/`, `scripts/shoot-*.js` |
| Mağaza metinleri (artık sürüm kontrolünde) | `scripts/store-content.js`, `scripts/build-store-page.js` |

**Bu paket birleştirilmeye hazır.** `backend/` değişikliği `main`'e girer
girmez Worker otomatik deploy oluyor — ama bu pakette backend'e giren tek şey
koç promptundaki uydurma atıf yasağı, ki saf iyileştirme.

`FREE_COACH_MESSAGES` bilerek **50'de bırakıldı** (bkz. aşağıda 1. madde).
Bir ara 5 yapılmıştı; RevenueCat bağlanmadan canlıya girerse test grubu
satın alınamayan bir duvara çarpacağı için geri alındı. Kotayı düşürmek
yayın için zorunlu, ama sırası RevenueCat'ten sonra.

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

### 1. ⏸️ `FREE_COACH_MESSAGES` — bilerek 50'de bırakıldı
Bir ara 5 yapılmıştı, sonra **kasten geri alındı**: `backend/` `main`'e
girer girmez Worker deploy oluyor ve RevenueCat bağlı olmadığı için duvara
çarpan kullanıcı satın alma yapamıyor (Paywall "YAKINDA" durumunda).

Yayına çıkarken düşürülecek — ama düz "5 ömür boyu" olarak değil; gerekçesi
ve önerilen tasarım 6. maddede.

### 2. ✅ Kullanım Koşulları (EULA)
Yazıldı: `public/terms.html` (TR) ve `public/terms-en.html` (EN). Gizlilik
politikasının tasarımını ve yapısını izliyor. Kapsam: hizmet tanımı, ücretsiz
ve ücretli özellikler, abonelik koşulları (fiyat, dönem, iptal, yenileme),
ödeme ve geri ödeme, sorumluluk reddi (tıbbi/terapötik hizmet değil), fikri
mülkiyet, askıya alma.

Apple'ın hazır standart EULA'sı yerine kendi metnimiz yazıldı; uygulamanın
gerçek işleyişini anlatabilmesi için. 6 Eylül 2026'da **Stoikos Plus modeline
göre güncellendi** (sürüm 1.1): ücretsiz katman, Plus paketi ve 14 günlük
mağaza denemesi ayrı ayrı yazılı. **Avukat kontrolü bekliyor.**

### 3. ✅ Ödeme ekranı zorunlu bilgileri
`components/Paywall.tsx` iki planı yan yana gösteriyor (yıllık $49,99
önseçili + tasarruf rozeti, aylık $6,99), altında seçime göre değişen
yenileme satırı ve koşulları kabul yazısı. Altı dilde.

⚠️ **Dört fiyat dizesi de sabit yazılı** (`paywall.price`, `priceAnnual`,
`perMonth`, `save`). Mağaza yerel para biriminde tahsil edeceği için
RevenueCat'in döndürdüğü yerelleştirilmiş değerler kullanılmalı.

⚠️ **Bağlantılar hâlâ tıklanabilir değil.** Şu an yalnızca "Gizlilik
Politikası ve Kullanım Koşulları'nı kabul ediyorum" cümlesi yazıyor; Apple
ödeme ekranında bu iki belgeye **açılabilir bağlantı** istiyor. RevenueCat
bağlanırken `terms.html` / `gizlilik.html` adreslerine `Linking.openURL` ile
bağlanmalı.

### 4. RevenueCat bağlama
- `hasActiveSubscription()` (backend) şimdilik KV stub'ı: `sub:<userId>` = `'1'` → sınırsız. Test hesabı işaretlemek için kullanılabilir.
- Gerçek doğrulama **sunucuda** yapılacak: `GET https://api.revenuecat.com/v1/subscribers/<userId>` → `entitlements.coach.expires_date`. Uygulamadan gelen "ben aboneyim" bilgisine güvenilmez.
- RevenueCat `appUserId` = bizim `userId` (aynı değer).
- Arayüzde tek bağlantı noktası: `Paywall`'a `onSubscribe` prop'u geçmek. Verilmediğinde buton "YAKINDA" durumunda kalıyor — kasten böyle, satın alınamayan bir butona "ABONE OL" yazmamak için.

### 5. ✅ Yıllık plan — eklendi (6 Eylül 2026)

**$49,99/yıl**, aylığa göre %40 tasarruf (ayda $4,17). Ödeme ekranında iki
plan yan yana; **yıllık önseçili** ve tasarruf rozetiyle işaretli.

Neden eklendi — "istenirse olur" değil, zorunluluk:

- Sağlık & Fitness kategorisinde abonelik gelirinin **%60–68'i** yıllık
  planlardan geliyor.
- Ödeyen abone başına edinme maliyeti **$50–100**. $6,99'dan net ~$5,94 →
  geri kazanım **9–17 ay**. Ama **aylık + yapay zekâ** planlarında 12. ay
  elde tutma **%6,1** (RevenueCat, 1 milyar+ işlem). Aylık planla ücretli
  reklam matematiksel olarak geri dönmüyor; yıllık tek çıkış yolu.
- Nişteki tipik yıllık indirim %40–55. $49,99 bandın alt ucunda.

Fiyatın kendisi sorun değildi: $6,99 global medyanın ($12,99) ve nişin altında.

⚠️ Fiyat karşılaştırması için not: kategori lideri **stoic.** yıllık planını
$39,99'a satıyor (kaynak zayıf, doğrulanmalı). Dönüşüm düşük kalırsa
$44,99'a çekmek düşünülebilir — tek yapılacak `paywall.priceAnnual`,
`paywall.perMonth` ve `paywall.save` dizelerini değiştirmek.

### 6. Ücretsiz koç tadımı — küçük ve taahhütsüz

Model Stoikos Plus'a genişleyince kota sorusu da değişti. Artık asıl demo
**14 günlük mağaza denemesi**: kullanıcı Plus'ın tamamını (koç, programlar,
ses) iki hafta boyunca kullanıyor, bu da hafızanın farklı günlerde
çalıştığını görmeye fazlasıyla yetiyor. Değerlendirmedeki "haftada 3 mesaj"
önerisinin yerini bu aldı.

Geriye tek soru kalıyor: kullanıcı **kart bilgisi vermeden** koçun kalitesini
görebilmeli mi? Görebilmeli — deneme başlatmanın önündeki en büyük engel bu.
Bu yüzden ücretsiz katmanda **birkaç mesajlık taahhütsüz bir tadım** kalıyor
(`FREE_COACH_MESSAGES`, mekanizma zaten çalışıyor).

Yayına çıkarken: tadım küçük bir sayıya çekilecek. Şu an 50 ve bilerek öyle
(1. madde).

### 7. Ödeme ekranındaki fiyat sabit yazılı — düzeltilmeli

`constants/i18n.tsx` → `paywall.price` altı dilde **`$6,99` olarak sabit**.
Ama mağaza Türkiye'de TL, Almanya'da EUR tahsil edecek. Gösterilen fiyatın
tahsil edilenle uyuşmaması hem Apple kılavuzuna aykırı hem kullanıcıyı
yanıltır. RevenueCat'in döndürdüğü **yerelleştirilmiş fiyat dizesi**
kullanılmalı; şu anki değer geçici yer tutucudur.

### 8. Değerlendirme istemi yok — eklenmeli

`expo-store-review` kullanılmıyor; uygulama hiç puan istemiyor. Organik
keşfin en güçlü kaldıracı mağaza puanı ve yorum sayısı. İyi zamanlanmış tek
bir `StoreReview.requestReview()` (7 günlük süreklilikte ya da bir program
bitiminde) muhtemelen en yüksek getirili tek satır.

### 9. Node sürümü (acil değil)
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

**Apple Developer — ⏳ kayıt takıldı** (5 Eylül 2026)
- **2FA açık** ✅ — eşin Apple hesabında iki faktörlü doğrulama zaten
  etkindi (iPhone, Apple Watch ve telefon numarası güvenilir aygıt olarak
  kayıtlı). Apple'ın kayıt ön koşulu bu, karşılanıyor.
- **Kayıt tamamlanamıyor.** developer.apple.com/enroll → "Web'de kayıt devam
  edin" adımında *"Kayıtlarınız tamamlanamadı / Your enrollment could not be
  completed"* dönüyor. Birden çok denemede aynı sonuç.
- Hesap sayfası (developer.apple.com → Hesap) hâlâ "Apple Geliştirici
  Programına Katılın · Bugün kayıt olun" gösteriyor, yani hesap programa
  **kayıtlı değil**; sorun bizim tarafta bir eksik bilgi değil, Apple
  tarafında bir engel gibi görünüyor.
- Denenecekler sırayla: birkaç saat/gün bekleyip tekrar; **Apple Developer
  uygulamasından** kayıt (iPhone/iPad/Mac — web yerine uygulama akışı sık
  çalışıyor); sonuç alınamazsa Apple Developer Support'a başvuru.
- $99 henüz ödenmedi.

### Android cihaz ihtiyacı (tek seferlik değil)

Android telefona birden fazla noktada ihtiyaç var — "sonra hallederiz" derken bunları hesaba kat:
1. Play Console cihaz doğrulaması (yukarıda)
2. 12 testçinin **hepsi** Android kullanıcısı olmalı
3. Build'i yayına vermeden kendin denemek

Emülatör 3. madde için iş görür ama **cihaz doğrulaması için gerçek cihaz gerekiyor**.

Bireysel/kişisel hesapta mağazada **yasal ad** görünüyor ("Stoikos" değil). Google, ücretli/abonelikli uygulamalarda **herkese açık fiziksel adres** yayınlıyor.

### Gereken varlıklar — ✅ görseller hazır

Hepsi `store-assets/` altında, üretim betikleriyle birlikte. Ayrıntı ve
yeniden üretme komutları: **`store-assets/README.md`**.

- ✅ **Ekran görüntüleri** — 5 ekran × 2 boyut: `iphone-*` 1290×2796
  (App Store 6.7"), `android-*` 1080×1920 (Play). Apple en az 3, Play en az
  2 istiyor. Üretim: `node scripts/shoot-store.js` (yerel Expo web
  sunucusundan Playwright ile).
- ✅ **Play öne çıkan görsel** — `play-feature-*.png`, tam 1024×500, altı
  dilde. Üretim: `node scripts/shoot-feature.js`.
- ✅ **Simgeler** — `icon-1024-apple.png`, `icon-512-play.png`; kare, alfa
  kanalı yok. Üretim: `node scripts/make-store-icons.js`.
  Kaynak `assets/icon.png` olduğu gibi yüklenemezdi: alfa kanalı vardı ve
  piksellerin %4,4'ü gerçekten saydamdı (yuvarlatılmış köşeler) — Apple
  bunu reddediyor. Ayrıca köşeleri iki mağaza da kendisi yuvarladığı için
  hazır yuvarlatılmış simge iki kez kırpılıyordu.
- ✅ Gizlilik politikası bağlantısı — mevcut (`gizlilik.html` / `privacy.html`)
- ⏳ Yaş sınırı anketi — mağaza formunda doldurulacak
- ⏳ Kategori — öneri: Sağlık ve Fitness (birincil), Yaşam Tarzı (ikincil)
- ⏳ `constants/config.ts` → `storeUrl` — uygulama yayına girmeden doldurulamaz

**Ekran görüntülerindeki veri gerçek değil**, çekim öncesi `localStorage`'a
tohumlanıyor (dokuz günlük süreklilik, favoriler, koç için elle yazılmış bir
sohbet). İki tuzak betikte çözülü ama elle üretilecekse bilinmeli: tamamlanan
gün anahtarı `Date.toDateString()` biçiminde olmalı (ISO değil), egzersiz
kimlikleri gerçek olmalı (`neg_vis`, `intention`, `memento`, `review`,
`gratitude`). Yanlışında İlerleme ekranı yarı boş çıkıyor.

### Bu ortamda Expo web sunucusu

Ekran görüntüsü çekmek için gereken yerel sunucu, `--offline` olmadan
başlamıyor: Expo CLI açılışta `api.expo.dev`'e bağımlılık sürümü doğrulaması
yapıyor, ağ politikası bunu engelleyince çöküyor.

```bash
EXPO_BASE_URL= EXPO_OFFLINE=1 npx expo start --web --port 8081 --offline
```

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

## Pazarlama

**Video teaser** — 20 saniyelik tanıtım konsepti, Instagram Reels / TikTok /
Facebook için. Altı sahnelik storyboard, altı dilde ekran metni ve
seslendirme, prodüksiyon künyesi:
https://claude.ai/code/artifact/b2c0a5f3-d1f8-4c67-a1e4-0f59335e2a8f

- Görsel yönerge dilden bağımsız; kurgu bir kez kurulur, her dil için yalnızca
  ses ve metin katmanı değişir.
- Seslendirme metinleri sahne sürelerine göre kelime bütçesine sığdırıldı
  (dakikada ~130 kelime + %15 nefes payı). Almanca ve Fransızca bütçeyi
  aşıyor, sayfada uyarı ve çözüm yazılı.
- Sahne 3-4-5 uygulamanın gerçek ekranlarını kullanıyor — `store-assets/`
  içindeki kayıtlarla aynı oturumda çekilebilir.
- ⚠️ Kapanıştaki "bio'da link" çağrısı, uygulama yayınlanmadan işe yaramaz.
  Video şimdiden çekilebilir, yalnızca **yayın** beklesin.

## Bağlantılar

- **Mağaza metinleri** (6 dil, karakter sınırları doğrulanmış, kopyala düğmeli):
  https://claude.ai/code/artifact/f17fb2ac-76fe-4c7f-a16b-8381f772d3fb
- **Mağaza görselleri**: `store-assets/` (README'sinde üretim komutları var)
- Canlı web sürümü: https://suleymaninon-blip.github.io/stoikos-app
- Backend: https://stoikos-backend.stoikos-app.workers.dev
