#!/usr/bin/env bash
# "Yolculuk" — I · Kontrol Dairesi denemesi (10 sn, 1080×1920).
#   bash scripts/social/yolculuk-build.sh [tr,en]
# Görüntü: scripts/teaser/yolculuk.html (canvas, kare kare). Parçalar: docs/sosyal-medya/yolculuk-videosu/
#   (Gemini; komutlar docs/sosyal-medya/yolculuk-videosu-yapay-zeka.md).
# Hazırlık: yürüyüş videosundan ve ön katmandan yeşil silinir (kadin-kareler/, on-katman-saydam.png; git'e girmez).
# Ses: kodla dalga + rüzgâr, altında Grieg "Sabah" (Musopen, kamu malı kayıt) yumuşak giriş.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
D=docs/sosyal-medya/yolculuk-videosu
TMP="${YOLCULUK_TMP:-${TMPDIR:-/tmp}/yolculuk-build}"; mkdir -p "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
DUR=10

# 1) Yeşil zemin: yürüyüş kareleri (240 kare, 24 fps; 480×660 kesit → 240×330) ve ön katman
if [ ! -f "$D/kadin-kareler/240.png" ]; then
  mkdir -p "$D/kadin-kareler"
  ffmpeg -v error -i "$D/parca-2-yuruyus.mp4" \
    -vf "crop=480:660:400:40,chromakey=0x08AA52:0.12:0.06,despill=type=green:mix=0.6:expand=0.1,scale=240:-1:flags=lanczos,format=rgba" \
    "$D/kadin-kareler/%03d.png"
fi
[ -f "$D/on-katman-saydam.png" ] || ffmpeg -v error -y -i "$D/parca-4-on-katman.jpg" \
  -vf "chromakey=0x08AE48:0.14:0.06,despill=type=green:mix=0.5,format=rgba" "$D/on-katman-saydam.png"

# 2) Kareler
if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/yolculuk.html TEASER_MS=$((DUR*1000)) TEASER_NAME=yolculuk-sessiz \
    node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

# 3) Ses: dalga (yavaş kabaran kahverengi gürültü) + hafif rüzgâr + müzik
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:duration=$DUR:sample_rate=48000" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.15:duration=$DUR:sample_rate=48000" \
  -i "$MUSIC" -filter_complex "\
[0:a]lowpass=f=900,volume='0.35+0.3*sin(2*PI*t/5.2)':eval=frame,pan=stereo|c0=c0|c1=c0[w];\
[1:a]highpass=f=500,lowpass=f=3000,volume=0.25,pan=stereo|c0=c0|c1=c0[r];\
[2:a]atrim=0:$DUR,asetpts=N/SR/TB,aresample=48000,volume=4dB,afade=t=in:d=2.5[m];\
[w][r][m]amix=inputs=3:normalize=0,afade=t=in:d=0.8,afade=t=out:st=$((DUR-1)):d=1,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/yolculuk-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" \
    -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$D/yolculuk-deneme-$l-1080x1920.mp4"
  echo "$D/yolculuk-deneme-$l-1080x1920.mp4"
done
