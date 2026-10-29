import { Platform, Dimensions, useWindowDimensions } from 'react-native';

/** Web'de geniş ekranda (masaüstü) uygulama telefon gibi ortada dar bir sütunda durur.
 *  Pencere ölçüsü yerine bunu kullan: sütunun içindeki gerçek genişliği verir. Native'de etkisiz. */
export const APP_MAX_W = 480;

const clampW = (w: number) => (Platform.OS === 'web' ? Math.min(w, APP_MAX_W) : w);

export function useAppDimensions() {
  const d = useWindowDimensions();
  return { ...d, width: clampW(d.width) };
}

export function appDimensions() {
  const d = Dimensions.get('window');
  return { width: clampW(d.width), height: d.height };
}

/** Web: sütun stili. `body`'ye transform verilmesi şart — RN-web pencereleri (Modal) `position:fixed`
 *  ile body'ye eklenir; transform body'yi onların kapsayıcısı yapar, böylece pencereler de sütunda kalır. */
export function installWebColumn() {
  if (Platform.OS !== 'web' || typeof document === 'undefined' || document.getElementById('stoikos-column')) return;
  const s = document.createElement('style');
  s.id = 'stoikos-column';
  s.textContent = `@media (min-width:${APP_MAX_W + 40}px){
  html{background:radial-gradient(ellipse at 50% 30%,#221c14 0%,#0d0b08 70%)}
  body{max-width:${APP_MAX_W}px;margin:0 auto;transform:translateZ(0);overflow:hidden;
    box-shadow:0 0 0 1px rgba(196,169,106,.14),0 30px 120px rgba(0,0,0,.65)}
}`;
  document.head.appendChild(s);
}
