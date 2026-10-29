import { Platform } from 'react-native';
import { Fonts } from './theme';

/**
 * Söz kartını görsel olarak paylaşır (yalnız web). Native'de `react-native-view-shot` kartın
 * ekran görüntüsünü alıyor; web'de o yol çalışmıyor ve paylaşım düz metne düşüyordu
 * (WhatsApp'ta bağlantısız, sade bir yazı — 29 Ekim 2026). Burada kart 1080×1350 bir
 * <canvas>'a doğrudan çizilir (Instagram/WhatsApp dikey kart oranı), sonra Web Share API ile
 * dosya olarak paylaşılır; dosya paylaşımı yoksa görsel indirilir.
 * Dönüş: 'shared' | 'downloaded' | 'unsupported' (çağıran metne düşer).
 */
export type ShareCardInput = { text: string; author: string; source: string; tagline: string; message: string };

const W = 1080, H = 1350, PAD = 110;
// Marka işaretinin geometrisi — components/StoikosMark.tsx ve website/index.html ile aynı (viewBox 192 162 640 640)
const MARK_ARC = 'M296 688 H415 A232 232 0 1 1 609 688 H728';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y); ctx.scale(size / 640, size / 640); ctx.translate(-192, -162);
  const orb = ctx.createRadialGradient(480, 430, 10, 512, 477, 128);
  orb.addColorStop(0, '#f6e6c0'); orb.addColorStop(0.45, '#cfae6c'); orb.addColorStop(1, '#6e5530');
  ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(512, 477, 128, 0, Math.PI * 2); ctx.fill();
  const gold = ctx.createLinearGradient(0, 250, 0, 760);
  gold.addColorStop(0, '#f4e2b8'); gold.addColorStop(0.45, '#d4b376'); gold.addColorStop(1, '#9a7b44');
  ctx.strokeStyle = gold; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.stroke(new Path2D(MARK_ARC));
  ctx.restore();
}

async function renderCard(q: ShareCardInput): Promise<Blob> {
  const fam = { quote: Fonts.cormorantItalic, brand: Fonts.cinzelBold ?? Fonts.cinzel, body: Fonts.jost, bodyMed: Fonts.jostMedium ?? Fonts.jost };
  try {
    await Promise.all([`64px "${fam.quote}"`, `40px "${fam.brand}"`, `30px "${fam.body}"`, `30px "${fam.bodyMed}"`].map((f) => (document as any).fonts.load(f)));
  } catch {}
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // Zemin: koyu taş + sağ üstten sıcak hale
  ctx.fillStyle = '#16130f'; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.08, 20, W * 0.85, H * 0.08, W * 0.95);
  glow.addColorStop(0, 'rgba(212,146,74,0.28)'); glow.addColorStop(1, 'rgba(212,146,74,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // İnce altın çerçeve
  ctx.strokeStyle = 'rgba(196,169,106,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); (ctx as any).roundRect ? (ctx as any).roundRect(46, 46, W - 92, H - 92, 48) : ctx.rect(46, 46, W - 92, H - 92); ctx.stroke();
  // Silik büyük işaret (filigran)
  drawMark(ctx, W - 470, 90, 420, 0.07);

  // Söz: uzunluğa göre punto, dikeyde ortalanmış blok
  const maxW = W - PAD * 2;
  let size = 76, lines: string[] = [];
  for (; size >= 46; size -= 4) {
    ctx.font = `${size}px "${fam.quote}"`;
    lines = wrap(ctx, `“${q.text}”`, maxW);
    if (lines.length * size * 1.32 <= 620) break;
  }
  const lh = size * 1.32;
  // Blok: yıldız (70) + söz satırları + boşluk (96) + yazar (50) + künye (30); üst 120 ile alt bant arasında ortalı
  const blockH = 70 + lines.length * lh + 96 + 50 + 30;
  let y = 120 + Math.max(60, (H - 290 - 120 - blockH) / 2);

  ctx.fillStyle = '#c4a96a'; ctx.font = `34px "${fam.body}"`; ctx.fillText('✦', PAD, y + 30); y += 70;
  ctx.fillStyle = '#efe3c8'; ctx.font = `${size}px "${fam.quote}"`; ctx.textBaseline = 'alphabetic';
  for (const l of lines) { y += lh * 0.78; ctx.fillText(l, PAD, y); y += lh * 0.22; }
  y += 96;
  ctx.fillStyle = '#d4b376'; ctx.font = `40px "${fam.brand}"`;
  ctx.fillText(`— ${q.author.toLocaleUpperCase('tr')}`, PAD, y); y += 50;
  ctx.fillStyle = '#9b8f78'; ctx.font = `italic 30px "${fam.body}"`; ctx.fillText(q.source, PAD, y);

  // Alt bant: işaret + STOIKOS + slogan + adres
  const fy = H - 250;
  ctx.strokeStyle = 'rgba(196,169,106,0.22)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PAD, fy); ctx.lineTo(W - PAD, fy); ctx.stroke();
  drawMark(ctx, PAD - 6, fy + 40, 84);
  ctx.fillStyle = '#e8d6ad'; ctx.font = `44px "${fam.brand}"`;
  (ctx as any).letterSpacing = '10px'; ctx.fillText('STOIKOS', PAD + 100, fy + 96); (ctx as any).letterSpacing = '0px';
  ctx.fillStyle = '#9b8f78'; ctx.font = `28px "${fam.body}"`; ctx.fillText(q.tagline, PAD + 100, fy + 140);
  ctx.fillStyle = '#d4b376'; ctx.font = `30px "${fam.bodyMed}"`; ctx.textAlign = 'right';
  ctx.fillText('stoikos.app', W - PAD, fy + 96); ctx.textAlign = 'left';

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
