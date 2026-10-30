import { Platform } from 'react-native';
import { Fonts } from './theme';
import { WP_W, WP_H, WP_OUT, PALETTES, weeksLayout, marbleVeins, groupNum, type WeeksPrefs } from './lifeWeeks';
import { MARK_PATH } from '../components/StoikosMark';

/**
 * Hayat haftaları duvar kağıdını web'de 1290×2796 PNG'ye çizer (react-native-view-shot web'de
 * çalışmıyor — söz kartındaki gibi, constants/shareCard.ts). Geometri lifeWeeks.ts'ten; nokta
 * yolları SVG yolu olarak Path2D'ye verilir, tuval 390×844'ten ölçeklenir.
 * Kaydet → indirme; Paylaş → Web Share (dosya destekleniyorsa), yoksa indirme.
 */
type Texts = { caption: string; weeksUpper: string; lang: string };

async function render(p: WeeksPrefs, tx: Texts): Promise<Blob> {
  try {
    await Promise.all([`17px "${Fonts.cormorantItalic}"`, `11px "${Fonts.jost}"`, `10px "${Fonts.cinzel}"`].map((f) => (document as any).fonts.load(f)));
  } catch {}
  const P = PALETTES[p.theme];
  const L = weeksLayout(p);
  const c = document.createElement('canvas');
  c.width = WP_OUT.width; c.height = WP_OUT.height;
  const ctx = c.getContext('2d')!;
  ctx.scale(WP_OUT.width / WP_W, WP_OUT.height / WP_H);

  ctx.fillStyle = P.base; ctx.fillRect(0, 0, WP_W, WP_H);
  if (P.grad) {
    const g = P.grad.kind === 'radial'
      ? ctx.createRadialGradient(WP_W * P.grad.cx, WP_H * P.grad.cy, 0, WP_W * P.grad.cx, WP_H * P.grad.cy, Math.hypot(WP_W, WP_H) * P.grad.r * 0.5)
      : ctx.createLinearGradient(0, 0, 0, WP_H);
    for (const [o, col] of P.grad.stops) g.addColorStop(o, col);
    ctx.fillStyle = g; ctx.fillRect(0, 0, WP_W, WP_H);
  }
  if (P.veins) {
    ctx.strokeStyle = P.veins; ctx.lineCap = 'round';
    for (const v of marbleVeins()) { ctx.globalAlpha = v.o; ctx.lineWidth = v.w; ctx.stroke(new Path2D(v.d)); }
    ctx.globalAlpha = 1;
  }
  if (P.vignette) {
    const g = ctx.createRadialGradient(WP_W / 2, WP_H / 2, 0, WP_W / 2, WP_H / 2, Math.hypot(WP_W, WP_H) * 0.375);
    g.addColorStop(0.55, P.vignette + '00'); g.addColorStop(1, P.vignette + '59');
    ctx.fillStyle = g; ctx.fillRect(0, 0, WP_W, WP_H);
  }

  ctx.globalAlpha = 0.07; ctx.fillStyle = P.accent;
  ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(L.band.x, L.band.y, L.band.w, L.band.h, 3) : ctx.rect(L.band.x, L.band.y, L.band.w, L.band.h); ctx.fill();
  ctx.fillStyle = P.lived;
  ctx.globalAlpha = 0.55; ctx.fill(new Path2D(L.oldPath));
  ctx.globalAlpha = 0.95; ctx.fill(new Path2D(L.recentPath));
  ctx.globalAlpha = 1;
  ctx.strokeStyle = P.rest; ctx.lineWidth = 0.7; ctx.stroke(new Path2D(L.restPath));
  ctx.fillStyle = P.now; ctx.beginPath(); ctx.arc(L.now.x, L.now.y, L.now.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = P.now; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(L.now.x, L.now.y, L.now.halo, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.textBaseline = 'middle';
  ctx.fillStyle = P.muted; ctx.font = `9px "${Fonts.jost}"`; ctx.textAlign = 'right';
  for (const d of L.decades) ctx.fillText(d.label, d.right, d.y);
  ctx.textAlign = 'center';
  const stat = p.numbers
    ? `MEMENTO MORI · ${groupNum(L.lived, tx.lang)} / ${groupNum(L.total, tx.lang)} ${tx.weeksUpper}`
    : 'MEMENTO MORI';
  ctx.font = `11px "${Fonts.jost}"`; (ctx as any).letterSpacing = '3px';
  ctx.fillText(stat, WP_W / 2, 758);
  (ctx as any).letterSpacing = '0px';
  ctx.fillStyle = P.text; ctx.font = `17px "${Fonts.cormorantItalic}"`;
  ctx.fillText(tx.caption, WP_W / 2, 782);

  // İşaret + STOIKOS, ortalı
  ctx.globalAlpha = 0.7;
  ctx.font = `10px "${Fonts.cinzel}"`; (ctx as any).letterSpacing = '4px';
  const bw = ctx.measureText('STOIKOS').width, total = 13 + 8 + bw;
  const bx = WP_W / 2 - total / 2;
  ctx.save(); ctx.translate(bx, 806); ctx.scale(13 / 640, 13 / 640); ctx.translate(-192, -162);
  ctx.strokeStyle = P.brand; ctx.lineWidth = 79; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(MARK_PATH)); ctx.restore();
  ctx.fillStyle = P.brand; ctx.textAlign = 'left'; ctx.fillText('STOIKOS', bx + 21, 813);
  (ctx as any).letterSpacing = '0px'; ctx.globalAlpha = 1;

  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function exportWeeksWeb(p: WeeksPrefs, tx: Texts, mode: 'save' | 'share', shareText: string): Promise<'shared' | 'downloaded' | 'unsupported'> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return 'unsupported';
  const blob = await render(p, tx);
  const name = 'stoikos-hayat-haftalari.png';
  if (mode === 'share') {
    const file = new File([blob], name, { type: 'image/png' });
    const nav: any = navigator;
    if (nav.canShare?.({ files: [file] })) {
      try { await nav.share({ files: [file], text: shareText }); return 'shared'; }
      catch (e: any) { if (e?.name === 'AbortError') return 'shared'; }
    }
  }
  download(blob, name);
  return 'downloaded';
}
