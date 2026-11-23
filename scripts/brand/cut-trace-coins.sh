#!/usr/bin/env bash
# İzler sikkeleri: Gemini'nin ürettiği beyaz zeminli sikke fotoğraflarını
# (docs/izler/kaynak/<programId>.jpg) daire olarak keser → assets/traces/<id>.webp (320 px, saydam).
# Kullanım: bash scripts/brand/cut-trace-coins.sh [id ...]   (boşsa hepsi)
set -euo pipefail
cd "$(dirname "$0")/../.."
SRC=docs/izler/kaynak; OUT=assets/traces; N=320
mkdir -p "$OUT"
ids=("$@"); [ ${#ids[@]} -eq 0 ] && ids=($(ls $SRC | sed 's/\.jpg$//'))
for id in "${ids[@]}"; do
  f="$SRC/$id.jpg"
  # Beyaz zemini kırp → sikkenin sınır kutusu; kareye tamamla (uzun kenar)
  geo=$(convert "$f" -fuzz 12% -trim -format '%w %h %X %Y' info:)
  read w h x y <<<"$(echo "$geo" | tr -d '+')"
  s=$(( w > h ? w : h )); cx=$(( x + w / 2 )); cy=$(( y + h / 2 ))
  convert "$f" -crop "${s}x${s}+$(( cx - s / 2 ))+$(( cy - s / 2 ))" +repage -resize ${N}x${N}! \
    \( -size ${N}x${N} xc:black -fill white -draw "circle $(( N / 2 )),$(( N / 2 )) $(( N / 2 )),$(( N / 2 * 3 / 100 + 3 ))" -blur 0x0.8 \) \
    -alpha off -compose CopyOpacity -composite -define webp:alpha-quality=100 -quality 86 "$OUT/$id.webp"
  echo "$id: $(stat -c %s "$OUT/$id.webp") bayt"
done
