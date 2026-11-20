"""Kâğıt dokusu (kavram penceresi, 20 Kasım 2026): assets/paper.png, 160 px, döşenebilir.
Saydam zemin üstünde çok hafif koyu/açık benekler + yumuşak lekeler. Yeniden üretmek için:
  python3 scripts/brand/make-paper.py   (Pillow gerekir)"""
import random
from PIL import Image, ImageFilter
N = 160
random.seed(7)
def tile_blur(img, r):
    big = Image.new('L', (N * 3, N * 3))
    for i in range(3):
        for j in range(3):
            big.paste(img, (i * N, j * N))
    return big.filter(ImageFilter.GaussianBlur(r)).crop((N, N, 2 * N, 2 * N))
blot = Image.new('L', (N, N))
blot.putdata([random.randint(0, 255) for _ in range(N * N)])
blot = tile_blur(blot, 6)
out = Image.new('RGBA', (N, N))
px = []
for v in blot.getdata():
    r = random.random()
    d = (v - 128) / 128.0
    if r < 0.05:   px.append((70, 58, 40, random.randint(10, 26)))
    elif r < 0.09: px.append((255, 255, 255, random.randint(20, 45)))
    elif d > 0.05: px.append((90, 75, 50, int(min(14, d * 60))))
    else:          px.append((255, 255, 255, int(min(18, -d * 70))))
out.putdata(px)
out.save('assets/paper.png', optimize=True)
