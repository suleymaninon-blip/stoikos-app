# Teaser videosu

Instagram Reels / TikTok / Facebook için 20 saniyelik tanıtım. **Sessiz görsel
kurgu** — seslendirme ve müzik yok, onlar dışarıda eklenecek (aşağıya bak).

Çıktı: `store-assets/teaser-<dil>-1080x1920.mp4`
1080×1920 · 30 fps · H.264 High · yuv420p · sessiz AAC ses kanalı.

Storyboard ve altı dildeki seslendirme metinleri:
https://claude.ai/code/artifact/b2c0a5f3-d1f8-4c67-a1e4-0f59335e2a8f

## Üretmek

```bash
npm i ffmpeg-static                      # bir kez; nedeni aşağıda
node scripts/teaser/render-teaser.js tr,en
```

Diller `COPY` içinde (`teaser.html`). Şu an `tr` ve `en` var; kalan dört dil
storyboard'daki metinlerden eklenebilir.

## Neden kare kare render ediliyor

`teaser.html` bir CSS animasyonu **değil**. Sayfada `renderFrame(t)` var; her
öğenin o andaki opaklığını, konumunu ve ölçeğini t milisaniyesine göre
kuruyor. Render betiği her kare için bu fonksiyonu çağırıp ekran görüntüsü
alıyor.

CSS animasyonuna bırakılsaydı headless tarayıcının zamanlaması kareler arası
kayardı ve hareket titrek çıkardı. Bu yöntemle çıktı tümüyle deterministik:
aynı komut her çalıştığında birebir aynı video.

Kareler diske yazılmıyor, doğrudan ffmpeg'e boru ile veriliyor — 600 kare
1080×1920 PNG diskte birkaç yüz MB tutardı.

## ffmpeg neden ayrıca kuruluyor

Playwright'ın gömülü ffmpeg'inde (`/opt/pw-browsers/ffmpeg-*`) **yalnız VP8**
var, H.264 yok. VP8/WebM'i Instagram kabul etmiyor. `ffmpeg-static` tam
sürümlü bir ikili indiriyor (libx264 + aac). Betik `FFMPEG_PATH` ortam
değişkenini de dinliyor.

Videoya **sessiz bir ses kanalı** bilerek ekleniyor: bazı yükleyiciler ses
kanalı hiç olmayan dosyada tuhaf davranıyor.

## Sahneler

| # | Süre | İçerik |
|---|---|---|
| 1 | 0–2 sn | Kaygı: "Dün endişelendin. Bugün de endişeleniyorsun." |
| 2 | 2–3 sn | "Peki yarın?" — zemin ısınmaya başlar |
| 3 | 3–8 sn | Nefes orbu (4 sn'lik döngü) + "Sakinlik bir yetenek değil, bir pratiktir." |
| 4 | 8–14 sn | Epiktetos alıntısı — videonun en uzun duraklaması |
| 5 | 14–18 sn | Uygulama ekranları, dördü sırayla |
| 6 | 18–20 sn | Ω + STOIKOS + slogan |

Sahne 3'teki orb uygulamadan kayıt değil, CSS ile yeniden kuruldu — kayıttan
daha akıcı ve kare kare denetlenebilir. Sahne 5 `store-assets/` içindeki
gerçek ekran görüntülerini kullanıyor, dolayısıyla **ekranlar değişince
teaser de eskir**: önce `scripts/shoot-store.js`, sonra bu betik.

Sahne 5'te geçiş bilerek kısa (180 ms). Uzun tutulduğunda iki yoğun arayüz
üst üste binip metinleri birbirine karışıyor.

## Eksik olan: ses

Video sessiz. Yayına çıkmadan iki katman eklenecek:

1. **Seslendirme.** Metinler altı dilde hazır (storyboard bağlantısı yukarıda),
   sahne sürelerine göre kelime bütçesine sığdırılmış. Uygulamanın kavram
   seslendirmeleriyle aynı sesler tercih edilir — TR: Şükrü Terzi, EN: Donovan,
   DE: David, RU: Artem Lebedev, FR: Yann, ES: Miguel.
   ⚠️ Almanca ve Fransızca metinler bütçeyi aşıyor; storyboard'da çözümü yazılı.
2. **Müzik.** Ambient piyano, ritimsiz. Epidemic Sound veya Artlist — **ticari
   lisans şart**, ücretsiz kaynak kullanılmamalı.

İkisi de CapCut ya da DaVinci Resolve'da bu MP4'ün üzerine bindirilir.

## Yayın sırası

Kapanışta çağrı yok, ama reklam metnine "bio'da link" yazılacaksa uygulamanın
mağazada olması gerekir. Video şimdiden hazır edilebilir; **yayın**, Apple ve
Google onaylarını bekler.
