#!/usr/bin/env bash
# "Rüzgârı sen seçmezsin" — 18 sn dikey filozof videosu (TR + EN).
# Kaynak klipler docs/sosyal-medya/filozof-videosu/ içinde (Kling + Gemini, 720p, filigranlı).
# Kullanım: bash scripts/social/filozof/build.sh [müzik.mp3]
#   Müzik verilmezse yalnız rüzgâr sesiyle çıkar (Instagram'da kitaplıktan müzik eklenebilir).
set -euo pipefail
cd "$(dirname "$0")/../../.."

SRC=docs/sosyal-medya/filozof-videosu
OUT=$SRC
TMP=$(mktemp -d)
MUSIC="${1:-}"
D=0.6   # geçiş süresi

# Ortak işlem: sağ alttaki "KlingAI" filigranını atmak için %7 yakınlaştırıp üstten
# kırp, 1080×1920'ye büyüt, 30 fps; renkleri hafifçe eşitle (biraz kontrast, biraz
# az doygunluk — üç farklı araçtan gelen klipler aynı filmden gibi dursun).
PREP="crop=iw*0.93:ih*0.93:(iw-iw*0.93)/2:0,scale=1080:1920:flags=lanczos,fps=30,eq=contrast=1.05:saturation=0.92,vignette=PI/5,setsar=1,format=yuv420p"

ffmpeg -v error -y -ss 0   -t 5.0 -i $SRC/01-yuruyus-kling-720p.mp4  -vf "$PREP" -an $TMP/w.mp4
ffmpeg -v error -y -ss 3.5 -t 4.6 -i $SRC/02-el-gemini-720p.mp4      -vf "$PREP" -an $TMP/h.mp4
ffmpeg -v error -y -ss 3.6 -t 5.6 -i $SRC/03-siluet-gemini-720p.mp4  -vf "$PREP" -an $TMP/s.mp4
ffmpeg -v error -y -f lavfi -i color=c=black:s=1080x1920:r=30:d=1.5 -vf format=yuv420p $TMP/b.mp4

# Rüzgâr: siluet klibinin kendi sesi (Gemini'ye "yalnız rüzgâr" denmişti), 18 sn'ye uzatılıp yumuşatılır.
ffmpeg -v error -y -stream_loop 1 -i $SRC/03-siluet-gemini-720p.mp4 -vn -t 18.3 \
  -af "highpass=f=60,lowpass=f=9000,volume=2.2,afade=t=in:d=1.2,afade=t=out:st=15.8:d=2.5" -ar 48000 -ac 2 $TMP/wind.wav

for LANG in tr en; do
  if [ "$LANG" = tr ]; then
    T1="Rüzgârı sen seçmezsin."; T2="Yolu da."; T3="Ama nasıl yürüdüğünü seçersin."
  else
    T1="You don't choose the wind."; T2="Nor the road."; T3="But you choose how you walk."
  fi

  # Yazı katmanları (saydam PNG) ve kapanış sahnesi
  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$T1" "$T2" "$T3"
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  ffmpeg -v error -y -i $TMP/kapanis-$LANG-1080x1920.mp4 -an -vf "fps=30,format=yuv420p,setsar=1" $TMP/c.mp4

  # Birleştir: siyah → yürüyüş → el → siluet → kapanış (xfade, 0,6 sn)
  # Uzunluklar 1,5 / 5,0 / 4,6 / 5,6 / 4,0 → toplam 18,3 sn
  ffmpeg -v error -y -i $TMP/b.mp4 -i $TMP/w.mp4 -i $TMP/h.mp4 -i $TMP/s.mp4 -i $TMP/c.mp4 \
    -loop 1 -t 18.3 -i $TMP/t1.png -loop 1 -t 18.3 -i $TMP/t2.png -loop 1 -t 18.3 -i $TMP/t3.png \
    -filter_complex "\
[0][1]xfade=transition=fade:duration=$D:offset=0.9[v1];\
[v1][2]xfade=transition=fade:duration=$D:offset=5.3[v2];\
[v2][3]xfade=transition=fade:duration=$D:offset=9.3[v3];\
[v3][4]xfade=transition=fadeblack:duration=$D:offset=14.3[v4];\
[5]format=rgba,fade=in:st=1.8:d=0.6:alpha=1,fade=out:st=4.8:d=0.5:alpha=1[a1];\
[6]format=rgba,fade=in:st=6.1:d=0.5:alpha=1,fade=out:st=9.0:d=0.5:alpha=1[a2];\
[7]format=rgba,fade=in:st=10.3:d=0.6:alpha=1,fade=out:st=13.9:d=0.5:alpha=1[a3];\
[v4][a1]overlay=0:0[o1];[o1][a2]overlay=0:0[o2];[o2][a3]overlay=0:0,format=yuv420p[v]" \
    -map "[v]" -t 18.3 -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p $TMP/video-$LANG.mp4

  # Ses: rüzgâr (+ varsa müzik, rüzgârın üstünde, sonunda yavaşça kısılarak)
  if [ -n "$MUSIC" ]; then
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -i $TMP/wind.wav -i "$MUSIC" -filter_complex \
      "[2]atrim=0:18.3,asetpts=N/SR/TB,volume=0.8,afade=t=in:d=1.5,afade=t=out:st=15.8:d=2.5[m];[1][m]amix=inputs=2:normalize=0[a]" \
      -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -movflags +faststart -shortest $OUT/ruzgar-$LANG-1080x1920.mp4
  else
    ffmpeg -v error -y -i $TMP/video-$LANG.mp4 -i $TMP/wind.wav \
      -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -movflags +faststart -shortest $OUT/ruzgar-$LANG-1080x1920.mp4
  fi
  echo "✓ $OUT/ruzgar-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
