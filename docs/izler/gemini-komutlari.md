# İzler sikkeleri — Gemini komutları (23 Kasım 2026)

Üslup örneği: `stil-ornegi.jpg` (pirinç zeytin dalı; yalnız üslup için, zeytin dalı bir program sikkesi değil).
Her sikke için **yeni sohbet** aç, `stil-ornegi.jpg`'yi ekle, aşağıdaki komutu `[METAL]` ve `[MOTIF]` doldurarak yapıştır.
Çıktıyı `kaynak/<id>.jpg` olarak koy, sonra: `bash scripts/brand/cut-trace-coins.sh <id>` → `assets/traces/<id>.webp`,
ve `constants/traceImages.ts`'e satırı ekle.

```
Match the exact style, lighting, rim, size and framing of the attached coin. Only change the metal tone and the motif.
A single ancient-style coin, photographed straight from above (orthographic, perfectly circular, not tilted, not perspective), centered and filling 88% of a square 1024×1024 image.
Background: perfectly flat solid pure white (#FFFFFF). No texture, no gradient, no table, no cast shadow on the background.
The coin: thick raised plain rim, a recessed groove just inside the rim, slightly domed field, [METAL], subtle aged patina in the recesses, softly polished highlights on the raised parts, soft light from the top-left.
In the center, one raised relief motif: [MOTIF]. The motif is simple, bold and clearly readable even when the coin is shown small (64 px), centered, about 55% of the coin's diameter.
The raised motif must be clearly brighter and more polished than the flat field around it.
Style: realistic museum coin photograph, fine matte metal texture.
DO NOT include: any text, letters, numbers, inscriptions or writing on the rim; portraits or people; flags; crescent moons; stars; religious symbols; logos; a second coin.
```

| id | Program | [METAL] | [MOTIF] | Durum |
|---|---|---|---|---|
| control | Kontrol Dairesi | dark bronze with a faint green patina | a ship's steering wheel (helm) with eight spokes and round handles, seen flat from the front | ✅ |
| calm | İç Sakinlik | warm golden brass | an ancient Roman oil lamp seen from the side, a small calm flame rising from its spout, a ring handle on the left | ✅ |
| anger | Öfkeyle Çalışmak | reddish copper-bronze | a drawn bow with an arrow nocked and pointing right, string pulled back, arrow not yet released | |
| regard | Başkalarının Gözü | cool silvery dark bronze | a single ancient Greek theatre mask with a calm neutral expression, front view, empty eye holes, ribbons at the sides | |
| time | Zamanın Kısalığı | dark bronze with a slight plum tint | a sundial seen from above: round dial with twelve hour marks, a triangular gnomon in the middle, its shadow falling across the dial | |
| grief | Kayıpla Yaşamak | very dark blue-black patinated bronze | a short branch with three leaves, and one single leaf falling below it | |
| enough | Az ile Yetinmek | golden brass | a single upright ear of wheat on a short stem | |
| work | İşte Stoacı Olmak | bronze with teal verdigris patina | three hexagonal honeycomb cells with one small bee flying above them | |
| patience | Sabır | rose copper | a single ripe fig with one fig leaf on its stem | |
| criticism | Eleştiriyi Kaldırmak | warm grey iron-bronze | a blacksmith's anvil seen from the side, three small sparks above it, no hammer | |
| mortality | Ölümlülük | pewter grey | a single poppy flower on a thin stem with one leaf | |
| uncertainty | Belirsizlikle Yaşamak | blue-grey bronze | a compass rose with a single needle and sixteen fine tick marks around it | |
| people | Zor İnsanlar | copper | a stone arch bridge over gentle water, seen from the side | |

Kontrol: kenarda yazı/harf benzeri iz yok; tam yuvarlak, tam tepeden; zemin düz beyaz; küçültünce sembol okunuyor.
