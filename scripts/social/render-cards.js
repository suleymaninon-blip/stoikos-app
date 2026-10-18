// Sosyal medya kartları — scripts/social/cards.html içindeki CARDS dizisini
// 1080×1350 JPG (kalite 92) olarak çıkarır. Kullanım: node scripts/social/render-cards.js [çıkış klasörü]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.resolve(__dirname, '..', '..', 'docs', 'sosyal-medya', 'ilk-10');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.resolve(__dirname, 'cards.html'));
  await page.evaluate(() => document.fonts.ready);
  const n = await page.evaluate(() => window.CARDS.length);
  for (let i = 0; i < n; i++) {
    const file = await page.evaluate((k) => { window.show(k); return window.CARDS[k].file; }, i);
    await page.evaluate(() => document.fonts.ready);
    // Taşma denetimi: içerik kartın dışına çıkıyorsa söyle.
    const over = await page.evaluate(() => { const c = document.getElementById('card'); return c.scrollHeight > c.clientHeight + 1; });
    await page.locator('#card').screenshot({ path: path.join(OUT, file + '.jpg'), type: 'jpeg', quality: 92 });
    console.log((over ? '⚠ TAŞIYOR ' : '✓ ') + file);
  }
  await browser.close();
})();
