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

## Hâlâ eksik

- **Play öne çıkan görsel — 1024×500.** Play'de zorunlu ve bir ekran
  görüntüsü değil, tasarlanması gereken bir kapak görseli.
- **Uygulama simgesi.** `assets/icon.png` mevcut; Apple 1024×1024, Play
  512×512 ister ve ikisinde de saydamlık kabul edilmiyor — boyut ve alfa
  kanalı kontrol edilmeli.
