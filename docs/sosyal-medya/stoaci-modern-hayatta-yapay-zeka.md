# "Bir Stoacı modern hayatta" — viral seri, 1. bölüm (yapay zekâ üretim rehberi)

> Hazırlandı: 20 Ekim 2026. ~18 sn, dikey (9:16). Araç: Gemini (Veo).
> Fikir: antik filozof bugünün kaosunda; herkes çıldırırken o sakin. Komik karşıtlık + herkesin yaşadığı an + dil gerektirmeyen görüntü → paylaşılabilir. Sonunda Stoikos.
> Baş rolde **ilk videodaki filozof** (keten tunik, kum rengi pelerin) — Stoikos'un tekrar eden yüzü/maskotu. Referans: `filozof-videosu/` klipleri ya da karakter görseli.
> Tutarsa seri: "Stoacı biri düğünde / tatilde / kayınvalidesiyle…".

## Viral kuralları (kurguda uygulanacak)
- İlk 1 sn kanca; sahne başına 2–3 sn hızlı kesim; yazı az ve büyük.
- Son kare ilk kareye benzesin → döngü, tekrar izlenme.
- Önce **İngilizce** sürüm (Reels + TikTok + YouTube Shorts aynı gün), açıklamanın ilk satırı soru.

## Senaryo

| Süre | Sahne | Yazı (TR / EN) |
|---|---|---|
| 0–2 | Trafikte zeytin yiyen filozof | Pazartesi sabahı. Bir Stoacı: / Monday morning. A Stoic: |
| 2–5 | Bildirim yağan telefonu ters çevirir | |
| 5–8 | Bağrışılan toplantıda sakin not alır | |
| 8–11 | Kaçan otobüs, sıçrayan su; kollarını yağmura açar | |
| 11–15 | Gece balkon, şehir ışıkları, deftere yazar | Seni rahatsız eden olaylar değil, onlar hakkındaki yargıların. / It's not events that disturb you, but your judgments about them. |
| 15–18 | Marka işareti | Sen de dene. · stoikos.app / Try it. · stoikos.app |

⚠️ Komutlarda **gerçek isim, marka, logo yok** ("no logos, no brand names, no readable text"): Kling ve Gemini bunlarda reddedebiliyor.

Her komutun başı aynı karakter tarifi (referans görselle birlikte yükle):
`an ancient philosopher with short grey hair and beard, wearing a simple undyed linen tunic and a long sand-coloured wool cloak`

## Durum ve ders (21 Ekim 2026)
- ✅ Kimlik görseli: `stoaci-modern-hayatta/00-filozof-yuz-referans.png` — **her sahnede bunu yükle**.
- ✅ Sahne 1: `01-trafik-gemini-720p.mp4` + ek açılar `01b-trafik-arabadan…` (2,1. sn'de atlama, sonrası kullanılır) ve `01c-trafik-tepeden…`.
- **Ders:** Gemini tek komutta birden çok olayı sırayla yapınca bazen çekimin ortasında kendi kendine kesiyor. Komutları **tek eyleme** indir. Farklı açılar kurguda kırpılarak (geniş/orta/yakın) çıkarılıyor; ek açı çekimi şart değil.
- Aşağıdaki 2–5. sahne komutları bu derse göre sadeleştirildi.

## ✅ Kurgulandı (22 Ekim 2026)
- Çıktı: `stoaci-modern-hayatta/pazartesi-stoaci-tr-1080x1920.mp4` ve `…-en-…` — **27,3 sn**, 1080×1920, Gemini'nin kendi sesleri (korna, titreşim, ofis, yağmur).
- Kurgu: `bash scripts/social/stoaci/build.sh [müzik.mp3]`. Sıra: arabadan bakış (kanca + "Pazartesi sabahı. Bir Stoacı:") → trafikte zeytin → telefonu ters çevirir → toplantıda not → otobüs suyu sıçratır, kollarını yağmura açar → gece balkonda yazar, başını kaldırıp şehre bakar (Epiktetos cümlesi bunun üstünde) → marka kapanışı.
- Sahne klipleri: `02-telefon…`, `03-toplanti…`, `04-otobus-yagmur…`, `05-balkon…` (22 Ekim 2026'da eklendi). `01c-trafik-tepeden` kullanılmadı (1–4. sn'de otobüsler biçim değiştiriyor).

## Sahne 1 — Trafik (kanca)
```
Using this man as the character: an ancient philosopher with short grey hair and beard, wearing a simple undyed linen tunic and a long sand-coloured wool cloak, stands calmly in the middle of a modern city traffic jam on a grey Monday morning. Cars all around him are stuck bumper to bumper, drivers inside look stressed and frustrated, horns blaring, exhaust in the cold air. He is completely relaxed, slowly eating a single olive from his hand, looking around with mild curiosity and a faint smile. Funny, gentle contrast between ancient calm and modern chaos. Medium shot, slow push-in. Realistic, cinematic, 35mm film look, muted cool city palette with warm light on him, vertical 9:16, single continuous shot, no cuts. No logos, no brand names, no readable text.
Audio: car horns and city noise, no music, no dialogue.
```

## Sahne 2 — Telefon (tek eylem: telefonu ters çevirir)
```
Using this man as the character. Close medium shot at a small café table. A modern smartphone lies on the table in front of him, buzzing and lighting up with notifications. He calmly reaches out and turns the phone face down, then rests his hand on it and smiles slightly. Static camera, single continuous shot, no cuts. Realistic, cinematic, 35mm film look, warm soft morning light, vertical 9:16. No logos, no brand names, no readable text on the screen.
Audio: phone vibration that stops when he turns it over, quiet café ambience, no music, no dialogue.
```

## Sahne 3 — Toplantı (tek eylem: sakin not alır)
```
Using this man as the character. Medium shot at a modern glass office meeting table. Around him, blurred people in business suits argue and wave papers. He sits completely still and calm, slowly writing with a stylus on a small wooden wax tablet. Static camera, single continuous shot, no cuts. Realistic, cinematic, 35mm film look, cool office light with warm light on him, vertical 9:16. No logos, no brand names, no readable text.
Audio: overlapping tense voices and office noise, no music, no clear dialogue.
```

## Sahne 4 — Otobüs ve yağmur (tek eylem: ıslanınca gülümser)
```
Using this man as the character. Medium shot at a rainy city bus stop. A passing bus splashes a wave of puddle water onto him in slow motion. Soaked, he looks down at his wet cloak, then slowly smiles and opens his arms to the rain. Static camera, single continuous shot, no cuts. Realistic, cinematic, 35mm film look, grey rainy palette with warm glow on his face, vertical 9:16. No logos, no brand names, no readable text on the bus.
Audio: rain, bus engine, splash, then only rain, no music, no dialogue.
```

## Sahne 5 — Gece, balkon (tek eylem: deftere yazar)
```
Using this man as the character. Medium close-up on a small apartment balcony at night, glowing city lights blurred behind him. A small oil lamp beside him gives warm light. He writes slowly in a small leather notebook, then pauses and looks out at the city with a calm, content expression. Very slow push-in, single continuous shot, no cuts. Realistic, intimate, cinematic, 35mm film look, deep blue night with warm lamp light, vertical 9:16. No logos, no brand names, no readable text.
Audio: distant city hum, soft wind, the scratch of the pen, no music, no dialogue.
```

## Açıklama metni (taslak)

**EN (önce bu):**
> What would a Stoic do on a Monday? 😌
>
> Traffic, notifications, meetings, a missed bus. Two thousand years ago Epictetus said it: it's not events that disturb us, but our judgments about them.
>
> Stoikos — Stoic wisdom for everyday life. Link in bio.
>
> #stoicism #stoic #marcusaurelius #mindset #mondaymotivation #philosophy

**TR:**
> Sen bu durumda ne yapardın? 😌
>
> Trafik, bildirimler, toplantı, kaçan otobüs. Epiktetos iki bin yıl önce söyledi: bizi rahatsız eden olaylar değil, onlar hakkındaki yargılarımız.
>
> Stoikos — Stoacı bilgelik, günlük hayatta. Bağlantı profilde.
>
> #stoacılık #pazartesi #felsefe #sakinlik #stoicism
