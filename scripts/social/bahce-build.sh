#!/usr/bin/env bash
# "Bahçe" — ~34 sn dikey (TR + EN). Kadın kahraman: kalabalık çarşı → "STOIKOS" yazılı bahçe kapısı
# → zeytin bahçesinde çeşme başında oturur, gözlerini kapatır.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/bahce-videosu/:
#   cekim-1-carsi:  0–8,6 arkadan çarşıdan kapıya yürür, ellerini kapıya koyar
#                   (ilk 3,2 sn tabelalarda Arapça benzeri uydurma yazı var → üst %30 bulanıklaştırılır)
#   cekim-2-kapi:   0,1–10 kapıyı iter, altın ışık, bahçeye girer
#   cekim-3-bahce:  0,1–7,5 çeşmeye yürür, oturur; 7,5–10 yarı hızda (yüzü profilden, gözleri kapalı)
# Çekimler düz kesmeyle bağlanır. Müzik kapı açılırken (≈9,5 sn) girer: Bach, Viyolonsel Süiti No.1 Prelüd.
# Oturunca alt üçte birde Seneca sözü (Mektuplar 56, serbest uyarlama). Sonda logo kapanışı.
# Kullanım: bash scripts/social/bahce-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/bahce-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
X=30.3      # bahçe → logo (0,6 sn kararma); 8,6 + 9,9 + 7,4 + 5,0 = 30,9
TOTAL=34.3

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q="Huzur dışarıda bulunmaz. İçeride kurulur."
  else Q="Calm isn't found outside. It is built within."; fi
  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-carsi-gemini-720p.mp4 -i $SRC/cekim-2-kapi-gemini-720p.mp4 \
    -i $SRC/cekim-3-bahce-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC \
    -loop 1 -t $TOTAL -i $TMP/t1.png -filter_complex "\
[0:v]trim=0:8.6,setpts=PTS-STARTPTS,split[a0][a1];[a1]crop=iw:ih*0.3:0:0,boxblur=12:2[ab];\
[a0][ab]overlay=0:0:enable='lt(t,3.25)',$P[a];\
[1:v]trim=0.1:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0.1:7.5,setpts=PTS-STARTPTS,$P[c];[2:v]trim=7.5:10,setpts=2*(PTS-STARTPTS),$P[d];[3:v]$P[k];\
[a][b][c][d]concat=n=4:v=1:a=0,settb=1/30[abcd];\
[5:v]format=rgba,fade=in:st=24.8:d=0.8:alpha=1,fade=out:st=29.6:d=0.5:alpha=1[q];[abcd][q]overlay=0:0,settb=1/30[vq];\
[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X[v];\
[0:a]atrim=0:8.6,asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st=8.1:d=0.5[aa];\
[1:a]atrim=0.1:10,asetpts=PTS-STARTPTS,aresample=48000,volume=2[ba];\
[2:a]atrim=0.1:7.5,asetpts=PTS-STARTPTS,aresample=48000,volume=5[ca];\
[2:a]atrim=7.5:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=0.5,volume=5[da];\
[aa][ba][ca][da]concat=n=4:v=0:a=1,volume=0.6[amb];\
[4:a]atrim=0.7:36,asetpts=N/SR/TB,adelay=9500|9500,afade=t=in:st=9.5:d=1.2,afade=t=out:st=31.0:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/bahce-$LANG-1080x1920.mp4
  echo "✓ $SRC/bahce-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
