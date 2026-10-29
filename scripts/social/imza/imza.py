"""Stoikos ses imzası (3 sn): bir nefes alışı + tek bir çan (şarkı söyleyen kâse).
Videoların kapanışında logo çıkarken çalar. Tamamen sentez: telif yok.
Kullanım: python3.13 scripts/social/imza/imza.py docs/sosyal-medya/muzik/stoikos-imza.wav
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 3.2
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)

# 1) Nefes: pembe gürültü, bant geçiren süzgeç; 0–1,1 sn yükselip (alış) yumuşakça söner
white = rng.standard_normal(len(t))
pink = np.cumsum(white); pink -= np.convolve(pink, np.ones(2000) / 2000, mode='same')
pink /= np.max(np.abs(pink))
sos = butter(2, [350, 2600], btype='bandpass', fs=SR, output='sos')
breath = sosfilt(sos, pink)
# süzgeç frekansı alışta açılıyormuş gibi: iki bandı karıştır
sos_hi = butter(2, [900, 4200], btype='bandpass', fs=SR, output='sos')
breath_hi = sosfilt(sos_hi, pink)
env_in = np.clip(t / 1.05, 0, 1) ** 1.6
env_out = np.exp(-np.clip(t - 1.05, 0, None) / 0.22)
benv = env_in * env_out
mix = np.clip(t / 1.05, 0, 1)
breath = (breath * (1 - mix) + breath_hi * mix) * benv
breath /= np.max(np.abs(breath)) + 1e-9
breath *= 0.22

# 2) Çan: 1,0 sn'de vurulur. Kâse kısmi tonları (uyumsuz oranlar) + hafif çarpışma (beating)
t0 = 1.0
tb = np.clip(t - t0, 0, None)
on = (t >= t0).astype(float)
f0 = 392.0  # G4: sıcak, sert değil
partials = [  # oran, genlik, sönüm süresi (sn), çarpışma Hz
    (1.000, 1.00, 2.6, 0.9),
    (2.756, 0.45, 1.5, 1.6),
    (5.404, 0.18, 0.8, 2.3),
    (8.933, 0.07, 0.45, 0.0),
]
bell = np.zeros_like(t)
for ratio, amp, decay, beat in partials:
    f = f0 * ratio
    tone = np.sin(2 * np.pi * f * tb) + 0.6 * np.sin(2 * np.pi * (f + beat) * tb)
    bell += amp * tone * np.exp(-tb / decay)
attack = np.clip(tb / 0.004, 0, 1)
bell *= attack * on
bell /= np.max(np.abs(bell)) + 1e-9
bell *= 0.55
# kuyruğu yumuşakça bitir
fade = np.clip((DUR - t) / 0.5, 0, 1)

sig = (breath + bell) * fade
# stereo: nefes ortada, çan hafif genişlik (sağ kanal 9 ms gecikmeli)
d = int(0.009 * SR)
left = sig
right = np.concatenate([np.zeros(d), sig[:-d]]) * 0.92 + breath * fade * 0.08
st = np.stack([left, right], axis=1)
st /= np.max(np.abs(st)) / 0.89
wavfile.write(sys.argv[1], SR, (st * 32767).astype(np.int16))
print('ok', sys.argv[1])
