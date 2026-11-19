// "Yukarıdan Bakış" yazı katmanları: her yazı için saydam 1080×1920 PNG.
// Kullanım: node scripts/social/yukaridan-layers.js <tr|en> <çıkış klasörü>
// Çıktı: c1.png … c6.png (üstte tek/iki satırlık yazılar) ve quote.png (alıntı + künye, üst yarıda).
// Yazılar ekranın üst kısmında: alttaki görüntüde kadın, köprü ya da Dünya var; üstte gökyüzü/uzay boş.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const [, , LANG = 'tr', OUT = '.'] = process.argv;
const NM = path.resolve(__dirname, '../../node_modules/@expo-google-fonts');

const T = {
  tr: {
    c1: 'Her şey aynı anda.', c2: 'Bir an dur.', c3: 'Yukarı çık.', c4: 'Biraz daha.',
    c5: 'Sonra hayatına dön.', c6: 'Yukarıdan bakış:\n2.000 yıllık bir Stoacı egzersizi.',
    q: 'Bütün evreni düşüncene sığdır;\nkendine geniş bir yer açarsın.',
    by: 'MARCUS AURELIUS · DÜŞÜNCELER 9.32 · SERBEST UYARLAMA',
  },
  en: {
    c1: 'Everything, all at once.', c2: 'Stop for a moment.', c3: 'Rise above it.', c4: 'A little higher.',
    c5: 'Then go back to your life.', c6: 'The view from above:\na 2,000-year-old Stoic exercise.',
    q: 'Take the whole universe\ninto your mind, and you make\nample room for yourself.',
    by: 'MARCUS AURELIUS · MEDITATIONS 9.32 · FREELY ADAPTED',
  },
}[LANG];

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Cormorant'; font-style:italic; font-weight:400; src:url('file://${NM}/cormorant-garamond/CormorantGaramond_400Regular_Italic.ttf'); }
@font-face { font-family:'Jost'; font-weight:400; src:url('file://${NM}/jost/Jost_400Regular.ttf'); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; background:transparent; overflow:hidden; }
#shade { position:absolute; left:0; right:0; height:760px; top:var(--sy);
  background:radial-gradient(ellipse 72% 46% at 50% 50%, rgba(6,8,12,.50) 0%, rgba(6,8,12,.26) 45%, rgba(6,8,12,0) 75%); }
#box { position:absolute; left:70px; right:70px; top:var(--ty); text-align:center; }
#t { font-family:'Cormorant'; font-style:italic; font-size:var(--fs); line-height:1.22; color:#f6eedd; white-space:pre-line;
  text-shadow:0 2px 8px rgba(0,0,0,.6), 0 0 42px rgba(0,0,0,.45); }
#by { font-family:'Jost'; font-weight:400; font-size:26px; letter-spacing:4px; color:#d8c49a; margin-top:34px;
  text-shadow:0 1px 6px rgba(0,0,0,.7); }
</style></head><body><div id="shade"></div><div id="box"><div id="t"></div><div id="by"></div></div></body></html>`;

(async () => {
  const tmp = path.join(OUT, 'yukaridan-layers.html');
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(tmp));
  const shot = async (name, text, by, ty, fs_) => {
    await p.evaluate(([text, by, ty, fs_]) => {
      document.documentElement.style.setProperty('--ty', ty + 'px');
      document.documentElement.style.setProperty('--sy', (ty - 300) + 'px');
      document.documentElement.style.setProperty('--fs', fs_ + 'px');
      document.getElementById('t').textContent = text;
      document.getElementById('by').textContent = by;
      document.getElementById('by').style.display = by ? 'block' : 'none';
    }, [text, by, ty, fs_]);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true });
  };
  for (const k of ['c1', 'c2', 'c3', 'c4', 'c5']) await shot(k, T[k], '', 250, 84);
  await shot('c6', T.c6, '', 250, 64);
  await shot('quote', T.q, T.by, 330, LANG === 'en' ? 66 : 74);
  await b.close();
  fs.unlinkSync(tmp);
})();
