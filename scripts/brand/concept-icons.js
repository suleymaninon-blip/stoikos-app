// Kavram simgeleri — gravür üslubu. 64×64 tuval; her simge üç katman: kalın kontur (1.6),
// ince tarama/damar (0.7), dolu küçük öğeler. Tek renk (temanın vurgu rengi).
function circ(cx, cy, r) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
}
function line(x1, y1, x2, y2) { return `M${x1} ${y1}L${x2} ${y2}`; }
const f = (n) => Math.round(n * 100) / 100;
// Yaprak: (x,y) kök, açı (derece), boy, en → kontur + orta damar + yan damarlar
function leaf(x, y, ang, len, wid) {
  const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (t, s) => [f(x + ux * len * t + nx * wid * s), f(y + uy * len * t + ny * wid * s)];
  const tip = P(1, 0), c1 = P(0.35, 1), c2 = P(0.75, 0.75), c3 = P(0.75, -0.75), c4 = P(0.35, -1);
  const outline = `M${x} ${y}C${c1} ${c2} ${tip}C${c3} ${c4} ${x} ${y}Z`.replace(/,/g, ' ');
  let veins = `M${x} ${y}L${P(0.92, 0).join(' ')}`;
  for (const t of [0.3, 0.5, 0.7]) {
    const m = P(t, 0), s1 = P(t + 0.14, 0.62), s2 = P(t + 0.14, -0.62);
    veins += `M${m.join(' ')}L${s1.join(' ')}M${m.join(' ')}L${s2.join(' ')}`;
  }
  return { outline, veins };
}
// Kısa paralel tarama çizgileri: (x1,y1)-(x2,y2) arası, adım vektörü (dx,dy), n adet
function hatch(x1, y1, x2, y2, dx, dy, n) {
  let d = '';
  for (let i = 0; i < n; i++) d += line(f(x1 + dx * i), f(y1 + dy * i), f(x2 + dx * i), f(y2 + dy * i));
  return d;
}
// Daire içine yatay tarama
function hatchCircle(cx, cy, r, step) {
  let d = '';
  for (let y = -r + step; y < r; y += step) {
    const hw = Math.sqrt(r * r - y * y);
    d += line(f(cx - hw), f(cy + y), f(cx + hw), f(cy + y));
  }
  return d;
}
function star(cx, cy, r) {
  const k = r * 0.28;
  return `M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z`;
}

function ICONS() {
  const I = {};

  // Amor Fati — harlı ateş: her şeyi alevine katıp ışığa çevirir (kavram metnindeki imge)
  I.amor = {
    thick: 'M32 7C37 16 45 22 45 35C45 46 39 53 32 53C25 53 19 46 19 35C19 27 24 22 26 15C28 21 30 23 32 25C33 19 33 13 32 7Z'
      + 'M32 30C36 36 38 40 38 44C38 49 35 52 32 52C29 52 26 49 26 44C26 40 29 37 32 30Z'
      + line(20, 57, 44, 57),
    thin: 'M22 36C22 43 25 48 29 51M24 30C24 38 26 44 29 48M41 34C42 41 40 47 36 51M39 28C40 35 39 41 36 46'
      + line(25, 60, 39, 60) + 'M32 40C33 43 33 46 32 48',
    fill: '',
  };

  // Memento Mori — kum saati
  I.memento = {
    thick: line(17, 8, 47, 8) + line(17, 56, 47, 56)
      + 'M23 10C23 22 30 27 31 32C30 37 23 42 23 54M41 10C41 22 34 27 33 32C34 37 41 42 41 54',
    thin: line(19, 10, 19, 54) + line(45, 10, 45, 54)
      + 'M25.5 16H38.5C37 22 34 26 32 29C30 26 27 22 25.5 16Z'
      + hatch(27, 18.5, 37, 18.5, 0.4, 2.4, 3)
      + 'M25 54C27 47 29.5 44 32 44C34.5 44 37 47 39 54'
      + hatch(28, 51, 36, 51, 0.6, -2.2, 2)
      + 'M32 32V43',
    fill: circ(17, 8, 1.6) + circ(47, 8, 1.6) + circ(17, 56, 1.6) + circ(47, 56, 1.6),
  };

  // Premeditatio Malorum — çapa: fırtına gelmeden hazırlık
  I.premed = {
    thick: circ(32, 11, 4) + line(32, 15, 32, 54) + line(23, 21, 41, 21)
      + 'M13 39C15 49 23 54 32 54C41 54 49 49 51 39'
      + 'M13 39L10 44M13 39L18 42M51 39L54 44M51 39L46 42',
    thin: 'M32 25C41 27 41 33 32 35C23 37 23 43 32 45'
      + hatch(30.5, 27, 33.5, 29, 0, 6, 4)
      + 'M16 43C19 49 25 52 32 52.5M48 43C45 49 39 52 32 52.5',
    fill: circ(23, 21, 1.4) + circ(41, 21, 1.4),
  };

  // Kontrol Dairesi — içte elindeki (taralı), dışta elinde olmayan
  I.control = {
    thick: circ(32, 32, 12),
    thin: hatchCircle(32, 32, 12, 2.6) + circ(32, 32, 23),
    fill: circ(32, 32, 1.8)
      + [0, 40, 80, 130, 175, 220, 265, 310].map((g) => {
        const a = (g * Math.PI) / 180; return circ(f(32 + Math.cos(a) * 23), f(32 + Math.sin(a) * 23), 1.3);
      }).join(''),
  };

  // Eudaimonia — zeytin dalı (gelişen, serpilen hayat)
  {
    let ol = '', vn = '';
    // dal (16,56) → (46,10); yapraklar dalın iki yanında, dala ~40° açıyla, sırayla
    const sx = 16, sy = 56, ex = 46, ey = 10, ang = (Math.atan2(ey - sy, ex - sx) * 180) / Math.PI;
    const pts = [0.16, 0.3, 0.44, 0.58, 0.72, 0.86];
    pts.forEach((t, i) => {
      const x = f(sx + (ex - sx) * t), y = f(sy + (ey - sy) * t), side = i % 2 === 0 ? -1 : 1;
      const g = leaf(x, y, ang + side * 42, 14 - i * 0.6, 4.4); ol += g.outline; vn += g.veins;
    });
    const tip = leaf(ex, ey, ang, 10, 3.4); ol += tip.outline; vn += tip.veins;
    I.eudai = {
      thick: `M${sx} ${sy}C24 44 32 30 ${ex} ${ey}` + ol + circ(27.5, 46, 2.8) + circ(37, 34.5, 2.6),
      thin: vn + hatchCircle(27.5, 46, 2.8, 1.4) + hatchCircle(37, 34.5, 2.6, 1.3) + line(25.5, 42, 27.5, 43.2) + line(34.6, 31, 36.4, 32),
      fill: '',
    };
  }

  // Sympatheia — takımyıldız: her şey birbirine bağlı
  {
    const S = [[14, 22], [26, 12], [38, 20], [50, 13], [46, 34], [30, 38], [18, 48], [40, 52]];
    const E = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [5, 6], [5, 7], [4, 7], [0, 5]];
    I.sympa = {
      thick: S.map(([x, y], i) => star(x, y, i % 3 === 0 ? 3.6 : 2.6)).join(''),
      thin: E.map(([a, b]) => line(S[a][0], S[a][1], S[b][0], S[b][1])).join('') + circ(32, 32, 27),
      fill: S.map(([x, y]) => circ(x, y, 0.9)).join(''),
    };
  }

  // Logos — güneş: kozmosu düzenleyen akıl
  {
    let rays = '', fine = '';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, long = i % 2 === 0;
      const r1 = 14, r2 = long ? 27 : 21;
      rays += line(f(32 + Math.cos(a) * r1), f(32 + Math.sin(a) * r1), f(32 + Math.cos(a) * r2), f(32 + Math.sin(a) * r2));
      const b = a + Math.PI / 16;
      fine += line(f(32 + Math.cos(b) * 15), f(32 + Math.sin(b) * 15), f(32 + Math.cos(b) * 18), f(32 + Math.sin(b) * 18));
    }
    I.logos = { thick: circ(32, 32, 10) + rays, thin: fine + circ(32, 32, 6.5) + hatchCircle(32, 32, 10, 2.5), fill: circ(32, 32, 1.5) };
  }

  // Aretē — terazi (dört erdemin dengesi)
  I.arete = {
    thick: line(32, 11, 32, 52) + line(13, 18, 51, 18) + line(22, 55, 42, 55)
      + 'M7 36C9 42 19 42 21 36ZM43 36C45 42 55 42 57 36Z',
    thin: line(13, 18, 8, 36) + line(13, 18, 20, 36) + line(51, 18, 44, 36) + line(51, 18, 56, 36)
      + line(26, 52, 38, 52) + hatch(10, 38, 18, 38, 0.6, 1.5, 2) + hatch(46, 38, 54, 38, 0.6, 1.5, 2)
      + 'M29 52C29 48 31 47 32 47C33 47 35 48 35 52',
    fill: circ(32, 9, 2.2),
  };

  // Prosochē — açık göz (dikkat)
  {
    let iris = '';
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; iris += line(f(32 + Math.cos(a) * 4.5), f(32 + Math.sin(a) * 4.5), f(32 + Math.cos(a) * 8.5), f(32 + Math.sin(a) * 8.5)); }
    I.prosoche = {
      thick: 'M6 32C14 19 50 19 58 32C50 45 14 45 6 32Z' + circ(32, 32, 9),
      thin: iris + 'M12 27L9 23M18 23L16 18M25 21L24 16M32 20.5V15.5M39 21L40 16M46 23L48 18M52 27L55 23'
        + 'M10 36C17 43 47 43 54 36',
      fill: circ(32, 32, 3.6),
    };
  }

  // Apatheia — durgun su, hilal ay ve yansıması
  I.apatheia = {
    thick: circ(32, 19, 8) + line(7, 34, 57, 34),
    thin: 'M29 11.6C26.5 15 26.5 23 29 26.4' + line(27.71, 13, 29.11, 13) + line(26.07, 15, 28.07, 15) + line(25.25, 17, 27.85, 17) + line(25.00, 19, 28.20, 19) + line(25.25, 21, 27.85, 21) + line(26.07, 23, 28.07, 23) + line(27.71, 25, 29.11, 25)
      + line(27, 38, 37, 38) + line(28.5, 42, 35.5, 42) + line(30, 46, 34, 46) + line(31, 50, 33, 50)
      + 'M9 52C14 50 18 54 23 52M41 52C46 50 50 54 55 52M14 44C17 43 19 45 22 44M42 44C45 43 47 45 50 44',
    fill: '',
  };

  // Oikeiōsis — şefkat halkaları (Hierokles): merkezde kişi, dışa doğru halkalar
  I.oikeiosis = {
    thick: circ(32, 32, 9) + circ(32, 32, 26),
    thin: circ(32, 32, 17.5)
      + [[32, 6], [50.4, 13.6], [58, 32], [50.4, 50.4], [32, 58], [13.6, 50.4], [6, 32], [13.6, 13.6]].map(([x, y]) => circ(x, y, 1.6)).join('')
      + [[32, 14.5], [49.5, 32], [32, 49.5], [14.5, 32]].map(([x, y]) => circ(x, y, 1.5)).join(''),
    fill: circ(32, 29.5, 2.4) + 'M27.5 37C27.5 33 29.5 32 32 32C34.5 32 36.5 33 36.5 37Z',
  };

  // Ataraxia — sarsılmaz dağ, eteğinde geçen bulutlar
  {
    let sh = '';
    for (const t of [0.22, 0.36, 0.5, 0.64, 0.78]) { const x = 38 + 21 * t, y = 13 + 34 * t; sh += line(f(x - 1.2), f(y + 1.6), f(x - 5.5), f(y + 8)); }
    for (const t of [0.35, 0.6]) { const x = 22 + 7 * t, y = 20 + 10 * t; sh += line(f(x - 0.8), f(y + 1.6), f(x - 3.2), f(y + 6)); }
    I.ataraxia = {
      thick: 'M5 47L22 20L29 30L38 13L59 47Z',
      thin: 'M34.3 20L36.4 22.3L38.4 19.6L40.4 22.6L42.3 20' + 'M19.5 24L21.4 25.6L23.4 23.6' + sh
        + 'M8 53C11 50 15 50 17 53C19 51 23 51 24 54M38 54C40 51 44 51 46 53C48 50 53 50 56 53',
      fill: '',
    };
  }
  return I;
}
if (typeof module !== 'undefined') module.exports = { ICONS, circ, line, leaf, hatch, hatchCircle, star, f };

// Çalıştır: node scripts/brand/concept-icons.js → constants/conceptIcons.ts yeniden üretilir.
if (require.main === module) {
  const KEYS = {
    'Amor Fati': 'amor', 'Memento Mori': 'memento', 'Premeditatio Malorum': 'premed', 'Dichotomy of Control': 'control',
    'Eudaimonia': 'eudai', 'Sympatheia': 'sympa', 'Logos': 'logos', 'Aretē': 'arete', 'Prosochē': 'prosoche',
    'Apatheia': 'apatheia', 'Oikeiōsis': 'oikeiosis', 'Ataraxia': 'ataraxia',
  };
  const I = ICONS();
  const out = {};
  for (const [latin, k] of Object.entries(KEYS)) out[latin] = I[k];
  const fs = require('fs'), path = require('path');
  const body = `// OTOMATİK üretilir: node scripts/brand/concept-icons.js — elle düzenleme.\n`
    + `// Kavram simgeleri, gravür üslubu (21 Kasım 2026; tasarım https://claude.ai/artifact/C5zAkxaAvC9ZPMVFk4C8Zt).\n`
    + `// 64×64 tuval: thick = kontur (1.6), thin = tarama/damar (0.7), fill = dolu küçük öğeler. Anahtar: kavramın latin adı.\n`
    + `export type ConceptIconPaths = { thick: string; thin: string; fill: string };\n`
    + `export const CONCEPT_ICONS: Record<string, ConceptIconPaths> = ${JSON.stringify(out, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../../constants/conceptIcons.ts'), body);
  console.log('constants/conceptIcons.ts yazıldı:', Object.keys(out).length, 'simge');
}
