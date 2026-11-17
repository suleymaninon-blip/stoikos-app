#!/usr/bin/env bash
# "Programlar" animasyonu (60 sn): programlar ekranının amacı, işleyişi ve ekranı (liste, yedi gün, gün penceresi, bitiş, her ay yeni program).
#   bash scripts/social/programlar-build.sh [tr,en]
# Görüntü: scripts/teaser/programlar.html (canvas, kare kare). Ses: Grieg "Sabah", 58. saniyeden (Musopen, kamu malı kayıt; Birlikte videosuyla aynı eser, farklı bölüm)
# baştan yumuşak girer, logoda söner; sonda Stoikos ses imzası.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
OUT=docs/sosyal-medya/programlar-videosu
TMP="${PROGRAMLAR_TMP:-${TMPDIR:-/tmp}/programlar-build}"; mkdir -p "$OUT" "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3

if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/programlar.html TEASER_MS=60000 TEASER_NAME=programlar-sessiz node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

ffmpeg -y -loglevel error -i "$MUSIC" -i "$SIG" -filter_complex "\
[0:a]atrim=58:116,asetpts=N/SR/TB,aresample=48000,volume=9dB,afade=t=in:d=3,afade=t=out:st=52:d=5[m];\
[1:a]aresample=48000,volume=-6dB,adelay=55200|55200[s];\
[m][s]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=60,atrim=0:60,afade=t=out:st=58.6:d=1.4,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/programlar-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$OUT/programlar-$l-1080x1920.mp4"
  echo "$OUT/programlar-$l-1080x1920.mp4"
done
