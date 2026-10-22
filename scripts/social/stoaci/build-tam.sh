#!/usr/bin/env bash
# "Pazartesi" tam sürüm — 50 sn dikey video, sonda Stoikos logosu (TR + EN kapanış).
# Kaynaklar (Gemini, 720p, 24 fps):
#   tam-kaynak-b-ofis: 0–10 trafik · 10–20 kafe/telefon · 20–30 yeni ofis
#   tam-kaynak-a:      22–30 otobüs (su sıçrar, kollarını açar) · 31,4–40 balkon (yazar, gözlerini kapatır)
# 46,0'da 0,6 sn kararma → 4 sn kapanış (scripts/social/filozof/overlay.html) = 50,0 sn.
# Kullanım: bash scripts/social/stoaci/build-tam.sh
set -euo pipefail
cd "$(dirname "$0")/../../.."

SRC=docs/sosyal-medya/stoaci-modern-hayatta
A=$SRC/tam-kaynak-a-gemini-720p.mp4
B=$SRC/tam-kaynak-b-ofis-gemini-720p.mp4
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $B -i $A -i $TMP/kapanis-$LANG-1080x1920.mp4 -filter_complex "\
[0:v]trim=0:30,setpts=PTS-STARTPTS,$P[a];[0:a]atrim=0:30,asetpts=PTS-STARTPTS,aresample=48000[aa];\
[1:v]trim=22:30,setpts=PTS-STARTPTS,$P[b];[1:a]atrim=22:30,asetpts=PTS-STARTPTS,aresample=48000[ba];\
[1:v]trim=31.4:40,setpts=PTS-STARTPTS,$P[d];[1:a]atrim=31.4:40,asetpts=PTS-STARTPTS,aresample=48000[da];\
[a][aa][b][ba][d][da]concat=n=3:v=1:a=1[v0][x0];[v0]settb=1/30[v1];\
[2:v]$P[c];[v1][c]xfade=transition=fadeblack:duration=0.6:offset=46.0[v];\
[x0]apad=whole_dur=50,afade=t=out:st=45.0:d=2.5[au]" \
    -map "[v]" -map "[au]" -t 50 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart $SRC/pazartesi-tam-$LANG-1080x1920.mp4
  echo "✓ $SRC/pazartesi-tam-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
