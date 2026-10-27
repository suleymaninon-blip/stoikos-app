#!/usr/bin/env bash
# "Beş Şey" — ~58 sn dikey (TR + EN). Kadın kahraman; liste biçimi: "Stoacı bir kadının asla yapmadığı 5 şey".
# Kaynaklar (Gemini, 720p, 24 fps) docs/sosyal-medya/bes-sey-videosu/ — çekimler birbirinden bağımsız, düz kesmeyle sıralanır:
#   cekim-0-kanca     4,0–10   kalabalık yaya geçidi, durup kameraya bakar        (başlık üstte)
#   cekim-1-telefon   1,0–9,0  ters duran telefon titreşir, pencereyi açar         1. başkalarının gündemi
#   cekim-2-saganak   1,5–9,5  ani sağanak, herkes kaçar, o yürür (şemsiyeli deneme1 tutmadı)  2.
#   cekim-3-kafe      1,5–9,5  herkes selfie çeker, o okur                          3.
#   cekim-4-nehir     1,0–9,5  mektuptan kâğıt kayık                                4.
#   cekim-5-kumsaati  0,9–4,0 + 6,3–10  "STOIKOS" taban 0,5'te belirip 4,2'de kayboluyordu → arası atlandı  5.
#   cekim-6-sahil     0,5–10   denize koşar                                         final
# Yazılar altta, kanca başlığı üstte. Bach baştan sona; çekim sesleri altta. Sonda logo.
# Kullanım: bash scripts/social/bes-sey-build.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=docs/sosyal-medya/bes-sey-videosu
MUSIC=docs/sosyal-medya/muzik/bach-cello-suite-1-prelude-lud-schlatt.ogg
TMP=$(mktemp -d)
P="scale=1080:1920:flags=lanczos,fps=30,setsar=1,format=yuv420p,settb=1/30"

# Parçalar: dosya başlangıç bitiş
SEGS=(
  "cekim-0-kanca 4.0 10"
  "cekim-1-telefon 1.0 9.0"
  "cekim-2-saganak 1.5 9.5"
  "cekim-3-kafe 1.5 9.5"
  "cekim-4-nehir 1.0 9.5"
  "cekim-5-kumsaati 0.9 4.0"
  "cekim-5-kumsaati 6.3 10"
  "cekim-6-sahil 0.5 10"
)
# Her parçanın montajdaki başlangıcı (yazı zamanlaması için)
STARTS=(); T=0
for s in "${SEGS[@]}"; do set -- $s; STARTS+=("$T"); T=$(echo "$T + $3 - $2" | bc); done
VID_END=$T                       # yazılı bölümün sonu
X2=$(echo "$VID_END - 0.6" | bc) # logoya kararma
TOTAL=$(echo "$X2 + 4" | bc)

for LANG in tr en; do
  TEASER_TPL=scripts/social/filozof/overlay.html TEASER_MS=4000 TEASER_NAME=kapanis \
    node scripts/teaser/render-teaser.js "$LANG" "$TMP" > /dev/null
  if [ "$LANG" = tr ]; then
    TXT=($'Stoacı bir kadının\nasla yapmadığı 5 şey' $'1. Güne başkalarının\ngündemiyle başlamaz' $'2. Kontrol edemediğine\nöfkelenmez' '3. Onay peşinde koşmaz' '4. Geçmişte yaşamaz' '5. Ölümü unutmaz…' $'…bu yüzden\nhayatı ertelemez.')
  else
    TXT=($'5 things a Stoic woman\nnever does' $'1. She doesn\'t start her day\non everyone else\'s agenda' $'2. She doesn\'t rage at what\nshe can\'t control' $'3. She doesn\'t chase approval' $'4. She doesn\'t live in the past' $'5. She never forgets\nshe will die…' $'…so she never\npostpones living.')
  fi
  node scripts/social/filozof/render-layers.js "$LANG" "$TMP" "${TXT[@]}"
  # Kanca başlığı açık gökyüzünün önünde: gölge halkası leke gibi duruyor → halkasız + üstten karartma
  mkdir -p $TMP/h && NOSHADE=1 node scripts/social/filozof/render-layers.js "$LANG" "$TMP/h" "${TXT[0]}" && mv $TMP/h/t1.png $TMP/t1.png
  convert -size 1080x760 gradient:"rgba(8,6,4,0.72)"-"rgba(8,6,4,0)" $TMP/topshade.png
  # yazı → (görünme, kaybolma) zamanları; 5. madde iki parçaya yayılır
  S=("${STARTS[@]}")
  WIN=(
    "0.6 $(echo "${S[1]} - 0.4" | bc)"
    "$(echo "${S[1]} + 0.5" | bc) $(echo "${S[2]} - 0.4" | bc)"
    "$(echo "${S[2]} + 0.5" | bc) $(echo "${S[3]} - 0.4" | bc)"
    "$(echo "${S[3]} + 0.5" | bc) $(echo "${S[4]} - 0.4" | bc)"
    "$(echo "${S[4]} + 0.5" | bc) $(echo "${S[5]} - 0.4" | bc)"
    "$(echo "${S[5]} + 0.4" | bc) $(echo "${S[7]} - 0.4" | bc)"
    "$(echo "${S[7]} + 3.0" | bc) $(echo "$VID_END - 0.8" | bc)"
  )
  IN=""; FC=""; n=0
  for s in "${SEGS[@]}"; do set -- $s; IN="$IN -i $SRC/$1-gemini-720p.mp4"
    FC="$FC[$n:v]trim=$2:$3,setpts=PTS-STARTPTS,$P[v$n];[$n:a]atrim=$2:$3,asetpts=PTS-STARTPTS,aresample=48000[a$n];"; n=$((n+1)); done
  CAT=""; for i in $(seq 0 $((n-1))); do CAT="$CAT[v$i][a$i]"; done
  FC="$FC${CAT}concat=n=$n:v=1:a=1[V0][A0];[V0]settb=1/30[V0b];"
  IN="$IN -loop 1 -t $TOTAL -i $TMP/topshade.png"
  FC="$FC[$n:v]format=rgba,fade=in:st=0.3:d=0.5:alpha=1,fade=out:st=$(echo "${S[1]} - 0.4" | bc):d=0.3:alpha=1[sh];[V0b][sh]overlay=0:0[V0s];"
  last="V0s"; k=$((n+1))
  for j in 0 1 2 3 4 5 6; do
    set -- ${WIN[$j]}
    IN="$IN -loop 1 -t $TOTAL -i $TMP/t$((j+1)).png"
    Y=0; [ $j -eq 0 ] && Y=-1130
    FC="$FC[$k:v]format=rgba,fade=in:st=$1:d=0.4:alpha=1,fade=out:st=$2:d=0.3:alpha=1[q$j];[$last][q$j]overlay=0:$Y[o$j];"
    last="o$j"; k=$((k+1))
  done
  LOGO=$k; MUS=$((k+1))
  IN="$IN -i $TMP/kapanis-$LANG-1080x1920.mp4 -i $MUSIC"
  FC="$FC[$last]settb=1/30[VQ];[$LOGO:v]$P[K];[VQ][K]xfade=transition=fadeblack:duration=0.6:offset=$X2[v];"
  FC="$FC[A0]volume=0.55[amb];[$MUS:a]atrim=0.7:80,asetpts=N/SR/TB,afade=t=in:d=1.5,afade=t=out:st=$(echo "$TOTAL - 3.2" | bc):d=3.2[m];"
  FC="$FC[amb][m]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11[au]"
  ffmpeg -v error -y $IN -filter_complex "$FC" -map "[v]" -map "[au]" -t $TOTAL -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart $SRC/bes-sey-$LANG-1080x1920.mp4
  echo "✓ $SRC/bes-sey-$LANG-1080x1920.mp4 ($TOTAL sn)"
done
rm -rf "$TMP"
