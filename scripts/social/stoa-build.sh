#!/usr/bin/env bash
# "Metrodan Stoa'ya" — ~30 sn dikey (TR + EN). Kalabalık peron → "STOIKOS" kemeri →
# ışığa çıkan merdiven → denize bakan stoa.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/stoa-videosu/:
#   cekim-1-metro:     0–7,8 arkadan perondan kemere yürür
#   cekim-2-merdiven:  0,2–10 merdiveni çıkar (ilk karedeki atlama kesilir)
#   cekim-3-stoa:      0,45–10 sütunlar arasında yürür, denize bakıp oturur (baştaki referans karesi kesilir);
#                      oturduktan sonraki 7,5–10 yarı hızda (2,5 → 5 sn) ki söz okunacak kadar kalsın
# Çekimler düz kesmeyle bağlanır (erime farklı kadrajları üst üste bindiriyor).
# Müzik merdivene adım atınca (7,8 sn) girer: Bach, Viyolonsel Süiti No.1 Prelüd.
# Oturunca gökyüzünde Marcus Aurelius sözü (Düşünceler 4.3, serbest uyarlama).
# Sonda 0,6 sn kararma → 4 sn logo kapanışı (scripts/social/filozof/overlay.html).
# Kullanım: bash scripts/social/stoa-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/stoa-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
X2=29.05    # stoa → logo (0,6 sn kararma); 7,8 + 9,8 + 7,05 + 5 = 29,65
TOTAL=33.05

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q="İnsan, kendi ruhundan daha sakin bir sığınak bulamaz."
  else Q="There is no quieter retreat than your own soul."; fi
  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-metro-gemini-720p.mp4 -i $SRC/cekim-2-merdiven-gemini-720p.mp4 \
    -i $SRC/cekim-3-stoa-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC \
    -loop 1 -t $TOTAL -i $TMP/t1.png -filter_complex "\
[0:v]trim=0:7.8,setpts=PTS-STARTPTS,$P[a];[1:v]trim=0.2:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0.45:7.5,setpts=PTS-STARTPTS,$P[c];[2:v]trim=7.5:10,setpts=2*(PTS-STARTPTS),$P[d];[3:v]$P[k];\
[a][b][c][d]concat=n=4:v=1:a=0,settb=1/30[abcd];\
[5:v]format=rgba,fade=in:st=24.7:d=0.7:alpha=1,fade=out:st=28.4:d=0.5:alpha=1[q];[abcd][q]overlay=0:-850,settb=1/30[vq];\
[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=0:7.8,asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st=7.3:d=0.5[aa];\
[1:a]atrim=0.2:10,asetpts=PTS-STARTPTS,aresample=48000,volume=4[ba];\
[2:a]atrim=0.45:7.5,asetpts=PTS-STARTPTS,aresample=48000,volume=4[ca];[2:a]atrim=7.5:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=0.5,volume=4[da];\
[aa][ba][ca][da]concat=n=4:v=0:a=1,volume=0.6[amb];\
[4:a]atrim=0.7:34,asetpts=N/SR/TB,adelay=7600|7600,afade=t=in:st=7.6:d=1.2,afade=t=out:st=29.8:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/stoa-$LANG-1080x1920.mp4
  echo "✓ $SRC/stoa-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
