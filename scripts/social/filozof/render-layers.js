// Filozof videosunun yazı katmanları: üç saydam 1080×1920 PNG (t1/t2/t3.png).
// Kullanım: node render-layers.js <dil> <çıkış klasörü> "<yazı 1>" "<yazı 2>" "<yazı 3>"
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

const [, , , OUT, ...TEXTS] = process.argv;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.resolve(__dirname, 'overlay.html'));
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < 3; i++) {
    await page.evaluate((s) => window.showText(s), TEXTS[i]);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `t${i + 1}.png`), omitBackground: true });
  }
  await browser.close();
})();
