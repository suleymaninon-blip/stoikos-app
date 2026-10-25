#!/usr/bin/env bash
# "Kütüphane" — ~33 sn dikey (TR + EN). Kadın kahraman; gece havalimanı kargaşası → beyaz yan koridorda
# "STOIKOS" yazılı meşe kapı → sessiz, güneşli yuvarlak kütüphane → pencere kenarında kitap, gözler kapalı.
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/kutuphane-videosu/:
#   cekim-1a-havalimani: 2,0–10 kalabalığın içinden kameraya yürür, beyaz koridora döner (baştaki 0,5 sn portre kesilir)
#   cekim-1b-kapi:       4,0–10 koridor → kapı, elini kapıya koyar (düz kesme)
#   cekim-2-kutuphane:   0–7,0 aynı kapı açılır, kütüphaneye girer (1b'nin son karesinden; düz kesme)
#   cekim-3-deneme1:     2,0–5,75 kitabı alır, pencereye oturur (oda birebir; yüz görünmeden kesilir)
#   cekim-3b-yuz:        6,25–10 yakın plan profil, gözleri kapalı gülümser (yüz referanslı deneme; 8–10 yarı hızda)
#                        deneme1'in sonundaki yüz başka biriydi, 3b'nin başındaki oda farklıydı → ikisi birleştirildi.
# 2 → 3a: 0,5 sn yumuşak odak geçişi; 3a → 3b düz kesme (genişten yakın plana; erime iki kadını üst üste bindiriyordu). Bach kütüphaneye girişte başlar. Söz pencere kenarında altta. Sonda logo.
# Kullanım: bash scripts/social/kutuphane-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/kutuphane-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"
# A 8,0 + B 6,0 + C 7,0 = 21,0 · D 3,75 (C→D 0,5) · E 1,75 + 4,0 = 5,75 (D→E düz kesme) · logo 4 (0,6 kararma)
XD=20.5      # C → D
X2=28.9      # E → logo: 20,5 + 3,75 + 5,75 − 0,6 − 0,5 (son 0,5 sn kararmaya girer)
TOTAL=32.9
QIN=25.0     # söz görünür
QOUT=28.5

python3 - "$TMP" <<'PY'
import sys
d=sys.argv[1]
def ease(x): return x*x*(3-2*x)
def out(name, n, start):   # sondaki 0,7 sn bulanıklaşır
    with open(f'{d}/{name}.txt','w') as f:
        for i in range(n+1):
            t=i/30; v=0 if t<start else 14*ease(min(1,(t-start)/0.7))
            f.write(f'{t:.4f} gblur sigma {max(v,0.01):.3f};\n')
def inn(name):             # baştaki 0,7 sn netleşir
    with open(f'{d}/{name}.txt','w') as f:
        for i in range(31):
            t=i/30; v=14*ease(max(0,1-t/0.7))
            f.write(f'{t:.4f} gblur sigma {max(v,0.01):.3f};\n')
out('blurC', 210, 6.3)          # C: 7,0 sn
inn('blurD')
PY

# Söz altta; kitabın üstünde okunsun diye alttan yumuşak karartma
convert -size 1080x900 gradient:"rgba(8,6,4,0)"-"rgba(8,6,4,0.75)" $TMP/botshade.png

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then Q=$'Her yerde olan,\nhiçbir yerde değildir.'
  else Q=$'Everywhere\nis nowhere.'; fi
  NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "$Q"
  ffmpeg -v error -y -i $SRC/cekim-1a-havalimani-gemini-720p.mp4 -i $SRC/cekim-1b-kapi-gemini-720p.mp4 \
    -i $SRC/cekim-2-kutuphane-gemini-720p.mp4 -i $SRC/cekim-3-deneme1-yuz-farkli.mp4 -i $SRC/cekim-3b-yuz-gemini-720p.mp4 \
    -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC -loop 1 -t $TOTAL -i $TMP/t1.png -loop 1 -t $TOTAL -i $TMP/botshade.png \
    -filter_complex "\
[0:v]trim=2.0:10,setpts=PTS-STARTPTS,$P[a];[1:v]trim=4.0:10,setpts=PTS-STARTPTS,$P[b];\
[2:v]trim=0:7.0,setpts=PTS-STARTPTS,$P,sendcmd=f=$TMP/blurC.txt,gblur=sigma=0.01,settb=1/30[c];\
[a][b][c]concat=n=3:v=1:a=0,settb=1/30[ABC];\
[3:v]trim=2.0:5.75,setpts=PTS-STARTPTS,$P,sendcmd=f=$TMP/blurD.txt,gblur=sigma=0.01,settb=1/30[D];\
[4:v]trim=6.25:8,setpts=PTS-STARTPTS,$P[e1];[4:v]trim=8:10,setpts=2*(PTS-STARTPTS),$P[e2];\
[e1][e2]concat=n=2:v=1:a=0,settb=1/30[E];\
[ABC][D]xfade=transition=fade:duration=0.5:offset=$XD,settb=1/30[ABCD];[ABCD][E]concat=n=2:v=1:a=0,settb=1/30[V];\
[8:v]format=rgba,fade=in:st=$QIN:d=1.0:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[sh];[V][sh]overlay=0:1020[vs];\
[7:v]format=rgba,fade=in:st=$(echo "$QIN+0.2"|bc):d=0.8:alpha=1,fade=out:st=$QOUT:d=0.5:alpha=1[q];[vs][q]overlay=0:0,settb=1/30[vq];\
[5:v]$P[k];[vq][k]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];\
[0:a]atrim=2.0:10,asetpts=PTS-STARTPTS,aresample=48000[a1];[1:a]atrim=4.0:10,asetpts=PTS-STARTPTS,aresample=48000[a2];\
[2:a]atrim=0:7.0,asetpts=PTS-STARTPTS,aresample=48000[a3];\
[3:a]atrim=2.0:5.75,asetpts=PTS-STARTPTS,aresample=48000,volume=2[a4];\
[4:a]atrim=6.25:8,asetpts=PTS-STARTPTS,aresample=48000,volume=2[a5];[4:a]atrim=8:10,asetpts=PTS-STARTPTS,aresample=48000,atempo=0.5,volume=2[a6];\
[a1][a2][a3]concat=n=3:v=0:a=1[a123];[a123][a4]acrossfade=d=0.5[a1234];[a5][a6]concat=n=2:v=0:a=1[a56];[a1234][a56]concat=n=2:v=0:a=1,volume=0.7[amb];\
[6:a]atrim=0.7:40,asetpts=N/SR/TB,adelay=15800|15800,afade=t=in:st=15.8:d=1.2,afade=t=out:st=29.7:d=3.2[m];\
[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]" \
    -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/kutuphane-$LANG-1080x1920.mp4
  echo "✓ $SRC/kutuphane-$LANG-1080x1920.mp4"
done
rm -rf "$TMP"
