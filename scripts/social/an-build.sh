#!/usr/bin/env bash
# "An" — ~27 sn dikey (TR + EN). Kadın kahraman; yağmurlu gece kavşağında zaman durur →
# donmuş yağmurun içinden "STOIKOS" kemerine → bulutların üstünde dağ terası.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/an-videosu/:
#   cekim-1-kavsak: 0–4,3 canlı; 4,3'ten sonra DONMA KURGUDA: arka plan 4,3. sn karesinde sabit,
#                   kadın cekim-1-kadin-maske.png ile canlı videodan bindirilir (Gemini insanları dondurmadı).
#                   Donmuş bölüm 4,5 sn, yavaş yakınlaşma; ses kesilir, ince çınlama.
#   cekim-2-kemer:  1,6–6,0 donmuş sokakta yürür, damlaya dokunur (baştaki portre ve 6,5'ten sonra yürüyen heykeller kesilir)
#   cekim-3-zirve:  1,9–7,4 kemer ışığından terasa (baştaki portre ve kameraya dönük kemer anı kesilir);
#                   7,4–10 yarı hızda (gözleri kapalı, gülümser)
# 2 → 3 beyaz/altın ışık geçişi; müzik bu geçişte girer (Bach). Terasta Marcus 8.47 sözü. Sonda logo.
# Kullanım: bash scripts/social/an-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/an-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
F=4.5        # donmuş bölüm süresi
# A = 4,3 + 4,5 = 8,8 · B = 4,4 · C = 5,5 + 5,2 = 10,7 · logo 4
X1=12.6      # B → C ışık geçişi (0,6 sn): 8,8 + 4,4 − 0,6
X2=22.6      # C → logo (0,6 sn kararma): 12,6 + 10,7 − 0,7
TOTAL=26.6

# Söz için üstte yumuşak karartma (gökyüzü açık; yazı okunsun)
convert -size 1080x900 gradient:"rgba(8,6,4,0.62)"-"rgba(8,6,4,0)" $TMP/topshade.png

# 1) Donma: sabit arka plan + maskeli canlı kadın, yavaş yakınlaşma
ffmpeg -v error -y -ss 4.3 -i $SRC/cekim-1-kavsak-gemini-720p.mp4 -frames:v 1 $TMP/still.png
ffmpeg -v error -y -i $SRC/cekim-1-kavsak-gemini-720p.mp4 -loop 1 -i $TMP/still.png -loop 1 -i $SRC/cekim-1-kadin-maske.png -filter_complex "\
[0:v]trim=4.3:$(echo "4.3+$F" | bc),setpts=PTS-STARTPTS,format=rgba[live];[2:v]format=gray,trim=0:$F[m];[live][m]alphamerge[fg];\
[1:v]trim=0:$F,setpts=PTS-STARTPTS,format=rgba[bg];[bg][fg]overlay=shortest=1,scale=1080:1920:flags=lanczos,fps=30,\
zoompan=z='1+0.0004*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1,format=yuv420p" \
  -t $F -an -c:v libx264 -crf 15 $TMP/frozen.mp4

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q=$'Olayı değil,\nyargını değiştirebilirsin.'
  else Q=$'Change your judgment,\nnot the event.'; fi
  NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1-kavsak-gemini-720p.mp4 -i $TMP/frozen.mp4 -i $SRC/cekim-2-kemer-gemini-720p.mp4 \
    -i $SRC/cekim-3-zirve-gemini-720p.mp4 -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC \
    -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/topshade.png -f lavfi -t $F -i "sine=f=2093:sample_rate=48000" -filter_complex "\
[0:v]trim=0:4.3,setpts=PTS-STARTPTS,$P[a];[1:v]$P[fz];[a][fz]concat=n=2:v=1:a=0,settb=1/30[A];\
[2:v]trim=1.6:6.0,setpts=PTS-STARTPTS,$P[B];\
[3:v]trim=1.9:7.4,setpts=PTS-STARTPTS,$P[c1];[3:v]trim=7.4:10,setpts=2*(PTS-STARTPTS),$P[c2];[c1][c2]concat=n=2:v=1:a=0,settb=1/30[C];\
[A][B]concat=n=2:v=1:a=0,settb=1/30[AB];[AB][C]xfade=transition=fadewhite:duration=0.6:offset=$X1[ABC];\
[7:v]format=rgba,fade=in:st=17.2:d=1.0:alpha=1,fade=out:st=22.0:d=0.5:alpha=1[sh];[ABC][sh]overlay=0:0[abs];\
[6:v]format=rgba,fade=in:st=17.4:d=0.8:alpha=1,fade=out:st=22.0:d=0.5:alpha=1[q];[abs][q]overlay=0:-1130,settb=1/30[vq];\
[4:v]$P[k];[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=0:4.3,asetpts=PTS-STARTPTS,aresample=48000,afade=t=out:st=4.0:d=0.3[a1];\
[8:a]volume=0.012,afade=t=in:d=0.4,afade=t=out:st=2.5:d=2.0[ring];\
[2:a]atrim=1.6:6.0,asetpts=PTS-STARTPTS,aresample=48000,volume=3[b1];\
[3:a]atrim=1.9:7.4,asetpts=PTS-STARTPTS,aresample=48000,volume=2[c1a];[3:a]atrim=7.4:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=0.5,volume=2[c2a];\
[a1][ring][b1][c1a][c2a]concat=n=5:v=0:a=1,volume=0.7[amb];\
[5:a]atrim=0.7:30,asetpts=N/SR/TB,adelay=12600|12600,afade=t=in:st=12.6:d=1.0,afade=t=out:st=23.4:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/an-$LANG-1080x1920.mp4
  echo "✓ $SRC/an-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
