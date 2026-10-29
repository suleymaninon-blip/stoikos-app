#!/usr/bin/env bash
# stoikos.app sitesini üretir → site/
#
#   /            → website/index.html (açılış sayfası)
#   /app/        → Expo web uygulaması
#   /gizlilik.html, /privacy.html, /terms*.html → yasal sayfalar
#   /404.html    → bulunamayan her yolu /app/'e yönlendirir
#
# Cloudflare Pages bu betiği build komutu olarak çalıştırır (çıktı: site).
# Bağımlılıkları Cloudflare kendisi kurar (npm ci). Yerelde: npm ci && bash scripts/build-site.sh
#
# ⚠️ BASE, app.json → experiments.baseUrl ile AYNI olmalı.
set -euo pipefail
BASE=/app

rm -rf dist site
EXPO_BASE_URL=$BASE npx expo export --platform web --clear

# Expo bazı HTML referanslarını kök yoldan yazabiliyor; hepsini BASE altına al.
find dist -name "*.html" -exec sed -i \
  -e "s|src=\"/_expo/|src=\"$BASE/_expo/|g" \
  -e "s|href=\"/_expo/|href=\"$BASE/_expo/|g" \
  -e "s|url(/assets/|url($BASE/assets/|g" \
  -e "s|href=\"/assets/|href=\"$BASE/assets/|g" \
  {} \;

# ⚠️ Cloudflare Pages `node_modules` adlı klasörleri YAYINLAMIYOR. Expo yazı tiplerini
# (Jost, Cinzel, Cormorant) ve gezinme simgelerini dist/assets/node_modules/ altına koyuyor;
# canlıda hepsi 404 oluyor ve uygulama sistem serif yazı tipine düşüyordu (22 Ekim 2026).
# Klasörü yeniden adlandır, paketteki yolları da buna göre değiştir.
if [ -d dist/assets/node_modules ]; then
  mv dist/assets/node_modules dist/assets/vendor
  grep -rl "assets/node_modules/" dist --include=*.js --include=*.html --include=*.css --include=*.json \
    | xargs -r sed -i "s|assets/node_modules/|assets/vendor/|g"
fi
if find dist -type d -name node_modules | grep -q .; then
  echo "HATA: dist içinde hâlâ node_modules klasörü var (Cloudflare yayınlamaz)"; exit 1
fi

mkdir site
mv dist "site$BASE"
cp -r website/. site/   # açılış sayfası, 404, img/, media/
cp public/gizlilik.html public/privacy.html public/terms.html public/terms-en.html site/

# Uygulama kendi 6 dilini taşıyor: Chrome'un "Bu sayfayı çevir" önerisi çıkmasın (lang="en" yüzünden Türkçe sayfaya çeviri öneriyordu)
sed -i 's|<html lang="en">|<html lang="en" translate="no">|' "site$BASE/index.html"
# Web uygulaması "Ana ekrana ekle" ile tam ekran açılsın: manifest, tema rengi, iOS etiketleri.
sed -i 's|</head>|<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#14120e"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Stoikos"><meta name="google" content="notranslate"><link rel="apple-touch-icon" href="/img/icon-180.png"></head>|' "site$BASE/index.html"
echo "site/ hazır:"; ls site
