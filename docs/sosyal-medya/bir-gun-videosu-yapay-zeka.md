# "Bir Stoacı Gün" — Gemini komutları

> Hazırlandı: 27 Kasım 2026 (kullanıcı seçimi: konu 1). "Yolculuk" videosunun düzeneğiyle (aynı kadın, aynı
> yürüyüş videosu `yolculuk-videosu/parca-2-yuruyus.mp4`, katmanlı kaydırma, kodla canlılar, kodla STOIKOS).
> Kadın bir günün içinden yürür: şafak → öğle → gün batımı → gece. Üstte sikke yerine **güneşin yayı** (gece ay).
> Sözler uygulamadaki doğrulanmış sözlerden (constants/content.ts): #37 Marcus, #74 Seneca (Öfke Üzerine),
> Marcus 9.32 (Yukarıdan videosundaki serbest uyarlama), #157 gelenek (akşam üç soru). Kapanış: "Felsefe okunmaz. Yaşanır."
>
> Her dünya için iki resim: **manzara** (21:9, Parça 1 kadın resmi üslup örneği olarak yüklenir) ve **ön katman**
> (21:9, yeşil zemin, görsel yükleme yok). Her resim için **yeni sohbet**. Dosya adları:
> `bir-gun-videosu/parca-3-manzara-<dünya>.jpg`, `parca-4-on-katman-<dünya>.jpg` (dünya: `safak`, `ogle`, `aksam`, `gece`).
> Hiçbir resimde yazı yok; STOIKOS kodla eklenir (her dünyada boş bırakılan bir yüzeye).

Ortak manzara başlangıcı (her manzara komutunun başı):
```
The attached image is ONLY a STYLE reference (character rendering, materials, colours, lighting softness). Do NOT include this woman or any person in the new image.

Create ONE very wide panoramic image, 21:9, for a side-scrolling scene. NO PEOPLE and NO ANIMALS anywhere.

STYLE: exactly the same stylized 3D animated feature film look as the reference: soft rounded shapes, slightly simplified forms, rich painterly textures, gentle haze, cozy and calm. Not photorealistic.

WALKING LINE: a flat path runs PERFECTLY HORIZONTALLY across the whole image; its walkable surface is at about 78–85% of the image height. Below it only the simple path surface, nothing tall. Above the path, nothing should overlap the path itself. Paint the WHOLE image down to the very bottom edge: the bottom 15% is the path's surface, fully detailed, never a flat empty colour.
```

## I · Şafak
Manzara (ortak başlangıcın altına):
```
SCENE: a small whitewashed seaside town at sunrise. The path is a quiet cobbled street running along the fronts of the houses.
- Left third: closed blue wooden shutters, potted geraniums, a stone staircase going up between two houses, soft blue morning shadow.
- Middle: a small bakery with its door open and warm golden light spilling out onto the street, a basket of round loaves on a bench outside. Above the bakery door hangs a plain smooth wooden signboard with NO letters and NO symbols.
- Right third: the street opens to the harbour; the sun is just rising over a calm sea, pale pink and gold sky, a few small fishing boats moored.
Light: fresh dawn light, cool blue shadows and warm golden highlights, long soft shadows.

No text, no signs with letters, no logos, no watermark.
```
Ön katman nesneleri: `terracotta pots with geraniums, a wooden crate, a coiled hose, a few cobblestones and a broken roof tile; cool dawn light with warm golden rim light from the right.`

## II · Öğle
Manzara:
```
SCENE: an old Mediterranean market street at bright noon, during the quiet midday break (no people). The path is a sunlit stone-paved street.
- Left third: market stalls under striped canvas awnings, crates of oranges, lemons and pomegranates, baskets of spices, hanging copper pots.
- Middle: a wide wooden stall with fabrics and hanging lanterns; on its front edge a plain smooth wooden board with NO letters. Laundry lines with colourful cloths stretched high between the houses, gently flapping.
- Right third: a small square with a stone fountain, a big plane tree giving shade, bright white walls.
Light: strong high midday sun, short crisp shadows, bright warm colours, a little heat haze.

No text, no signs with letters, no logos, no watermark.
```
Ön katman nesneleri: `wooden crates of oranges and lemons, a woven basket, a terracotta jug, a folded canvas awning corner; bright midday light from above.`

## III · Gün batımı
Manzara:
```
SCENE: a hilltop path high above a big old city at sunset. The path is a dirt track along the crest, edged with low stones.
- Left third: wild grass, a few cypress trees and a stone wall at the top of the hill.
- Middle: an old stone milestone standing beside the path, with a plain smooth front face with NO letters. Below and beyond the path, the whole city spreads out far away: thousands of tiny roofs, domes and towers in golden haze, a river winding through it.
- Right third: the sun setting on the horizon behind the distant city, the sky glowing orange, pink and violet, first lights appearing in the city.
Light: warm golden-hour backlight from the right, long shadows, a big calm open sky.

No text, no signs with letters, no logos, no watermark.
```
Ön katman nesneleri: `tall dry golden grass, wild thistles, a few flat stones and a low broken stone wall piece; warm sunset backlight from the right.`

## IV · Gece
Manzara:
```
SCENE: a quiet rooftop terrace garden at night under a starry sky with the Milky Way. The path is a smooth terracotta-tiled terrace floor.
- Left third: potted lemon trees and herbs, a string of tiny warm lights hanging between two posts.
- Middle: a small wooden table with one glowing oil lantern, a closed leather notebook and a pen on it, a simple chair. The leather notebook cover is plain and smooth, with NO letters.
- Right third: over the low terrace wall, the sleeping town below with a few warm windows, the dark sea and a bright crescent moon above.
Light: deep blue night, the Milky Way softly glowing, warm orange lantern light pooling on the table and floor.

No text, no signs with letters, no logos, no watermark.
```
Ön katman nesneleri: `potted herbs (rosemary, basil in dark tones), a terracotta pot, a folded blanket over a low stool edge, a few fallen lemon leaves; cool moonlight rim from the upper left, warm lantern glow from the right.`

### Ön katman komutu (her dünyada aynı; yalnız "OBJECTS" satırına o dünyanın nesnelerini yaz)
```
Create ONE very wide image, 21:9, used as a FOREGROUND layer for a side-scrolling scene.

STYLE: a stylized 3D animated feature film look, soft rounded shapes, painterly textures.

OBJECTS: <o dünyanın nesneleri>

Only along the BOTTOM 25% of the image: a loose, uneven row of these foreground elements seen very close to the camera. Their tops form an irregular line with gaps, never taller than 30% of the image height. Slightly out of focus (shallow depth of field), with soft rim light on their edges.

Everything else (the top 70% and all gaps) is a perfectly flat, uniform chroma-key green (#00B140): no gradient, no shadow, no sky, no other objects. Nothing green in the foreground objects themselves (any leaves in olive, dark or ochre tones).
No text, no logo, no watermark.
```

## Benim tarafım
- Aynı yolculuk düzeneği (`scripts/teaser/yolculuk.html` kalıbı), sabit ayak çizgisi.
- Canlılar: I fırından buhar + martılar + doğan güneş; II çamaşırların gölge dalgası + sıcak titreşimi + fıskiye; III şehirde yanan ışıklar + kuş sürüsü; IV yıldızlar + kayan yıldız + fener.
- Kadının ışığı saate göre (şafak serin-altın, öğle parlak, akşam turuncu, gece mavi + fener).
- Ses: kodla yumuşak ortam (aç-kapa kapılı ses YOK) + müzik + kapanışta ses imzası.
