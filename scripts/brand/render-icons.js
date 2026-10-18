// Marka varlıklarını üretir: node scripts/brand/render-icons.js
//   assets/icon.png              1024, tam taşan, alfasız (Expo ikon + iOS)
//   assets/adaptive-icon.png     512, saydam; işaret güvenli alanın (orta %66) içinde
//   assets/splash.png            1024, saydam; açılış ekranında ortada işaret
//   assets/favicon.png           48 (Expo web)
//   store-assets/icon-1024-apple.png, icon-512-play.png  alfasız
//   website/img/favicon.png (64), website/img/icon-180.png (apple-touch-icon)
// Alfa kanalı ImageMagick ile atılıyor (Apple alfa kanallı ikonu reddediyor).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const { ICON, MARK } = require('./mark');
const R = path.resolve(__dirname, '..', '..');

async function shot(page, svg, size, out, transparent, markScale = 1) {
  const inner = Math.round(size * markScale), pad = Math.round((size - inner) / 2);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">
    <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
      ${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  void pad;
}
const noAlpha = (f) => execFileSync('convert', [f, '-background', '#0c0a07', '-alpha', 'remove', '-alpha', 'off', f]);
const resize = (src, size, out) => execFileSync('convert', [src, '-resize', `${size}x${size}`, out]);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  const icon = path.join(R, 'assets/icon.png');
  await shot(p, ICON, 1024, icon, false); noAlpha(icon);
  execFileSync('cp', [icon, path.join(R, 'store-assets/icon-1024-apple.png')]);
  resize(icon, 512, path.join(R, 'store-assets/icon-512-play.png')); noAlpha(path.join(R, 'store-assets/icon-512-play.png'));
  resize(icon, 180, path.join(R, 'website/img/icon-180.png')); noAlpha(path.join(R, 'website/img/icon-180.png'));
  resize(icon, 64, path.join(R, 'website/img/favicon.png'));
  resize(icon, 48, path.join(R, 'assets/favicon.png'));
  // Android: ön katman 108dp, görünen güvenli alan ortadaki 66dp çember → işaret ~%60.
  await shot(p, MARK, 512, path.join(R, 'assets/adaptive-icon.png'), true, 0.6);
  // Açılış: işaret tuvalin %40'ı (resizeMode contain, zemin #1a1814).
  await shot(p, MARK, 1024, path.join(R, 'assets/splash.png'), true, 0.4);
  await b.close();
  console.log('tamam');
})();
