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
EXPO_BASE_URL=$BASE npx expo export --platform web

# Expo bazı HTML referanslarını kök yoldan yazabiliyor; hepsini BASE altına al.
find dist -name "*.html" -exec sed -i \
  -e "s|src=\"/_expo/|src=\"$BASE/_expo/|g" \
  -e "s|href=\"/_expo/|href=\"$BASE/_expo/|g" \
  -e "s|url(/assets/|url($BASE/assets/|g" \
  -e "s|href=\"/assets/|href=\"$BASE/assets/|g" \
  {} \;

mkdir site
mv dist "site$BASE"
cp website/index.html website/404.html site/
cp public/gizlilik.html public/privacy.html public/terms.html public/terms-en.html site/
echo "site/ hazır:"; ls site
