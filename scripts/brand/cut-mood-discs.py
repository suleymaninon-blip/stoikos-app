# Duygu çiçeğinin cam diskleri (15 Kasım 2026): Gemini'nin ürettiği 3x3 buzlu cam görselinden dokuz diski keser.
# Kaynak docs/mood-cam/gemini-dokuz-disk.jpg; çıktı assets/mood/<duygu>.webp (240 px, saydam kenar).
# Gölge diskin altına düştüğü için maske, üst yarıdan ölçülen daire. Önizleme: <önizleme klasörü>/cut-l.png, cut-d.png
# Kullanım (numpy, pillow, scipy gerekir): python3 scripts/brand/cut-mood-discs.py docs/mood-cam/gemini-dokuz-disk.jpg assets/mood /tmp
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
src, outdir = sys.argv[1], sys.argv[2]
im=np.asarray(Image.open(src).convert('RGB')).astype(float)
mx=im.max(2); mn=im.min(2); lum=im.mean(2)
mask=((mx-mn)>16)|(lum<228)
mask=nd.binary_opening(mask,iterations=2)
lab,n=nd.label(mask)
sizes=nd.sum(mask,lab,range(1,n+1))
keep=np.argsort(sizes)[::-1][:9]+1
objs=[]
for k in keep:
    ys,xs=np.where(lab==k); objs.append((ys.mean(),xs.mean(),k,ys.min(),ys.max(),xs.min(),xs.max()))
objs.sort(key=lambda o:(round(o[0]/400),o[1]))
ids=['kaygi','ofke','yas','kabul','kontrol','ic-huzur','cesaret','sukran','sadelik']
for (cy,cx,k,y0,y1,x0,x1),name in zip(objs,ids):
    m=nd.binary_fill_holes(lab==k)
    # Gölge diskin altına düşüyor: yarıçapı üst yarıdaki genişlikten, merkezi üst kenardan bul; daire maskesi.
    ys,xs=np.where(m)
    top=ys.min()
    rows=[(y, xs[ys==y].min(), xs[ys==y].max()) for y in range(top, top+int((y1-y0)*0.55))]
    w=max(r[2]-r[1] for r in rows); yw=[r for r in rows if r[2]-r[1]==w][0]
    r=w/2*0.955; ccx=(yw[1]+yw[2])/2; ccy=top+w/2
    size=int(r*2)+8; t,l=int(ccy-size/2),int(ccx-size/2)
    Y,X=np.mgrid[t:t+size,l:l+size]
    d=np.sqrt((X-ccx)**2+(Y-ccy)**2)
    al=np.clip((r-d)/2.2+0.5,0,1)
    rgb=im[t:t+size,l:l+size]
    out=np.dstack([rgb,al*255]).clip(0,255).astype(np.uint8)
    Image.fromarray(out,"RGBA").resize((240,240),Image.LANCZOS).save(f"{outdir}/{name}.webp",quality=88)
    print(name,int(r))
for bg,nm in [((244,241,234),'l'),((20,29,42),'d')]:
    c=Image.new('RGB',(248*9+8,280),bg)
    for i,n in enumerate(ids):
        p=Image.open(f'{outdir}/{n}.webp'); c.paste(p,(i*248+8,20),p)
    c.save(f'{sys.argv[3]}/cut-{nm}.png')
