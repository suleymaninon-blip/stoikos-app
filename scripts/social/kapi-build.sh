#!/usr/bin/env bash
# "Kapı" videosu — ~30 sn dikey (TR + EN). Kargaşadan STOIKOS kapısına, kapıdan yulaf tarlasına.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/kapi-videosu/:
#   cekim-1-kargasa:     0–7,7 arkadan kalabalıkta kapıya yürür, ellerini kapıya koyar
#   cekim-2-3-tarla:     1,5–20 kapıyı iter, ışık dolar, tarlaya yürür, yüzünü güneşe kaldırır
#                        (ilk 1,5 sn'deki yakın plan atlanır)
# Müzik kapı aralanınca (≈9,2 sn) girer: Bach, Viyolonsel Süiti No.1 Prelüd.
# Sonda 0,6 sn kararma → 4 sn logo kapanışı (scripts/social/filozof/overlay.html).
# Kullanım: bash scripts/social/kapi-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/kapi-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
# Kargaşa → kapı: eller kapıdayken düz kesme (erime iki farklı kadrajı üst üste bindiriyordu)
X2=25.6     # tarla → logo (0,6 sn kararma)
TOTAL=29.6

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $SRC/cekim-1-kargasa-gemini-720p.mp4 -i $SRC/cekim-2-3-tarla-gemini-720p.mp4 \
    -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC -filter_complex "\
[0:v]trim=0:7.7,setpts=PTS-STARTPTS,$P[a];[1:v]trim=1.5:20,setpts=PTS-STARTPTS,$P[b];[2:v]$P[c];\
[a][b]concat=n=2:v=1:a=0,settb=1/30[ab];[ab][c]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=0:7.7,asetpts=PTS-STARTPTS,aresample=48000[aa];[1:a]atrim=1.5:20,asetpts=PTS-STARTPTS,aresample=48000,volume=0.7[ba];\
[aa][ba]acrossfade=d=0.1[amb];\
[3:a]atrim=0.7:30,asetpts=N/SR/TB,adelay=9200|9200,afade=t=in:st=9.2:d=1.5,afade=t=out:st=26.8:d=3[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/kapi-$LANG-1080x1920.mp4
  echo "✓ $SRC/kapi-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
