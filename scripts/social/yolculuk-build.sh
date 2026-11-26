#!/usr/bin/env bash
# "Yolculuk" — yandan kayan yolculuk videosu (1080×1920), dünya başına 10 sn.
#   bash scripts/social/yolculuk-build.sh [tr,en]
# Görüntü: scripts/teaser/yolculuk.html (canvas, kare kare; dünyalar WORLDS dizisinde).
# Parçalar: docs/sosyal-medya/yolculuk-videosu/ (Gemini; komutlar docs/sosyal-medya/yolculuk-videosu-yapay-zeka.md):
#   parca-2-yuruyus.mp4, parca-3-manzara-<dünya>.jpg, parca-4-on-katman-<dünya>.jpg
# Hazırlık: yürüyüşten ve ön katmanlardan yeşil silinir (kadin-kareler/, on-katman-saydam-<dünya>.png; git'e girmez).
# Ses: dünyaya göre kodla ortam sesi (I dalga, II rüzgâr, III kuş + arı) + altında Grieg "Sabah" (Musopen, kamu malı kayıt).
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
D=docs/sosyal-medya/yolculuk-videosu
TMP="${YOLCULUK_TMP:-${TMPDIR:-/tmp}/yolculuk-build}"; mkdir -p "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
WORLDS=$(grep -o "{ id: '[a-z]*'" scripts/teaser/yolculuk.html | sed "s/{ id: '//; s/'//")
NW=$(echo "$WORLDS" | wc -l); DUR=$((NW*10))
echo "dünyalar: $(echo $WORLDS) · $DUR sn"

# 1) Yeşil zemin
if [ ! -f "$D/kadin-kareler/240.png" ]; then
  mkdir -p "$D/kadin-kareler"
  ffmpeg -v error -i "$D/parca-2-yuruyus.mp4" \
    -vf "crop=480:660:400:40,chromakey=0x08AA52:0.12:0.06,despill=type=green:mix=0.6:expand=0.1,scale=240:-1:flags=lanczos,format=rgba" \
    "$D/kadin-kareler/%03d.png"
fi
for w in $WORLDS; do
  src="$D/parca-4-on-katman-$w.jpg"; out="$D/on-katman-saydam-$w.png"
  [ -f "$out" ] && continue
  key=$(python3 -c "from PIL import Image; p=Image.open('$src').convert('RGB').getpixel((1000,60)); print('0x%02X%02X%02X'%p)")
  ffmpeg -v error -y -i "$src" -vf "chromakey=$key:0.14:0.06,despill=type=green:mix=0.5,format=rgba" "$out"
done

# 2) Kareler
if [ -z "${SKIP_RENDER:-}" ]; then
  TEASER_TPL=scripts/teaser/yolculuk.html TEASER_MS=$((DUR*1000)) TEASER_NAME=yolculuk-sessiz \
    node scripts/teaser/render-teaser.js "$LANGS" "$TMP"
fi

# 3) Ses: her dünyanın ortam sesi kendi 10 sn'sinde (geçişlerde 1,2 sn erir) + altında müzik.
#    Ortam sesleri kodla: kontrol = dalga, sakinlik = rüzgâr, sabir = kuş cıvıltısı + arı vızıltısı + hafif esinti.
python3 - "$DUR" $WORLDS > "$TMP/ses-filtre.txt" <<'PY'
import sys
dur=int(sys.argv[1]); ws=sys.argv[2:]; n=len(ws)
def gate(i):
    a = "1" if i==0 else f"clip((t-{10*i-0.6})/1.2\\,0\\,1)"
    b = "1" if i==n-1 else f"clip(({10*(i+1)+0.6}-t)/1.2\\,0\\,1)"
    return f"{a}*{b}"
src={
 'kontrol': f"anoisesrc=color=brown:amplitude=0.6:duration={dur}:sample_rate=48000",
 'sakinlik': f"anoisesrc=color=pink:amplitude=0.5:duration={dur}:sample_rate=48000",
 'sabir': f"aevalsrc='0.22*sin(2*PI*(2700+900*sin(2*PI*15*t))*t)*gt(sin(2*PI*0.62*t+1)\\,0.93)+0.16*sin(2*PI*(3400+600*sin(2*PI*22*t))*t)*gt(sin(2*PI*0.41*t)\\,0.95)+0.05*sin(2*PI*185*t+3*sin(2*PI*6*t))+0.03*sin(2*PI*370*t)':s=48000:d={dur}",
}
shape={
 'kontrol': "lowpass=f=900,volume='(0.35+0.3*sin(2*PI*t/5.2))*G':eval=frame",
 'sakinlik': "highpass=f=300,lowpass=f=2400,volume='(0.18+0.14*sin(2*PI*t/3.1)+0.06*sin(2*PI*t/1.3))*G':eval=frame",
 'sabir': "volume='0.9*G':eval=frame",
}
ins=[]; parts=[]
for i,w in enumerate(ws):
    ins.append(f'-f lavfi -i "{src[w]}"')
    parts.append(f"[{i}:a]{shape[w].replace('G', '('+gate(i)+')')},pan=stereo|c0=c0|c1=c0[w{i}]")
m=n
parts.append(f"[{m}:a]atrim=0:{dur},asetpts=N/SR/TB,aresample=48000,volume=4dB,afade=t=in:d=2.5[m]")
mix="".join(f"[w{i}]" for i in range(n))+"[m]"
parts.append(f"{mix}amix=inputs={n+1}:normalize=0,afade=t=in:d=0.8,afade=t=out:st={dur-1}:d=1,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
print(" ".join(ins)); print(";".join(parts))
PY
INPUTS=$(sed -n 1p "$TMP/ses-filtre.txt"); FILTER=$(sed -n 2p "$TMP/ses-filtre.txt")
eval ffmpeg -y -loglevel error $INPUTS -i "$MUSIC" -filter_complex "\"$FILTER\"" -map "[a]" -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/yolculuk-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" \
    -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$D/yolculuk-$l-1080x1920.mp4"
  echo "$D/yolculuk-$l-1080x1920.mp4"
done
