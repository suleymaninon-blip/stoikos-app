const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const path = require('path');
// Marka tescili örneği (EPATS: 591×591, RGB, 300 DPI, JPG). Fontlar bu klasörde değil:
// node_modules/@expo-google-fonts/cinzel'den okunuyor. PNG üretir; JPG'ye çevirme:
// convert in.png -alpha off -units PixelsPerInch -density 300 -quality 92 out.jpg
const D = __dirname;
const FONTS = path.resolve(__dirname, '../../node_modules/@expo-google-fonts/cinzel');
const font = (f) => 'data:font/ttf;base64,' + fs.readFileSync(path.join(FONTS, f)).toString('base64');
const css = `@font-face{font-family:Cinzel;font-weight:500;src:url(${font('Cinzel_500Medium.ttf')})}@font-face{font-family:Cinzel;font-weight:700;src:url(${font('Cinzel_700Bold.ttf')})}`;
// Aynı geometri: components/StoikosMark.tsx, scripts/brand/mark.js
const mark = (mode) => mode === 'bw' ? `
  <circle cx="512" cy="477" r="292" fill="none" stroke="#000" stroke-width="6"/>
  <circle cx="512" cy="477" r="128" fill="#000"/>
  <path d="M296 688 H415 A232 232 0 1 1 609 688 H728" fill="none" stroke="#000" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>` : `
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="760"><stop offset="0" stop-color="#f4e2b8"/><stop offset=".45" stop-color="#d4b376"/><stop offset="1" stop-color="#9a7b44"/></linearGradient>
    <radialGradient id="o" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#f6e6c0"/><stop offset=".45" stop-color="#cfae6c"/><stop offset="1" stop-color="#6e5530"/></radialGradient>
    <radialGradient id="w" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e2b874" stop-opacity=".45"/><stop offset="1" stop-color="#e2b874" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="512" cy="477" r="292" fill="none" stroke="#d4b376" stroke-opacity=".3" stroke-width="6"/>
  <circle cx="512" cy="477" r="200" fill="url(#w)"/>
  <circle cx="512" cy="477" r="128" fill="url(#o)"/>
  <path d="M296 688 H415 A232 232 0 1 1 609 688 H728" fill="none" stroke="url(#g)" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 591, height: 591 } });
  for (const mode of ['bw', 'renkli']) {
    const bg = mode === 'bw' ? '#ffffff' : '#14120e', fg = mode === 'bw' ? '#000000' : '#e6d2a4';
    await p.setContent(`<html><head><style>${css}
      body{margin:0;width:591px;height:591px;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center}
      .w{font-family:Cinzel;font-weight:500;font-size:62px;letter-spacing:15px;color:${fg};margin-top:14px;padding-left:15px}
    </style></head><body>
      <svg width="330" height="330" viewBox="192 162 640 640">${mark(mode)}</svg>
      <div class="w">STOIKOS</div></body></html>`);
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${D}/tescil-${mode}.png`, clip: { x: 0, y: 0, width: 591, height: 591 } });
  }
  await b.close();
})();
