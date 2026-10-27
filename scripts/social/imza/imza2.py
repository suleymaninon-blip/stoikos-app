"""Stoikos ses imzası — 3 aday (kullanıcı ilk taslağı beğenmedi: nefes gürültüsü cızırtı gibiydi).
A Kâse: derin, temiz şarkı söyleyen kâse, uzun yankı · B İki nota: yumuşak keçe piyano, aralıklı beşli (Re → La)
C Açılış: alçak bir ses yüzeyi yükselir, tepede tek tiz çınlama (nefes çiçeğinin açılışı gibi)
Kullanım: python3.13 scripts/social/imza/imza2.py <çıkış klasörü>
"""
import sys, os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(3)

def reverb(x, sec=2.2, mix=0.28):
    n = int(SR * sec)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (sec / 5))
    ir = sosfilt(butter(1, 4500, fs=SR, output='sos'), ir)
    wet = fftconvolve(x, ir)[:len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    return (1 - mix) * x / (np.max(np.abs(x)) + 1e-9) + mix * wet

def finish(x, dur):
    n = int(SR * dur); x = np.pad(x, (0, max(0, n - len(x))))[:n]
    t = np.arange(n) / SR
    x = x * np.clip((dur - t) / 0.6, 0, 1) * np.clip(t / 0.01, 0, 1)
    d = int(0.011 * SR)
    st = np.stack([x, np.concatenate([np.zeros(d), x[:-d]])], 1)
    return st / (np.max(np.abs(st)) / 0.85)

def bowl(f0, dur, start=0.0):
    t = np.arange(int(SR * dur)) / SR; tb = np.clip(t - start, 0, None); on = t >= start
    y = np.zeros_like(t)
    for r, a, dc, bt in [(1, 1, 3.5, 0.7), (2.71, .32, 2.0, 1.3), (5.15, .10, 1.0, 2.1)]:
        f = f0 * r
        y += a * (np.sin(2*np.pi*f*tb) + .5*np.sin(2*np.pi*(f+bt)*tb)) * np.exp(-tb/dc)
    soft = 1 - np.exp(-tb / 0.012)            # tokmak değil, sürtme gibi yumuşak giriş
    return y * soft * on

def piano(f, dur, start):
    t = np.arange(int(SR * dur)) / SR; tb = np.clip(t - start, 0, None); on = t >= start
    y = sum((1/(k**1.6)) * np.sin(2*np.pi*f*k*tb) * np.exp(-tb/(1.6/k**0.7)) for k in range(1, 7))
    y = sosfilt(butter(2, 2200, fs=SR, output='sos'), y)   # keçe: tizleri kıs
    return y * (1 - np.exp(-tb/0.006)) * on

def variant_a():
    return finish(reverb(bowl(220.0, 3.6), 2.6, .25), 3.4)

def variant_b():
    x = piano(293.66, 3.6, 0.05) + 0.85 * piano(440.0, 3.6, 0.42)
    return finish(reverb(x, 2.4, .32), 3.4)

def variant_c():
    dur = 3.6; t = np.arange(int(SR*dur))/SR
    pad = sum(np.sin(2*np.pi*f*t) for f in [196.0, 196.8, 293.66, 294.4, 392.0]) / 5
    pad *= np.clip(t/1.4, 0, 1)**2 * np.exp(-np.clip(t-1.4, 0, None)/0.9)
    pad = sosfilt(butter(2, 1500, fs=SR, output='sos'), pad)
    chime = bowl(1174.66, dur, 1.35) * 0.35
    return finish(reverb(pad*0.9 + chime, 2.4, .3), 3.4)

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
parts = []
for name, fn in [('A-kase', variant_a), ('B-iki-nota', variant_b), ('C-acilis', variant_c)]:
    st = fn(); wavfile.write(f'{out}/imza-{name}.wav', SR, (st*32767).astype(np.int16)); parts.append(st)
    parts.append(np.zeros((int(SR*1.2), 2)))
wavfile.write(f'{out}/imza-adaylar.wav', SR, (np.concatenate(parts)*32767).astype(np.int16))
print('ok')
