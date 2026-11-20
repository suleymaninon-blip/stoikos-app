import { Platform } from 'react-native';
import { Fonts } from './theme';

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
export type ShareCardInput = { text: string; author: string; source: string; message: string };

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

async function renderCard(q: ShareCardInput): Promise<Blob> {
  const fam = {
    quote: Fonts.cormorantItalic, mark: Fonts.cormorant, brand: Fonts.cinzelBold ?? Fonts.cinzel,
    author: Fonts.cinzel, body: Fonts.jost,
  };
  const qs = quoteSizeFor(q.text);
  try {
    await Promise.all([`${qs.size * S}px "${fam.quote}"`, `192px "${fam.mark}"`, `39px "${fam.brand}"`, `33px "${fam.author}"`, `33px "${fam.body}"`]
      .map((f) => (document as any).fonts.load(f)));
  } catch {}
  const W = CARD_OUT.width, H = CARD_OUT.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';

  // Zemin
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#17140f'); bg.addColorStop(1, '#0a0908');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Üst: işaret + STOIKOS, ortalı (y 98–124)
  ctx.font = `${13 * S}px "${fam.brand}"`;
  const brandSp = 4 * S, markSz = 26 * S, gap = 10 * S;
  const bw = markSz + gap + spacedWidth(ctx, 'STOIKOS', brandSp);
  let bx = (W - bw) / 2; const by = 98 * S;
  drawMark(ctx, bx, by, markSz);
  ctx.fillStyle = '#d8c49a';
  drawSpaced(ctx, 'STOIKOS', bx + markSz + gap, by + markSz / 2 + 13 * S * 0.36, brandSp);

  // Yaprak (gölgeli)
  const sx = 28 * S, sy = 150 * S, sw = 304 * S, sh = 322 * S, sr = 6 * S;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30 * S; ctx.shadowOffsetY = 10 * S;
  ctx.fillStyle = '#1f1b16';
  ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(sx, sy, sw, sh, sr) : ctx.rect(sx, sy, sw, sh); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(196,169,106,0.16)'; ctx.lineWidth = S;
  ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(sx, sy, sw, sh, sr) : ctx.rect(sx, sy, sw, sh); ctx.stroke();

  // Yaprağın içi: tırnak + söz + yazar + künye, dikeyde ortalı
  const innerW = sw - 26 * S * 2;
  ctx.font = `${qs.size * S}px "${fam.quote}"`;
  const lines = wrap(ctx, q.text, innerW);
  const markH = 36 * S, lh = qs.line * S, authorH = 20 * S + 14 * S, sourceH = 4 * S + 13 * S;
  const blockH = markH + lines.length * lh + authorH + sourceH;
  let y = sy + (sh - blockH) / 2;
  const cx = W / 2;
  ctx.textAlign = 'center';

  ctx.fillStyle = '#6e5a3a'; ctx.font = `${64 * S}px "${fam.mark}"`;
  ctx.fillText('“', cx, y + markH + 4 * S); y += markH;

  ctx.fillStyle = '#f5edd8'; ctx.font = `${qs.size * S}px "${fam.quote}"`;
  for (const l of lines) { ctx.fillText(l, cx, y + lh * 0.76); y += lh; }

  y += 20 * S;
  // Cinzel'de Kiril yok: Rusça yazar adında Cormorant (RU_DISPLAY_FALLBACK ile aynı mantık).
  const authorFam = /[\u0400-\u04FF]/.test(q.author) ? fam.mark : fam.author;
  ctx.fillStyle = '#c2a878'; ctx.font = `${(authorFam === fam.mark ? 13 : 11) * S}px "${authorFam}"`; ctx.textAlign = 'left';
  const asp = 3 * S;
  drawSpaced(ctx, q.author, cx - spacedWidth(ctx, q.author, asp) / 2, y + 11 * S, asp);
  y += 14 * S + 4 * S;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a8070'; ctx.font = `italic ${10.5 * S}px "${fam.body}"`;
  ctx.fillText(q.source, cx, y + 10.5 * S);

  // Alt: adres (Instagram'ın cevap çubuğunun üstünde)
  ctx.font = `${11 * S}px "${fam.body}"`; ctx.textAlign = 'left';
  const usp = 1.5 * S;
  drawSpaced(ctx, 'stoikos.app', cx - spacedWidth(ctx, 'stoikos.app', usp) / 2, 488 * S + 11 * S, usp);

  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}

export async function shareQuoteCardWeb(q: ShareCardInput): Promise<'shared' | 'downloaded' | 'unsupported'> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 'unsupported';
  const blob = await renderCard(q);
  const file = new File([blob], 'stoikos.png', { type: 'image/png' });
  const nav: any = navigator;
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], text: q.message }); return 'shared'; }
    catch (e: any) { if (e?.name === 'AbortError') return 'shared'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'stoikos.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
