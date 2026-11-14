#!/usr/bin/env bash
# "Geçit" (film sürümü; çizim animasyonu gecit-build.sh'tır) — ~33,5 sn dikey (TR + EN). İki kahraman:
# kadın kar fırtınasında → erkek yolu kapatan kayanın üstünden geçer → "STOIKOS" sığınağında buluşma → şafakta bulut denizi.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/gecit-videosu/:
#   cekim-1-kadin:   2,5–9,5  rüzgâr, nefes, kameranın yanından geçer, uzakta ışık
#   cekim-2-erkek:   2,0–9,6  kayaya varır, üstüne çıkar, ışığı görür, yürür
#   cekim-3-genis:   0,8–3,7  ikisi kapıya varır (kapı kapalı, erkek elini uzatır)
#   cekim-3b-el:     1,2–4,0  yakın plan: el demir halkayı tutup çeker, altın ışık sızar
#   cekim-3-genis:   5,3–7,9  kapı açık, içeri girerler (sonra kapı kendi kendine kapanıyor: kesildi)
#   cekim-4-safak:   0–8      şafak, bulut denizi, bankta iki kişi; söz altta
# Gemini geniş planda kapıyı elle açtıramadı (iki deneme: el değmeden ve dışarı açıldı) → yakın plan ara çekimle çözüldü.
# Hepsi düz kesme; içeri giriş → şafak 0,8 sn erime (gece geçti). Grieg "Sabah" el kapıya değince girer; logoda ses imzası.
# Kullanım: bash scripts/social/gecit-film-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/gecit-videosu
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
# A 7,0 + B 7,6 + C 2,9 + D 2,8 + E 2,6 = 22,9 · F 8,0 (E→F 0,8 erime) → 30,1 · logo 4 (0,6 kararma)
XF=22.1
XL=29.5
TOTAL=33.5
QIN=24.2
QOUT=29.0

convert -size 1080x900 gradient:"rgba(8,6,4,0)"-"rgba(8,6,4,0.72)" $TMP/botshade.png

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q=$'Yola çıkan engel,\nyolun kendisi olur.'
  else Q=$'What stands in the way\nbecomes the way.'; fi
  NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-kadin.mp4 -i $SRC/cekim-2-erkek.mp4 -i $SRC/cekim-3-genis.mp4 -i $SRC/cekim-3b-el.mp4 \
    -i $SRC/cekim-4-safak.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC -i $SIG \
    -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/botshade.png \
    -filter_complex "\
[0:v]trim=2.5:9.5,setpts=PTS-STARTPTS,$P[a];[1:v]trim=2.0:9.6,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0.8:3.7,setpts=PTS-STARTPTS,$P[c];[3:v]trim=1.2:4.0,setpts=PTS-STARTPTS,$P[d];\
[2:v]trim=5.3:7.9,setpts=PTS-STARTPTS,$P[e];[4:v]trim=0:8,setpts=PTS-STARTPTS,$P[f];\
[a][b][c][d][e]concat=n=5:v=1:a=0,settb=1/30[AE];\
[AE][f]xfade=transition=fade:duration=0.8:offset=$XF,settb=1/30[V];\
[9:v]format=rgba,fade=in:st=$QIN:d=1.0:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[sh];[V][sh]overlay=0:1020[vs];\
[8:v]format=rgba,fade=in:st=$(echo "$QIN+0.2"|bc):d=0.8:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[q];[vs][q]overlay=0:0,settb=1/30[vq];\
[5:v]$P[k];[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$XL[v];\
[0:a]atrim=2.5:9.5,asetpts=PTS-STARTPTS,aresample=48000[a1];[1:a]atrim=2.0:9.6,asetpts=PTS-STARTPTS,aresample=48000[a2];\
[2:a]atrim=0.8:3.7,asetpts=PTS-STARTPTS,aresample=48000[a3];[3:a]atrim=1.2:4.0,asetpts=PTS-STARTPTS,aresample=48000[a4];\
[2:a]atrim=5.3:7.9,asetpts=PTS-STARTPTS,aresample=48000[a5];[4:a]atrim=0:8,asetpts=PTS-STARTPTS,aresample=48000,volume=0.6[a6];\
[a1][a2][a3][a4][a5]concat=n=5:v=0:a=1[a15];[a15][a6]acrossfade=d=0.8,volume=0.7,afade=t=out:st=28.6:d=1.4[amb];\
[6:a]atrim=0:18,asetpts=N/SR/TB,aresample=48000,volume=12dB,afade=t=in:d=2.0,afade=t=out:st=11.3:d=3.2,adelay=17500|17500[m];\
[7:a]aresample=48000,volume=-7dB,adelay=30300|30300[s];\
[amb][m][s]amix=inputs=3:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/gecit-film-$LANG-1080x1920.mp4
  echo "✓ $SRC/gecit-film-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
