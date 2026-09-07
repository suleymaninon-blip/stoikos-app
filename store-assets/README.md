# Mağaza Görselleri

App Store ve Google Play için ekran görüntüleri. Yerel Expo web sunucusundan
Playwright ile çekildi; boyutlar mağazaların istediği piksel değerlerine
`deviceScaleFactor` ile ulaşıyor.

| Dosya öneki | Görüntü boyutu | Nerede kullanılır |
|---|---|---|
| `iphone-*` | **1290×2796** | App Store, iPhone 6.7" (zorunlu boyut) |
| `android-*` | **1080×1920** | Google Play, telefon |

Beş ekran: ana (nefes orbu + günün alıntısı), bilgelik (alıntı tekerleği),
koç (sohbet), pratik, ilerleme. App Store en az 3, Play en az 2 istiyor —
ikisi de karşılanıyor.

## Yeniden çekmek

Ekranlar değişince görüntüler eskir. Yeniden üretmek için:

```bash
# 1. Web sunucusunu çevrimdışı modda başlat (Expo CLI api.expo.dev'e
#    ulaşamazsa --offline olmadan çöküyor)
EXPO_BASE_URL= EXPO_OFFLINE=1 npx expo start --web --port 8081 --offline

# 2. Betiği çalıştır
node scripts/shoot-store.js
```

## Ekrandaki veri gerçek değil

Boş bir uygulama hiçbir şey anlatmadığı için betik çekimden önce
`localStorage`'a örnek veri yazıyor: dokuz günlük süreklilik, tamamlanmış
pratikler, favori alıntılar ve koç ekranı için elle yazılmış bir sohbet.
Bu veri yalnızca tarayıcı oturumunda yaşıyor, depoya veya cihaza yazılmıyor.

İki ayrıntı kolay kaçıyor, betikte ikisi de doğru:

- Tamamlanan gün anahtarı `Date.toDateString()` biçiminde
  (`stoikos_completed_Sat Sep 05 2026`), ISO değil. ISO yazılırsa süreklilik
  görünür ama haftalık sayaç ve 7 günlük grafik boş kalır.
- Egzersiz kimlikleri gerçek olmalı (`neg_vis`, `intention`, `memento`,
  `review`, `gratitude`); uydurma kimlikler dağılım listesini 0/7 bırakır.

## Öne çıkan görsel (Play)

`play-feature-*.png` — tam **1024×500**, altı dilde. Play'de zorunlu.
Şablon `scripts/feature-graphic.html`, üretim `node scripts/shoot-feature.js`.
Metinler mağaza açıklamalarıyla aynı cümleler; fontlar uygulamanın kendi
dosyalarından okunuyor (`node_modules/@expo-google-fonts`), ağ gerekmiyor.

Play her dil için ayrı görsel kabul ediyor; yalnızca biri yüklenecekse
Türkçe ya da İngilizce sürüm kullanılır.

## Teaser videosu

`teaser-<dil>-1080x1920.mp4` — 20 sn, 30 fps, H.264. Instagram Reels / TikTok /
Facebook için. **Sessiz**: seslendirme ve müzik dışarıda eklenecek.

Üretim, sahne listesi ve eksik ses katmanı: **`scripts/teaser/README.md`**.

⚠️ Video sahne 5'te buradaki ekran görüntülerini kullanıyor — **ekranlar
değişince teaser de eskir.** Önce `shoot-store.js`, sonra `render-teaser.js`.

## Simgeler

`icon-1024-apple.png` (App Store) ve `icon-512-play.png` (Play vitrini).
Üretim: `node scripts/make-store-icons.js`.

Kaynak `assets/icon.png` doğrudan yüklenemezdi:

- **Alfa kanalı vardı** ve piksellerin %4,4'ü gerçekten saydamdı
  (yuvarlatılmış köşeler). Apple alfa kanallı simgeyi reddediyor.
- **Köşeler hazır yuvarlatılmıştı.** Her iki mağaza da köşeyi kendisi
  yuvarlıyor; hazır yuvarlatılmış simge iki kez kırpılınca köşelerde koyu
  artık kalıyor.

Betik saydam köşeleri simgenin kendi dış bandının rengiyle dolduruyor
(renk sabit yazılmadı, simgeden okunuyor) ve alfa kanalını tümüyle atıyor.

`assets/adaptive-icon.png` bilerek değiştirilmedi — o Android'in
uyarlanabilir simgesinin ön katmanı ve saydamlığı orada doğru.

## Hâlâ eksik

- **Mağaza bağlantısı.** `constants/config.ts` içindeki `storeUrl` boş;
  uygulama yayına girince doldurulacak.
