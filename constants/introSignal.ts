/**
 * Açılış animasyonu (BrandIntro, ~3,5 sn) bitti mi? Ana ekranın kademeli girişi (StaggerSection) bunu bekler;
 * yoksa giriş hareketi açılışın arkasında oynayıp biter ve kullanıcı hiçbir şey görmez (19 Kasım 2026,
 * kullanıcı: "bir değişiklik göremedim").
 */
let done = false;
const subs = new Set<() => void>();

export const isIntroDone = () => done;

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((f) => f());
  subs.clear();
}

/** Açılış bitince bir kez çağrılır (zaten bittiyse hemen). Geri dönen fonksiyon aboneliği iptal eder. */
export function onIntroDone(f: () => void): () => void {
  if (done) { f(); return () => {}; }
  subs.add(f);
  return () => subs.delete(f);
}
