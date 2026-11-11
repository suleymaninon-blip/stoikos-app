#!/usr/bin/env bash
# "Geçit" animasyonu (60 sn): sessiz görüntüyü üretir, rüzgâr + müzik ekler.
#   bash scripts/social/gecit-build.sh [tr,en]
# Görüntü: scripts/teaser/gecit.html (canvas, kare kare). Ses: sentez rüzgâr (pembe gürültü; nefeste kısılır,
# kapı açılınca söner) + Grieg "Sabah" (Musopen; kapı açılırken girer) + sonda Stoikos ses imzası.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
OUT=docs/sosyal-medya/gecit-videosu
TMP="${GECIT_TMP:-${TMPDIR:-/tmp}/gecit-build}"; mkdir -p "$OUT" "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3

if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/gecit.html TEASER_MS=60000 TEASER_NAME=gecit-sessiz node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

# Rüzgâr zarfı: 0–1 sn açılır; 10,6–14,8 sn (nefes) kısılır; 35–41 sn (kapı) söner.
ENV="min(1,t/1.2)*(1-0.72*min(1,max(0,(t-10.4)/0.8))*(1-min(1,max(0,(t-14.4)/0.9))))*(1-min(1,max(0,(t-35)/6)))"
GUST="(0.62+0.24*sin(2*PI*t/5.3)+0.14*sin(2*PI*t/2.1+1))"
ffmpeg -y -loglevel error \
  -f lavfi -t 60 -i "anoisesrc=color=pink:sample_rate=48000:seed=7:amplitude=0.9" \
  -f lavfi -t 60 -i "anoisesrc=color=brown:sample_rate=48000:seed=11:amplitude=0.9" \
  -i "$MUSIC" -i "$SIG" -filter_complex "\
[0:a]highpass=f=180,lowpass=f=900,volume='0.3*$ENV*$GUST':eval=frame,pan=stereo|c0=c0|c1=0.8*c0[w1];\
[1:a]lowpass=f=260,volume='0.95*$ENV*(1.1-$GUST*0.5)':eval=frame,pan=stereo|c0=0.8*c0|c1=c0[w2];\
[2:a]atrim=0:26,asetpts=N/SR/TB,aresample=48000,volume=14dB,afade=t=in:d=2.5,afade=t=out:st=21:d=4,adelay=34800|34800[m];\
[3:a]aresample=48000,volume=-7dB,adelay=53000|53000[s];\
[w1][w2][m][s]amix=inputs=4:normalize=0:duration=longest,apad=whole_dur=60,atrim=0:60,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/gecit-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$OUT/gecit-$l-1080x1920.mp4"
  echo "$OUT/gecit-$l-1080x1920.mp4"
done
