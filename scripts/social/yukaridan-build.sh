#!/usr/bin/env bash
# "Yukarıdan Bakış" — ~62 sn dikey (TR + EN). Stoacıların "yukarıdan bakış" egzersizi: köprüde duran kadın →
# tepesinden yükseliş → şehir → bulut denizi → uzayın kıyısı → Dünya ve Ay (alıntı) → geri dalış → sakin yürüyüş.
# Kaynaklar (Gemini/Veo, 720×1280, 24 fps, 10 sn) docs/sosyal-medya/yukaridan-videosu/cekim-1…10.mp4,
# komutlar docs/sosyal-medya/yukaridan-videosu-yapay-zeka.md. Zincirleme çekimler (1→2, 3→4→5→6→7→8→9) bir öncekinin
# son karesiyle başladığı için o geçişlerde önceki çekim SONUNA kadar kullanılır (düz kesme dikişsiz olur).
#   1: 5–10        kadın durur (baştaki yüz görünen kısım atılır)
#   2: 0–8         telefon cebe, nefes; yan profil + buhar bilerek kaldı (kullanıcı kararı)
#   3: 2–10 ×1,6   tam tepeden yükseliş; ışık gündüz gibiydi → koyulaştırılıp maviye çekilir (4'ün ilk karesiyle aynı ayar)
#   4–7: 0–10 ×2   şehir → kıyı → bulut denizi → uzayın kıyısı
#   8: 0–10 ×1,15  Dünya ve Ay; alıntı üstte
#   9: 0–6,4 ×1,2  geri dalış; 6,6'dan sonra kadın arabalara göre dev görünüyor → kesilir
#   10: 0–7        kadın sakin yürür; son 0,6 sn kapanışa kararır
# Ses: 1–2 şehir sesi tek başına; Grieg "Sabah" yükselişle (3. çekim) 29. sn'sinden girer, forte bulutların üstüne
# çıkışa denk gelir; sonda ses imzası.
# Kullanım: bash scripts/social/yukaridan-build.sh [tr,en]
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/yukaridan-videosu
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3
LANGS="${1:-tr,en}"
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
GRADE="eq=brightness=-0.07:gamma=0.9:saturation=0.95,colorbalance=rs=-0.05:bs=0.07:rm=-0.04:bm=0.05:rh=-0.04:bh=0.04"
# Süreler: 5 + 8 + 5 + 5×4 + 8,696 + 5,333 + 7 = 59,03 → kapanış 0,6 sn erimeyle 58,43'te, toplam 62,43
XEND=58.43
TOTAL=62.43
MSTART=13.0          # müzik 3. çekimle girer
SIGAT=58.9

# yazı: dosya giriş çıkış
CAPS=(
  "c1 0.6 4.4"
  "c2 7.6 12.4"
  "c3 19.0 24.6"
  "c4 34.0 37.8"
  "quote 40.6 46.6"
  "c5 52.4 55.4"
  "c6 55.6 58.4"
)

IFS=',' read -ra LL <<< "$LANGS"
for LANG in "${LL[@]}"; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  node scripts/social/yukaridan-layers.js "$LANG" "$TMP"

  IN=""; for i in 1 2 3 4 5 6 7 8 9 10; do IN="$IN -i $SRC/cekim-$i.mp4"; done
  OV=""; FC=""; k=12; prev="V"
  for c in "${CAPS[@]}"; do
    set -- $c
    OV="$OV -loop 1 -t $TOTAL -i $TMP/$1.png"
    FC="$FC[$k:v]format=rgba,fade=in:st=$2:d=0.7:alpha=1,fade=out:st=$(echo "$3-0.6"|bc):d=0.6:alpha=1[o$k];[$prev][o$k]overlay=0:0,settb=1/30[w$k];"
    prev="w$k"; k=$((k+1))
  done

  ffmpeg -v error -y $IN -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC $OV -i $SIG -filter_complex "\
[0:v]trim=5:10,setpts=PTS-STARTPTS,$P[v1];\
[1:v]trim=0:8,setpts=PTS-STARTPTS,$P[v2];\
[2:v]trim=2:10,setpts=(PTS-STARTPTS)/1.6,$GRADE,$P[v3];\
[3:v]setpts=PTS/2,$P[v4];[4:v]setpts=PTS/2,$P[v5];[5:v]setpts=PTS/2,$P[v6];[6:v]setpts=PTS/2,$P[v7];\
[7:v]setpts=PTS/1.15,$P[v8];\
[8:v]trim=0:6.4,setpts=(PTS-STARTPTS)/1.2,$P[v9];\
[9:v]trim=0:7,setpts=PTS-STARTPTS,$P[v10];\
[v1][v2][v3][v4][v5][v6][v7][v8][v9][v10]concat=n=10:v=1:a=0,settb=1/30[V];\
$FC\
[10:v]$P[k];[$prev][k]xfade=transition=fadeblack:duration=0.6:offset=$XEND[v];\
[0:a]atrim=5:10,asetpts=PTS-STARTPTS,aresample=48000[a1];\
[1:a]atrim=0:8,asetpts=PTS-STARTPTS,aresample=48000[a2];\
[2:a]atrim=2:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=1.6,volume=0.5[a3];\
[3:a]aresample=48000,atempo=2,volume=0.4[a4];[4:a]aresample=48000,atempo=2,volume=0.4[a5];\
[5:a]aresample=48000,atempo=2,volume=0.4[a6];[6:a]aresample=48000,atempo=2,volume=0.3[a7];\
[7:a]aresample=48000,atempo=1.15,volume=0.3[a8];\
[8:a]atrim=0:6.4,asetpts=PTS-STARTPTS,aresample=48000,atempo=1.2,volume=0.5[a9];\
[9:a]atrim=0:7,asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st=6.2:d=0.8[a10];\
[a1][a2][a3][a4][a5][a6][a7][a8][a9][a10]concat=n=10:v=0:a=1,volume=0.9[amb];\
[11:a]atrim=29:90,asetpts=N/SR/TB,aresample=48000,volume=9dB,afade=t=in:d=2.5,afade=t=out:st=46.0:d=3.0,adelay=$(echo "$MSTART*1000/1"|bc)|$(echo "$MSTART*1000/1"|bc)[m];\
[$k:a]aresample=48000,volume=-6dB,adelay=$(echo "$SIGAT*1000/1"|bc)|$(echo "$SIGAT*1000/1"|bc)[s];\
[amb][m][s]amix=inputs=3:normalize=0:duration=longest,apad=whole_dur=$TOTAL,atrim=0:$TOTAL,afade=t=out:st=$(echo "$TOTAL-1.2"|bc):d=1.2,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/yukaridan-$LANG-1080x1920.mp4
  echo "✓ $SRC/yukaridan-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
