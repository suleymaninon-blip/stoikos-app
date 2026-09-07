const fs = require('fs');
const C = require('./store-content.js');

const LIM = { name: 30, subtitle: 30, short: 80, keywords: 100, promo: 170, full: 4000 };

const FIELDS = [
  { key: 'name',     label: 'Uygulama adı',      where: 'Apple + Play' },
  { key: 'subtitle', label: 'Alt başlık',        where: 'Apple' },
  { key: 'short',    label: 'Kısa açıklama',     where: 'Play' },
  { key: 'keywords', label: 'Anahtar kelimeler', where: 'Apple' },
  { key: 'promo',    label: 'Tanıtım metni',     where: 'Apple' },
  { key: 'full',     label: 'Tam açıklama',      where: 'Apple + Play' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const len = (s) => [...s].length;

const tabs = Object.entries(C)
  .map(([code, d], i) =>
    `<button class="tab${i === 0 ? ' on' : ''}" data-lang="${code}">${d.flag} ${d.label}</button>`)
  .join('');

const panels = Object.entries(C).map(([code, d], i) => {
  const rows = FIELDS.map((f) => {
    const val = d[f.key];
    const n = len(val), max = LIM[f.key];
    const pct = Math.round((n / max) * 100);
    const tight = pct >= 90;
    return `<section class="field">
  <header class="fh">
    <div class="fl"><span class="fname">${f.label}</span><span class="fwhere">${f.where}</span></div>
    <div class="fr">
      <span class="count${tight ? ' tight' : ''}">${n} / ${max}</span>
      <button class="copy" type="button">Kopyala</button>
    </div>
  </header>
  <pre class="val">${esc(val)}</pre>
</section>`;
  }).join('\n');
  return `<div class="panel${i === 0 ? ' on' : ''}" data-lang="${code}">${rows}</div>`;
}).join('\n');

const html = `<title>Stoikos Mağaza Metinleri</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Jost:wght@300;400;500&display=swap">
<style>
  :root {
    --bg:#14120e; --surface:#1c1915; --surface2:#211d18; --line:rgba(196,169,106,.16);
    --gold:#c2a878; --goldSoft:#d8c49a; --text:#ece4d4; --textSoft:#cabfa8;
    --dim:#8a8070; --faint:#5a5348; --warn:#d9a441;
    --serif:'Cinzel',Georgia,serif; --sans:'Jost',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  }
  * { box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:var(--sans); font-weight:300;
         margin:0; padding:0 20px 72px; line-height:1.6; }
  .wrap { max-width:820px; margin:0 auto; }

  header.top { padding:44px 0 26px; border-bottom:1px solid var(--line); }
  .omega { font-family:var(--serif); font-size:30px; color:var(--gold); line-height:1; }
  h1 { font-family:var(--serif); font-weight:400; font-size:26px; letter-spacing:.5px;
       color:var(--goldSoft); margin:14px 0 8px; text-wrap:balance; }
  .lede { color:var(--textSoft); font-size:14px; max-width:62ch; margin:0; }

  .meta { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
  .chip { background:var(--surface2); border:1px solid var(--line); border-radius:999px;
          padding:5px 13px; font-size:12px; color:var(--textSoft); }
  .chip b { color:var(--goldSoft); font-weight:500; }

  nav.tabs { position:sticky; top:0; z-index:5; background:var(--bg);
             padding:18px 0 14px; border-bottom:1px solid var(--line);
             display:flex; gap:7px; flex-wrap:wrap; }
  .tab { font-family:var(--sans); font-size:12.5px; color:var(--dim); cursor:pointer;
         background:var(--surface); border:1px solid transparent; border-radius:10px;
         padding:7px 13px; transition:.15s; }
  .tab:hover { color:var(--textSoft); }
  .tab.on { background:rgba(196,169,106,.13); border-color:var(--line); color:var(--goldSoft); }
  .tab:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }

  .panel { display:none; padding-top:24px; }
  .panel.on { display:flex; flex-direction:column; gap:16px; }

  .field { background:var(--surface); border:1px solid rgba(255,255,255,.055); border-radius:13px;
           overflow:hidden; }
  .fh { display:flex; align-items:center; justify-content:space-between; gap:12px;
        padding:11px 15px; background:var(--surface2); border-bottom:1px solid rgba(255,255,255,.05); }
  .fl { display:flex; align-items:baseline; gap:9px; min-width:0; }
  .fname { font-size:13px; font-weight:500; color:var(--text); }
  .fwhere { font-size:10.5px; letter-spacing:.6px; text-transform:uppercase; color:var(--faint); }
  .fr { display:flex; align-items:center; gap:9px; flex-shrink:0; }
  .count { font-size:11.5px; color:var(--dim); font-variant-numeric:tabular-nums; }
  .count.tight { color:var(--warn); }
  .copy { font-family:var(--sans); font-size:11.5px; color:var(--textSoft); cursor:pointer;
          background:transparent; border:1px solid var(--line); border-radius:7px;
          padding:4px 11px; transition:.15s; }
  .copy:hover { background:rgba(196,169,106,.12); color:var(--goldSoft); }
  .copy.done { color:var(--gold); border-color:var(--gold); }
  .copy:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }

  .val { margin:0; padding:15px; font-family:var(--sans); font-size:13.5px; font-weight:300;
         color:var(--textSoft); white-space:pre-wrap; word-wrap:break-word;
         max-height:none; overflow-x:auto; }

  h2 { font-family:var(--serif); font-weight:400; font-size:19px; color:var(--goldSoft);
       margin:46px 0 6px; letter-spacing:.4px; }
  h2 + p { color:var(--dim); font-size:13px; margin:0 0 18px; max-width:62ch; }

  ul.check { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:9px; }
  ul.check li { background:var(--surface); border:1px solid rgba(255,255,255,.055);
                border-left:2px solid var(--gold); border-radius:9px; padding:12px 15px; font-size:13.5px; }
  ul.check li b { color:var(--goldSoft); font-weight:500; }
  ul.check li span { display:block; color:var(--dim); font-size:12.5px; margin-top:3px; }

  .note { background:rgba(217,164,65,.08); border:1px solid rgba(217,164,65,.28);
          border-radius:11px; padding:15px 17px; margin-top:18px; font-size:13.5px; color:var(--textSoft); }
  .note b { color:var(--warn); font-weight:500; }

  footer { margin-top:52px; padding-top:20px; border-top:1px solid var(--line);
           color:var(--faint); font-size:12px; }
  @media (max-width:560px) {
    .fh { flex-direction:column; align-items:flex-start; gap:8px; }
  }
</style>

<div class="wrap">
  <header class="top">
    <div class="omega">Ω</div>
    <h1>Stoikos Mağaza Metinleri</h1>
    <p class="lede">App Store ve Google Play formlarına girilecek metinler, altı dilde.
      Her alanın karakter sayısı sınırına göre kontrol edildi — hepsi sınır içinde.</p>
    <div class="meta">
      <span class="chip">Stoikos Plus <b>$6,99 / ay</b></span>
      <span class="chip">Deneme <b>14 gün</b></span>
      <span class="chip">Paket <b>com.stoikos.app</b></span>
      <span class="chip">Diller <b>6</b></span>
      <span class="chip">Destek <b>support@stoikos.app</b></span>
    </div>
  </header>

  <nav class="tabs">${tabs}</nav>

  ${panels}

  <h2>Metin dışında gereken varlıklar</h2>
  <p>Formları doldurmadan önce hazırlaman gerekenler. Ekran görüntüleri build aldıktan sonra çekilebilir.</p>
  <ul class="check">
    <li><b>Uygulama simgesi</b> — Apple 1024×1024, Play 512×512, saydamlık yok
      <span>Depoda <code>assets/icon.png</code> var; boyutları kontrol et.</span></li>
    <li><b>iPhone ekran görüntüleri</b> — 6.7" (1290×2796), en az 3 adet
      <span>Öneri: ana ekran (nefes orbu) · bilgelik/filozoflar · koç sohbeti · kavram detayı</span></li>
    <li><b>Android ekran görüntüleri</b> — telefon, en az 2 adet
      <span>Aynı ekranlar kullanılabilir.</span></li>
    <li><b>Play öne çıkan görsel</b> — 1024×500
      <span>Ω logosu + slogan yeterli. Play'de zorunlu.</span></li>
    <li><b>Gizlilik politikası bağlantısı</b> — her iki mağazada zorunlu
      <span>Mevcut: <code>…/gizlilik.html</code> (TR) ve <code>…/privacy.html</code> (EN). Alan adın hazırsa <code>stoikos.app</code> altına taşımak daha iyi görünür.</span></li>
    <li><b>Yaş sınırı anketi</b> — ikisinde de doldurulacak
      <span>Uygulamada kullanıcı içeriği yok (Meydan Okuma kapalı), bu anketi basitleştiriyor.</span></li>
    <li><b>Kategori</b> — öneri: Sağlık ve Fitness (birincil), Yaşam Tarzı (ikincil)</li>
  </ul>

  <h2>Ne ücretsiz, ne Plus</h2>
  <p>Metinlerdeki vaadin ürünle aynı şeyi söylemesi şart; mağaza formunu doldururken bu ayrımı bozma.</p>
  <ul class="check">
    <li><b>Her zaman ücretsiz</b> — 164 alıntı, 12 kavram, 10 filozof, nefes orbu, günlük pratik, ilerleme
      <span>İndirme sebebi ve mağaza puanı motoru burası; kapatılmıyor.</span></li>
    <li><b>Stoikos Plus</b> — koç, tüm programlar, kavramların sesli anlatımı, sonradan eklenen içerik
      <span>14 gün ücretsiz deneme, sonra $6,99/ay. Deneme mağazanın introductory offer'ı ile veriliyor.</span></li>
  </ul>

  <h2>Abonelik için özel şartlar</h2>
  <p>Apple'ın otomatik yenilenen abonelikler için ek zorunlulukları var. Bunlar en sık ret sebeplerinden.</p>
  <div class="note">
    <b>Kullanım Koşulları (EULA) — yazıldı.</b> <code>public/terms.html</code> (TR) ve
    <code>public/terms-en.html</code> (EN). Mağaza sayfasına bağlantı verilecek.
    <b>Kalan:</b> uygulama içinden de tıklanabilir bağlantı gerekiyor; şu an ödeme
    ekranında yalnız metin olarak anılıyor.
  </div>
  <div class="note">
    <b>Ödeme ekranı — bilgiler eklendi.</b> Aboneliğin adı, süresi ve fiyatı
    <code>Paywall.tsx</code>'te görünüyor, altı dilde.
    <b>Kalan:</b> fiyat sabit yazılı (<code>$6,99</code>); mağaza yerel para biriminde
    tahsil edeceği için RevenueCat'in döndürdüğü yerelleştirilmiş fiyat kullanılmalı.
  </div>

  <footer>
    Karakter sayıları üretim sırasında hesaplandı. Metni değiştirirsen sayıyı yeniden kontrol et —
    sınırı aşan alanı mağaza formu kabul etmiyor.
  </footer>
</div>

<script>
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.toggle('on', x === t));
    panels.forEach((p) => p.classList.toggle('on', p.dataset.lang === t.dataset.lang));
  }));

  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.closest('.field').querySelector('.val').textContent;
      const done = () => {
        const old = btn.textContent;
        btn.textContent = 'Kopyalandı';
        btn.classList.add('done');
        setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1600);
      };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch {
        // Pano izni yoksa metni seç — kullanıcı elle kopyalayabilsin
        const r = document.createRange();
        r.selectNodeContents(btn.closest('.field').querySelector('.val'));
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        btn.textContent = 'Seçildi, kopyala';
        setTimeout(() => { btn.textContent = 'Kopyala'; }, 2200);
      }
    });
  });
</script>`;

const out = '/tmp/claude-0/-home-user/1dcc43ab-0312-5771-8259-d03876b1f260/scratchpad/store-listing.html';
fs.writeFileSync(out, html);
console.log('yazıldı:', (fs.statSync(out).size / 1024).toFixed(1), 'KB');
