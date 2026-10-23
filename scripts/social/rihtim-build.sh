#!/usr/bin/env bash
# "Rıhtım" — ~29 sn dikey (TR + EN). Yağmurlu iskele → "STOIKOS" yazılı kayık → şafakta durgun göl.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/rihtim-videosu/:
#   cekim-1-iskele:  0–8,5 arkadan kalabalıkta iskelenin ucuna yürür, kayığa bakar
#   cekim-2-kayik:   1,5–10 kayıkta oturur, ipi çözer, kayık sise ve altın ışığa açılır
#                    (baştaki referans yüzü ve yüzü dönük ayakta duruşu kesilir)
#   cekim-3-gol:     0,4–10 karşıdan: göl ve dağlar, sakin kürek çeker (baştaki referans yüzü kesilir)
# 1 → 2 erime (kayığa biniş zaman atlaması), 2 → 3 düz kesme (ters açı), sonda logo.
# Müzik ipi çözüp iskeleden ayrılırken (≈9,5 sn) girer: Bach, Viyolonsel Süiti No.1 Prelüd.
# Gölde gökyüzünde Marcus Aurelius sözü (Düşünceler 4.49, serbest uyarlama; iki satıra sığsın diye kısa).
# Kullanım: bash scripts/social/rihtim-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/rihtim-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
X1=8.0      # iskele → kayık (0,5 sn erime); A 8,5 sn
# kayık → göl: düz kesme (ters açı; erime iki farklı kadrajı üst üste bindiriyordu). B 8,5 sn
X3=25.5     # göl → logo (0,6 sn kararma); A+B−0,5 = 16,5, C 9,6 sn → 26,1
TOTAL=29.5

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q="Kaya gibi ol: dalgalar kırılır, o yerinde durur."
  else Q="Be like the rock: the waves break, it stands firm."; fi
  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-iskele-gemini-720p.mp4 -i $SRC/cekim-2-kayik-gemini-720p.mp4 \
    -i $SRC/cekim-3-gol-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC \
    -loop 1 -t $TOTAL -i $TMP/t1.png -filter_complex "\
[0:v]trim=0:8.5,setpts=PTS-STARTPTS,$P[a];[1:v]trim=1.5:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0.4:10,setpts=PTS-STARTPTS,$P[c];[3:v]$P[k];\
[a][b]xfade=transition=fade:duration=0.5:offset=$X1[ab];[ab]settb=1/30[ab2];[ab2][c]concat=n=2:v=1:a=0,settb=1/30[abc];\
[5:v]format=rgba,fade=in:st=20.2:d=0.8:alpha=1,fade=out:st=24.8:d=0.5:alpha=1[q];[abc][q]overlay=0:-850,settb=1/30[vq];\
[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X3[v];\
[0:a]atrim=0:8.5,asetpts=PTS-STARTPTS,aresample=48000[aa];\
[1:a]atrim=1.5:10,asetpts=PTS-STARTPTS,aresample=48000,volume=2[ba];\
[2:a]atrim=0.4:10,asetpts=PTS-STARTPTS,aresample=48000,volume=5[ca];\
[aa][ba]acrossfade=d=0.5[ab_a];[ab_a][ca]concat=n=2:v=0:a=1,volume=0.6[amb];\
[4:a]atrim=0.7:32,asetpts=N/SR/TB,adelay=9500|9500,afade=t=in:st=9.5:d=1.2,afade=t=out:st=26.2:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/rihtim-$LANG-1080x1920.mp4
  echo "✓ $SRC/rihtim-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
