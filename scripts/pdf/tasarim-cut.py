# 2. adım: ekran görüntüsünü telefonları/notları bölmeden A4 sayfalara keser, alt bilgi + sayfa no ekler (Pillow gerekir).
import json, sys
from PIL import Image, ImageDraw, ImageFont
png, out, foot = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(png + '.json')); im = Image.open(png).convert('RGB')
sc = im.width / 900; W = im.width
PH = int(W * 297 / 210) - int(90 * sc)  # sayfanın içerik yüksekliği (alt bilgi payı)
bad = [(a * sc, b * sc) for a, b in d['R'] if b - a < PH / sc * .95 * sc / sc]
def ok(y): return all(not (a + 2 < y < b - 2) for a, b in bad)
cuts, y = [0], 0
while im.height - y > PH:
    t = y + PH
    fz = [int(v * sc) for v in d.get('F', []) if y + PH * .3 < v * sc <= t]
    if fz: cuts.append(fz[0]); y = fz[0]; continue
    c = next((yy for yy in range(int(t), int(y + PH * .4), -4) if ok(yy)), int(t))
    cuts.append(c); y = c
cuts.append(im.height)
bg = tuple(int(x) for x in d['bg'][4:-1].split(','))
pages = []
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', int(11 * sc))
except Exception: f = None
H = int(W * 297 / 210); n = len(cuts) - 1
for i in range(n):
    pg = Image.new('RGB', (W, H), bg); part = im.crop((0, cuts[i], W, cuts[i + 1]))
    pg.paste(part, (0, int(20 * sc)))
    dr = ImageDraw.Draw(pg); dr.text((int(40 * sc), H - int(34 * sc)), foot, fill=(150, 140, 120), font=f)
    s = f'{i + 1}/{n}'; dr.text((W - int(40 * sc) - dr.textlength(s, font=f), H - int(34 * sc)), s, fill=(150, 140, 120), font=f)
    pages.append(pg)
pages[0].save(out, save_all=True, append_images=pages[1:], resolution=W / 8.27)
print(n, 'sayfa', cuts)
