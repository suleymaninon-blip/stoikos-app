// Tasarım sayfasını (telefon çerçeveli HTML) yazdırmalık PDF yapmak için 1. adım: tam sayfa ekran görüntüsü + bölünmemesi gereken öğelerin konumları.
// Kullanım: node scripts/pdf/tasarim-shot.js <tam yol/sayfa.html> <çıkış.png> [genişlik=900]  →  python3 scripts/pdf/tasarim-cut.py <çıkış.png> <çıkış.pdf> "alt bilgi"
// Neden: tarayıcının sayfa bölmesi (page.pdf) bu tasarımlarda telefonları ve notları üst üste bindiriyor.
const { chromium } = require('playwright');
const fs = require('fs');
const [, , src, out, widthArg] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: Number(widthArg || 900), height: 1200 }, deviceScaleFactor: 2.5 });
  await p.goto('file://' + src, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => {
    const sel = 'h1, h2, .lede, .eyebrow, .ph, .note, .card, .phones, section > p, .wrap > p';
    const R = [...document.querySelectorAll(sel)].filter(e => !e.closest('.phone')).map(e => { const r = e.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; });
    const F = [...document.querySelectorAll('section')].slice(1).map(e => e.getBoundingClientRect().top + scrollY - 24); return { R, F, H: document.documentElement.scrollHeight, bg: getComputedStyle(document.body).backgroundColor };
  });
  await p.screenshot({ path: out, fullPage: true });
  fs.writeFileSync(out + '.json', JSON.stringify(info));
  await b.close();
})();
