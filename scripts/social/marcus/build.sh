#!/usr/bin/env bash
# "İçindeki kale" — ~22 sn dikey Marcus Aurelius videosu (TR + EN).
# Kaynak klipler docs/sosyal-medya/marcus-videosu/ içinde (Gemini/Veo, 720p, 10 sn).
# Yazı ve kapanış katmanları filozof videosuyla ortak: scripts/social/filozof/.
# Kullanım: bash scripts/social/marcus/build.sh [müzik.mp3]
set -euo pipefail
cd "$(dirname "$0")/../../.."

SRC=docs/sosyal-medya/marcus-videosu
OUT=$SRC
TMP=$(mktemp -d)
MUSIC="${1:-}"
D=0.6

# Gemini çıktılarında filigran yok; yalnız büyüt, 30 fps, hafif kontrast ve vinyet.
PREP="scale=1080:1920:flags=lanczos,fps=30,eq=contrast=1.04:saturation=0.95,vignette=PI/5,setsar=1,format=yuv420p"

# Bölümler (giriş, süre): kaos 0–5,5 · yüz 1,2–5,8 (gözlerini kapattığı an) · yürüyüş 2–6,5 · çadır 3,5–9
cut() { ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -vf "$PREP" -map 0:v -map 0:a \
  -af "aresample=48000,aformat=channel_layouts=stereo" -c:v libx264 -crf 16 -c:a pcm_s16le "$4"; }
cut $SRC/01-kaos-gemini-720p.mp4     0.0 5.5 $TMP/s1.mov
cut $SRC/02-yuz-gemini-720p.mp4      1.2 4.6 $TMP/s2.mov
cut $SRC/03-yuruyus-gemini-720p.mp4  2.0 4.5 $TMP/s3.mov
cut $SRC/04-cadir-gemini-720p.mp4    3.5 5.5 $TMP/s4.mov
# Uzunluklar 5,5 / 4,6 / 4,5 / 5,5 / kapanış 4,0 → geçişlerle toplam 21,7 sn
# Geçiş noktaları: 4,9 · 8,9 · 12,8 · 17,7

for LANG in tr en; do
  if [ "$LANG" = tr ]; then
    T1="Dışarıda her şey kaos olabilir."; T2="İçinde bir kale var."; T3="Kapısı yalnız sana açılır."
    T4="Marcus Aurelius bu notları bir savaş çadırında yazdı."
  else
    T1="Outside, everything may be chaos."; T2="Inside, there is a citadel."; T3="Only you hold its key."
    T4="Marcus Aurelius wrote these notes in a tent at war."
  fi

  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$T1" "$T2" "$T3" "$T4"
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $TMP/kapanis-$LANG-1080x1920.mp4 -an -vf "fps=30,format=yuv420p,setsar=1" $TMP/c.mp4

  ffmpeg -v error -y -i $TMP/s1.mov -i $TMP/s2.mov -i $TMP/s3.mov -i $TMP/s4.mov -i $TMP/c.mp4 \
    -loop 1 -t 21.7 -i $TMP/t1.png -loop 1 -t 21.7 -i $TMP/t2.png -loop 1 -t 21.7 -i $TMP/t3.png -loop 1 -t 21.7 -i $TMP/t4.png \
    -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=$D:offset=4.9[v1];\
[v1][2:v]xfade=transition=fade:duration=$D:offset=8.9[v2];\
[v2][3:v]xfade=transition=fade:duration=$D:offset=12.8[v3];\
[v3][4:v]xfade=transition=fadeblack:duration=$D:offset=17.7[v4];\
[5]format=rgba,fade=in:st=0.8:d=0.6:alpha=1,fade=out:st=4.3:d=0.5:alpha=1[a1];\
[6]format=rgba,fade=in:st=5.7:d=0.5:alpha=1,fade=out:st=8.5:d=0.5:alpha=1[a2];\
[7]format=rgba,fade=in:st=9.5:d=0.5:alpha=1,fade=out:st=12.4:d=0.5:alpha=1[a3];\
[8]format=rgba,fade=in:st=13.5:d=0.6:alpha=1,fade=out:st=17.1:d=0.5:alpha=1[a4];\
[v4][a1]overlay[o1];[o1][a2]overlay[o2];[o2][a3]overlay[o3];[o3][a4]overlay,format=yuv420p[v];\
[0:a][1:a]acrossfade=d=$D[x1];[x1][2:a]acrossfade=d=$D[x2];[x2][3:a]acrossfade=d=$D[x3];\
[x3]apad=whole_dur=21.7,loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:d=0.4,afade=t=out:st=17.4:d=2.5[a]" \
    -map "[v]" -map "[a]" -t 21.7 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 \
    $TMP/video-$LANG.mp4

  if [ -n "$MUSIC" ]; then
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -i "$MUSIC" -filter_complex \
      "[1]atrim=0:21.7,asetpts=N/SR/TB,volume=0.6,afade=t=in:d=2,afade=t=out:st=19:d=2.7[m];[0:a][m]amix=inputs=2:normalize=0[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -movflags +faststart $OUT/icindeki-kale-$LANG-1080x1920.mp4
  else
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -c copy -movflags +faststart $OUT/icindeki-kale-$LANG-1080x1920.mp4
  fi
  echo "✓ $OUT/icindeki-kale-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
