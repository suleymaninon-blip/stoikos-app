// Yayın öncesi eksikler listesi → PDF (A4, yazdırmalık).
// Fontlar uygulamanın kendi dosyalarından; ağ gerekmiyor.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

// Kullanım: node make-pdf.js [kaynak.html çıktı.pdf "altbilgi"] — varsayılan eksikler listesi.
// Apple kurulumu: node make-pdf.js apple-kurulum.html stoikos-apple-kurulum.pdf "Stoikos — Apple kurulumu"
const [, , srcArg, outArg, footArg] = process.argv;
const SRC = 'file://' + path.resolve(__dirname, srcArg || 'eksikler.html');
const OUT = path.resolve(__dirname, outArg || 'stoikos-yayin-oncesi-eksikler.pdf');
const FOOT = footArg || 'Stoikos — Yayın öncesi eksikler';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  const page = await (await browser.newContext()).newPage();
  await page.goto(SRC, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: OUT, format: 'A4', printBackground: true,
    margin: { top: '16mm', bottom: '15mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-family:sans-serif;font-size:7pt;color:#a09884;padding:0 16mm;display:flex;justify-content:space-between;"><span>' + FOOT + '</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log(`✓ ${path.basename(OUT)}  ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
})();
