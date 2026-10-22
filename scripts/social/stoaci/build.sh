#!/usr/bin/env bash
# "Bir Stoacı modern hayatta" 1. bölüm — ~27 sn dikey video (TR + EN).
# Kaynak klipler docs/sosyal-medya/stoaci-modern-hayatta/ içinde (Gemini/Veo, 720p, 10 sn).
# Yazı ve kapanış katmanları filozof videosuyla ortak: scripts/social/filozof/.
# Kullanım: bash scripts/social/stoaci/build.sh [müzik.mp3]
set -euo pipefail
cd "$(dirname "$0")/../../.."

SRC=docs/sosyal-medya/stoaci-modern-hayatta
OUT=$SRC
TMP=$(mktemp -d)
MUSIC="${1:-}"
D=0.3   # viral kurgu: kısa geçişler
TOTAL=27.3
D2=0.6  # otobüsten geceye ve kapanışa: daha yavaş geçiş

PREP="scale=1080:1920:flags=lanczos,fps=30,eq=contrast=1.04:saturation=0.95,vignette=PI/5,setsar=1,format=yuv420p"

# Bölümler (giriş, süre): arabadan 2,3–5,6 (zeytini ağzına götürür) · trafik yakın 4,5–7,3 ·
# telefon 2,8–6,4 (ters çevirir) · toplantı 1,0–4,2 · otobüs 2,6–9,9 (su sıçrar, kollarını açar) ·
# balkon 3,5–9,0 (yazar, başını kaldırıp şehre bakar)
cut() { ffmpeg -v error -y -ss "$2" -t "$3" -i "$1" -vf "$PREP" -map 0:v -map 0:a \
  -af "aresample=48000,aformat=channel_layouts=stereo" -c:v libx264 -crf 16 -c:a pcm_s16le "$4"; }
cut $SRC/01b-trafik-arabadan-gemini-720p.mp4 2.3 3.3 $TMP/s1.mov
cut $SRC/01-trafik-gemini-720p.mp4           4.5 2.8 $TMP/s2.mov
cut $SRC/02-telefon-gemini-720p.mp4          2.8 3.6 $TMP/s3.mov
cut $SRC/03-toplanti-gemini-720p.mp4         1.0 3.2 $TMP/s4.mov
cut $SRC/04-otobus-yagmur-gemini-720p.mp4    2.6 7.3 $TMP/s5.mov
cut $SRC/05-balkon-gemini-720p.mp4          3.5 5.5 $TMP/s6.mov
# Geçiş noktaları: 3,0 · 5,5 · 8,8 · 11,7 · 18,4 (gece) · 23,3 (kapanış, 4 sn) → toplam 27,3

for LANG in tr en; do
  if [ "$LANG" = tr ]; then
    T1="Pazartesi sabahı. Bir Stoacı:"
    T2="Seni rahatsız eden olaylar değil, onlar hakkındaki yargıların."
  else
    T1="Monday morning. A Stoic:"
    T2="It's not events that disturb you, but your judgments about them."
  fi

  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$T1" "$T2"
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $TMP/kapanis-$LANG-1080x1920.mp4 -an -vf "fps=30,format=yuv420p,setsar=1" $TMP/c.mp4

  ffmpeg -v error -y -i $TMP/s1.mov -i $TMP/s2.mov -i $TMP/s3.mov -i $TMP/s4.mov -i $TMP/s5.mov -i $TMP/s6.mov -i $TMP/c.mp4 \
    -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/t2.png \
    -filter_complex "\
[0:v][1:v]xfade=transition=fade:duration=$D:offset=3.0[v1];\
[v1][2:v]xfade=transition=fade:duration=$D:offset=5.5[v2];\
[v2][3:v]xfade=transition=fade:duration=$D:offset=8.8[v3];\
[v3][4:v]xfade=transition=fade:duration=$D:offset=11.7[v4];\
[v4][5:v]xfade=transition=fade:duration=$D2:offset=18.4[v5];\
[v5][6:v]xfade=transition=fadeblack:duration=$D2:offset=23.3[v6];\
[7]format=rgba,fade=in:st=0.2:d=0.4:alpha=1,fade=out:st=2.6:d=0.4:alpha=1[a1];\
[8]format=rgba,fade=in:st=19.1:d=0.7:alpha=1,fade=out:st=22.8:d=0.5:alpha=1[a2];\
[v6][a1]overlay[o1];[o1][a2]overlay,format=yuv420p[v];\
[0:a][1:a]acrossfade=d=$D[x1];[x1][2:a]acrossfade=d=$D[x2];[x2][3:a]acrossfade=d=$D[x3];[x3][4:a]acrossfade=d=$D[x4];[x4][5:a]acrossfade=d=$D2[x5];\
[x5]apad=whole_dur=$TOTAL,loudnorm=I=-20:TP=-2:LRA=11,afade=t=in:d=0.2,afade=t=out:st=23.0:d=2.5[a]" \
    -map "[v]" -map "[a]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 160k -ar 48000 \
    $TMP/video-$LANG.mp4

  if [ -n "$MUSIC" ]; then
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -i "$MUSIC" -filter_complex \
      "[1]atrim=0:$TOTAL,asetpts=N/SR/TB,volume=0.6,afade=t=in:d=2,afade=t=out:st=24.4:d=2.9[m];[0:a][m]amix=inputs=2:normalize=0[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -movflags +faststart $OUT/pazartesi-stoaci-$LANG-1080x1920.mp4
  else
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -c copy -movflags +faststart $OUT/pazartesi-stoaci-$LANG-1080x1920.mp4
  fi
  echo "✓ $OUT/pazartesi-stoaci-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
