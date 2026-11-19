# "Yukarıdan Bakış" — 60 sn'lik yapay zekâ videosu (Gemini / Veo)

> 18 Kasım 2026. Stok video. 10 çekim × ~6 sn = 60 sn.
> Fikir: Stoacıların 2.000 yıllık **"yukarıdan bakış"** egzersizi (Marcus Aurelius bunu *Düşünceler*'de defalarca yapar: 7.48, 9.30, 12.24). Kalabalık bir köprüde sıkışan bir kadın durur, nefes alır ve kamera onun tepesinden yükselerek şehrin, bulutların, Dünya'nın ve yıldızların üstüne çıkar; sonra aynı hızla ona geri iner. Kadın aynı dünyaya, daha geniş bir içle döner.
> Neden iddialı: tek bir kesintisiz "yükseliş" hissi veren on çekim, insan ölçeğinden uzay ölçeğine, ve geri. Önceki videolarımızın hiçbirinde bu yok (onlar hep "kapıdan geçip sığınağa varma" hikâyesiydi).

## Önce oku — çalışma kuralları (önceki videoların dersleri)

1. **Her çekim için yeni bir Gemini sohbeti aç.** Aynı sohbette Gemini önceki görselleri yeni çekime karıştırıyor.
2. **Biçim: dikey 9:16**, video modeli (Veo). Her komutu **olduğu gibi, tamamını** yapıştır; kısaltma.
3. **"İlk kare" yüklemesi:** komutun başında "İLK KARE" yazan çekimlerde, bir önceki çekimin **son karesini** görsel olarak yükle. Son kareyi almanın en kolay yolu: videoyu bana gönder, ben çıkarıp geri göndereyim. Ya da telefonda videonun son anında ekran görüntüsü al.
4. **Başka görsel yükleme.** İlk karenin yanına ikinci bir görsel (yüz, referans) eklenince Gemini ilk kareye bağlı kalmıyor (Kütüphane videosunda yaşandı). Kadının yüzü zaten hiç görünmeyecek.
5. **Her çekimden 2–3 deneme üret,** en iyisini seç. "YASAK" listesindeki bir şey çıkarsa o denemeyi at.
6. **Yazıları Gemini'ye yazdırmıyoruz.** Bütün yazılar, alıntı ve logo kurguda ekleniyor; komutlarda "hiçbir yazı yok" diyoruz (Gemini harfleri bozuyor, uydurma tabela üretiyor).
7. **Ses:** yalnız ortam sesi, konuşma yok. Müzik kurguda eklenecek.
8. Bütün denemeleri bana gönder; kurguyu, yazıları, müziği ve logoyu ben yaparım (önceki videolardaki gibi bir `scripts/social/yukaridan-build.sh`).

## Gelen çekimler ve kurgu notları

- **Çekim 1** (`yukaridan-videosu/cekim-1.mp4`, 10 sn, 720×1280): kullanılabilir. İlk ~1,5 sn'de yüz yandan görünüyor → kurguda **4–10 sn** kullanılacak. Arka planda küçük mavi yol levhaları (okunmuyor), gerekirse bulanıklaştır.
- **Çekim 2** (`cekim-2.mp4`, 10 sn): kullanılabilir, başlangıç 1. çekimin son karesine oturuyor. ~6–9 sn'de yan profil + nefes buharı görünüyor; **kullanıcı kararı (18 Kasım 2026): profil kalsın**, 0–9 sn kullanılacak. Bu yüzden diğer çekimlerden toplam ~2 sn kısılacak. Son kare `cekim-2-son-kare.png` → 10. çekimin ilk karesi.

- **Çekim 3** (`cekim-3.mp4`, 10 sn): 3A fotoğrafı (`cekim-3a-ilk-kare.jpg`, Gemini'de iki kez düzenlendi) + 3B komutuyla. **Tam tepeden düz yükseliş tuttu**, kadın kıpırdamıyor, kalabalık etrafından akıyor. Video ilk kareye birebir bağlı kalmadı ama sorun değil. Işık gündüz gibi aydınlık → kurguda koyulaştırıp maviye çek. Son kare aynı renk düzeltmesiyle `cekim-3-son-kare.png` (ffmpeg `eq=brightness=-0.07:gamma=0.9,colorbalance=…bs=0.07`) → 4. çekimin ilk karesi; böylece 4. çekim akşam ışığında başlar.

- **Çekim 4** (`cekim-4.mp4`, 10 sn): tuttu. Tam tepeden yükseliş, köprü → akşam ışığında şehir ızgarası. Köprü ortadan sola kayıyor (sorun değil). Yükseliş ~6. sn'de yavaşlıyor → kurguda 0–6 sn, gerekirse hafif hızlandır. Son kare `cekim-4-son-kare.png` (renk düzeltmesi gerekmedi) → 5. çekim.

- **Çekim 5** (`cekim-5.mp4`, 10 sn): tuttu. Şehir ızgarası → kamera ufka döner, kıyı ve deniz, gün batımı şeridi, altından bulutlar geçer. Son kare `cekim-5-son-kare.png` → 6. çekim.

- **Çekim 6** (`cekim-6.mp4`, 10 sn): tuttu. Bulutların içinden geçiş → gün batımında bulut denizi → gökyüzü koyulaşır, yıldızlar belirir. Son kare `cekim-6-son-kare.png` → 7. çekim.

- **Çekim 7** (`cekim-7.mp4`, 10 sn): tuttu. Bulut denizi → ~3–4. sn'de bulutlar Dünya'nın kavisine eriyerek dönüşüyor (yumuşak bindirme; yükseliş hissini bozmuyor) → mavi atmosfer çizgisi, gece tarafında kıyı boyunca şehir ışıkları. Son kare `cekim-7-son-kare.png` → 8. çekim.

- **Çekim 8** (`cekim-8.mp4`, 10 sn): tuttu. Dünya geri çekilerek küreye dönüşür, Ay ve Samanyolu belirir, ~6. sn'den sonra sabit. Dünya "nokta" kadar küçülmüyor, orta boy bir küre kalıyor; Ay gerçeğe göre büyük/yakın (sinematik, sorun değil). Üst yarı boş ve karanlık → alıntı oraya. Son kare `cekim-8-son-kare.png` → 9. çekim.

- **Çekim 9** (`cekim-9.mp4`, 10 sn): **ilk denemede tuttu** (yedek plana gerek kalmadı). Uzaydan Dünya'ya dalış → altın bulutlar → şehir → köprü → kadının arkasında, yukarıdan durur; kadın kıpırdamıyor, atkı sırtında. Bulutlar 6. çekimden biraz daha aydınlık/altın, köprü öncekilerden dar — hızlı geçişte fark edilmez. ⚠️ ~6,6. sn'den sonra ölçek bozuluyor: kadın alttaki arabalara göre **dev gibi** görünüyor (kullanıcı fark etti) → kurguda **0–6,4 sn** kullanılacak (kadın köprüde küçük bir figürken kes), ardından düz kesmeyle 10. çekime geç; gerekirse ~5 sn'ye hızlandır.

## Akış ve kurgu planı

| # | Çekim | Kurguda | Üstteki yazı (TR / EN) |
|---|---|---|---|
| 1 | Köprüde kalabalık, kadın durur | 6 sn | Her şey aynı anda. / *Everything, all at once.* |
| 2 | Telefonu cebe koyar, nefes alır, zaman yavaşlar | 9 sn (0–9; yan profil + nefes buharı bilerek kaldı) | Bir an dur. / *Stop for a moment.* |
| 3 | Tam tepeden yükseliş: kalabalık onun etrafından akar | 6 sn | — |
| 4 | Köprü ince bir çizgi, şehir ışıktan bir ağ | 5 sn | Yukarı çık. / *Rise above it.* |
| 5 | Bütün şehir ve kıyı, bulutlar altta | 5 sn | — |
| 6 | Bulutların içinden geçip altın bir bulut denizine çıkış | 6 sn | — |
| 7 | Uzayın kıyısı: Dünya'nın kavisi | 5 sn | Biraz daha. / *A little higher.* |
| 8 | Dünya küçük mavi bir nokta, Ay, Samanyolu | 8 sn | Alıntı (aşağıda) |
| 9 | Aynı hızla geri dalış, köprüye, ona | 5 sn | — |
| 10 | Gözlerini açar, sakin yürür | 8 sn | Sonra hayatına dön. / *Then go back to your life.* → logo |

**Alıntı (8. çekim):**
- TR: *"Bütün evreni düşüncene sığdır; kendine geniş bir yer açarsın."* — Marcus Aurelius, Düşünceler 9.32 · serbest uyarlama
- EN: *"Take the whole universe into your mind, and you make ample room for yourself."* — Marcus Aurelius, Meditations 9.32 · freely adapted

**Kapanış (10. çekimin son 3 sn'si, görüntü kararırken):** logo + STOIKOS + "Yukarıdan bakış: 2.000 yıllık bir Stoacı egzersizi." / *"The view from above: a 2,000-year-old Stoic exercise."* + stoikos.app

---

## Her komutta aynen geçen bloklar

Aşağıdaki üç blok her komutun içine **zaten yerleştirildi**; ayrıca bir şey yapman gerekmiyor. Burada yalnız ne olduklarını görmen için duruyorlar.

- **STYLE** — görüntü dili (fotogerçekçi sinema, 9:16, renk tonu, film grenli)
- **CHARACTER** — kadının tarifi (her çekimde birebir aynı kelimeler)
- **DO NOT SHOW** — yasak listesi

---

## ÇEKİM 1 — Köprüde kalabalık (yeni sohbet, görsel yükleme yok)

```
Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic live-action film, shot on a large-format digital cinema camera with a 35mm lens, shallow depth of field, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CHARACTER (she is the only main character; keep her exactly like this): A woman in her early thirties, seen only from behind or from a three-quarter back angle — her face is never visible. Dark brown hair tied in a low, loose bun at the nape of the neck. Knee-length charcoal-grey wool coat, straight cut, collar turned down. A long sand-beige knit scarf wrapped once around the neck, both ends hanging down her back to the waist. Dark grey trousers, black leather ankle boots. A plain black smartphone in her right hand. No bag, no hat, no jewelry, no visible logos.

SETTING: A long, wide concrete pedestrian footbridge with plain grey steel railings, crossing high over a busy multi-lane city highway. Modern glass office towers stand on both sides in the distance, their windows lit. Time: blue hour just after sunset — deep blue sky with a thin band of orange light at the horizon. Streetlights are on. Below the bridge, rivers of white headlights and red taillights stream in both directions. Cold evening air. The bridge is crowded with commuters in dark coats walking fast in both directions, many looking at their phones.

CAMERA: Camera at waist height, starting 4 meters directly behind the woman, tracking forward smoothly at walking pace (steady gimbal, no shake). It never passes her and never shows her face.

TIMELINE:
- 0–3 s: She walks quickly with the crowd along the center of the bridge, away from the camera, phone in her right hand. Commuters brush past on both sides of her.
- 3–5 s: She slows down and stops in the middle of the bridge. The crowd keeps flowing around her on both sides like water around a stone.
- 5–8 s: The camera slows and stops 2 meters behind her. She stands still, shoulders raised and tense. The phone screen glows faintly in her hand (screen content not readable). People keep rushing past her.

SOUND: Ambient city sound only: loud traffic roar from the highway below, many hurried footsteps, a phone vibrating twice, a distant car horn. No music. No spoken words in any language, no voices, no announcements.

DO NOT SHOW: her face; any readable text, letters or numbers; signs, billboards, logos or brand names anywhere; readable content on any screen; a second woman dressed like her; anyone looking into the camera; camera shake; cuts or scene changes within the shot; rain or snow; animals; cartoon, painterly or CGI look.
```

---

## ÇEKİM 2 — Telefonu bırakır, nefes alır (yeni sohbet)

**İLK KARE:** Çekim 1'in son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue the same scene seamlessly from it: same woman, same bridge, same light, same people. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic live-action film, shot on a large-format digital cinema camera with a 35mm lens, shallow depth of field, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CHARACTER (keep her exactly like this): A woman in her early thirties, seen only from behind or from a three-quarter back angle — her face is never visible. Dark brown hair tied in a low, loose bun at the nape of the neck. Knee-length charcoal-grey wool coat, straight cut, collar turned down. A long sand-beige knit scarf wrapped once around the neck, both ends hanging down her back to the waist. Dark grey trousers, black leather ankle boots. A plain black smartphone in her right hand. No bag, no hat, no jewelry, no visible logos.

SETTING: The same crowded concrete pedestrian footbridge over a busy city highway at blue hour, as in the first frame.

CAMERA: The camera starts exactly at the first-frame position (2 meters behind her) and makes a very slow arc of about 30 degrees to her left, ending at a three-quarter back angle. Her face stays hidden: we see only the back and left side of her head, the bun and the scarf; her cheek and profile stay turned away from the camera at all times.

TIMELINE:
- 0–2 s: The phone in her right hand vibrates twice. She looks down at it.
- 2–4 s: She lowers the phone and slides it into the right pocket of her coat. Her empty right hand rests by her side.
- 4–6 s: The whole scene smoothly ramps into slow motion (high frame rate look): the passing commuters, their coats and the light streaks of traffic below all slow down to about one quarter speed. She lifts her chin slightly and takes a slow, deep breath — her shoulders rise.
- 6–8 s: Still in slow motion, her shoulders drop as she exhales; a faint cloud of breath vapor appears in the cold air in front of her. The scarf ends move gently. She stays still.

SOUND: The traffic roar and footsteps slowly fade into a soft, muffled low hum by second 6, as if heard underwater. One long, calm exhale. No music. No spoken words in any language, no voices, no announcements.

DO NOT SHOW: her face or profile; any readable text, letters or numbers; signs, billboards, logos or brand names; readable content on the phone screen; a second woman dressed like her; anyone looking into the camera; camera shake; cuts or scene changes within the shot; rain or snow; animals; cartoon, painterly or CGI look.
```

---

## ÇEKİM 3 — Tam tepeden yükseliş (yeni sohbet)

**İLK KARE: yok** (açı tamamen değişiyor). Görsel yükleme.

```
Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic live-action film, aerial drone cinematography, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CHARACTER (keep her exactly like this): A woman in her early thirties. From directly above we see: dark brown hair tied in a low, loose bun; the shoulders of a knee-length charcoal-grey wool coat; a long sand-beige knit scarf wrapped once around the neck with both ends hanging down her back. Black leather ankle boots. Her hands are empty and relaxed at her sides. Her face is never visible.

SETTING: A long, wide concrete pedestrian footbridge with plain grey steel railings, crossing high over a busy multi-lane city highway, at blue hour just after sunset. The bridge is crowded with commuters in dark coats walking fast in both directions. On both sides of the bridge, far below, rivers of white headlights and red taillights stream along the highway.

CAMERA: A perfectly top-down, 90-degree bird's-eye view looking straight down. The woman is standing perfectly still at the exact center of the frame for the whole shot. The camera starts 3 meters above her head and rises straight up, smoothly and steadily, without rotating, to about 40 meters by the end of the shot. She stays exactly centered.

TIMELINE:
- 0–3 s: Close above her: her bun, her shoulders and the sand-beige scarf fill the center. Commuters stream past her on both sides at normal speed; she does not move at all.
- 3–6 s: As the camera rises, the people become small and the crowd looks like two rivers flowing in opposite directions around one still point — her.
- 6–8 s: At about 40 meters, the whole width of the bridge is visible with the glowing traffic streams on both sides. She is a small still figure in the exact center, the sand-beige scarf still visible as a tiny light dot.

SOUND: Soft wind, a distant low hum of the city far below. No music. No spoken words in any language, no voices.

DO NOT SHOW: her face; any readable text, letters or numbers; signs, billboards, logos, road markings with words; any drone, helicopter or camera visible in the frame; camera tilt or rotation; cuts or scene changes within the shot; rain or snow; animals; cartoon, painterly or CGI look.
```

---

### Çekim 3 — 2. sürüm (1. deneme tutmadı)

**2. deneme (kullanıcının önceki üretimi):** kadın ilk ~4 sn kıpırdamadan duruyor, kalabalık etrafından akıyor (güzel); ama pantolon yerine etek/çıplak bacak, kamera yine ufka dönüyor, ışık gri-bulutlu gündüz, köprü farklı (askılı). Yedek olarak saklanıyor (ilk ~4 sn, renk düzeltmesiyle). Bu yüzden 3A/3B'ye "etek değil, pantolon" eklendi.

**1. denemede olanlar (18 Kasım 2026):** kamera tam tepeden bakmadı, arkadan yükselip ufka döndü. Kadın da durmak yerine baştan sona yürüdü. Bu yüzden "kalabalığın ortasında kıpırdamayan bir nokta" görüntüsü oluşmadı.

**Bu sürüm iki adımlı.** Önce Gemini'ye tepeden bir **fotoğraf** çizdiriyoruz; sonra o fotoğrafı ilk kare yapıp videoyu ürettiriyoruz. Gemini fotoğrafta açıyı çok daha iyi tutuyor, video da ilk kareye bağlı kalıyor.

**3A — Fotoğraf** (yeni sohbet, görsel yükleme yok; video değil, **görsel** üret):

```
Create a photorealistic still image, vertical 9:16.

A perfectly top-down, 90-degree bird's-eye photograph looking straight down at the ground from about 4 meters above. The ground is the pale concrete walkway of a wide pedestrian footbridge with plain grey steel railings along both the left and the right edges of the frame. Blue hour just after sunset: soft, cool, even light; no hard shadows.

In the exact center of the frame stands one woman, seen from directly above: the top of her head with dark brown hair tied in a low, loose bun; the shoulders of a knee-length charcoal-grey wool coat; a long sand-beige knit scarf wrapped once around the neck with both ends hanging down her back; dark grey trousers (she wears trousers, NOT a skirt or a dress, and her legs are not bare); the toes of black leather ankle boots just visible. She stands perfectly still, arms relaxed at her sides.

Around her, about fifteen commuters in dark coats are walking past her on both sides in both directions, slightly motion-blurred, seen from directly above (tops of heads and shoulders).

The sky, the horizon and any buildings are NOT visible — only the bridge walkway and its two railings fill the frame.

Do not show: her face; a skirt, a dress or bare legs; any text, letters, numbers, signs or logos; road markings with words; the sky; the horizon; buildings; a drone or camera; a cartoon, painterly or CGI look.
```

**3B — Video** (yeni sohbet; **3A'daki fotoğrafı ilk kare olarak yükle**):

```
Use the uploaded image as the exact first frame of the video. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic live-action film, aerial drone cinematography, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no stylization.

CAMERA — THE MOST IMPORTANT RULE: The camera points straight down at the ground (90 degrees) for the entire shot and NEVER tilts up. The sky, the horizon and the buildings are never visible. The camera rises vertically, smoothly and steadily, from about 4 meters to about 30 meters above the woman, without rotating and without moving sideways. The woman stays at the exact center of the frame for the entire shot.

THE WOMAN — SECOND MOST IMPORTANT RULE: She stands completely still like a statue for all 8 seconds. She does not walk, does not take a single step, does not turn, does not move her arms. Only the ends of her sand-beige scarf move very slightly in the wind.

TIMELINE:
- 0–3 s: Close above her: her bun, her shoulders and the sand-beige scarf fill the center. Commuters in dark coats stream past her on both sides at normal walking speed.
- 3–6 s: As the camera rises, the people become smaller and the crowd looks like two rivers flowing in opposite directions around one still point — her.
- 6–8 s: The full width of the bridge walkway is visible, edged by its two railings; along the outer edges of the frame the tops of moving cars with glowing headlights and taillights appear on the highway below. She is a small, still figure in the exact center, the sand-beige scarf a tiny light mark.

SOUND: Soft wind and the distant, low hum of a city below. No music. No spoken words in any language, no voices.

DO NOT SHOW: the woman walking, stepping or turning; a skirt, a dress or bare legs (she wears dark grey trousers); the camera tilting up; the sky; the horizon; buildings; her face; any text, letters, numbers, signs, logos or road markings with words; any drone, helicopter or camera in the frame; cuts or scene changes within the shot; rain or snow; a cartoon, painterly or CGI look.
```

Tutarsa 4. çekim bu videonun son karesiyle başlar (4. çekimin komutu değişmiyor).

---

## ÇEKİM 4 — Köprü bir çizgi, şehir bir ağ (yeni sohbet)

**İLK KARE:** Çekim 3'ün son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic aerial cinematography, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

SUBJECT: In the exact center of the frame is the same tiny still figure of a woman on the footbridge, marked by a small sand-beige dot (her scarf). Keep that point at the exact center for the whole shot.

CAMERA: Perfectly top-down, looking straight down. The camera continues to rise straight up, smoothly and steadily, from about 40 meters to about 600 meters, while slowly rotating clockwise by about 30 degrees over the whole shot.

TIMELINE:
- 0–3 s: The footbridge shrinks to a thin pale line. The highway below becomes two glowing rivers of white and red light.
- 3–6 s: The city grid appears around it at blue hour: dark rooftops, streets lined with warm streetlights, glass towers with lit windows, small parks as dark patches. The tiny sand-beige point in the center fades into the city lights by second 5.
- 6–8 s: The whole district is visible as a living network of light, with traffic moving along every street.

SOUND: Steady wind at altitude, the city reduced to a very distant low hum. No music. No spoken words in any language, no voices.

DO NOT SHOW: any readable text, letters or numbers; signs, billboards, logos; any drone, aircraft or camera visible in the frame; cuts or scene changes within the shot; tilt away from straight down; daylight; rain or snow; cartoon, painterly, map-like or CGI look.
```

---

## ÇEKİM 5 — Bütün şehir ve kıyı (yeni sohbet)

**İLK KARE:** Çekim 4'ün son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic aerial cinematography, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CAMERA: The camera keeps rising smoothly from about 600 meters to about 5 kilometers. At the same time it slowly tilts up from looking straight down (90 degrees) to looking about 45 degrees down toward the horizon by the end of the shot. Smooth, steady, no shake.

TIMELINE:
- 0–3 s: The whole city spreads out below as a vast web of warm lights at blue hour.
- 3–6 s: As the camera tilts toward the horizon, the edge of the city appears where it meets a dark, calm sea along a curving coastline. The western sky shows a thin band of orange afterglow above the horizon.
- 6–8 s: Thin, soft wisps of low cloud begin to slide beneath the camera, partly veiling the city lights.

SOUND: Steady high-altitude wind, nothing else. No music. No spoken words in any language, no voices.

DO NOT SHOW: any readable text, letters or numbers; logos; any aircraft, drone, wing or camera visible in the frame; cuts or scene changes within the shot; daylight; the sun itself; rain or lightning; cartoon, painterly, map-like or CGI look.
```

---

## ÇEKİM 6 — Bulutların içinden, altın bulut denizine (yeni sohbet)

**İLK KARE:** Çekim 5'in son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic aerial cinematography, soft natural film grain, muted teal-and-amber color grade, 24 fps, real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CAMERA: The camera keeps rising steadily and slowly levels out until it looks straight at the horizon by second 6. Smooth, no shake.

TIMELINE:
- 0–2 s: The camera rises into a thin layer of cloud; the view fills with soft grey-white mist moving past.
- 2–4 s: The mist thins and the camera emerges above the clouds.
- 4–6 s: An endless, calm sea of clouds stretches to the horizon below, its tops lit warm gold and pink by the last light of the sunset at the horizon.
- 6–8 s: The camera keeps rising slowly. Above the clouds the sky shifts from gold at the horizon, to deep blue, to almost black at the top of the frame, where the first few stars appear.

SOUND: The wind softens into near silence; a faint, warm, low tone of air. No music. No spoken words in any language, no voices.

DO NOT SHOW: any aircraft, wing, drone, bird or camera visible in the frame; any text, letters, numbers or logos; the sun's disk with lens flare; cuts or scene changes within the shot; lightning or storm clouds; cartoon, painterly or CGI look.
```

---

## ÇEKİM 7 — Uzayın kıyısı (yeni sohbet)

**İLK KARE:** Çekim 6'nın son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic, like real footage filmed from the edge of space at about 100 kilometers altitude, documentary realism, soft natural film grain, 24 fps, real-world physics. No visual effects overlays, no stylization.

CAMERA: The camera keeps rising and slowly drifts backward, so more and more of the Earth enters the frame. Smooth, steady.

TIMELINE:
- 0–3 s: The sea of clouds falls away below. The sky above turns fully black and full of sharp, still stars.
- 3–6 s: The curvature of the Earth becomes clearly visible as a wide arc across the lower half of the frame, wrapped in a thin, glowing blue line of atmosphere. Along the arc runs the line between day and night: one side still faintly lit by sunset, the other side in night.
- 6–8 s: On the night side, clusters of golden city lights glitter along a coastline. Everything is calm and still.

SOUND: Near silence; only a very low, warm, slowly swelling hum. No music. No spoken words in any language, no voices.

DO NOT SHOW: any spacecraft, satellite, space station, astronaut, window frame or camera; any text, letters, numbers, logos, interface or HUD graphics; a sun with lens flare; cuts or scene changes within the shot; cartoon, painterly or CGI look; fantasy-colored nebulae.
```

---

## ÇEKİM 8 — Küçük mavi nokta (yeni sohbet)

**İLK KARE:** Çekim 7'nin son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic, like real deep-space observation footage, documentary realism, sharp stars, soft natural film grain, 24 fps. No visual effects overlays, no stylization.

CAMERA: The camera pulls back steadily and far away from the Earth, then comes to a complete stop at second 6 and holds perfectly still until the end.

TIMELINE:
- 0–3 s: The Earth shrinks from a huge arc into a whole sphere: blue oceans and white cloud swirls, half in sunlight and half in night.
- 3–6 s: The Earth keeps shrinking. The Moon appears as a small grey sphere to the upper left of the Earth. The band of the Milky Way stretches diagonally across the black sky behind them, faint and natural.
- 6–8 s: The camera holds still. The Earth is now a small bright blue point slightly below the center of the frame; the Moon is a tiny grey point beside it. The stars do not move.

SOUND: Silence, with only a very soft, deep, sustained tone. No music. No spoken words in any language, no voices.

DO NOT SHOW: any spacecraft, satellite, astronaut or camera; any text, letters, numbers, logos, labels, interface or HUD graphics; a sun with lens flare; colorful fantasy nebulae; planets other than the Earth and the Moon; cuts or scene changes within the shot; cartoon, painterly or CGI look.
```

---

## ÇEKİM 9 — Geri dalış (yeni sohbet)

**İLK KARE:** Çekim 8'in son karesini yükle.

```
Use the uploaded image as the exact first frame of the video. Continue seamlessly from it. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic footage, one continuous camera move, soft natural film grain, muted teal-and-amber color grade, 24 fps. No visual effects overlays, no speed lines, no stylization.

CHARACTER (appears only at the end; keep her exactly like this): A woman in her early thirties seen from directly above: dark brown hair tied in a low, loose bun; the shoulders of a knee-length charcoal-grey wool coat; a long sand-beige knit scarf wrapped once around the neck with both ends hanging down her back. Her face is never visible.

CAMERA: One continuous, smooth, accelerating dive straight back down toward the Earth, then gently slowing at the end. Always looking down toward the destination.

TIMELINE:
- 0–2 s: The camera rushes toward the small blue Earth; it grows quickly until the curved horizon fills the frame.
- 2–4 s: The camera falls through the thin blue atmosphere and through a sea of clouds lit gold and pink by sunset.
- 4–6 s: Below the clouds, a city at blue hour rushes up: a web of warm street lights and rivers of traffic; a long footbridge over a highway grows larger in the center of the frame.
- 6–8 s: The camera slows down smoothly and stops about 10 meters directly above the footbridge, looking straight down. In the exact center stands the woman, perfectly still, as commuters in dark coats flow past her on both sides.

SOUND: A rising soft whoosh of air that falls away into the low hum of a city and footsteps as the camera slows. No music. No spoken words in any language, no voices.

DO NOT SHOW: her face; any spacecraft, aircraft, drone or camera; any text, letters, numbers, signs, logos, interface or HUD graphics; speed-line effects; cuts or scene changes within the shot; rain or snow; cartoon, painterly or CGI look.
```

> **Yedek plan:** Bu çekim tutmazsa (en zor çekim bu), kurguda **Çekim 3–8'i ters oynatıp hızlandırarak** aynı dönüşü yaparım. Tepeden bakışta insanların geri yürüdüğü hızlandırılmış görüntüde pek fark edilmez. Yine de önce bu komutu dene; tutarsa çok daha iyi olur.

---

## ÇEKİM 10 — Sakin dönüş (yeni sohbet)

**İLK KARE:** Çekim 2'nin son karesini yükle (kadın arkadan, köprüde, nefes vermiş hâliyle).

```
Use the uploaded image as the exact first frame of the video. Continue the same scene seamlessly from it: same woman, same bridge, same light. Create an 8-second photorealistic video, vertical 9:16.

STYLE: Photorealistic cinematic live-action film, shot on a large-format digital cinema camera with a 35mm lens, shallow depth of field, soft natural film grain, muted teal-and-amber color grade, normal speed 24 fps (no slow motion), real-world physics. No visual effects overlays, no lens-flare overlays, no stylization.

CHARACTER (keep her exactly like this): A woman in her early thirties, seen only from behind — her face is never visible. Dark brown hair tied in a low, loose bun at the nape of the neck. Knee-length charcoal-grey wool coat, straight cut, collar turned down. A long sand-beige knit scarf wrapped once around the neck, both ends hanging down her back to the waist. Dark grey trousers, black leather ankle boots. Her hands are empty (the phone stays in her coat pocket). No bag, no hat, no jewelry, no visible logos.

SETTING: The same concrete pedestrian footbridge over the city highway at blue hour. The crowd is now thinner and walks at an unhurried pace. A soft band of warm light glows low in the sky ahead of her.

CAMERA: Locked-off, completely still, at the same position as the first frame, behind her. It does not follow her.

TIMELINE:
- 0–2 s: She stands still. She tilts her head slightly upward toward the sky for a moment (we see only the back of her head).
- 2–4 s: She lowers her head, takes one easy breath, her shoulders relaxed, and with her left hand calmly tucks one end of the scarf back over her shoulder.
- 4–8 s: She starts walking forward along the center of the bridge at a calm, steady pace, away from the camera, without looking back. She grows smaller in the frame. The few people around her walk calmly too. The last second holds on her small figure walking toward the warm light.

SOUND: The city sound returns, softer than before: gentle traffic below, a few unhurried footsteps, a light breeze. No music. No spoken words in any language, no voices, no announcements.

DO NOT SHOW: her face or profile; her turning around; the phone; any readable text, letters or numbers; signs, billboards, logos or brand names; a second woman dressed like her; anyone looking into the camera; camera movement; slow motion; cuts or scene changes within the shot; rain or snow; animals; cartoon, painterly or CGI look.
```

---

## Kontrol listesi — her denemeyi şuna göre seç

- Kadının **yüzü** hiçbir karede görünmüyor mu?
- Kıyafet her çekimde aynı mı? Kömür grisi palto, **kum rengi atkı** (uçları sırtta), düşük topuz.
- **Yazı, tabela, logo** yok mu? (Gemini en çok burada hata yapıyor; reklam panosu, yol yazısı çıkarsa at.)
- Çekimin ortasında **sahne değişmiyor ya da kesilmiyor** mu?
- 3–5 arası çekimlerde kamera **düz yukarı** mı çıkıyor? (Yana kayarsa zincir kopar.)
- 7–8 arası çekimlerde uydu, uzay aracı, ekran yazısı yok mu?
- Ses: **konuşma ya da anons** yok mu? (Stoa videosunda Yunanca anons çıkmıştı.)

Takıldığın çekim olursa denemeyi bana gönder; komutu o hataya göre düzelteyim.
