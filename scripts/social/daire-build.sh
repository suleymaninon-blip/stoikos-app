#!/usr/bin/env bash
# "Daire" — ~33 sn dikey (TR + EN). Erkek filozof; yağmurlu meydanda şemsiye nehri, yerde bronz "STOIKOS" halkası,
# ortasında kıpırdamadan duran filozof → bastonlu yaşlı adam itilip düşer, kimse durmaz → filozof onu kaldırır,
# pelerinini omzuna örter → ikisi birlikte halkadan çıkar, yağmur diner, daire boş kalır.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/daire-videosu/:
#   cekim-1-2-meydan-yardim: 0–20 tek parça (Gemini Çekim 1'i uzattı: 0–10 meydan, 10–20 yardım)
#   cekim-3-cikis:           0,05–10 (ilk kare stüdyo portresi, kesilir); farklı kadraj → düz kesme
# Bach yardım anında (14 sn) girer. Söz son tepeden çekimde, üstte (yüzleri örtmesin). Sonda logo.
# Kullanım: bash scripts/social/daire-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/daire-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
# A 20,0 + B 9,95 = 29,95 · logo 4 (0,6 kararma)
X2=29.35
TOTAL=33.35
QIN=25.8
QOUT=28.9

convert -size 1080x900 gradient:"rgba(8,6,4,0.7)"-"rgba(8,6,4,0)" $TMP/topshade.png

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q=$'İyi bir insan nasıl olmalı,\ntartışmayı bırak. Öyle ol.'
  else Q=$'Stop arguing what a good man\nshould be. Be one.'; fi
  NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-2-meydan-yardim-gemini-720p.mp4 -i $SRC/cekim-3-cikis-gemini-720p.mp4 \
    -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/topshade.png \
    -filter_complex "\
[0:v]trim=0:20,setpts=PTS-STARTPTS,$P[a];[1:v]trim=0.05:10,setpts=PTS-STARTPTS,$P[b];[a][b]concat=n=2:v=1:a=0,settb=1/30[V];\
[5:v]format=rgba,fade=in:st=$QIN:d=1.0:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[sh];[V][sh]overlay=0:0[vs];\
[4:v]format=rgba,fade=in:st=$(echo "$QIN+0.2"|bc):d=0.8:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[q];[vs][q]overlay=0:-1130,settb=1/30[vq];\
[2:v]$P[k];[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=0:20,asetpts=PTS-STARTPTS,aresample=48000[a1];[1:a]atrim=0.05:10,asetpts=PTS-STARTPTS,aresample=48000[a2];\
[a1][a2]acrossfade=d=0.3,volume=0.8[amb];\
[3:a]atrim=0.7:45,asetpts=N/SR/TB,adelay=14000|14000,afade=t=in:st=14:d=1.2,afade=t=out:st=30.2:d=3.1[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/daire-$LANG-1080x1920.mp4
  echo "✓ $SRC/daire-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
