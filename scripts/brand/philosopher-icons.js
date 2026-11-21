// Filozof simgeleri — kavram simgeleriyle aynı gravür üslubu (21 Kasım 2026, kullanıcı: "aynı stili bu menüde de").
// 64×64 tuval; thick = kontur (1.6), thin = tarama (0.7), fill = dolu küçük öğeler.
// Motifler eski PhilosopherSymbol'dan korundu; Posidonius'ta takımyıldız (Sympatheia'yla çakışıyordu) yerine gök küresi.
// Çalıştır: node scripts/brand/philosopher-icons.js → constants/philosopherIcons.ts
const { circ, line, leaf, hatch, hatchCircle, f } = require('./concept-icons.js');

function PHILO() {
  const P = {};

  // Marcus Aurelius — defne tacı (üstte açık çelenk) + alttaki kurdele
  {
    let ol = '', vn = '';
    const cx = 32, cy = 33, R = 20;
    const branch = (sgn) => {
      // sol dal açısı 112°→238°, sağ dal 68°→-58° (ekran koordinatı, y aşağı)
      for (let i = 0; i < 6; i++) {
        const t = i / 5, deg = sgn < 0 ? 112 + t * 126 : 68 - t * 126, a = (deg * Math.PI) / 180;
        const x = f(cx + Math.cos(a) * R), y = f(cy + Math.sin(a) * R);
        // dalın yukarı doğru teğeti
        const tan = (Math.atan2(Math.cos(a), -Math.sin(a)) * 180) / Math.PI + (sgn < 0 ? 0 : 180);
        const g1 = leaf(x, y, tan - 28 * sgn, 9.5 - t * 1.5, 3.3); ol += g1.outline; vn += g1.veins;
        const g2 = leaf(x, y, tan + 30 * sgn, 8.5 - t * 1.5, 3); ol += g2.outline; vn += g2.veins;
      }
    };
    branch(-1); branch(1);
    const arc = (d1, d2, sweep) => { const a1 = (d1 * Math.PI) / 180, a2 = (d2 * Math.PI) / 180; return `M${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)}A${R} ${R} 0 0 ${sweep} ${f(cx + Math.cos(a2) * R)} ${f(cy + Math.sin(a2) * R)}`; };
    P.marcus = {
      thick: arc(108, 242, 1) + arc(72, -62, 0) + ol,
      thin: vn + 'M26 52C29 56 35 56 38 52M28 54L24 60M36 54L40 60',
      fill: circ(32, 53.5, 1.8),
    };
  }

  // Epiktetos — kopmuş zincir: iki parça, aradaki kırılma kıvılcımlarla
  {
    const oval = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
    const side = (x1, x2) => `M${x1 + 5} 27H${x2 - 5}A5 5 0 0 1 ${x2 - 5} 37H${x1 + 5}A5 5 0 0 1 ${x1 + 5} 27Z`;
    P.epictetus = {
      thick: oval(14, 32, 9, 9) + side(19, 31) + oval(50, 32, 9, 9) + side(33, 45),
      thin: oval(14, 32, 4.5, 4.5) + oval(50, 32, 4.5, 4.5) + 'M31.6 22L30 16M32.8 21.5L34.6 15.5M31.8 42L30.2 48M32.8 42.5L34.8 48.5'
        + 'M7 36C9 39 11 40.5 14 41M57 36C55 39 53 40.5 50 41' + line(23, 30, 27, 30) + line(37, 34, 41, 34),
      fill: circ(32, 13.5, 0.9) + circ(32, 51, 0.9),
    };
  }

  // Seneca — yazı tüyü ve hokka
  {
    let barbs = '';
    for (let i = 0; i < 9; i++) {
      const t = 0.12 + i * 0.09, x = 18 + (46 - 18) * t, y = 52 - (52 - 8) * t;
      barbs += line(f(x), f(y), f(x - 7 + t * 3), f(y - 3 + t * 2)) + line(f(x), f(y), f(x + 3 - t), f(y + 6 - t * 3));
    }
    P.seneca = {
      thick: 'M18 52C26 38 34 22 46 8C44 18 38 28 30 36C26 40 22 44 18 52Z' + 'M12 56H30M14 56V50H28V56',
      thin: barbs + 'M18 52L46 8' + hatch(15.5, 52, 15.5, 55, 2.4, 0, 6),
      fill: '',
    };
  }

  // Musonius Rufus — uzaklaşan patika ve ufukta güneş
  P.musonius = {
    thick: 'M14 58C22 50 30 46 30 38C30 32 34 28 32 22M50 58C42 50 36 46 36 38C36 32 38 28 34 22' + line(6, 22, 58, 22),
    thin: circ(32, 13, 5) + line(32, 4, 32, 6) + line(24, 8, 25.5, 9.5) + line(40, 8, 38.5, 9.5) + line(21, 14, 23.5, 14) + line(43, 14, 40.5, 14)
      + line(22, 54, 42, 54) + line(26, 48, 39, 48) + line(29, 42, 36, 42) + line(30, 36, 35.5, 36) + line(31, 30, 35, 30)
      + 'M6 30C12 28 16 29 20 32M58 30C52 28 48 29 44 32',
    fill: '',
  };

  // Zenon — kıvrılan dalga
  P.zeno = {
    thick: 'M6 46C14 46 18 40 20 32C22 22 32 14 42 16C50 18 54 26 48 32C44 36 38 34 38 30C38 26 42 26 44 28'
      + 'M6 52C14 50 20 52 26 50C32 48 36 50 42 48C48 46 52 48 58 46',
    thin: 'M12 46C18 44 22 38 24 31M18 47C23 44 26 38 27 32M24 47C28 43 30 38 31 33' + 'M24 24C28 20 34 18 38 19M27 27C30 24 34 22 38 23'
      + 'M6 58C14 56 20 58 26 56C32 54 36 56 42 54C48 52 52 54 58 52',
    fill: circ(50, 22, 0.9) + circ(53, 27, 0.8) + circ(46, 14, 0.8),
  };

  // Kleanthes — amfora (gençliğinde su taşıyıcı)
  P.cleanthes = {
    thick: 'M27 8H37M28 8C28 14 26 16 22 20C16 26 16 40 22 48C25 52 28 56 32 58C36 56 39 52 42 48C48 40 48 26 42 20C38 16 36 14 36 8'
      + 'M27 14C21 14 18 18 19 24M37 14C43 14 46 18 45 24',
    thin: 'M19 28H45M18.5 34H45.5M20 40H44' + hatch(23, 29, 25, 33, 4, 0, 6) + hatch(24, 42, 26, 47, 3.2, 0, 6) + line(29, 10, 35, 10),
    fill: '',
  };

  // Khrysippos — açık papirüs tomarı
  P.chrysippus = {
    thick: 'M14 16H50M14 48H50' + 'M14 16C10 16 8 18 8 20V44C8 46 10 48 14 48C16 48 18 46 18 44V20C18 18 16 16 14 16Z'
      + 'M50 16C54 16 56 18 56 20V44C56 46 54 48 50 48C48 48 46 46 46 44V20C46 18 48 16 50 16Z',
    thin: [22, 26, 30, 34, 38, 42].map((y, i) => line(22, y, i % 2 ? 40 : 42, y)).join('') + 'M11 22V42M53 22V42',
    fill: '',
  };

  // Hierokles — merkeze doğru çekilen halkalar
  {
    let arrows = '';
    for (const a of [45, 135, 225, 315]) {
      const r = (a * Math.PI) / 180, x1 = 32 + Math.cos(r) * 27, y1 = 32 + Math.sin(r) * 27, x2 = 32 + Math.cos(r) * 21, y2 = 32 + Math.sin(r) * 21;
      arrows += line(f(x1), f(y1), f(x2), f(y2));
      const l = r + Math.PI - 0.5, rr = r + Math.PI + 0.5;
      arrows += line(f(x2), f(y2), f(x2 + Math.cos(l) * -3), f(y2 + Math.sin(l) * -3)) + line(f(x2), f(y2), f(x2 + Math.cos(rr) * -3), f(y2 + Math.sin(rr) * -3));
    }
    P.hierocles = {
      thick: circ(32, 32, 6) + circ(32, 32, 18),
      thin: circ(32, 32, 12) + circ(32, 32, 24) + arrows,
      fill: circ(32, 32, 2.2),
    };
  }

  // Genç Cato — sütun
  P.cato = {
    thick: 'M16 10H48M18 14H46M20 14C20 17 22 18 24 18H40C42 18 44 17 44 14' + 'M22 18V48M42 18V48' + 'M18 52H46M15 56H49M20 48H44',
    thin: line(27, 20, 27, 46) + line(32, 20, 32, 46) + line(37, 20, 37, 46) + 'M16 10C14 10 13 12 14 13M48 10C50 10 51 12 50 13',
    fill: circ(17, 12.5, 1.3) + circ(47, 12.5, 1.3),
  };

  // Posidonius — gök küresi (astronom, gelgitler)
  P.posidonius = {
    thick: circ(32, 28, 18) + 'M24 52H40M32 46V52M28 56H36',
    thin: 'M14 28C14 33 22 37 32 37C42 37 50 33 50 28C50 23 42 19 32 19C22 19 14 23 14 28'
      + 'M32 10C27 10 23 18 23 28C23 38 27 46 32 46' + 'M20 15L44 41' + 'M16 22C24 26 40 26 48 22',
    fill: circ(32, 28, 2.4) + circ(20, 15, 1) + circ(44, 41, 1),
  };
  return P;
}

if (require.main === module) {
  const P = PHILO();
  const fs = require('fs'), path = require('path');
  const body = `// OTOMATİK üretilir: node scripts/brand/philosopher-icons.js — elle düzenleme.\n`
    + `// Filozof simgeleri, gravür üslubu (21 Kasım 2026). 64×64 tuval; anahtar filozof id'si.\n`
    + `import type { ConceptIconPaths } from './conceptIcons';\n`
    + `export const PHILOSOPHER_ICONS: Record<string, ConceptIconPaths> = ${JSON.stringify(P, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, '../../constants/philosopherIcons.ts'), body);
  console.log('constants/philosopherIcons.ts yazıldı:', Object.keys(P).length, 'simge');
}
module.exports = { PHILO };
