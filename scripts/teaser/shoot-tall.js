// Anlatım animasyonu için UZUN ekran görüntüleri (kaydırma efekti için): 430×1900 @2x, TR ve EN.
// Derlenmiş site gerekir: EXPO_OFFLINE=1 bash scripts/build-site.sh, sonra site/ bir statik sunucuda (8091).
// Kullanım: node scripts/teaser/shoot-tall.js <çıkış klasörü>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const BASE = process.env.STORE_BASE || 'http://localhost:8091/app/';
const OUT = process.argv[2];

const CHAT = {
  tr: [
    ['assistant', 'Buradayım. Bugün seni ne meşgul ediyor?'],
    ['user', 'Yarın sunum var ve gece boyunca uyuyamadım. Sürekli ters gidebilecek şeyleri düşünüyorum.'],
    ['assistant', 'Zihnin yarını bu gece yaşamaya çalışıyor — ve o savaşı hep kaybediyor, çünkü yarın henüz yok.\n\nSunumun nasıl geçeceği tümüyle senin elinde değil. Ama hazırlığın, sesinin tonu, bir soruya "bilmiyorum, bakıp döneyim" diyebilme dürüstlüğün — bunlar senin.\n\n> "İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir." — Epiktetos, Encheiridion · serbest uyarlama\n\nBu gece için tek bir iş kaldı: uyumak.'],
  ],
  en: [
    ['assistant', 'I am here. What is on your mind today?'],
    ['user', 'I have a presentation tomorrow and I could not sleep. I keep thinking about everything that could go wrong.'],
    ['assistant', 'Your mind is trying to live tomorrow tonight — and it always loses that fight, because tomorrow is not here yet.\n\nHow the presentation goes is not fully in your hands. But your preparation, your tone, the honesty to say "I don\'t know, let me get back to you" — those are yours.\n\n> "It is not things that disturb us, but our judgements about things." — Epictetus, Enchiridion · freely adapted\n\nThere is only one task left for tonight: to sleep.'],
  ],
};
const YESTERDAY = { tr: 'Toplantıda sesimi yükselttim. Haklıydım belki ama öfkem kimseye bir şey kazandırmadı. Yarın önce dinleyeceğim.',
  en: 'I raised my voice in the meeting. Maybe I was right, but my anger won nothing for anyone. Tomorrow I will listen first.' };

function seed(lang) {
  const out = { stoikos_onboarded: '1', stoikos_lang: lang, stoikos_user_id: 'anim-shot', stoikos_breath_duration: '60',
    stoikos_program_control: JSON.stringify([0,1,2,3,4,5,6]), stoikos_program_anger: JSON.stringify([0,1,2]), stoikos_program_reflected_control: '1',
    stoikos_chat_history: JSON.stringify(CHAT[lang].map((m, i) => ({ id: String(i), role: m[0], content: m[1], timestamp: '2026-10-27T09:1' + i + ':00.000Z' }))) };
  const per = [3,2,3,1,2,3,2,1,2,0,2,1]; const ex = ['breath','neg_vis','intention','memento','review','gratitude'];
  const today = new Date();
  per.forEach((n, i) => { if (!n) return; const d = new Date(today); d.setDate(d.getDate() - i);
    out[`stoikos_completed_${d.toDateString()}`] = JSON.stringify(Array.from({ length: n }, (_, j) => ex[(i*2+j) % ex.length])); });
  const y = new Date(today); y.setDate(y.getDate() - 1); out[`stoikos_journal_${y.toDateString()}`] = YESTERDAY[lang];
  return out;
}
const TAB = { tr: { practice: 'PRATİK', coach: 'KOÇ', progress: 'İLERLEME', home: 'ANA' }, en: { practice: 'PRACTICE', coach: 'COACH', progress: 'PROGRESS', home: 'HOME' } };
const MOOD = { tr: 'Öfke', en: 'Anger' };
const BREATH = { tr: 'Bir an dur', en: 'Pause for a moment' };
const RESUME = { tr: 'KALDIĞIN YER', en: 'PICK UP WHERE YOU LEFT OFF' };
const MOODLINK = { tr: /temasındaki/, en: /quotes on Anger/ };
const JOURNAL = { tr: 'GÜNLÜK YANSIMA', en: 'DAILY REFLECTION' };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const lang of ['tr', 'en']) {
    const ctx = await b.newContext({ viewport: { width: 430, height: 1900 }, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce' });
    await ctx.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); sessionStorage.setItem('seeded', '1'); } }, seed(lang));
    await ctx.route('**/coach/quota**', (r) => r.fulfill({ json: { subscribed: false, used: 2, limit: 50, remaining: 48 } }));
    const p = await ctx.newPage();
    // Sabah sahnesi için selamlama "Günaydın" olsun: saat 09:05'e sabit
    const now = new Date(); now.setHours(9, 5, 0, 0);
    await p.clock.setSystemTime(now);
    const boxes = {};
    const box = async (key, text, opts = {}) => { const l = p.getByText(text, opts).first(); const b = await l.boundingBox(); if (b) boxes[key] = b; };
    const shot = async (n) => { await p.waitForTimeout(1800); await p.screenshot({ path: `${OUT}/${lang}-${n}.png` }); console.log(lang, n); };
    await p.goto(BASE); await p.waitForTimeout(6000); await shot('home');
    await box('breath', BREATH[lang]); await box('resume', RESUME[lang]); await box('mood', MOOD[lang], { exact: true });
    await box('coachTab', TAB[lang].coach, { exact: true });
    await p.getByText(MOOD[lang], { exact: true }).first().click(); await shot('home-mood');
    await box('moodQuote', MOODLINK[lang]);
    await p.getByText(TAB[lang].practice).last().click(); await shot('practice');
    await box('journal', JOURNAL[lang]);
    await p.getByText(TAB[lang].coach).last().click(); await shot('coach');
    await p.getByText(TAB[lang].progress).last().click(); await shot('progress');
    require('fs').writeFileSync(`${OUT}/${lang}-boxes.json`, JSON.stringify(boxes, null, 1));
    await ctx.close();
  }
  await b.close();
})();
