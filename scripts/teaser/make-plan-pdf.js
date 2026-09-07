// Teaser prodüksiyon planı → PDF (A4).
// plan-print.html'i Chromium ile basar; fontlar uygulamanın kendi
// dosyalarından geldiği için ağ gerekmiyor.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const SRC = 'file://' + path.resolve(__dirname, 'plan-print.html');
const OUT = process.argv[2] || path.resolve(__dirname, '..', '..', 'store-assets', 'stoikos-teaser-plani.pdf');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  const page = await (await browser.newContext()).newPage();
  await page.goto(SRC, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: '17mm', bottom: '15mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font-family:sans-serif;font-size:7pt;color:#a09884;'
      + 'padding:0 15mm;display:flex;justify-content:space-between;">'
      + '<span>Stoikos — Teaser Prodüksiyon Planı</span>'
      + '<span class="pageNumber"></span></div>',
  });

  await browser.close();
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`✓ ${path.basename(OUT)}  ${kb} KB`);
})();
