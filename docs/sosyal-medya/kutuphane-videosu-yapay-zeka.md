# "Kütüphane" videosu: yapay zekâ üretim rehberi

> Hazırlandı: 25 Ekim 2026. Araç: Gemini (Veo), dikey 9:16, 3 çekim × 8–10 sn. Kahraman: kadın (`bahce-videosu/00-kadin-referans.png`).
> Serinin yedincisi. Akış: kalabalık, gürültülü bir havalimanı terminali (rötar, koşuşturma) → koridorun sonunda, yeri yokmuş gibi duran eski ahşap kapı, üstünde "STOIKOS" → içeride sessiz, ışık hüzmeleri düşen eski bir kütüphane → pencere kenarında oturur, kitabı açar, gözlerini kapatır.
> Söz (Seneca, Mektuplar 2, serbest uyarlama): TR "Her yerde olan, hiçbir yerde değildir." / EN "Everywhere is nowhere."
> Kurgu: kapı kapanınca terminal gürültüsü kesilir, Bach kütüphanede girer, söz pencere kenarında, sonda logo.

## Kurallar (önceki altı videodan)

- **Her çekim için Gemini'de yeni bir sohbet.** Çekim 1'de yalnız kadın karakter görseli, Çekim 2 ve 3'te yalnız bir önceki çekimin son karesi (Claude gönderir), "+" ile yüklenir.
- Son karedeki mekân komutta **madde madde** tarif edilir, **ilk 2 saniye kamera kilitli** (Fener'de kapı birebir böyle tuttu).
- **Havalimanında yazı riski yüksek:** uçuş panoları, tabelalar ve havayolu logoları. Komutta hepsi "bulanık, okunmaz ışık" olarak tarif edildi. Yine de yazı çıkarsa kurguda bulanıklaştırılır ya da çekim yeniden üretilir.
- Kitap sayfalarında da **okunabilir yazı olmasın**.
- Ses: **"no spoken words in any language"**. Havalimanı anonsları konuşmaya dönüşebilir.

## Çekim 1a: Havalimanında 10 saniyelik yürüyüş (yeni, 25 Ekim 2026)

İlk denemede (`kutuphane-videosu/cekim-1b-kapi-gemini-720p.mp4`) havalimanı yalnızca 3 saniye sürdü, kalabalık ve uğultu zayıftı, uçuş panosunda "Departures" yazısı okunuyordu. Kapı kısmı (3,5–10 sn) ise iyi çıktı ve **Çekim 1b** olarak kullanılıyor. Havalimanı yürüyüşü ayrı ve tam 10 saniyelik bir çekim olarak yeniden üretiliyor. Son 2 saniyede kadın beyaz yan koridora girer; Çekim 1b'nin ilk karesi de koridorda arkadan çekilmiş kadını gösterdiği için iki çekim birbirine bağlanır.

**Yeni sohbet. Yükle:** yalnız `bahce-videosu/00-kadin-referans.png`

```
Use this image ONLY as the reference for the woman's appearance. Do NOT show this image or any studio portrait in the video. The video starts directly in the middle of the airport crowd.

CHARACTER (keep exactly the same): a calm woman about 40 years old with long dark brown hair with a few silver strands, loosely braided over one shoulder, olive-toned skin, dark brown eyes. She wears a simple ankle-length undyed off-white linen tunic tied with a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders. Her hands are empty.

SETTING: an enormous, overcrowded, chaotic international airport terminal at night during mass flight delays. The hall is PACKED: hundreds of stressed travellers fill every part of the frame, shoulder to shoulder. People run past dragging suitcases, a family argues, a man shouts silently into his phone, a child cries, people sleep on the floor between bags, long tangled queues snake through barriers, a luggage trolley train and an electric cart push through the crowd, a cleaning machine hums. Everyone is rushing, bumping, checking phones and watches. Harsh flickering white ceiling lights, glass walls with aircraft lights outside in the dark.
There are NO departure boards, NO screens with text, NO signs, NO airline logos, NO brand names and NO readable text anywhere in the frame; any screens in the distance are only blurred coloured light.

CAMERA AND TIMELINE (one continuous 10-second walk):
0–6 s: the camera moves backwards in front of her at chest height while she walks slowly and calmly straight through the middle of the packed crowd toward the camera. Her face is serene and unhurried; around her the crowd is a blur of rushing people, suitcases and carts crossing in front of and behind her, some bumping her shoulder. She never speeds up.
6–8 s: she walks past the camera; the camera turns and now follows her from behind at shoulder height as she continues through the crowd.
8–10 s: from behind, she turns off the main hall into a quiet, narrow, plain white side corridor with a light grey stone floor; the crowd stays behind her in the hall. End with her walking away from the camera into the empty white corridor, seen from behind.

STYLE: photorealistic, cinematic, shot on 35mm film, natural film grain, shallow depth of field. Cold, harsh white-blue airport light, slight motion blur on the rushing crowd; the only warm tones are her cloak and skin. Handheld camera with a slight nervous shake. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a studio portrait or grey background; departure boards, signs, logos, brand names or any readable text; a door; the woman running or looking stressed; an empty or quiet main hall.

AUDIO: loud, dense airport chaos: echoing crowd roar, hundreds of overlapping footsteps, rolling suitcase wheels, beeping carts, a crying child, phone ringtones, repeated airport announcement chimes, a cleaning machine humming; all voices are an unintelligible murmur with no spoken words in any language. In the last 2 seconds, inside the white corridor, the noise becomes muffled behind her. No music.
```

## Çekim 1b: Koridor ve kapı (hazır)

`cekim-1b-kapi-gemini-720p.mp4` dosyasının 3,5–10. saniyeleri kullanılıyor: koridorda arkadan yürür, eski meşe kapı ve "STOIKOS" yazısı, elini kapıya koyar. **Çekim 2, bu çekimin son karesiyle (`cekim-1b-son-kare.png`) başlar.**

## (Eski) Çekim 1: Havalimanı ve kapı (8 sn)

**Yeni sohbet. Yükle:** yalnız `bahce-videosu/00-kadin-referans.png`

```
Use this image ONLY as the reference for the woman's appearance. Do NOT show this image or any studio portrait in the video. The video starts directly in the airport.

CHARACTER (keep exactly the same): a calm woman about 40 years old with long dark brown hair with a few silver strands, loosely braided over one shoulder, olive-toned skin, dark brown eyes. She wears a simple ankle-length undyed off-white linen tunic tied with a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders. Her hands are empty.

SETTING: a huge, crowded, stressful modern airport terminal at night during flight delays. Hundreds of travellers rush in every direction dragging suitcases, staring at phones, sitting on the floor, queuing anxiously; a cleaning machine passes; harsh white ceiling lights and glass walls with planes outside in the dark. All departure boards and screens show only blurred, unreadable red and white light. There are NO airline logos, NO brand names, NO shop signs and NO readable text anywhere.
At the far end of a long side corridor, set into a plain white terminal wall where it clearly does not belong, is an old, tall, arched door of dark carved oak with black iron hinges, in a frame of pale marble. Across the marble above the door, carved classical Roman capital letters read exactly "STOIKOS", clearly readable and correctly spelled: S-T-O-I-K-O-S. Warm golden light glows faintly around the edges of the closed door.

CAMERA: behind her at shoulder height, following her. We see her back, her braid and her cloak. She never turns to face the camera.

TIMELINE:
0–3 s: from behind, she walks slowly and calmly through the rushing crowd while everyone hurries past her with suitcases.
3–6 s: she turns into the quiet side corridor; the crowd falls behind and the old door with "STOIKOS" above it grows larger ahead of her.
6–8 s: she stops in front of the closed door and places one hand flat on the dark wood. End on this moment, with "STOIKOS" clearly visible above her. The door stays closed.

STYLE: photorealistic, cinematic, shot on 35mm film, natural film grain, shallow depth of field. Cold, harsh white-blue airport light; the only warm tones are her cloak and the golden glow around the door. Handheld camera with a slight nervous shake. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a studio portrait or grey background; airline logos, brand names, shop signs or any readable text other than "STOIKOS"; the door opening; the inside of the library; her face.

AUDIO: busy terminal echo, rolling suitcase wheels, footsteps, beeping, a dull crowd murmur, distant muffled announcement chimes with no spoken words in any language. No music.
```

## Çekim 2: Kapı açılır, kütüphane (8 sn) — ayrıntılı sürüm (25 Ekim 2026) ✅ tuttu: `cekim-2-kutuphane-gemini-720p.mp4`

**Yeni sohbet. Yükle:** yalnız `kutuphane-videosu/cekim-1b-son-kare.png`

İlk denemede (`kutuphane-videosu/cekim-2-deneme1-kapi-farkli.mp4`) Gemini görseli ilk kare olarak kullanmadı: kapıyı yeniden çizdi (dikdörtgen kapı, ince çerçeve, minicik ve yanlış yazılmış "STOIIKOS"), kadını da pelerini açık, örgüsü görünür hâlde çizdi. Kütüphane içi ise çok güzeldi (3,5–10 sn yedek olarak duruyor). Bu sürümde ilk karedeki her nesne yeri, boyutu ve rengiyle tek tek tarif ediliyor (Fener'de işe yarayan yöntem).

```
Use this image as the EXACT first frame of the video and continue directly from it, pixel for pixel. Do not redraw, reinterpret or re-imagine the image. Do not show any studio portrait or grey background.

THE FIRST FRAME, EXACTLY AS IT IS (keep every detail for the first 3 seconds):
- Framing: we look straight at a door from behind a woman, centred, the camera at chest height. The door frame fills almost the whole width of the image.
- The door frame: a wide, flat, square-topped surround of pale cream marble with light grey veins, with a thin moulded edge. Its top band is tall and wide.
- The letters: in the top band of the marble frame, large carved classical Roman capital letters read exactly "STOIKOS", seven letters, S-T-O-I-K-O-S, in warm bronze-gold, spanning about two thirds of the frame's width. They are big and clearly readable. They stay in exactly this place, size and spelling for the whole time they are visible. Never "STOIIKOS", never smaller, never missing.
- Inside the marble frame: a rounded arch, and inside the arch a tall dark brown oak door made of vertical planks with a carved pointed-arch panel at the top, two large black wrought-iron scroll hinges across the upper part of the door at the height of the woman's head, a black iron lever handle with a keyhole on the left side at waist height. A thin line of warm golden light glows around the edge of the closed door.
- The wall: plain smooth white wall on both sides, a dark grey skirting strip at the bottom, a small white plaque on the wall to the right of the frame.
- The floor: light grey speckled terrazzo tiles.
- The woman: standing right in front of the door in the centre, seen completely from behind. Her dark hair is gathered at the back of her head; her braid is hidden. The long heavy sand-coloured wool cloak covers her whole back and both shoulders and falls almost to her ankles, so her tunic is NOT visible from behind except a little white hem at the bottom. Brown leather sandals. Her right hand is raised and resting flat on the left half of the door at shoulder height; a little white linen sleeve shows at her wrist.

CAMERA: for the first 3 seconds the camera stays perfectly still, in exactly the same position and framing as the first frame, so the marble frame and the word "STOIKOS" stay fully visible and sharp. Only after she has stepped through the doorway does the camera glide forward through the same arch after her.

TIMELINE:
0–3 s: with the hand that is already on the door, she slowly pushes the SAME oak door inward on its iron hinges. It swings open into the arch and warm golden light and floating dust pour out around her. She steps forward through the arch, her back to the camera. The marble frame and "STOIKOS" above it stay exactly where they are.
3–4 s: the camera passes under the same marble arch after her; the airport noise is suddenly gone.
4–8 s: inside: a vast, silent old library with two-storey walls of dark wooden bookshelves full of old leather-bound books, wooden rolling ladders, a gallery with a carved wooden railing, long reading tables with small green-shaded lamps, tall arched windows letting in soft golden late-afternoon sunbeams full of drifting dust. She walks slowly down the central aisle between the shelves, the fingertips of one hand lightly brushing the spines of the books. The library is completely empty except for her.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. The palette changes from cold white at the door to warm amber, honey and gold inside. Smooth, steady camera. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a different door, a rectangular door, a thinner or different frame, a different wall or floor at the start; the word "STOIKOS" small, misspelled, moved or missing; her braid or her white tunic visible from behind at the start; other people; readable titles or text on books, shelves or anywhere; logos; her face; a studio portrait.

AUDIO: muffled airport noise, the deep creak of the heavy door, then sudden deep silence: soft footsteps on old wooden floorboards, the faint whisper of fingertips on book spines, a clock ticking far away. No spoken words in any language, no music.
```

## (Eski) Çekim 2: Kapı açılır, kütüphane (8 sn)

**Yeni sohbet. Yükle:** yalnız `kutuphane-videosu/cekim-1b-son-kare.png`

```
Use this image as the exact first frame of the video and continue directly from it. Do not show any studio portrait or grey background.

KEEP THE DOOR AND CORRIDOR IDENTICAL TO THE IMAGE (very important). Do not redesign, replace, resize or restyle anything. For the first 2 seconds everything stays exactly as in the first frame: the same tall arched door of dark carved oak with black iron hinges, the same pale marble frame, the same carved letters "STOIKOS" above it, the same plain white wall and corridor around it, and the woman in exactly the same position with her hand on the door. Only the door moves when it opens.

CHARACTER (keep exactly the same as in the image): a calm woman about 40 years old with a long dark brown braid with a few silver strands over one shoulder, an ankle-length undyed off-white linen tunic, a thin brown leather belt, brown leather sandals, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

CAMERA: for the first 2 seconds the camera stays perfectly still in exactly the same position and framing as the first frame. After she has stepped through the doorway, the camera glides in after her, behind her.

TIMELINE:
0–2 s: with the hand that is already on the door, she slowly pushes the same door inward. It opens, and warm golden light and floating dust pour out. She steps through, her back to the camera.
2–3 s: the camera follows her through the doorway; the airport noise is suddenly gone.
3–8 s: inside: a vast, silent old library with two-storey walls of dark wooden bookshelves full of old leather-bound books, wooden rolling ladders, a gallery with a carved wooden railing, long reading tables with small green-shaded lamps, tall arched windows letting in soft golden late-afternoon sunbeams full of drifting dust. She walks slowly down the central aisle between the shelves, the fingertips of one hand lightly brushing the spines of the books. The library is completely empty except for her.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. The palette changes from cold white-blue at the door to warm amber, honey and gold inside. Smooth, steady camera. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a different door or a different corridor at the start; other people; readable titles or text on books, shelves or anywhere; logos; her face; a studio portrait.

AUDIO: airport noise, the creak of the heavy door, then sudden deep silence: soft footsteps on old wooden floorboards, the faint whisper of fingertips on book spines, a clock ticking far away. No spoken words in any language, no music.
```

## Çekim 3: Pencere kenarı (10 sn) — ayrıntılı sürüm (25 Ekim 2026)

**Yeni sohbet. Yükle:** yalnız `kutuphane-videosu/cekim-2-son-kare.png`

Çekim 2'nin ayrıntılı sürümü ilk denemede tuttu (kapı, mermer çerçeve ve "STOIKOS" birebir kaldı). Aynı yöntem: son karedeki her şey tek tek tarif edildi.

```
Use this image as the EXACT first frame of the video and continue directly from it. Do not redraw, reinterpret or re-imagine the image. Do not show any studio portrait or grey background.

THE FIRST FRAME, EXACTLY AS IT IS (keep every detail for the first 3 seconds):
- Framing: we stand in a light wooden-floored aisle of a round, two-storey old library, looking forward; the woman is in the centre, seen from behind, walking away from us.
- Upper level: a curved gallery with a carved light-wood balustrade (turned wooden balusters) running around the room, tall bookshelves behind it, and two tall arched windows with small panes, glowing with bright golden sunlight.
- Lower level: tall dark-honey wooden bookshelves full of old leather-bound books on both sides; a tall wooden rolling ladder leaning on the shelves on the right; two more tall arched windows with small panes on the left and right of the back wall; a long wooden reading table with wooden chairs on the left, with brass lamps with green glass shades.
- Light: warm golden sunbeams with soft haze and drifting dust; long soft shadows on the pale wooden floorboards.
- The woman: seen from behind, centred, her dark brown hair loosely gathered at the back of her head, a long heavy sand-coloured wool cloak covering her whole back and both shoulders down to her calves, brown leather sandals. Her right arm is stretched out to the side, the fingertips just leaving the books on the right.

CHARACTER (keep exactly the same): a calm woman about 40 years old, dark brown hair loosely gathered at the back, olive-toned skin, dark brown eyes, an ankle-length undyed off-white linen tunic with a thin brown leather belt under the long heavy sand-coloured wool cloak that covers BOTH shoulders, brown leather sandals.

CAMERA: for the first 3 seconds the camera stays in exactly the same position and framing as the first frame and only follows her slowly from behind; there is no cut and no jump to a new place. The same room, the same gallery, the same windows, the same table and lamps.

TIMELINE:
0–3 s: from behind, she walks a few more slow steps along the same aisle toward the back of the same room and takes one old leather-bound book from a shelf.
3–6 s: she sits down on a cushioned window seat in the deep recess of one of the same tall arched windows on the lower level, warm sunlight falling across her, and opens the book on her lap. The pages are old and pale, with no readable text.
6–10 s: the camera slowly moves around to her side so we see her face in soft profile in the golden window light. She looks up from the book, closes her eyes, takes one slow breath, and a quiet, peaceful smile appears. Dust drifts slowly through the sunbeams around her. End on this calm, intimate moment.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. Warm amber, honey and gold palette, deeply calm atmosphere. Very slow, smooth camera movement. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a different library, a different room or a different woman at the start; a braid over her shoulder; the cloak changing colour; other people; readable text on the book pages, covers or shelves; logos; the airport or the door; a studio portrait; fast camera moves.

AUDIO: near silence; soft footsteps on wood, the gentle sound of pages turning, a distant clock, faint birdsong outside the window. No spoken words in any language, no music.
```

## (Eski) Çekim 3: Pencere kenarı (10 sn)

**Yeni sohbet. Yükle:** yalnız Çekim 2'nin son karesi

```
Use this image as the exact first frame of the video and continue directly from it. Do not show any studio portrait or grey background.

KEEP THE LIBRARY IDENTICAL TO THE IMAGE (very important). Do not redesign, replace or restyle anything. For the first 2 seconds everything stays exactly as in the first frame: the same dark wooden bookshelves full of old leather-bound books, the same reading tables and green-shaded lamps, the same tall arched windows and golden sunbeams with drifting dust, and the woman in exactly the same position, size and clothing. The camera starts in exactly the same position and framing and follows her smoothly; there is no cut and no jump to a new place.

CHARACTER (keep exactly the same): a calm woman about 40 years old with a long dark brown braid with a few silver strands over one shoulder, olive-toned skin, dark brown eyes, an ankle-length undyed off-white linen tunic, a thin brown leather belt, and a long heavy sand-coloured wool cloak that covers BOTH shoulders.

TIMELINE:
0–3 s: from behind, she walks a few more steps along the same aisle and takes one old leather-bound book from a shelf.
3–6 s: she sits down on a cushioned window seat in the deep stone recess of a tall arched window, warm sunlight falling across her, and opens the book on her lap. The pages are old and pale, with no readable text.
6–10 s: the camera slowly moves around to her side so we see her face in soft profile in the golden window light. She looks up from the book, closes her eyes, takes one slow breath, and a quiet, peaceful smile appears. Dust drifts slowly through the sunbeams around her. End on this calm, intimate moment.

STYLE: photorealistic, cinematic, 35mm film, natural film grain, shallow depth of field. Warm amber, honey and gold palette, deeply calm atmosphere. Very slow, smooth camera movement. Single continuous shot, no cuts, no transitions. Vertical 9:16.

DO NOT SHOW: a different library or a different woman at the start; other people; readable text on the book pages, covers or shelves; logos; the airport; a studio portrait; fast camera moves.

AUDIO: near silence; soft footsteps on wood, the gentle sound of pages turning, a distant clock, faint birdsong outside the window. No spoken words in any language, no music.
```
