# "Rüzgârı sen seçmezsin" — yapay zekâ ile üretim rehberi

> Hazırlandı: 18 Ekim 2026. 30 sn, dikey (9:16) tanıtım videosu.
> Fikir: rüzgâr her şeyi eğiyor, filozof sakin kalıyor. Rüzgâr kontrolümüz dışındaki şeyler, duruşu ise elimizde olan (Kontrol Dairesi).
> Sen sahneleri bir yapay zekâ video aracında üretip bana gönderiyorsun; ben kurgu, renk, yazı, marka işareti, müzik ve 6 dil çıkışını yapıyorum.

## Durum (19 Ekim 2026) — kısa sürüm: 20 sn, 2 sahne daha

Kullanıcı Kling'in **ücretsiz** sürümüyle ilerliyor (kredi günlük geliyor), bu yüzden video **20 sn'ye** kısaltıldı:

| Süre | Sahne | Durum |
|---|---|---|
| 0–2 | Kararmış ekran, rüzgâr sesi | kurguda |
| 2–7 | Patikada yürüyüş — *"Rüzgârı sen seçmezsin."* | ✅ `filozof-videosu/01-yuruyus-kling-720p.mp4` |
| 7–11 | Başakların üstünde el — *"Yolu da."* | ⏳ önce görsel (Sahne 2), sonra Frames |
| 11–16 | Siluet: durur, gözlerini kapar — *"Ama nasıl yürüdüğünü seçersin."* | ⏳ Sahne 4 |
| 16–20 | Marka işareti, STOIKOS | kurguda |

Notlar:
- Karakter görseli Kling **AI Image (Image 3.0)** ile üretildi; videolar **AI Video → Frames** (görselden video), **Smart Multi-Shot KAPALI** (açıkken 5 sn'yi kesik sahnelere bölüyor).
- Ücretsiz çıktı 720×1276, 24 fps, sağ altta **"KlingAI 3.0" filigranı**. Kurguda ~%7 yakınlaştırıp kırparak filigran atılacak, 1080×1920'ye büyütülecek.
- 1080p 5 sn = 60 kredi; denemeler 720p.

## Nasıl çalışacağız (4 adım)

1. **Önce tek bir karakter görseli üret** (aşağıda "Adım 0"). Bütün sahnelerde aynı adamın görünmesi için bu görseli her sahneye referans olarak vereceksin. Yapay zekâ videosunda en sık sorun budur: her sahnede başka biri çıkar.
2. **Beş sahneyi ayrı ayrı üret** (Sahne 1–5). Her biri 5–8 saniye. Her sahneden 2–3 deneme al, en iyisini seç.
3. **Seçtiklerini bana gönder** — "Dosya olarak" ya da en yüksek kalitede. Sesleri önemli değil, ben değiştireceğim.
4. **Müziği indir ve gönder** (aşağıda "Müzik"). Bu ortam müzik sitelerine erişemiyor.

## Hangi araç?

Hepsi 9:16 dikey video üretebiliyor; fiyat ve özellikler sık değişiyor, aboneliği almadan önce güncel sayfasına bak.

| Araç | Neden | Dikkat |
|---|---|---|
| **Google Veo** (Gemini uygulaması / Flow) | Doğa, ışık ve rüzgârda en gerçekçi sonuçlar | Kendiliğinden ses ekler — sorun değil, ben sileceğim |
| **Kling** | Görselden videoya (image-to-video) çok iyi; karakteri tutarlı tutmak kolay | Uzun bekleme süreleri olabilir |
| **Runway** | Karakter referansı özelliği güçlü | Kredi hızlı biter |

**Önerim:** Kling ya da Veo ile **görselden video** yöntemi: önce her sahnenin ilk karesini görsel olarak üret, sonra onu "hareketlendir". Tutarlılık için en sağlam yol bu.

**Senin fotoğrafların:** taş duvar ve yabani yulaf fotoğraflarını görsel referans olarak yükleyebilirsin — renk ve doku tam istediğimiz gibi. Gün batımı fotoğrafında insan olan kısmı kullanma.

## Ortak ayarlar (her sahnede)

- **Oran:** 9:16 (dikey) · **Çözünürlük:** en yüksek (1080p ya da üstü) · **Süre:** 5–8 sn
- **Kamera:** yavaş, sakin; ani hareket yok
- **Yasaklar (negative prompt varsa oraya yaz):**
  `text, letters, watermark, logo, modern clothing, sunglasses, phone, cars, power lines, buildings, face close-up, smiling at camera, fast motion, shaky camera, cartoon, oversaturated`

Her komutun sonunda aynı **üslup cümlesi** var; değiştirme, sahneler birbirine benzesin diye orada.

---

## Adım 0 — Karakter görseli (görsel üreticide)

ChatGPT, Gemini ya da Midjourney gibi bir görsel aracında:

```
Full-body photo of a Stoic philosopher seen from behind, a man in his fifties with short grey hair and a short grey beard, wearing a simple undyed linen tunic and a long sand-coloured wool cloak draped over one shoulder, leather sandals, standing on a dusty path in a valley full of dry golden wild oats at golden hour. Cinematic 35mm film photograph, warm low sun, soft haze, muted ochre and stone palette, shallow depth of field, vertical 9:16.
```

Beğendiğin görseli kaydet; adı **"karakter"** olsun. Yüzü görünmüyorsa daha iyi.

---

## Sahne 1 — Vadiden iniş (3–7. sn)

*Ekranda: "Rüzgârı sen seçmezsin."*

```
Wide establishing shot at golden hour: a gentle valley completely covered in dry golden wild oats swaying in a light breeze, low hills in the distance, sun near the horizon with soft lens flare. Far away, a lone man in a long sand-coloured cloak walks slowly down a narrow dusty path toward the camera, seen small in the frame. Slow push-in. Cinematic 35mm film look, warm low sun, soft haze, muted ochre and stone palette, shallow depth of field, gentle wind, vertical 9:16.
```

## Sahne 2 — Başakların üstünde el (7–11. sn) · en önemli sahne

*Ekranda: "Yolu da."*

```
Extreme close-up, slow motion: a weathered open hand of an older man gently brushing over the tops of dry wild oat spikelets as he walks, the drooping golden seed heads bend under his palm and spring back, backlit by the low golden sun, tiny dust and seed particles glowing in the air. Camera tracks sideways alongside the hand. Cinematic 35mm film look, warm low sun, soft haze, muted ochre and stone palette, very shallow depth of field, gentle wind, vertical 9:16.
```

İpucu: senin yabani yulaf fotoğrafını ilk kare olarak verip "add a hand brushing over the oats" diyebilirsin.

## Sahne 3 — Patikada adımlar (11–15. sn)

```
Low-angle tracking shot at ground level: bare ankles and simple leather sandals stepping slowly along a dusty dry path between tall golden wild oats, the hem of a sand-coloured wool cloak swaying with each step, fine dust rising, low golden sunlight from behind. Cinematic 35mm film look, warm low sun, soft haze, muted ochre and stone palette, shallow depth of field, gentle wind, vertical 9:16.
```

## Sahne 4 — Siluet, durur ve nefes alır (15–20. sn) · doruk

*Ekranda: "Ama nasıl yürüdüğünü seçersin."*

```
Medium shot from behind and slightly to the side, backlit silhouette: the man in the long cloak stops walking in the middle of a field of golden wild oats facing the setting sun. Wind grows stronger, the oats around him ripple in waves and his cloak billows, but he stands completely still, lowers his shoulders and closes his eyes, taking one slow deep breath. His face stays in shadow. Very slow orbit of the camera around him. Cinematic 35mm film look, warm low sun, strong rim light, soft haze, muted ochre and stone palette, shallow depth of field, vertical 9:16.
```

## Sahne 5 — Yukarıdan: başak denizinde tek insan (20–25. sn)

```
High aerial shot slowly rising straight up: a lone man in a sand-coloured cloak stands motionless in the centre of a vast field of dry golden wild oats, wind sends long rolling waves across the field around him while he remains perfectly still, long shadows at golden hour. Cinematic 35mm film look, warm low sun, soft haze, muted ochre and stone palette, gentle wind, vertical 9:16.
```

## Kapanış (25–30. sn) — üretmene gerek yok

Kararma, marka işareti çizilir, STOIKOS, "Stoacı bilgelik, günlük hayatta" · stoikos.app. Bunu ben yapıyorum (tanıtım videosundaki kapanışın aynısı).

---

## Müzik

Klasik eserin bestesi serbest olsa da **kaydın** telifi olabilir. Güvenli yol: **Musopen** (musopen.org) — kayıtları serbest (Public Domain / CC0).

1. **Erik Satie — Gymnopédie No. 1** (ilk tercih: yavaş, sakin, tam bu hava)
2. Bach — Air (Orkestra Süiti No. 3)
3. Beethoven — Ay Işığı Sonatı, 1. bölüm

İndirdiğin dosyayı (mp3) bana gönder; videoya göre keser, girişini ve bitişini yumuşatırım.

⚠️ **Kullanma:** "Albinoni Adagio" (aslında 1958 bestesi, telifli) ve Barber "Adagio for Strings" (telifli). YouTube'dan indirilen kayıtlar da çoğu zaman telifli.

Alternatif: müziği hiç eklemeden gönder, Instagram'da yüklerken uygulamanın kendi müzik kitaplığından seç.

## Benim yapacaklarım (görüntüler gelince)

- Sahneleri kesip 30 sn'ye oturtmak, geçişleri yumuşatmak
- Renkleri uygulamanın altın-taş paletine eşitlemek (sahneler arası renk farkını gidermek)
- Yazılar (uygulamanın yazı tipleriyle), kapanışta marka işareti
- Müziği yerleştirmek, rüzgâr sesini altına katmak
- **TR + EN** (istersen 6 dil) ayrı dosyalar, Instagram için 1080×1920

## Açıklama metni (taslak)

> Rüzgârı sen seçmezsin. Yolu da. Ama nasıl yürüdüğünü seçersin.
>
> Epiktetos'un el kitabı şu fikirle açılır: bazı şeyler bize bağlıdır, bazıları değil. Huzur, ikisini ayırabildiğin yerde başlar.
>
> Bağlantı profilde.
>
> #stoacılık #epiktetos #felsefe #farkındalık #sakinlik #stoicism

Not: yapay zekâyla üretilmiş görüntü olduğunu Instagram yükleme ekranında **"Yapay zekâ etiketi"** ile belirtmen gerekebilir (Meta gerçekçi yapay zekâ görüntülerinde bunu istiyor). Etiket erişimi düşürmüyor; belirtmemek ise sonradan sorun çıkarabilir.
