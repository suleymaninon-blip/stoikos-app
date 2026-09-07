// Mağaza simgeleri: kare, saydamlıksız, alfa kanalı olmayan PNG.
//
// assets/icon.png köşeleri yuvarlatılmış ve dışı saydam. İki sorun:
//   1. Apple alfa kanalı taşıyan simgeyi reddediyor.
//   2. Her iki mağaza da köşeyi kendisi yuvarlıyor; hazır yuvarlatılmış simge
//      iki kez kırpılınca köşelerde koyu artık kalıyor.
// Çözüm: saydam köşeleri simgenin kendi dış bandının rengiyle doldurup
// alfa kanalını tümüyle atmak. Mağaza maskesi temiz kare üzerine uygulanır.
//
// assets/adaptive-icon.png'ye DOKUNULMUYOR — o Android'in uyarlanabilir
// simgesinin ön katmanı ve saydamlığı orada doğru.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { PNG } = require('/home/user/stoikos-app/node_modules/pngjs');
const fs = require('fs');
const path = require('path');

const SRC = '/home/user/stoikos-app/assets/icon.png';
const OUT = path.resolve(__dirname, '..', 'store-assets');
const TARGETS = [
  { size: 1024, file: 'icon-1024-apple.png', note: 'App Store' },
  { size: 512, file: 'icon-512-play.png', note: 'Play vitrin' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  const page = await (await browser.newContext()).newPage();
  // file:// görsellerini okuyabilmek için sayfanın kendisi de file:// olmalı.
  await page.goto('file://' + path.resolve(__dirname, 'feature-graphic.html'));

  for (const t of TARGETS) {
    const { rgba, fill } = await page.evaluate(async ({ src, size }) => {
      const img = new Image();
      img.src = src;
      await img.decode();

      // Dolgu rengi: simgenin üst kenar ortası — yuvarlatılmış çerçevenin
      // koyu bandı. Sabit bir renk uydurmak yerine simgeden okunuyor.
      const s = document.createElement('canvas');
      s.width = img.width; s.height = img.height;
      const sx = s.getContext('2d');
      sx.drawImage(img, 0, 0);
      const mid = sx.getImageData(Math.floor(img.width / 2), 1, 1, 1).data;
      const fill = `rgb(${mid[0]},${mid[1]},${mid[2]})`;

      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const x = c.getContext('2d');
      x.fillStyle = fill;
      x.fillRect(0, 0, size, size);
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, size, size);
      return { rgba: Array.from(x.getImageData(0, 0, size, size).data), fill };
    }, { src: 'file://' + SRC, size: t.size });

    // Alfa kanalını at: RGBA → RGB, colorType 2 ile yaz.
    const png = new PNG({ width: t.size, height: t.size, colorType: 2, inputHasAlpha: false });
    const rgb = Buffer.alloc(t.size * t.size * 3);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
      rgb[j] = rgba[i]; rgb[j + 1] = rgba[i + 1]; rgb[j + 2] = rgba[i + 2];
    }
    png.data = rgb;

    const file = path.join(OUT, t.file);
    await new Promise((res, rej) =>
      png.pack().pipe(fs.createWriteStream(file)).on('finish', res).on('error', rej));

    const b = fs.readFileSync(file);
    const kinds = { 0: 'gri', 2: 'RGB (alfa yok)', 3: 'paletli', 4: 'gri+alfa', 6: 'RGBA' };
    console.log(`✓ ${t.file.padEnd(22)} ${b.readUInt32BE(16)}×${b.readUInt32BE(20)}  ${kinds[b[25]]}  dolgu ${fill}  ${(b.length / 1024).toFixed(0)} KB  — ${t.note}`);
  }

  await browser.close();
})();
