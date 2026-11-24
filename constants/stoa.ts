import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from './api';
import { localDay } from './together';

/**
 * Stoa'nın nabzı (15 Kasım 2026, topluluk 1. aşama; tasarım https://claude.ai/artifact/RAc3JRxKeVESNW9FiiJmHv).
 * Üyelik numarası, günün nabzı, sözlerde kalp sayısı. Sunucu yalnız toplam sayar; kimlik gönderilmez.
 * Sayılar küçükken gösterilmez (aşağıdaki eşikler): boş oda moral bozar, uydurma sayı güveni bozar.
 */
export const FOUNDER_MAX = 10000;
/** Nabız satırında kişi sayısı bu sayıdan itibaren yazılır; altında yalnız ülke sayısı. */
export const PULSE_MIN = 100;
/** Ülke satırı için en az ülke. */
export const COUNTRY_MIN = 2;
/** Kalp sayısı bu sayıdan itibaren gösterilir; "haftanın sözü" de en az bu kadar kalp ister. */
export const HEART_MIN = 20;

const MEMBER_KEY = 'stoikos_member_no';
const MEMBER_SEEN_KEY = 'stoikos_member_seen';
const PULSE_KEY = 'stoikos_pulse';

export type PulseKind = 'breath' | 'program' | 'journal' | 'practice' | 'sieve';
export type Pulse = { active: number; breath: number; program: number; journal: number; countries: number; top: string[] };
export type Hearts = { counts: Record<string, number>; weekTop: { id: string; n: number } | null };

// ─── Üyelik ───────────────────────────────────────────────
export async function getMemberNo(): Promise<number | null> {
  try { const v = await AsyncStorage.getItem(MEMBER_KEY); return v ? Number(v) : null; } catch { return null; }
}

/** Numara yoksa sunucudan bir kez alır. Ağ yoksa null; sonraki açılışta yeniden denenir. */
export async function claimMember(): Promise<number | null> {
  const have = await getMemberNo();
  if (have) return have;
  try {
    const res = await fetch(`${BACKEND_URL}/stoa/member`, { method: 'POST' });
    if (!res.ok) return null;
    const { no } = await res.json();
    if (typeof no !== 'number') return null;
    await AsyncStorage.setItem(MEMBER_KEY, String(no));
    return no;
  } catch { return null; }
}

export const isFounder = (no: number | null) => !!no && no <= FOUNDER_MAX;
export async function memberWelcomeSeen(): Promise<boolean> {
  try { return !!(await AsyncStorage.getItem(MEMBER_SEEN_KEY)); } catch { return true; }
}
export async function markMemberWelcomeSeen(): Promise<void> {
  try { await AsyncStorage.setItem(MEMBER_SEEN_KEY, '1'); } catch {}
}

// ─── Nabız ────────────────────────────────────────────────
/**
 * Bugün bu türden ilk olaysa sunucuya bildirir (günün ilk olayı "active"i ve ülkeyi de sayar).
 * Beklenmez, hata yutulur: nabız hiçbir zaman asıl işi geciktirmemeli.
 */
// Bildirimler sırayla işlenir: aynı anda gelen iki tür (ör. program günü + kapanış yansıması) ikisi de
// "günün ilk olayı" sanıp "active"i ve ülkeyi iki kez saydırıyordu (23 Kasım 2026 denetimi).
let pulseQueue: Promise<void> = Promise.resolve();
export function reportPulse(kind: PulseKind): void {
  pulseQueue = pulseQueue.then(() => sendPulse(kind)).catch(() => {});
}

async function sendPulse(kind: PulseKind): Promise<void> {
  await (async () => {
    const day = localDay();
    const raw = await AsyncStorage.getItem(PULSE_KEY);
    const cur: { day: string; kinds: string[] } = raw ? JSON.parse(raw) : { day, kinds: [] };
    const sent = cur.day === day ? cur.kinds : [];
    if (sent.includes(kind)) return;
    const kinds = sent.length === 0 ? ['active', kind] : [kind];
    const res = await fetch(`${BACKEND_URL}/stoa/event`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day, kinds }),
    });
    if (res.ok) await AsyncStorage.setItem(PULSE_KEY, JSON.stringify({ day, kinds: [...sent, ...kinds] }));
  })();
}

export async function fetchPulse(): Promise<Pulse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/stoa/pulse?day=${localDay()}`);
    if (!res.ok) return null;
    // Beklenmeyen bir cevap ana ekranı düşürmesin (23 Kasım 2026 denetimi: eksik `top` alanında ekran çöküyordu).
    const j = await res.json();
    const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
    return {
      active: num(j?.active), breath: num(j?.breath), program: num(j?.program), journal: num(j?.journal),
      countries: num(j?.countries), top: Array.isArray(j?.top) ? j.top.filter((c: unknown) => typeof c === 'string') : [],
    };
  } catch { return null; }
}

// ─── Kalpler ──────────────────────────────────────────────
let heartsCache: { at: number; data: Hearts } | null = null;

export async function fetchHearts(force = false): Promise<Hearts | null> {
  if (!force && heartsCache && Date.now() - heartsCache.at < 5 * 60_000) return heartsCache.data;
  try {
    const res = await fetch(`${BACKEND_URL}/stoa/hearts`);
    if (!res.ok) return heartsCache?.data ?? null;
    const j = await res.json();
    const data: Hearts = { counts: j && typeof j.counts === 'object' && j.counts ? j.counts : {}, weekTop: j?.weekTop ?? null };
    heartsCache = { at: Date.now(), data };
    return data;
  } catch { return heartsCache?.data ?? null; }
}

/** Favori eklenince/çıkınca sunucudaki toplamı bir artırır/azaltır; önbelleği de hemen günceller. */
export function reportHeart(quoteId: string, on: boolean): void {
  if (heartsCache) {
    const n = Math.max(0, (heartsCache.data.counts[quoteId] ?? 0) + (on ? 1 : -1));
    heartsCache.data = { ...heartsCache.data, counts: { ...heartsCache.data.counts, [quoteId]: n } };
  }
  fetch(`${BACKEND_URL}/stoa/heart`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quoteId, on }),
  }).catch(() => {});
}

// ─── Ülkeler ──────────────────────────────────────────────
/** Ülke adı cihazın diliyle (Intl.DisplayNames); desteklenmiyorsa null döner, liste gösterilmez. */
export function countryNamer(locale: string): ((cc: string) => string) | null {
  try {
    const D = (Intl as any).DisplayNames;
    if (!D) return null;
    const dn = new D([locale], { type: 'region' });
    if (!dn.of('TR')) return null;
    return (cc: string) => dn.of(cc) ?? cc;
  } catch { return null; }
}

/** Küre çizimi için kaba ülke merkezleri [boylam, enlem]. Listede olmayan ülke sayılır ama çizilmez. */
export const CENTROIDS: Record<string, [number, number]> = {
  TR: [35, 39], DE: [10, 51], US: [-98, 39], GB: [-2, 54], FR: [2, 46], ES: [-4, 40], IT: [12, 43], NL: [5, 52], BE: [4, 51],
  CH: [8, 47], AT: [14, 47], PL: [19, 52], CZ: [15, 50], SE: [15, 62], NO: [9, 61], DK: [10, 56], FI: [26, 64], IE: [-8, 53],
  PT: [-8, 40], GR: [22, 39], RO: [25, 46], BG: [25, 43], HU: [19, 47], UA: [31, 49], RU: [60, 58], BY: [28, 53], RS: [21, 44],
  HR: [16, 45], BA: [18, 44], AL: [20, 41], MK: [22, 41], CY: [33, 35], GE: [44, 42], AZ: [48, 40], AM: [45, 40], KZ: [67, 48],
  UZ: [64, 41], IR: [53, 32], IQ: [44, 33], SA: [45, 24], AE: [54, 24], QA: [51, 25], IL: [35, 31], EG: [30, 27], MA: [-6, 32],
  DZ: [3, 28], TN: [9, 34], NG: [8, 9], KE: [38, 0], ZA: [25, -29], IN: [79, 22], PK: [70, 30], CN: [104, 35], JP: [138, 37],
  KR: [128, 36], ID: [118, -2], MY: [102, 4], SG: [104, 1], TH: [101, 15], VN: [106, 16], PH: [122, 12], AU: [134, -25],
  NZ: [172, -41], CA: [-106, 56], MX: [-102, 23], BR: [-52, -10], AR: [-64, -34], CL: [-71, -33], CO: [-74, 4], PE: [-75, -10],
};
