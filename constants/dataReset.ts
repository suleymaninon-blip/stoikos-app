// "Tüm verilerimi sil"den sonra açık sekmelerin bellekteki kopyasını bırakması için haber (23 Kasım 2026 denetimi).
// Sekmeler açık kalıyor (Koç, Pratik); silmeden sonra ilk yazışta eski sohbeti/günlüğü depoya geri yazıyorlardı.
type Listener = () => void;
const listeners = new Set<Listener>();

export function onDataReset(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function emitDataReset(): void {
  listeners.forEach((l) => { try { l(); } catch {} });
}
