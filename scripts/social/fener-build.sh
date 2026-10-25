#!/usr/bin/env bash
# "Fener" — ~35 sn dikey (TR + EN). Erkek filozof: gece fırtınasında kıyı → "STOIKOS" yazılı fener kapısı →
# kandilli taş merdiven → şafakta fenerin balkonu, durgun deniz.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/fener-videosu/:
#   cekim-1-firtina:  0,5–9,5 fırtınada yürür, kapıya elini koyar
#   cekim-2-merdiven: 0–10 aynı kapıyı iter (kapı birebir aynı kaldı), içeri girer, merdiveni çıkar
#   cekim-3-safak:    0–7,5 merdivenin tepesindeki kapı, balkona çıkar; 7,5–10 yarı hızda (yüzü profilden)
# Çekimler bir öncekinin son karesinden başladığı için düz kesmeyle bağlanır (geçiş görünmez).
# Bach içeride, merdivende girer. Balkonda gökyüzünde Seneca sözü (Mektuplar 71, serbest uyarlama). Sonda logo.
# Kullanım: bash scripts/social/fener-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/fener-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
# A = 9,0 · B = 10,0 · C = 7,5 + 5,0 = 12,5 → 31,5; logo 0,6 sn kararma
M=12.0       # müzik girişi (içeride, merdivende)
QS=26.7      # söz girişi (C'nin yavaşlayan kısmı 26,5'te başlar)
X=30.9       # logo geçişi
TOTAL=34.9

convert -size 1080x900 gradient:"rgba(8,6,4,0.55)"-"rgba(8,6,4,0)" $TMP/topshade.png

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q=$'Limanını bilmeyene\nhiçbir rüzgâr yardım etmez.'
  else Q=$'No wind helps the one\nwho doesn\'t know his harbour.'; fi
  NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-firtina-gemini-720p.mp4 -i $SRC/cekim-2-merdiven-gemini-720p.mp4 \
    -i $SRC/cekim-3-safak-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC \
    -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/topshade.png -filter_complex "\
[0:v]trim=0.5:9.5,setpts=PTS-STARTPTS,$P[a];[1:v]trim=0:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0:7.5,setpts=PTS-STARTPTS,$P[c1];[2:v]trim=7.5:10,setpts=2*(PTS-STARTPTS),$P[c2];\
[a][b][c1][c2]concat=n=4:v=1:a=0,settb=1/30[abc];\
[6:v]format=rgba,fade=in:st=$(echo "$QS-0.2"|bc):d=1.0:alpha=1,fade=out:st=30.3:d=0.5:alpha=1[sh];[abc][sh]overlay=0:0[abs];\
[5:v]format=rgba,fade=in:st=$QS:d=0.8:alpha=1,fade=out:st=30.3:d=0.5:alpha=1[q];[abs][q]overlay=0:-1150,settb=1/30[vq];\
[3:v]$P[k];[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X[v];\
[0:a]atrim=0.5:9.5,asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:d=0.3[aa];\
[1:a]atrim=0:10,asetpts=PTS-STARTPTS,aresample=48000,volume=2[ba];\
[2:a]atrim=0:7.5,asetpts=PTS-STARTPTS,aresample=48000,volume=5[ca];[2:a]atrim=7.5:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=0.5,volume=5[da];\
[aa][ba][ca][da]concat=n=4:v=0:a=1,volume=0.7[amb];\
[4:a]atrim=0.7:40,asetpts=N/SR/TB,adelay=12000|12000,afade=t=in:st=$M:d=1.5,afade=t=out:st=31.6:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/fener-$LANG-1080x1920.mp4
  echo "✓ $SRC/fener-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
