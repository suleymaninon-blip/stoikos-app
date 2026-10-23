#!/usr/bin/env bash
# "Metrodan Stoa'ya" — ~30 sn dikey (TR + EN). Kalabalık peron → "STOIKOS" kemeri →
# ışığa çıkan merdiven → denize bakan stoa.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/stoa-videosu/:
#   cekim-1-metro:     0–7,8 arkadan perondan kemere yürür
#   cekim-2-merdiven:  0,2–10 merdiveni çıkar (ilk karedeki atlama kesilir)
#   cekim-3-stoa:      0,45–10 sütunlar arasında yürür, denize bakıp oturur (baştaki referans karesi kesilir)
# Çekimler düz kesmeyle bağlanır (erime farklı kadrajları üst üste bindiriyor).
# Müzik merdivene adım atınca (7,8 sn) girer: Bach, Viyolonsel Süiti No.1 Prelüd.
# Sonda 0,6 sn kararma → 4 sn logo kapanışı (scripts/social/filozof/overlay.html).
# Kullanım: bash scripts/social/stoa-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/stoa-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
X2=26.55    # stoa → logo (0,6 sn kararma); 7,8 + 9,8 + 9,55 = 27,15
TOTAL=30.55

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $SRC/cekim-1-metro-gemini-720p.mp4 -i $SRC/cekim-2-merdiven-gemini-720p.mp4 \
    -i $SRC/cekim-3-stoa-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC -filter_complex "\
[0:v]trim=0:7.8,setpts=PTS-STARTPTS,$P[a];[1:v]trim=0.2:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0.45:10,setpts=PTS-STARTPTS,$P[c];[3:v]$P[k];\
[a][b][c]concat=n=3:v=1:a=0,settb=1/30[abc];[abc][k]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=0:7.8,asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st=7.3:d=0.5[aa];\
[1:a]atrim=0.2:10,asetpts=PTS-STARTPTS,aresample=48000,volume=4[ba];\
[2:a]atrim=0.45:10,asetpts=PTS-STARTPTS,aresample=48000,volume=4[ca];\
[aa][ba][ca]concat=n=3:v=0:a=1,volume=0.6[amb];\
[4:a]atrim=0.7:32,asetpts=N/SR/TB,adelay=7600|7600,afade=t=in:st=7.6:d=1.2,afade=t=out:st=27.3:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/stoa-$LANG-1080x1920.mp4
  echo "✓ $SRC/stoa-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
