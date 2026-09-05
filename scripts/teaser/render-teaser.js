// Stoikos teaser videosu — 20 sn, 1080×1920, 30 fps, H.264/MP4.
//
// Kareler teaser.html'den TEK TEK ve deterministik alınıyor: her karede
// renderFrame(t) çağrılıp o anın durumu kuruluyor. CSS animasyonuna
// bırakılsaydı headless zamanlaması kareler arası kayardı.
//
// Kareler diske yazılmıyor, doğrudan ffmpeg'e boru ile veriliyor
// (600 kare × 1080×1920 PNG diskte birkaç yüz MB tutardı).
//
// ffmpeg: H.264 gerekiyor. Playwright'ın gömülü ffmpeg'inde yalnız VP8 var,
// bu yüzden ffmpeg-static kullanılıyor (npm i ffmpeg-static).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = process.env.FFMPEG_PATH
  || '/tmp/claude-0/-home-user/1dcc43ab-0312-5771-8259-d03876b1f260/scratchpad/node_modules/ffmpeg-static/ffmpeg';

const W = 1080, H = 1920, FPS = 30, DURATION_MS = 20000;
const FRAMES = Math.round((DURATION_MS / 1000) * FPS);
const TPL = 'file://' + path.resolve(__dirname, 'teaser.html');
const OUT_DIR = process.argv[3] || path.resolve(__dirname, '..', '..', 'store-assets');
const LANGS = (process.argv[2] || 'tr,en').split(',');

function encoder(outFile) {
  // Sessiz ses kanalı bilerek ekleniyor: bazı yükleyiciler (Instagram dahil)
  // ses kanalı olmayan dosyada tuhaf davranıyor.
  const ff = spawn(FFMPEG, [
    '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-shortest',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
    '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    outFile,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  ff.stderr.on('data', (d) => { err += d.toString(); });
  ff.on('close', (code) => { if (code !== 0) console.error(err.slice(-1500)); });
  return ff;
}

// Boru dolduğunda beklemek şart, yoksa bellek şişer.
const write = (stream, buf) =>
  new Promise((res) => { stream.write(buf) ? res() : stream.once('drain', res); });

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files',
           '--force-color-profile=srgb', '--disable-lcd-text'],
  });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const lang of LANGS) {
    const outFile = path.join(OUT_DIR, `teaser-${lang}-1080x1920.mp4`);
    process.stdout.write(`\n${lang}: `);

    await page.goto(TPL, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((l) => window.init(l), lang);
    // Ekran görüntüsü PNG'leri de yüklensin
    await page.waitForFunction(() =>
      [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    await page.waitForTimeout(300);

    const ff = encoder(outFile);
    const done = new Promise((res) => ff.on('close', res));

    for (let f = 0; f < FRAMES; f++) {
      await page.evaluate((t) => window.renderFrame(t), (f / FPS) * 1000);
      await write(ff.stdin, await page.screenshot({ type: 'png' }));
      if (f % 60 === 0) process.stdout.write('.');
    }
    ff.stdin.end();
    await done;

    const kb = fs.existsSync(outFile) ? (fs.statSync(outFile).size / 1024 / 1024).toFixed(1) : '?';
    console.log(` ✓ ${path.basename(outFile)}  ${kb} MB`);
  }

  await browser.close();
})();
