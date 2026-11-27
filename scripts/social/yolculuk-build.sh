#!/usr/bin/env bash
# "Yolculuk" — yandan kayan yolculuk videosu (1080×1920), dünya başına 10 sn.
#   bash scripts/social/yolculuk-build.sh [tr,en]
# Görüntü: scripts/teaser/yolculuk.html (canvas, kare kare; dünyalar WORLDS dizisinde).
# Parçalar: docs/sosyal-medya/yolculuk-videosu/ (Gemini; komutlar docs/sosyal-medya/yolculuk-videosu-yapay-zeka.md):
#   parca-2-yuruyus.mp4, parca-3-manzara-<dünya>.jpg, parca-4-on-katman-<dünya>.jpg
# Hazırlık: yürüyüşten ve ön katmanlardan yeşil silinir (kadin-kareler/, on-katman-saydam-<dünya>.png; git'e girmez).
# Ses: dünyaya göre kodla ortam sesi (I dalga, II rüzgâr, III esinti, IV yaprak hışırtısı, V sıcak rüzgâr) + kapanışta ses imzası + altında Grieg "Sabah" (Musopen, kamu malı kayıt).
set -euo pipefail
cd "$(dirname "$0")/../.."
LANGS="${1:-tr,en}"
D=docs/sosyal-medya/yolculuk-videosu
TMP="${YOLCULUK_TMP:-${TMPDIR:-/tmp}/yolculuk-build}"; mkdir -p "$TMP"
MUSIC=docs/sosyal-medya/muzik/grieg-sabah-musopen.mp3
SIG=docs/sosyal-medya/muzik/stoikos-imza.mp3
WORLDS=$(grep -o "{ id: '[a-z]*'" scripts/teaser/yolculuk.html | sed "s/{ id: '//; s/'//")
NW=$(echo "$WORLDS" | wc -l); END=$((NW*10)); DUR=$((END+7))   # +7 sn kapanış
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

# 3) Ses: her dünyanın ortam sesi kendi 10 sn'sinde (geçişlerde 1,2 sn erir) + altında müzik; kapanışta ses imzası.
#    Ortam sesleri kodla, hepsi YUMUŞAK ve SÜREKLİ gürültüden: kontrol = dalga, sakinlik = rüzgâr, sabir = hafif esinti,
#    kayip = yaprak hışırtısı, yetinmek = sıcak rüzgâr.
#    ⚠️ 27 Kasım 2026: ilk sürümde kuş/arı/cırcır kodla (aç-kapa kapılı sinüs) üretilmişti → her açılışta çıtırtı, bip,
#    yapay ses; üstüne loudnorm'un dinamik modu müziği pompalıyor, tepe 0 dB'ye dayanıyordu. Kapılı (gt) ses ve tek
#    geçişli loudnorm kullanma: karışım önce WAV'a yazılır, ölçülür, sonra tek sabit kazançla (linear) normalleştirilir.
python3 - "$DUR" "$END" $WORLDS > "$TMP/ses-filtre.txt" <<'PY'
import sys
dur=int(sys.argv[1]); end=int(sys.argv[2]); ws=sys.argv[3:]; n=len(ws)
def gate(i):
    a = "1" if i==0 else f"clip((t-{10*i-0.6})/1.2\\,0\\,1)"
    b = f"clip(({end+3}-t)/3\\,0\\,1)" if i==n-1 else f"clip(({10*(i+1)+0.6}-t)/1.2\\,0\\,1)"
    return f"{a}*{b}"
noise={'kontrol':'brown','sakinlik':'pink','sabir':'pink','kayip':'pink','yetinmek':'brown'}
shape={
 'kontrol':  "lowpass=f=900,volume='(0.30+0.22*sin(2*PI*t/5.2))*G':eval=frame",
 'sakinlik': "highpass=f=300,lowpass=f=2400,volume='(0.15+0.09*sin(2*PI*t/3.1)+0.04*sin(2*PI*t/1.9))*G':eval=frame",
 'sabir':    "highpass=f=400,lowpass=f=2600,volume='(0.08+0.03*sin(2*PI*t/4.7))*G':eval=frame",
 'kayip':    "highpass=f=900,lowpass=f=5000,volume='(0.07+0.03*sin(2*PI*t/4.3)+0.02*sin(2*PI*t/1.7))*G':eval=frame",
 'yetinmek': "lowpass=f=650,volume='(0.22+0.08*sin(2*PI*t/6.1))*G':eval=frame",
}
ins=[]; parts=[]
for i,w in enumerate(ws):
    ins.append(f'-f lavfi -i "anoisesrc=color={noise[w]}:amplitude=0.5:duration={dur}:sample_rate=48000:seed={11+i}"')
    parts.append(f"[{i}:a]{shape[w].replace('G', '('+gate(i)+')')},pan=stereo|c0=c0|c1=c0[w{i}]")
m=n
parts.append(f"[{m}:a]atrim=0:{dur},asetpts=N/SR/TB,aresample=48000,afade=t=in:d=2.5,afade=t=out:st={end+3}:d=3.5[m]")
parts.append(f"[{m+1}:a]aresample=48000,volume=-4dB,adelay={end*1000+2400}|{end*1000+2400}[s]")   # logo ile ses imzası
mix="".join(f"[w{i}]" for i in range(n))+"[m][s]"
parts.append(f"{mix}amix=inputs={n+2}:normalize=0,afade=t=in:d=0.8,afade=t=out:st={dur-1}:d=1[a]")
print(" ".join(ins)); print(";".join(parts))
PY
INPUTS=$(sed -n 1p "$TMP/ses-filtre.txt"); FILTER=$(sed -n 2p "$TMP/ses-filtre.txt")
eval ffmpeg -y -loglevel error $INPUTS -i "$MUSIC" -i "$SIG" -filter_complex "\"$FILTER\"" -map "[a]" -c:a pcm_f32le "$TMP/ses-ham.wav"
# İki geçişli ses düzeyi: ölç → tek sabit kazanç + yalnız tepeleri tutan sınırlayıcı (müzik pompalanmaz, tepe ≈ -1,5 dB)
MEAS=$(ffmpeg -hide_banner -i "$TMP/ses-ham.wav" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mv_() { echo "$MEAS" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
GAIN=$(python3 -c "print(round(-16 - float($(mv_ input_i)), 2))")   # -16 LUFS'e tek sabit kazanç
ffmpeg -y -loglevel error -i "$TMP/ses-ham.wav" -af "volume=${GAIN}dB,alimiter=limit=0.84:attack=7:release=80:level=false" \
  -ar 48000 -c:a aac -b:a 192k "$TMP/ses.m4a"

IFS=, read -ra LS <<< "$LANGS"
for l in "${LS[@]}"; do
  ffmpeg -y -loglevel error -i "$TMP/yolculuk-sessiz-$l-1080x1920.mp4" -i "$TMP/ses.m4a" \
    -map 0:v -map 1:a -c:v copy -c:a copy -shortest -movflags +faststart "$D/yolculuk-$l-1080x1920.mp4"
  echo "$D/yolculuk-$l-1080x1920.mp4"
done
