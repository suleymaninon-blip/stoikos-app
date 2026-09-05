// Google Play "öne çıkan görsel" — tam 1024×500, saydamlık yok.
// scripts/feature-graphic.html şablonunu altı dilde doldurup PNG'ye çevirir.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const TPL = 'file://' + path.resolve(__dirname, 'feature-graphic.html');
const OUT = process.argv[2] || path.resolve(__dirname, '..', 'store-assets');

// Mağaza metinleriyle aynı cümleler — vitrin ile açıklama birbirini tekrarlasın.
const COPY = {
  tr: { tagline: 'Sakinlik bir yetenek değil,\nbir pratiktir.',
        features: '164 söz · 10 filozof · 12 kavram · Stoacı koç' },
  en: { tagline: 'Calm is not a talent.\nIt is a practice.',
        features: '164 quotes · 10 philosophers · 12 concepts · Stoic coach' },
  de: { tagline: 'Ruhe ist kein Talent.\nSie ist eine Übung.',
        features: '164 Zitate · 10 Philosophen · 12 Konzepte · Stoischer Coach' },
  ru: { tagline: 'Спокойствие — не талант.\nЭто практика.',
        features: '164 цитаты · 10 философов · 12 понятий · стоический коуч' },
  fr: { tagline: 'Le calme n\'est pas un talent.\nC\'est une pratique.',
        features: '164 citations · 10 philosophes · 12 concepts · coach stoïcien' },
  es: { tagline: 'La calma no es un talento.\nEs una práctica.',
        features: '164 citas · 10 filósofos · 12 conceptos · coach estoico' },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'],
  });
  // Play tam 1024×500 istiyor: ölçek 1, kırpma yok.
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const [lang, c] of Object.entries(COPY)) {
    await page.goto(TPL, { waitUntil: 'load' });
    await page.evaluate((copy) => {
      document.getElementById('tagline').textContent = copy.tagline;
      document.getElementById('tagline').style.whiteSpace = 'pre-line';
      document.getElementById('features').textContent = copy.features;
    }, c);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    const file = path.join(OUT, `play-feature-${lang}.png`);
    await page.screenshot({ path: file, omitBackground: false });
    const b = fs.readFileSync(file);
    console.log(`✓ ${lang}  ${b.readUInt32BE(16)}×${b.readUInt32BE(20)}  ${(b.length / 1024).toFixed(0)} KB`);
  }

  await browser.close();
})();
