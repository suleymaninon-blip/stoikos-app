#!/usr/bin/env bash
# "Kontrol Eleği" videosu (1080×1920, 47 sn).
#   bash scripts/social/elek-build.sh [tr,en]
# Görüntü: scripts/teaser/elek.html. Parçalar docs/sosyal-medya/elek-videosu/ (komutlar elek-videosu-yapay-zeka.md),
# kadının yürüyüşü yolculuk-videosu/. Hazırlık: hareket videolarından ve ön katmanlardan yeşil silinir (git'e girmez).
# Ses: Chopin Prelüd Op. 28 No. 15 "Yağmur Damlası" (Latsabidze, kamu malı), sakin açılış; kodla yağmur (taşlar
# düştükçe diner) + bahçede hafif hava; her taş toza dönüşünce ve taş avuca konunca yumuşak çan (üstel sönen sinüs).
# ⚠️ Aç-kapa kapılı ses yok; düzey iki geçişli (ölç → sabit kazanç + tepe sınırlayıcı). Bkz. yolculuk-build.sh notu.
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
D=docs/sosyal-medya/elek-videosu
WD_=docs/sosyal-medya/yolculuk-videosu
TMP="${ELEK_TMP:-${TMPDIR:-/tmp}/elek-build}"; mkdir -p "$TMP"
MUSIC=docs/sosyal-medya/muzik/chopin-prelud-15-yagmur-latsabidze.ogg
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3
DUR=47; END=41.8

# 1) Yeşil zemin
key() { python3 -c "from PIL import Image; p=Image.open('$1').convert('RGB').getpixel((1000,60)); print('0x%02X%02X%02X'%p)"; }
[ -f "$WD_/kadin-kareler/240.png" ] || { mkdir -p "$WD_/kadin-kareler"; ffmpeg -v error -i "$WD_/parca-2-yuruyus.mp4" -vf "crop=480:660:400:40,chromakey=0x08AA52:0.12:0.06,despill=type=green:mix=0.6:expand=0.1,scale=240:-1:flags=lanczos,format=rgba" "$WD_/kadin-kareler/%03d.png"; }
for h in hareket-1-agirlik hareket-2-birakis hareket-3-avuc; do
  [ -f "$D/kareler-$h/192.png" ] || { mkdir -p "$D/kareler-$h"; ffmpeg -v error -i "$D/$h.mp4" -vf "crop=480:660:400:40,chromakey=0x08AA52:0.12:0.06,despill=type=green:mix=0.6:expand=0.1,scale=240:-1:flags=lanczos,format=rgba" "$D/kareler-$h/%03d.png"; }
done
for w in yagmur bahce; do
  src="$D/parca-4-on-katman-$w.jpg"; out="$D/on-katman-saydam-$w.png"
  [ -f "$out" ] || ffmpeg -v error -y -i "$src" -vf "chromakey=$(key "$src"):0.14:0.06,despill=type=green:mix=0.5,format=rgba" "$out"
done

# 2) Kareler
[ -n "${SKIP_RENDER:-}" ] || TEASER_TPL=scripts/teaser/elek.html TEASER_MS=$((DUR*1000)) TEASER_NAME=elek-sessiz node scripts/teaser/render-teaser.js "$LANGS" "$TMP"

# 3) Ses
RAIN="if(lt(t\,10.6)\,1\,if(lt(t\,15.6)\,1-0.8*(t-10.6)/5\,if(lt(t\,17.5)\,0.2*(17.5-t)/1.9\,0)))"
BELL() { echo "aevalsrc='(0.16*sin(2*PI*$1*t)+0.07*sin(2*PI*$1*2.01*t)+0.04*sin(2*PI*$1*3.02*t))*exp(-2.6*t)*(1-exp(-60*t))':s=48000:d=2.2"; }
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=$DUR:sample_rate=48000:seed=3" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=$DUR:sample_rate=48000:seed=9" \
  -i "$MUSIC" -i "$SIG" \
  -f lavfi -i "$(BELL 880)" -f lavfi -i "$(BELL 988)" -f lavfi -i "$(BELL 1047)" -f lavfi -i "$(BELL 1175)" -f lavfi -i "$(BELL 659)" \
  -filter_complex "\
[0:a]highpass=f=400,lowpass=f=6000,volume='0.16*$RAIN':eval=frame,pan=stereo|c0=c0|c1=c0[rain];\
[1:a]highpass=f=500,lowpass=f=2500,volume='0.035*clip((t-16)/2\,0\,1)*clip(($END+2-t)/2\,0\,1)':eval=frame,pan=stereo|c0=c0|c1=c0[air];\
[2:a]atrim=0:$DUR,asetpts=N/SR/TB,aresample=48000,volume=8dB,afade=t=in:d=1.2,afade=t=out:st=$(python3 -c "print($END+2.4)"):d=2.8[m];\
[3:a]aresample=48000,volume=-4dB,adelay=$(python3 -c "print(int(($END+0.3)*1000))")|$(python3 -c "print(int(($END+0.3)*1000))")[s];\
[4:a]adelay=11750|11750,pan=stereo|c0=c0|c1=c0[b1];[5:a]adelay=13150|13150,pan=stereo|c0=c0|c1=c0[b2];\
[6:a]adelay=14550|14550,pan=stereo|c0=c0|c1=c0[b3];[7:a]adelay=15950|15950,pan=stereo|c0=c0|c1=c0[b4];\
[8:a]adelay=31550|31550,pan=stereo|c0=c0|c1=c0[b5];\
[rain][air][m][s][b1][b2][b3][b4][b5]amix=inputs=9:normalize=0:duration=first,afade=t=in:d=0.8,afade=t=out:st=$((DUR-1)):d=1[a]" \
  -map "[a]" -c:a pcm_f32le "$TMP/ses-ham.wav"
MEAS=$(ffmpeg -hide_banner -i "$TMP/ses-ham.wav" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
GAIN=$(echo "$MEAS" | python3 -c "import sys,json; print(round(-16-float(json.load(sys.stdin)['input_i']),2))")
ffmpeg -y -loglevel error -i "$TMP/ses-ham.wav" -af "volume=${GAIN}dB,alimiter=limit=0.84:attack=7:release=80:level=false" -ar 48000 -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/elek-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$D/elek-$l-1080x1920.mp4"
  echo "$D/elek-$l-1080x1920.mp4"
done
