import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * İzler — program sikkeleri (22 Kasım 2026, kullanıcı onayı; tasarım
 * https://claude.ai/artifact/BDgiRmFzWyeSVGoUKayzio).
 *
 * Bir programın yedinci günü tamamlanınca o programın sikkesi kazanılır,
 * İlerleme → İzler'de yerine oturur. Puan, seri, sıralama yok; bilerek.
 * Kayıt yalnız cihazda (`stoikos_traces`: { [programId]: ISO tarih | '' }).
 * '' = geriye dönük verilmiş (tarih bilinmiyor). "Tüm verilerimi sil"
 * `stoikos` önekli her anahtarı sildiği için bu da silinir.
 *
 * Yeni program eklerken: aşağıdaki MOTIFS'e bir çizim, i18n'e
 * `trace.<id>` (simge adı + söz) ekle. Çizimi olmayan programın yuvası
 * kendi glifiyle "yakında" gibi görünür.
 */

const KEY = 'stoikos_traces';

export type TraceMap = Record<string, string>;

export async function getTraces(): Promise<TraceMap> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

/** Sikkeyi kazandırır. Yeni kazanıldıysa true (mühür ekranı yalnız o zaman çıkar). */
export async function addTrace(programId: string, when: Date = new Date()): Promise<boolean> {
  const cur = await getTraces();
  if (programId in cur) return false;
  cur[programId] = when.toISOString();
  await AsyncStorage.setItem(KEY, JSON.stringify(cur));
  return true;
}

/**
 * Özellik gelmeden önce bitirilmiş programlar için sikkeyi sessizce verir
 * (tarih bilinmediği için ''). İlerleme ekranı açılırken çağrılır.
 */
export async function backfillTraces(completed: string[]): Promise<TraceMap> {
  const cur = await getTraces();
  let changed = false;
  for (const id of completed) if (!(id in cur)) { cur[id] = ''; changed = true; }
  if (changed) await AsyncStorage.setItem(KEY, JSON.stringify(cur));
  return cur;
}

// ─── Çizimler: 64×64 tuval, kavram simgeleriyle aynı gravür üslubu ───
// thick = ana kontur, thin = ince ayrıntı, fill = küçük dolu öğeler.
export interface TraceMotif { thick: string; thin: string; fill: string; }

const R2 = (n: number) => Math.round(n * 100) / 100;
const circ = (cx: number, cy: number, r: number) =>
  `M${R2(cx - r)} ${R2(cy)}a${r} ${r} 0 1 0 ${R2(2 * r)} 0a${r} ${r} 0 1 0 ${R2(-2 * r)} 0`;
const ln = (x1: number, y1: number, x2: number, y2: number) => `M${R2(x1)} ${R2(y1)}L${R2(x2)} ${R2(y2)}`;
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
};
function hex(cx: number, cy: number, r: number): string {
  let d = '';
  for (let i = 0; i < 6; i++) { const p = polar(cx, cy, r, i * 60); d += `${i ? 'L' : 'M'}${R2(p[0])} ${R2(p[1])}`; }
  return d + 'Z';
}
function leaf(x: number, y: number, ang: number, len: number, wid: number) {
  const a = (ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const P = (t: number, s: number) => `${R2(x + ux * len * t + nx * wid * s)} ${R2(y + uy * len * t + ny * wid * s)}`;
  return {
    o: `M${R2(x)} ${R2(y)}C${P(0.35, 1)} ${P(0.75, 0.75)} ${P(1, 0)}C${P(0.75, -0.75)} ${P(0.35, -1)} ${R2(x)} ${R2(y)}Z`,
    v: `M${R2(x)} ${R2(y)}L${P(0.9, 0)}`,
  };
}

function build(): Record<string, TraceMotif> {
  const M: Record<string, TraceMotif> = {};
  let t: string, h: string, f: string, L: { o: string; v: string }, p: [number, number], q: [number, number];

  // Kontrol Dairesi — dümen: denizi sen seçmezsin, dümeni sen tutarsın
  t = circ(32, 32, 13) + circ(32, 32, 4.5); f = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45 + 22.5;
    p = polar(32, 32, 4.5, a); q = polar(32, 32, 19, a); t += ln(p[0], p[1], q[0], q[1]);
    q = polar(32, 32, 21.5, a); f += circ(q[0], q[1], 2.4);
  }
  M.control = { thick: t, thin: circ(32, 32, 10), fill: f };

  // İç Sakinlik — kandil
  M.calm = {
    thick: 'M16 40C16 34 26 33 34 34L47 35C50.5 35.4 50.5 38.6 47 39L40 42C34 46 18 46 16 40Z'
      + 'M16.5 38.5C10 38 10 31 15 31C18 31 19.5 33 19.5 35' + 'M25 45.5L24 50L38 50L37 45'
      + 'M48 19C52.5 24.5 53 29 48.5 32.5C44 29 44 24.5 48 19Z',
    thin: 'M48.3 24.5C49.8 26.8 49.8 28.8 48.3 30.3' + ln(22, 39.5, 38, 39.5) + 'M39 15C44 12.5 52 12.5 57 15',
    fill: circ(30, 36.5, 1.6),
  };

  // Öfkeyle Çalışmak — gerili yay: ok yayda bekler
  M.anger = {
    thick: 'M26 8C44 16 44 48 26 56' + ln(12, 32, 52, 32) + 'M52 32L45.5 28.2M52 32L45.5 35.8',
    thin: ln(26, 8, 14, 32) + ln(14, 32, 26, 56) + 'M14 32L10.5 28.5M14 32L10.5 35.5M17.5 32L14 28.5M17.5 32L14 35.5',
    fill: circ(26, 8, 1.6) + circ(26, 56, 1.6),
  };

  // Başkalarının Gözü — maske: rolünü oyna
  M.regard = {
    thick: 'M19 13C27 9.5 37 9.5 45 13C46.5 29 42.5 44 32 51C21.5 44 17.5 29 19 13Z'
      + 'M23.5 27Q27 23.2 30.5 27Q27 29.6 23.5 27Z' + 'M33.5 27Q37 23.2 40.5 27Q37 29.6 33.5 27Z',
    thin: 'M23.5 21.5Q27 19.5 30.5 21.5M33.5 21.5Q37 19.5 40.5 21.5' + 'M27 40Q32 42 37 40' + ln(32, 29, 32, 35.5)
      + 'M19 15C12.5 17 11.5 24 13.5 29M45 15C51.5 17 52.5 24 50.5 29',
    fill: '',
  };

  // Zamanın Kısalığı — güneş saati
  h = '';
  for (let i = 0; i < 12; i++) { p = polar(32, 36, 14.5, i * 30); q = polar(32, 36, 17.5, i * 30); h += ln(p[0], p[1], q[0], q[1]); }
  h += ln(32, 36, 19.5, 44) + ln(32, 37.5, 21, 45) + ln(30.5, 36, 19.5, 42.5);
  M.time = { thick: circ(32, 36, 18) + 'M32 36L32 15L44 36', thin: h, fill: circ(32, 36, 1.8) };

  // Kayıpla Yaşamak — dal ve düşen yaprak
  t = 'M8 20C20 17 32 19 54 12'; h = '';
  for (const a of [[20, 18.5, 70, 14, 4.5], [33, 18.8, 105, 13, 4.2], [45, 15, 60, 12, 4], [36, 44, 25, 13, 4.4]] as const) {
    L = leaf(a[0], a[1], a[2], a[3], a[4]); t += L.o; h += L.v;
  }
  M.grief = { thick: t, thin: h + 'M27 33C29 37 29.5 40 33 42', fill: '' };

  // Az ile Yetinmek — buğday başağı
  t = 'M32 58C31.5 46 32 30 32 22'; h = '';
  for (const y of [40, 34, 28, 22]) {
    for (const a of [-128, -52]) {
      L = leaf(32, y, a, 9, 3); t += L.o;
      p = polar(32, y, 9, a); q = polar(32, y, 15, a); h += ln(p[0], p[1], q[0], q[1]);
    }
  }
  L = leaf(32, 22, -90, 9, 3); t += L.o;
  M.enough = { thick: t, thin: h + ln(32, 13, 32, 6) + 'M32 50C27 47 24 48 20 52', fill: '' };

  // İşte Stoacı Olmak — petek ve arı
  M.work = {
    thick: hex(22, 42, 8) + hex(34, 35.07, 8) + hex(34, 48.93, 8)
      + 'M41 22C43 16.5 50.5 15 52.5 17C54.5 19 52.5 26 46.5 26.5C42.5 27 40 25 41 22Z',
    thin: circ(45, 14, 3.6) + circ(50.5, 13.2, 3) + ln(45, 19, 43.8, 25) + ln(48.6, 18.2, 47.6, 25.4)
      + 'M41.5 22.5C38 22 35 23.5 33 26',
    fill: circ(22, 42, 2) + circ(34, 48.93, 2),
  };

  // Sabır — incir
  L = leaf(31.5, 17, -25, 18, 7);
  M.patience = {
    thick: 'M30 24C38.5 29 43 37 41 45C39 52 23 52 21 45C19 37 22.5 29 30 24Z' + 'M30 24L31.5 17' + L.o,
    thin: L.v + 'M26 31C23.5 37 23.5 43 25.5 48M34 30.5C37.5 36 38 42 36 48',
    fill: circ(31, 49.6, 1.2),
  };

  // Eleştiriyi Kaldırmak — örs
  M.criticism = {
    thick: 'M10 24L40 24C46 24 50 22.5 55 20C53.5 26.5 49 30.5 42 31L40 31L37.5 38L44 46L20 46L26.5 38L24 31L16 31C12 31 10 28 10 24Z',
    thin: ln(20, 46, 18, 50) + ln(44, 46, 46, 50) + ln(16, 50, 48, 50) + ln(12, 27.5, 39, 27.5)
      + ln(30, 18, 28, 13) + ln(34, 18.5, 37, 13.5) + ln(26.5, 19, 22.5, 15.5),
    fill: '',
  };

  // Ölümlülük (yayın bekliyor) — gelincik: kısa ömürlü, o yüzden güzel
  L = leaf(30, 46, -150, 11, 3.6);
  M.mortality = {
    thick: 'M32 58C31 48 32 38 32 30' + circ(32, 22, 9.5) + L.o,
    thin: 'M32 22C28 18 26 15 27 12.5M32 22C36 18 38 15 37 12.5M32 22C27 23 24.5 26 23.5 29M32 22C37 23 39.5 26 40.5 29' + L.v,
    fill: circ(32, 22, 3),
  };

  // Belirsizlikle Yaşamak (yayın bekliyor) — pusula: yolu bilmeden yönü tutmak
  h = '';
  for (let i = 0; i < 16; i++) {
    p = polar(32, 32, 17, i * 22.5); q = polar(32, 32, i % 4 === 0 ? 13.5 : 15.2, i * 22.5); h += ln(p[0], p[1], q[0], q[1]);
  }
  M.uncertainty = {
    thick: circ(32, 32, 19) + 'M32 17L35.5 32L32 47L28.5 32Z',
    thin: h + ln(32, 17, 32, 47) + 'M20 32L28.5 32M35.5 32L44 32',
    fill: 'M32 17L35.5 32L28.5 32Z' + circ(32, 32, 1.6),
  };

  // Zor İnsanlar (yayın bekliyor) — taş köprü: iki yakayı birleştirmek
  M.people = {
    thick: 'M6 36L58 36' + 'M10 36C10 26 20 20 32 20C44 20 54 26 54 36' + 'M22 36C22 30 26 27 32 27C38 27 42 30 42 36',
    thin: ln(6, 41, 58, 41) + 'M4 46C10 44 14 48 20 46C26 44 30 48 36 46C42 44 46 48 52 46C55 45 58 46 60 46'
      + ln(16, 24.5, 18, 29) + ln(48, 24.5, 46, 29) + ln(32, 20, 32, 27),
    fill: '',
  };

  return M;
}

export const TRACE_MOTIFS: Record<string, TraceMotif> = build();

/** Programların taban renkleri (`constants/programs.ts` → `color` alanıyla aynı RGB). */
export const TRACE_RGB: Record<string, [number, number, number]> = {
  control: [80, 160, 120], calm: [196, 169, 106], anger: [198, 108, 74], regard: [140, 160, 190],
  time: [160, 120, 170], grief: [90, 120, 170], enough: [140, 150, 90], work: [70, 150, 150],
  patience: [180, 110, 130], criticism: [150, 140, 125], mortality: [150, 145, 140],
  uncertainty: [120, 150, 175], people: [184, 120, 80],
};
