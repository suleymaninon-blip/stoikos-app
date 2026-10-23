# "Bahçe" videosu: yapay zekâ üretim rehberi

> Hazırlandı: 23 Ekim 2026. Araç: Gemini (görsel + Veo video), dikey 9:16. Önce 1 karakter görseli, sonra 3 çekim × 8–10 sn.
> Serinin dördüncüsü (Kapı → Stoa → Rıhtım → **Bahçe**): kargaşa → "STOIKOS" yazılı geçit → huzur.
> **Bu sefer kahraman bir kadın.** Stoacılar felsefenin kadınlar için de olduğunu söylemiş; Musonius Rufus'un bu konuda bir dersi var.
> Erkek filozofla aynı giysi dili kullanılıyor (keten tunik + kum rengi pelerin) ki seri tutarlı görünsün.
> Akış: akşam, kalabalık ve gürültülü bir çarşı sokağı → yüksek taş duvardaki ahşap bahçe kapısı, üstündeki taş kirişte oyma "STOIKOS" → içeride altın saatte sessiz bir zeytin bahçesi ve küçük taş çeşme.
> Kurgu: Bach müziği kapı açılınca girer. Bahçede söz görünür (Seneca, Mektuplar 56, serbest uyarlama): TR "Huzur dışarıda bulunmaz. İçeride kurulur." / EN "Calm isn't found outside. It is built within." Sonda logo kapanışı.

## Kurallar

- **Her çekim için Gemini'de yeni bir sohbet aç.** Aynı sohbette önceki referans yüzü çekimin başına ekliyor (Rıhtım'da oldu).
- Çekim 1'de yalnız **karakter görselini** yükle. Çekim 2 ve 3'te yalnız **bir önceki çekimin son karesini** yükle (Claude çıkarıp gönderir).
- Kamera hep kadının **arkasında**. Yüzü yalnız Çekim 3'ün sonunda, profilden görünür.
- Sese mutlaka şunu ekle: **"no spoken words in any language"**. Çarşı sahnesinde satıcı bağırışları konuşmaya dönüşebilir.

## Adım 0: Karakter görseli (bir kez)

Gemini'de görsel üret. Beğendiğin görseli `docs/sosyal-medya/bahce-videosu/00-kadin-referans.png` olarak kaydetmek üzere gönder.

```
A photorealistic full-body portrait of a calm, wise woman, about 40 years old, standing and facing the camera against a plain warm grey background, soft natural window light from the left.

She has long dark brown hair with a few natural silver strands, loosely braided over one shoulder, an olive-toned Mediterranean complexion, dark brown eyes, a natural face with no heavy makeup, and a serene, quietly confident expression with a faint smile.

She wears a simple ankle-length undyed off-white linen tunic in the ancient Greek style, tied at the waist with a thin brown leather belt, plain brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders and falls to her calves. No jewellery except one small plain silver ring. Her hands are relaxed at her sides and empty.

Modest, dignified, timeless; not glamorous, not a fashion photo. Shot on 35mm film, natural film grain, soft shadows, vertical 9:16. No text, no logos, no background objects.
```

## Çekim 1: Akşam çarşısı (8 sn)

**Yükle:** yalnız `00-kadin-referans.png`

```
Use this image as the exact character. Keep her face, hair, clothing and cloak identical in every detail.

CHARACTER (keep exactly the same): a calm woman about 40 years old with long dark brown hair with a few silver strands, loosely braided over one shoulder, olive-toned skin. She wears a simple ankle-length undyed off-white linen tunic tied with a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders and falls straight down her back to her calves. Her hands are empty.

THE GATE (keep exactly the same): set into a tall, old, sun-bleached cream stone wall, a large arched wooden garden gate made of heavy weathered dark oak planks with black iron hinges and studs. The two gate doors are CLOSED. Directly above the gate, a pale stone lintel carries large carved classical Roman capital letters that read exactly "STOIKOS", clearly readable and correctly spelled: S-T-O-I-K-O-S. A few green olive branches hang over the top of the wall.

CAMERA POSITION (very important): the camera is BEHIND her for the entire shot, at her shoulder height, about two metres away. We see the back of her head, her braid, her back and her cloak. She walks AWAY from the camera. She never turns around and never looks at the camera. The camera never moves in front of her.

SETTING: a narrow, crowded, chaotic old-city market street at dusk. Harsh neon signs and bare hanging bulbs, flickering screens in shop windows, scooters weaving and honking through the crowd, vendors waving goods, people rushing in both directions staring at glowing phones, shopping bags, steam from street food stalls. Busy, loud, overwhelming. Every sign, screen and label shows only blurred abstract shapes and colours, never readable words or logos. At the far end of the street, THE GATE stands in the stone wall, glowing faintly at its edges with warm light from behind.

TIMELINE:
0–3 s: from behind, she walks slowly and calmly through the rushing crowd with an unhurried, steady pace while everyone around her hurries and pushes.
3–6 s: the crowd thins; THE GATE with "STOIKOS" carved above it grows larger in the centre of the frame ahead of her.
6–8 s: she stops right in front of the closed gate and raises both hands, placing her palms flat on the wooden doors. End on this moment. The gate stays closed.

STYLE: photorealistic, cinematic, shot on 35mm film with a 35mm lens, natural film grain, shallow depth of field. Harsh mixed neon and cold blue light in the street; the only warm tones are her cloak and the faint glow around the gate. Handheld camera following behind her with a slight nervous shake. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: her face; the inside of the garden, olive trees inside, golden light or a fountain; any text other than "STOIKOS"; logos or brand names; the gate opening; anyone else touching the gate; a close-up portrait at the start.

AUDIO: dense market noise, scooter horns, clattering, sizzling street food, footsteps, a dull murmur of crowds with no spoken words in any language. No music, no dialogue, no shouting of words.
```

## Çekim 2: Kapıyı açar, bahçeye girer (8 sn)

**Yükle:** yalnız Çekim 1'in son karesi (yeni sohbet)

```
Use this image as the exact first frame of the video and continue directly from it. Do not add any other image or portrait at the start.

CHARACTER (keep exactly the same as in the image): a calm woman about 40 years old with a long dark brown braid over one shoulder, an ankle-length undyed off-white linen tunic, a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

THE GATE (keep exactly the same as in the image): an arched heavy dark oak garden gate with black iron studs in a tall cream stone wall, with "STOIKOS" carved in classical Roman capital letters on the stone lintel above.

CAMERA POSITION (very important): the camera stays BEHIND her the whole time, at shoulder height. We always see her back. She never turns to face the camera.

TIMELINE:
0–2 s: she pushes forward with both palms; the heavy gate doors begin to swing open INWARD, away from the camera.
2–5 s: the doors open wide. Warm golden evening sunlight pours through the opening onto her, outlining her silhouette, her braid and her cloak with golden light. The market noise behind her fades away. Through the gateway we see a quiet walled garden of old silver-green olive trees.
5–8 s: she steps through the gateway into the garden, her back to the camera, and walks a few slow steps along a narrow gravel path between the olive trees.

The camera follows her through the gateway, perfectly smooth and steady now. Single continuous shot, no cuts. The doors are opened only by her hands, never by themselves, and they do not close again. Nobody else is in the garden.

STYLE: photorealistic, cinematic, 35mm film, natural film grain. The palette changes from cold neon blue at the edges of the frame to warm soft gold in the centre. Vertical 9:16.

DO NOT SHOW: her face; any other people; the gate closing; any text other than "STOIKOS"; logos; a portrait or close-up of a face at the start.

AUDIO: market noise, the deep creak of heavy wooden doors; as they open, the noise fades out completely, replaced by soft wind in olive leaves, a few birds and footsteps on gravel. No spoken words in any language, no music.
```

## Çekim 3: Zeytin bahçesi ve çeşme (10 sn)

**Yükle:** yalnız Çekim 2'nin son karesi (yeni sohbet)

```
Use this image as the exact first frame of the video and continue directly from it. Do not add any other image or portrait at the start.

CHARACTER (keep exactly the same): a calm woman about 40 years old with a long dark brown braid with a few silver strands over one shoulder, olive-toned skin, an ankle-length undyed off-white linen tunic, a thin brown leather belt, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

SETTING: a quiet, sunlit walled garden at golden hour, enclosed by old cream stone walls. Ancient olive trees with twisted grey trunks and silver-green leaves moving gently in a soft breeze. Warm low sunlight filters through the leaves and makes moving dappled patterns on the ground. A narrow gravel path leads to a small round old stone fountain with a thin, gentle trickle of water. Next to the fountain, a simple low stone bench. Lavender and wild grass at the base of the walls. She is completely alone: no other people, no city, no market, no neon, no modern objects.

CAMERA POSITION: the camera starts BEHIND her and slowly circles to her side during the last seconds, so we finally see her face in soft profile.

TIMELINE:
0–4 s: from behind, she walks slowly along the gravel path toward the stone fountain, the fingertips of one hand brushing the silver leaves of a low olive branch as she passes.
4–7 s: she reaches the fountain, sits down on the stone bench beside it, and rests her hands in her lap. The water trickles quietly.
7–10 s: the camera slowly moves to her side. She closes her eyes, takes one slow deep breath, and a gentle, peaceful smile appears; warm sunlight falls across her face in soft profile. Leaves and light move gently around her. End on this calm, intimate moment.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. Warm gold, soft green and cream palette, deeply calm atmosphere. Very slow, smooth camera movement. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: the market, neon, crowds, the gate, any other people, any text or logos, fast camera moves, a portrait close-up at the very first frame.

AUDIO: near silence; soft breeze through olive leaves, gentle trickling water, footsteps on gravel, one or two distant birds. No spoken words in any language, no music.
```
