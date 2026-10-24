# "An" videosu: yapay zekâ üretim rehberi

> Hazırlandı: 24 Ekim 2026. Araç: Gemini (Veo), dikey 9:16, 3 çekim × 8–10 sn. Kahraman: Bahçe'deki kadın (`bahce-videosu/00-kadin-referans.png`).
> Serinin beşincisi ve en iddialısı. Fikir **zamanı durdurmak**: yağmurlu, kaotik bir gece kavşağında durup gözlerini kapatıyor ve dünya donuyor. Yağmur damlaları havada asılı kalıyor, insanlar adımlarının ortasında taş kesiliyor. Bir tek o hareket ediyor.
> Stoacılıktaki karşılığı: olay ile tepki arasındaki **an**. Olayı değil, ona vereceğin cevabı seçersin.
> Akış: kaos ve donma → donmuş yağmurun içinden "STOIKOS" yazılı mermer kemere yürüyüş → bulutların üstünde, gün doğumunda bir dağ terası.
> Kurgu: donma anında ses kesilir, yalnız tek bir nefes duyulur. Bach kemerden geçerken girer. Terasta söz görünür (Marcus Aurelius, Düşünceler 8.47, serbest uyarlama): TR "Olay değil, ona dair yargın. İşte onu değiştirebilirsin." / EN "Not the event, but your judgment of it. That, you can change." Sonda logo kapanışı.

## Kurallar

- **Her çekim için Gemini'de yeni bir sohbet.** Çekim 1'de yalnız karakter görseli, Çekim 2 ve 3'te yalnız bir önceki çekimin son karesi yüklenir.
- Karakter tarifi her komutta aynen tekrar edilir.
- Ses: **"no spoken words in any language"**.
- Donma efekti beğenilmezse aynı komutla bir kez daha üret; Gemini her seferinde farklı çıkarır.

## Deneme 1'den dersler (24 Ekim 2026)
- Başa yine referans portresi eklendi (0–1 sn) → kurguda kesilir.
- **Donma olmadı:** yağmur parıltıya döndü ama insanlar ve bisiklet yürümeye devam etti. Video modelleri "her şey dursun" komutunda zorlanıyor.
- **Gerçek marka tabelaları çıktı** (CROCS benzeri beyaz yazı, kırmızı neon mağaza adı) → kullanılamaz.
- Düzeltme: mağazasız sokak (yalnız tabelasız ofis/apartman camları), donma "duraklatılmış film / fotoğraf" diye tarif edilir, insanların donduğu ayrıca ve sayıyla yazılır. Yine olmazsa donma kurguda yapılır (kare dondurma + yavaş yakınlaşma + ses kesilir).

## Çekim 1: Kavşakta donma (8 sn) — düzeltilmiş komut aşağıda, eski komut onun altında

**Düzeltilmiş (Deneme 2). Yükle:** yalnız `bahce-videosu/00-kadin-referans.png`, yeni sohbet

```
Use this image ONLY as the reference for the woman's appearance. Do NOT show this image or any studio portrait in the video. The video starts directly on the rainy street.

CHARACTER (keep exactly the same): a calm woman about 40 years old with long dark brown hair with a few silver strands, loosely braided over one shoulder, olive-toned skin, dark brown eyes. She wears a simple ankle-length undyed off-white linen tunic tied with a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders. Her hands are empty.

SETTING: a wide city crosswalk at night in heavy rain, between tall dark office buildings with plain lit windows. There are NO shops, NO shop signs, NO billboards, NO screens, NO neon letters and NO brand names anywhere in the frame. Light comes only from street lamps, traffic lights and car headlights reflecting on the wet black asphalt. About twenty people in dark coats cross the street in both directions under black umbrellas, looking at their phones. A cyclist rides through a puddle. Heavy rain falls.

CAMERA: static, medium-wide shot from her side, slightly behind her (three-quarter back view), at shoulder height. The camera does not move at all.

TIMELINE:
0–3 s: she stands still in the middle of the crosswalk while everyone rushes around her in the rain. She closes her eyes.
3–4 s: she takes one slow, deep breath.
4–8 s: TIME STOPS. From exactly 4 seconds until the end, the whole world becomes a paused film, like a still photograph: every raindrop hangs motionless in the air like a tiny glass bead; all twenty people stop mid-step and stay completely frozen like statues; every umbrella stops; the cyclist and the water splash from his wheel freeze in the air; cars stop. NOTHING in the background moves at all. Only the woman is alive: she slowly opens her eyes and looks calmly at the frozen raindrops in front of her, and her braid and the edge of her cloak move very gently.

STYLE: photorealistic, cinematic, shot on 35mm film with a 50mm lens, natural film grain, shallow depth of field. Cold blue night palette with red traffic-light reflections and warm light on her face. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a studio portrait or grey background at the start; any shop, sign, billboard, screen, logo, brand name or readable text; any person, umbrella, bicycle or car moving after 4 seconds; raindrops falling after 4 seconds; sparkles or magic particles; a stone arch, mountains or sunrise.

AUDIO: heavy rain, car horns, splashing footsteps, a dull crowd murmur with no spoken words in any language; at 4 seconds every sound cuts to total silence except one slow breath and a soft, high crystalline ringing. No music.
```

**Eski komut (Deneme 1):**

**Yükle:** yalnız `bahce-videosu/00-kadin-referans.png`

```
Use this image as the exact character. Keep her face, hair, clothing and cloak identical in every detail.

CHARACTER (keep exactly the same): a calm woman about 40 years old with long dark brown hair with a few silver strands, loosely braided over one shoulder, olive-toned skin, dark brown eyes. She wears a simple ankle-length undyed off-white linen tunic tied with a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders. Her hands are empty.

SETTING: a busy city crosswalk at night in heavy rain. Wet black asphalt reflecting red and white car lights, traffic lights, glowing shop windows. Dozens of people in dark coats rush across the street in both directions under black umbrellas, staring at phones; a car honks; a cyclist splashes through a puddle; heavy raindrops fall and bounce off the ground. Every sign, screen and shop window shows only blurred abstract light, never readable words or logos.

CAMERA POSITION: a medium shot from her side and slightly behind (three-quarter back view), at shoulder height, about two metres away. The camera is static.

TIMELINE:
0–3 s: she walks slowly across the crowded crosswalk in the rain while everyone rushes around her, bumping and hurrying.
3–5 s: she stops in the middle of the crosswalk, closes her eyes and takes one slow, deep breath, her shoulders rising and falling.
5–8 s: as she breathes out, the whole world FREEZES completely: thousands of raindrops hang motionless in the air like tiny glass beads catching the light, people stop mid-step, umbrellas stop mid-swing, the splash from the bicycle hangs frozen in the air, a car's headlights stay fixed. Only she remains alive: she slowly opens her eyes and calmly looks ahead at the frozen street. Her braid and cloak move gently; nothing else moves at all. End on this moment.

STYLE: photorealistic, cinematic, shot on 35mm film with a 50mm lens, natural film grain, shallow depth of field. Cold blue and neon-red night palette with warm light on her face. Single continuous shot, no cuts, no transitions, no slow-motion before the freeze. Vertical 9:16.

DO NOT SHOW: anyone else moving after the freeze; any readable text or logos; a stone arch, mountains or sunrise; a close-up portrait at the start.

AUDIO: heavy rain, car horns, splashing footsteps and the dull murmur of a crowd with no spoken words in any language; at the moment of the freeze all sound cuts to complete silence except one slow breath and a soft, high, crystalline ringing. No music.
```

## Çekim 2: Donmuş yağmurun içinden kemere (8 sn)

**Yükle:** yalnız Çekim 1'in son karesi (yeni sohbet)

```
Use this image as the exact first frame of the video and continue directly from it. Do not add any other image or portrait at the start.

CHARACTER (keep exactly the same as in the image): a calm woman about 40 years old with a long dark brown braid with a few silver strands over one shoulder, olive-toned skin, an ankle-length undyed off-white linen tunic, a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

THE ARCH (keep exactly the same): at the far end of the frozen street stands an ancient arch of pale weathered marble, out of place among the modern buildings. Across the top of the arch, large carved classical Roman capital letters read exactly "STOIKOS", clearly readable and correctly spelled: S-T-O-I-K-O-S. Through the arch shines warm, soft golden morning light, as if it opens onto another world.

THE WORLD IS FROZEN: raindrops hang motionless in the air everywhere like glass beads; people, umbrellas, cars and splashes are frozen exactly as in the image. Nothing moves except her.

CAMERA POSITION (very important): the camera is BEHIND her and follows her at shoulder height. We see her back, her braid and her cloak. She walks AWAY from the camera and never turns around.

TIMELINE:
0–3 s: from behind, she starts walking slowly through the frozen street, weaving between the frozen people. The suspended raindrops touch her cloak and burst softly into tiny sparkling droplets as she passes through them, leaving a clear tunnel in the frozen rain behind her.
3–5 s: she raises one hand and gently touches a single raindrop hanging in front of her; it ripples like liquid glass and catches the golden light from the arch.
5–8 s: she continues toward THE ARCH, which grows larger in the centre of the frame, the golden light falling on her. She stops just before passing under it. End on this moment, with "STOIKOS" clearly visible above her.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. Cold blue frozen night around her, warm gold glowing from the arch ahead. Very smooth, steady camera glide. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: anyone else moving; time restarting; her face; any readable text other than "STOIKOS"; logos; a portrait at the start.

AUDIO: near silence; soft crystalline chimes as each frozen raindrop bursts against her cloak, her slow footsteps on wet asphalt, a faint warm hum growing from the arch. No spoken words in any language, no music.
```

## Çekim 3: Bulutların üstünde (10 sn)

**Yükle:** yalnız Çekim 2'nin son karesi (yeni sohbet)

```
Use this image as the exact first frame of the video and continue directly from it. Do not add any other image or portrait at the start.

CHARACTER (keep exactly the same): a calm woman about 40 years old with a long dark brown braid with a few silver strands over one shoulder, olive-toned skin, dark brown eyes, an ankle-length undyed off-white linen tunic, a thin brown leather belt, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

SETTING after the arch: an ancient terrace of pale stone slabs on the summit of a high mountain, far above a vast, endless sea of soft white clouds glowing gold and pink in the rising sun. A few distant mountain peaks rise out of the clouds. Clear pale sky, gentle wind, total peace. She is completely alone: no people, no city, no rain, no buildings except the low stone edge of the terrace.

CAMERA POSITION: the camera follows BEHIND her through the arch, then slowly circles around to her side so that at the end we see her face in soft profile against the sunrise.

TIMELINE:
0–3 s: from behind, she steps through the marble arch out of the dark frozen night into the bright sunrise; the light washes over her and the wind lifts her braid and the edge of her cloak.
3–6 s: she walks slowly across the stone terrace to its edge, high above the sea of clouds glowing in the sun.
6–10 s: she stops at the edge and lets her arms rest open slightly at her sides, palms facing forward. The camera moves to her side: her eyes are closed, she breathes in deeply, and a quiet, peaceful smile appears; warm golden sunlight falls across her face. The clouds drift slowly below. End on this wide, serene moment.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. Warm gold, soft pink and pale blue palette, deeply calm and luminous atmosphere. Very slow, smooth camera movement. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: rain, night, the city, any other people, any text or logos, fast camera moves, a portrait at the very first frame.

AUDIO: the night silence opening into soft high-altitude wind, the flutter of her cloak, one distant bird. No spoken words in any language, no music.
```
