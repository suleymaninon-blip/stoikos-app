// Stoikos mağaza ekran görüntüleri.
// Yerel Expo web sunucusundan (localhost:8081) çeker; App Store ve Play'in
// istediği piksel boyutlarına DPR ile ulaşır — 430×932@3 = 1290×2796.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8081';
const OUT = process.argv[2] || '/home/user/stoikos-app/store-assets';

// Mağaza vitrininde görünecek sohbet. Gerçek bir soru, alıntılı bir yanıt —
// koçun ne yaptığını tek bakışta anlatsın diye elle yazıldı.
const CHAT = [
  { id: '0', role: 'assistant', content: 'Buradayım. Bugün seni ne meşgul ediyor?', timestamp: '2026-09-05T09:12:00.000Z' },
  { id: '1', role: 'user', content: 'Yarın sunum var ve gece boyunca uyuyamadım. Sürekli ters gidebilecek şeyleri düşünüyorum.', timestamp: '2026-09-05T09:12:30.000Z' },
  { id: '2', role: 'assistant',
    content: 'Zihnin yarını bu gece yaşamaya çalışıyor — ve o savaşı hep kaybediyor, çünkü yarın henüz yok.\n\nSunumun nasıl geçeceği tümüyle senin elinde değil. Ama hazırlığın, sesinin tonu, bir soruya "bilmiyorum, bakıp döneyim" diyebilme dürüstlüğün — bunlar senin. Stoacılar buna kontrol ikilemi diyor: enerjiyi elinde olana ver, olmayanı bırak.\n\n> "İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir." — Epiktetos, Encheiridion\n\nBu gece için tek bir iş kaldı: uyumak. Sunum yarının işi.',
    timestamp: '2026-09-05T09:13:10.000Z' },
];

// Süreklilik ve tamamlanmış pratikler — boş bir İlerleme ekranı hiçbir şey anlatmaz.
// Anahtar biçimi uygulamanınkiyle aynı olmalı: Date.toDateString() ("Sat Sep 05 2026"),
// ISO değil — aksi halde 7 günlük grafik ve haftalık sayaç boş kalır.
const EXERCISES = ['neg_vis', 'intention', 'memento', 'review', 'gratitude'];

function seedProgress() {
  const out = {};
  const today = new Date();
  // Süreklilik 9 gün: son 9 gün kesintisiz dolu olmalı, öncesinde bir boşluk.
  const perDay = [3, 2, 3, 1, 2, 3, 2, 1, 2, 0, 2, 1];
  for (let i = 0; i < perDay.length; i++) {
    if (perDay[i] === 0) continue;
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out[`stoikos_completed_${d.toDateString()}`] =
      JSON.stringify(EXERCISES.slice(0, perDay[i]));
  }
  return out;
}

const SEED = {
  stoikos_onboarded: '1',
  stoikos_lang: 'tr',
  stoikos_user_id: 'store-shot',
  stoikos_chat_history: JSON.stringify(CHAT),
  stoikos_favorites: JSON.stringify(['1', '2', '5']),
  stoikos_streak: '9',
  stoikos_streak_last_date: new Date().toDateString(),
  stoikos_breath_sound: '1',
  ...seedProgress(),
};

const DEVICES = [
  { name: 'iphone', width: 430, height: 932, dpr: 3 },   // → 1290×2796
  { name: 'android', width: 360, height: 640, dpr: 3 },  // → 1080×1920
];

const SHOTS = [
  { slug: '1-home', route: '/', label: 'Ana ekran — nefes orbu ve günün alıntısı' },
  { slug: '2-wisdom', route: '/wisdom', label: 'Bilgelik — alıntı tekerleği' },
  { slug: '3-coach', route: '/coach', label: 'Koç — sohbet' },
  { slug: '4-practice', route: '/practice', label: 'Pratik — günlük egzersizler' },
  { slug: '5-progress', route: '/progress', label: 'İlerleme — süreklilik' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const results = [];
  for (const dev of DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width, height: dev.height },
      deviceScaleFactor: dev.dpr,
      isMobile: true,
      hasTouch: true,
      locale: 'tr-TR',
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    await ctx.addInitScript((seed) => {
      for (const [k, v] of Object.entries(seed)) {
        try { localStorage.setItem(k, v); } catch {}
      }
    }, SEED);

    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') console.error('  [browser]', m.text().slice(0, 160)); });

    for (const shot of SHOTS) {
      const file = path.join(OUT, `${dev.name}-${shot.slug}.png`);
      try {
        await page.goto(BASE + shot.route, { waitUntil: 'networkidle', timeout: 180000 });
        // Fontlar ve ilk animasyon karesi otursun.
        await page.waitForTimeout(4000);
        await page.screenshot({ path: file });
        const kb = (fs.statSync(file).size / 1024).toFixed(0);
        results.push(`ok   ${dev.name}-${shot.slug}.png  ${kb} KB`);
        console.log(`✓ ${dev.name} ${shot.slug} (${kb} KB)`);
      } catch (e) {
        results.push(`FAIL ${dev.name}-${shot.slug}: ${String(e.message).slice(0, 120)}`);
        console.error(`✗ ${dev.name} ${shot.slug}: ${String(e.message).slice(0, 200)}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\n--- özet ---');
  results.forEach((r) => console.log(r));
})();
