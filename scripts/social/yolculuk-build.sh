#!/usr/bin/env bash
# "Yolculuk" — yandan kayan yolculuk videosu (1080×1920), dünya başına 10 sn.
#   bash scripts/social/yolculuk-build.sh [tr,en]
# Görüntü: scripts/teaser/yolculuk.html (canvas, kare kare; dünyalar WORLDS dizisinde).
# Parçalar: docs/sosyal-medya/yolculuk-videosu/ (Gemini; komutlar docs/sosyal-medya/yolculuk-videosu-yapay-zeka.md):
#   parca-2-yuruyus.mp4, parca-3-manzara-<dünya>.jpg, parca-4-on-katman-<dünya>.jpg
# Hazırlık: yürüyüşten ve ön katmanlardan yeşil silinir (kadin-kareler/, on-katman-saydam-<dünya>.png; git'e girmez).
# Ses: dünyaya göre kodla ortam sesi (I dalga, II rüzgâr) + altında Grieg "Sabah" (Musopen, kamu malı kayıt).
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
D=docs/sosyal-medya/yolculuk-videosu
TMP="${YOLCULUK_TMP:-${TMPDIR:-/tmp}/yolculuk-build}"; mkdir -p "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
WORLDS=$(grep -o "{ id: '[a-z]*'" scripts/teaser/yolculuk.html | sed "s/{ id: '//; s/'//")
NW=$(echo "$WORLDS" | wc -l); DUR=$((NW*10))
echo "dünyalar: $(echo $WORLDS) · $DUR sn"

# 1) Yeşil zemin
if [ ! -f "$D/kadin-kareler/240.png" ]; then
  mkdir -p "$D/kadin-kareler"
  ffmpeg -v error -i "$D/parca-2-yuruyus.mp4" \
    -vf "crop=480:660:400:40,chromakey=0x08AA52:0.12:0.06,despill=type=green:mix=0.6:expand=0.1,scale=240:-1:flags=lanczos,format=rgba" \
    "$D/kadin-kareler/%03d.png"
fi
for w in $WORLDS; do
  src="$D/parca-4-on-katman-$w.jpg"; out="$D/on-katman-saydam-$w.png"
  [ -f "$out" ] && continue
  key=$(python3 -c "from PIL import Image; p=Image.open('$src').convert('RGB').getpixel((1000,60)); print('0x%02X%02X%02X'%p)")
  ffmpeg -v error -y -i "$src" -vf "chromakey=$key:0.14:0.06,despill=type=green:mix=0.5,format=rgba" "$out"
done

# 2) Kareler
if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/yolculuk.html TEASER_MS=$((DUR*1000)) TEASER_NAME=yolculuk-sessiz \
    node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

# 3) Ses: her dünyanın ortam sesi kendi 10 sn'sinde, geçişlerde 1,2 sn erir; altında müzik
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:duration=$DUR:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=$DUR:sample_rate=48000" \
  -i "$MUSIC" -filter_complex "\
[0:a]lowpass=f=900,volume='(0.35+0.3*sin(2*PI*t/5.2))*clip(1-(t-9.4)/1.2\,0\,1)':eval=frame,pan=stereo|c0=c0|c1=c0[sea];\
[1:a]highpass=f=300,lowpass=f=2400,volume='(0.18+0.14*sin(2*PI*t/3.1)+0.06*sin(2*PI*t/1.3))*clip((t-9.4)/1.2\,0\,1)':eval=frame,pan=stereo|c0=c0|c1=c0[wind];\
[2:a]atrim=0:$DUR,asetpts=N/SR/TB,aresample=48000,volume=4dB,afade=t=in:d=2.5[m];\
[sea][wind][m]amix=inputs=3:normalize=0,afade=t=in:d=0.8,afade=t=out:st=$((DUR-1)):d=1,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/yolculuk-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" \
    -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$D/yolculuk-$l-1080x1920.mp4"
  echo "$D/yolculuk-$l-1080x1920.mp4"
done
