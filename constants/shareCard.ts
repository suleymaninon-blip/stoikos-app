import { Platform } from 'react-native';
import { Fonts } from './theme';
import { PHILOSOPHER_ICONS } from './philosopherIcons';

/**
 * Söz kartını görsel olarak paylaşır (yalnız web). Native'de `react-native-view-shot` kartın
 * ekran görüntüsünü alıyor (components/QuoteShareModal.tsx); web'de o yol çalışmıyor ve paylaşım
 * düz metne düşüyordu (29 Ekim 2026). Burada kart doğrudan <canvas>'a çizilir, sonra Web Share
 * API ile dosya olarak paylaşılır; dosya paylaşımı yoksa görsel indirilir.
 *
 * Tasarım (20 Kasım 2026, https://claude.ai/artifact/6U1GQAtzbNer2zyC6pkm3F): 9:16 hikâye boyu,
 * siyah-altın, ortada koyu yaprak. Geometri 360×640'lık tuvalde tanımlı; native kart aynı
 * sayıları 0,8 katla, bu çizim 3 katla kullanır — biri değişirse öteki de değişmeli.
 * Dönüş: 'shared' | 'downloaded' | 'unsupported' (çağıran metne düşer).
 */
export type ShareCardInput = { text: string; author: string; source: string; authorId?: string; message: string };

export const CARD_OUT = { width: 1080, height: 1920 };
const S = 3; // 360×640 → 1080×1920
// Marka işaretinin geometrisi — components/StoikosMark.tsx ve website/index.html ile aynı (viewBox 192 162 640 640)
const MARK_ARC = 'M296 688 H415 A232 232 0 1 1 609 688 H728';

/** Sözün puntosu uzunluğa göre (360'lık tuvalde). Native kart ve web çizimi aynı tabloyu okur. */
export function quoteSizeFor(text: string): { size: number; line: number } {
  const len = text.length;
  if (len <= 60) return { size: 25, line: 32 };
  if (len <= 95) return { size: 22, line: 29 };
  if (len <= 135) return { size: 19.5, line: 26 };
  return { size: 17, line: 23 };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(size / 640, size / 640); ctx.translate(-192, -162);
  const orb = ctx.createRadialGradient(480, 430, 10, 512, 477, 128);
  orb.addColorStop(0, '#f6e6c0'); orb.addColorStop(0.45, '#cfae6c'); orb.addColorStop(1, '#6e5530');
  ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(512, 477, 128, 0, Math.PI * 2); ctx.fill();
  const gold = ctx.createLinearGradient(0, 250, 0, 760);
  gold.addColorStop(0, '#f4e2b8'); gold.addColorStop(0.45, '#d4b376'); gold.addColorStop(1, '#9a7b44');
  ctx.strokeStyle = gold; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(MARK_ARC));
  ctx.restore();
}

/** Harf aralıklı metnin genişliği (canvas letterSpacing her tarayıcıda yok; elle çiziliyor). */
function spacedWidth(ctx: CanvasRenderingContext2D, s: string, sp: number) {
  return ctx.measureText(s).width + sp * Math.max(0, s.length - 1);
}
function drawSpaced(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, sp: number) {
  for (const ch of s) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; }
}

const FAM = () => ({
  quote: Fonts.cormorantItalic, mark: Fonts.cormorant, brand: Fonts.cinzelBold ?? Fonts.cinzel,
  author: Fonts.cinzel, body: Fonts.jost,
});
// Yaprağın yeri (360×640 tuvalde) — native kartlar (QuoteShareModal, TraceShare) aynı sayıları kullanır.
export const SHEET = { x: 28, y: 150, w: 304, h: 322, r: 6 };
const URL_Y = 488;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
}

/** Ortak çerçeve: zemin, üstte işaret + STOIKOS, gölgeli kâğıt yaprak (dokulu), altta stoikos.app. */
function drawFrame(ctx: CanvasRenderingContext2D) {
  const fam = FAM();
  const W = CARD_OUT.width, H = CARD_OUT.height;
  ctx.textBaseline = 'alphabetic';

  // Zemin
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#17140f'); bg.addColorStop(1, '#0a0908');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Üst: işaret + STOIKOS, ortalı (y 98–124)
  ctx.font = `${13 * S}px "${fam.brand}"`; ctx.textAlign = 'left';
  const brandSp = 4 * S, markSz = 26 * S, gap = 10 * S;
  const bw = markSz + gap + spacedWidth(ctx, 'STOIKOS', brandSp);
  const bx = (W - bw) / 2; const by = 98 * S;
  drawMark(ctx, bx, by, markSz);
  ctx.fillStyle = '#d8c49a';
  drawSpaced(ctx, 'STOIKOS', bx + markSz + gap, by + markSz / 2 + 13 * S * 0.36, brandSp);

  // Yaprak (gölgeli)
  const sx = SHEET.x * S, sy = SHEET.y * S, sw = SHEET.w * S, sh = SHEET.h * S, sr = SHEET.r * S;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30 * S; ctx.shadowOffsetY = 10 * S;
  ctx.fillStyle = '#1f1b16';
  roundRect(ctx, sx, sy, sw, sh, sr); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(196,169,106,0.16)'; ctx.lineWidth = S;
  roundRect(ctx, sx, sy, sw, sh, sr); ctx.stroke();

  // Kâğıt dokusu (uygulamadaki kartlarla aynı dil, 21 Kasım 2026): yaprağa kırpılmış, tohumlu soluk benekler.
  ctx.save();
  roundRect(ctx, sx, sy, sw, sh, sr); ctx.clip();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) {
    const light = rnd() < 0.45;
    ctx.fillStyle = light ? `rgba(255,248,230,${0.025 + rnd() * 0.05})` : `rgba(0,0,0,${0.05 + rnd() * 0.08})`;
    const r = 0.8 + rnd() * 1.6;
    ctx.fillRect(sx + rnd() * sw, sy + rnd() * sh, r, r);
  }
  ctx.restore();

  // Alt: adres (Instagram'ın cevap çubuğunun üstünde)
  ctx.fillStyle = '#8a8070'; ctx.font = `${11 * S}px "${fam.body}"`; ctx.textAlign = 'left';
  const usp = 1.5 * S, cx = W / 2;
  drawSpaced(ctx, 'stoikos.app', cx - spacedWidth(ctx, 'stoikos.app', usp) / 2, URL_Y * S + 11 * S, usp);
}

/** Kenarlara sönen altın ayırıcı (merkez cx, y). */
function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number) {
  const grad = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  grad.addColorStop(0, 'rgba(196,169,106,0)'); grad.addColorStop(0.5, 'rgba(196,169,106,0.55)'); grad.addColorStop(1, 'rgba(196,169,106,0)');
  ctx.fillStyle = grad; ctx.fillRect(cx - w / 2, y - S / 2, w, S);
}

function newCanvas() {
  const c = document.createElement('canvas'); c.width = CARD_OUT.width; c.height = CARD_OUT.height;
  return { c, ctx: c.getContext('2d')! };
}
function toBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}

async function renderCard(q: ShareCardInput): Promise<Blob> {
  const fam = FAM();
  const qs = quoteSizeFor(q.text);
  try {
    await Promise.all([`${qs.size * S}px "${fam.quote}"`, `192px "${fam.mark}"`, `39px "${fam.brand}"`, `33px "${fam.author}"`, `33px "${fam.body}"`]
      .map((f) => (document as any).fonts.load(f)));
  } catch {}
  const W = CARD_OUT.width;
  const { c, ctx } = newCanvas();
  drawFrame(ctx);
  const sy = SHEET.y * S, sw = SHEET.w * S, sh = SHEET.h * S;
  // Yaprağın içi: tırnak + söz + ayırıcı + (yazarın çizimi) + yazar + künye, dikeyde ortalı
  const glyph = q.authorId ? PHILOSOPHER_ICONS[q.authorId] : undefined;
  const innerW = sw - 26 * S * 2;
  ctx.font = `${qs.size * S}px "${fam.quote}"`;
  const lines = wrap(ctx, q.text, innerW);
  const markH = 36 * S, lh = qs.line * S, divH = 14 * S, glyphH = glyph ? (10 + 30) * S : 0;
  const authorH = (glyph ? 6 : 12) * S + 14 * S, sourceH = 4 * S + 13 * S;
  const blockH = markH + lines.length * lh + divH + glyphH + authorH + sourceH;
  let y = sy + (sh - blockH) / 2;
  const cx = W / 2;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#6e5a3a'; ctx.font = `${64 * S}px "${fam.mark}"`;
  ctx.fillText('“', cx, y + markH + 4 * S); y += markH;

  ctx.fillStyle = '#f5edd8'; ctx.font = `${qs.size * S}px "${fam.quote}"`;
  for (const l of lines) { ctx.fillText(l, cx, y + lh * 0.76); y += lh; }

  // kenarlara sönen ayırıcı
  y += divH;
  drawDivider(ctx, cx, y, 140 * S);

  // yazarın gravür çizimi (64×64 tuvaldeki yollar ölçeklenerek)
  if (glyph) {
    y += 10 * S;
    const gs = 30 * S;
    ctx.save();
    ctx.translate(cx - gs / 2, y); ctx.scale(gs / 64, gs / 64);
    ctx.strokeStyle = '#c2a878'; ctx.fillStyle = '#c2a878'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = 0.7; ctx.stroke(new Path2D(glyph.thin));
    ctx.lineWidth = 1.6; ctx.stroke(new Path2D(glyph.thick));
    if (glyph.fill) ctx.fill(new Path2D(glyph.fill));
    ctx.restore();
    y += gs;
  }

  y += (glyph ? 6 : 12) * S;
  // Cinzel'de Kiril yok: Rusça yazar adında Cormorant (RU_DISPLAY_FALLBACK ile aynı mantık).
  const authorFam = /[\u0400-\u04FF]/.test(q.author) ? fam.mark : fam.author;
  ctx.fillStyle = '#c2a878'; ctx.font = `${(authorFam === fam.mark ? 13 : 11) * S}px "${authorFam}"`; ctx.textAlign = 'left';
  const asp = 3 * S;
  drawSpaced(ctx, q.author, cx - spacedWidth(ctx, q.author, asp) / 2, y + 11 * S, asp);
  y += 14 * S + 4 * S;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a8070'; ctx.font = `italic ${10.5 * S}px "${fam.body}"`;
  ctx.fillText(q.source, cx, y + 10.5 * S);

  return toBlob(c);
}

/**
 * İzler sikkesi öneri kartı (25 Kasım 2026; tasarım A · Kâğıt yaprak,
 * https://claude.ai/artifact/YHC39D6eCJesqL8kZGdp1V). Övünme değil arkadaşa öneri:
 * "Bu yolu yürüdüm" + sikke + program adı + motif cümlesi + "Sana da iyi gelebilir."
 * Dikey yerleşim `traceCardLayout`'ta; native kart (components/TraceShare.tsx) aynı sayıları okur.
 */
export type TraceCardInput = { coinUri: string | null; tag: string; title: string; motif: string; invite: string; message: string };

/** Yaprağın içindeki dikey yerleşim (360'lık tuvalde). Motif satır sayısına göre ortalanır. */
export function traceCardLayout(motifLines: number) {
  const tagH = 12, gap1 = 16, coin = 112, gap2 = 16, titleH = 30, gap3 = 8, motifLH = 20, gap4 = 16, gap5 = 14, inviteH = 16;
  const blockH = tagH + gap1 + coin + gap2 + titleH + gap3 + motifLines * motifLH + gap4 + gap5 + inviteH;
  const top = SHEET.y + (SHEET.h - blockH) / 2;
  const tagY = top;
  const coinY = tagY + tagH + gap1;
  const titleY = coinY + coin + gap2;
  const motifY = titleY + titleH + gap3;
  const dividerY = motifY + motifLines * motifLH + gap4;
  const inviteY = dividerY + gap5;
  return { tagY, coinY, coin, titleY, motifY, motifSize: 15, motifLH, dividerY, inviteY, inviteSize: 12.5 };
}
/** Program adının puntosu uzunluğa göre (tek satıra sığsın; native kart da bunu okur). */
export function traceTitleSize(title: string): number {
  const len = title.length;
  return len <= 18 ? 26 : len <= 24 ? 22 : 19;
}
/** Motif metninin genişliği (360'lık tuvalde) — native kart da bu genişliği kullanır. */
export const TRACE_MOTIF_W = SHEET.w - 2 * 30;

function loadImage(uri: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new (window as any).Image() as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img); img.onerror = () => res(null);
    img.src = uri;
  });
}

async function renderTraceCard(q: TraceCardInput): Promise<Blob> {
  const fam = FAM();
  try {
    await Promise.all([`${26 * S}px "${fam.mark}"`, `${15 * S}px "${fam.quote}"`, `39px "${fam.brand}"`, `33px "${fam.body}"`, `33px "${Fonts.jostMedium}"`]
      .map((f) => (document as any).fonts.load(f)));
  } catch {}
  const img = q.coinUri ? await loadImage(q.coinUri) : null;
  const { c, ctx } = newCanvas();
  drawFrame(ctx);
  const cx = CARD_OUT.width / 2;

  ctx.font = `${15 * S}px "${fam.quote}"`;
  const motifLines = wrap(ctx, q.motif, TRACE_MOTIF_W * S);
  const L = traceCardLayout(motifLines.length);

  // Üst etiket, harf aralıklı
  ctx.fillStyle = '#c2a878'; ctx.font = `${10 * S}px "${Fonts.jostMedium}"`; ctx.textAlign = 'left';
  const tsp = 2.4 * S;
  drawSpaced(ctx, q.tag, cx - spacedWidth(ctx, q.tag, tsp) / 2, (L.tagY + 10) * S, tsp);

  // Sikke: altında yumuşak gölge, üstünde fotoğraf (TraceCoin ile aynı oranlar)
  const cs = L.coin * S, cxL = cx - cs / 2, cy = L.coinY * S;
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.arc(cx + cs * 0.01, cy + cs * 0.525, cs * 0.465, 0, Math.PI * 2); ctx.fill();
  if (img) ctx.drawImage(img, cxL + cs * 0.03, cy + cs * 0.03, cs * 0.94, cs * 0.94);
  else {
    const g = ctx.createRadialGradient(cx - cs * 0.1, cy + cs * 0.36, cs * 0.05, cx, cy + cs / 2, cs * 0.46);
    g.addColorStop(0, '#c9a27a'); g.addColorStop(1, '#5e4329');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy + cs / 2, cs * 0.46, 0, Math.PI * 2); ctx.fill();
  }

  // Program adı
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5edd8'; ctx.font = `${traceTitleSize(q.title) * S}px "${fam.mark}"`;
  ctx.fillText(q.title, cx, (L.titleY + 23) * S, (SHEET.w - 40) * S);

  // Motif cümlesi (kısa, italik)
  ctx.fillStyle = '#d8c49a'; ctx.font = `${L.motifSize * S}px "${fam.quote}"`;
  motifLines.forEach((l, i) => ctx.fillText(l, cx, (L.motifY + i * L.motifLH + 15) * S));

  drawDivider(ctx, cx, L.dividerY * S, 120 * S);

  // Öneri satırı
  ctx.fillStyle = '#b5a88f'; ctx.font = `${L.inviteSize * S}px "${fam.body}"`;
  ctx.fillText(q.invite, cx, (L.inviteY + 12.5) * S, (SHEET.w - 40) * S);

  return toBlob(c);
}

export async function shareTraceCardWeb(q: TraceCardInput): Promise<'shared' | 'downloaded' | 'unsupported'> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 'unsupported';
  return shareBlob(await renderTraceCard(q), q.message);
}

export async function shareQuoteCardWeb(q: ShareCardInput): Promise<'shared' | 'downloaded' | 'unsupported'> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 'unsupported';
  return shareBlob(await renderCard(q), q.message);
}

async function shareBlob(blob: Blob, message: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], 'stoikos.png', { type: 'image/png' });
  const nav: any = navigator;
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], text: message }); return 'shared'; }
    catch (e: any) { if (e?.name === 'AbortError') return 'shared'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'stoikos.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
