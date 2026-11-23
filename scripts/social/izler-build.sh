#!/usr/bin/env bash
# "İzler" animasyonu (30 sn): yedi gün → sessiz mühür → İzler koleksiyonu → "Puan yok, sıralama yok" → logo.
#   bash scripts/social/izler-build.sh [tr,en]
# Görüntü: scripts/teaser/izler.html (canvas, kare kare; sikkeler docs/sosyal-medya/izler-videosu/sikkeler/).
# Ses: Bach çello süiti no.1 prelüdü, 20. saniyeden (Musopen, kamu malı kayıt), yumuşak giriş; sonda Stoikos ses imzası.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
OUT=docs/sosyal-medya/izler-videosu
TMP="${IZLER_TMP:-${TMPDIR:-/tmp}/izler-build}"; mkdir -p "$OUT" "$TMP"
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3

if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/izler.html TEASER_MS=30000 TEASER_NAME=izler-sessiz node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

ffmpeg -y -loglevel error -i "$MUSIC" -i "$SIG" -filter_complex "\
[0:a]atrim=20:49,asetpts=N/SR/TB,aresample=48000,afade=t=in:d=2.5,afade=t=out:st=25:d=3[m];\
[1:a]aresample=48000,volume=-6dB,adelay=27100|27100[s];\
[m][s]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=30,atrim=0:30,afade=t=out:st=29.2:d=0.8,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/izler-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$OUT/izler-$l-1080x1920.mp4"
  echo "$OUT/izler-$l-1080x1920.mp4"
done
