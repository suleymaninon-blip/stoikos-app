#!/usr/bin/env bash
# "Bilgelik" animasyonu (60 sn): Bilgelik sekmesinin amacı, işleyişi ve ekranı (alıntılar, kavramlar, filozoflar).
#   bash scripts/social/bilgelik-build.sh [tr,en]
# Görüntü: scripts/teaser/bilgelik.html (canvas, kare kare). Ses: Bach Çello Süiti No. 1 Prelüd (depodaki telifsiz kayıt)
# baştan yumuşak girer, logoda söner; sonda Stoikos ses imzası.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
OUT=docs/sosyal-medya/bilgelik-videosu
TMP="${BILGELIK_TMP:-${TMPDIR:-/tmp}/bilgelik-build}"; mkdir -p "$OUT" "$TMP"
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3

if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/bilgelik.html TEASER_MS=60000 TEASER_NAME=bilgelik-sessiz node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

ffmpeg -y -loglevel error -i "$MUSIC" -i "$SIG" -filter_complex "\
[0:a]atrim=0:58,asetpts=N/SR/TB,aresample=48000,volume=0dB,afade=t=in:d=3,afade=t=out:st=52:d=5[m];\
[1:a]aresample=48000,volume=-6dB,adelay=55200|55200[s];\
[m][s]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=60,atrim=0:60,afade=t=out:st=58.6:d=1.4,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/bilgelik-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$OUT/bilgelik-$l-1080x1920.mp4"
  echo "$OUT/bilgelik-$l-1080x1920.mp4"
done
