// Stoikos işareti — "Nefes orbu + Ω" (Ekim 2026). Uygulamadaki components/StoikosMark.tsx
// ve sitedeki <symbol id="mark"> ile AYNI geometri: değiştirirken üçünü birlikte güncelle.
// Koordinatlar 1024×1024 tuval.

const defs = (id, withBg) => `
  <defs>
    <radialGradient id="bg${id}" cx="50%" cy="44%" r="72%">
      <stop offset="0" stop-color="#2d261b"/><stop offset="0.55" stop-color="#17140f"/><stop offset="1" stop-color="#0c0a07"/>
    </radialGradient>
    <linearGradient id="gold${id}" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="760">
      <stop offset="0" stop-color="#f4e2b8"/><stop offset="0.45" stop-color="#d4b376"/><stop offset="1" stop-color="#9a7b44"/>
    </linearGradient>
    <radialGradient id="orb${id}" cx="42%" cy="36%" r="70%">
      <stop offset="0" stop-color="#f6e6c0"/><stop offset="0.45" stop-color="#cfae6c"/><stop offset="1" stop-color="#6e5530"/>
    </radialGradient>
    <radialGradient id="glow${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#e2b874" stop-opacity=".45"/><stop offset="1" stop-color="#e2b874" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${withBg ? `<rect width="1024" height="1024" fill="url(#bg${id})"/>` : ''}`;

const body = (id, outerRing) => `
  ${outerRing ? `<circle cx="512" cy="477" r="330" fill="none" stroke="#d4b376" stroke-opacity=".07" stroke-width="3"/>` : ''}
  <circle cx="512" cy="477" r="292" fill="none" stroke="#d4b376" stroke-opacity=".13" stroke-width="3"/>
  <circle cx="512" cy="477" r="200" fill="url(#glow${id})"/>
  <circle cx="512" cy="477" r="128" fill="url(#orb${id})"/>
  <path d="M296 688 H415 A232 232 0 1 1 609 688 H728" fill="none" stroke="url(#gold${id})" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>`;

// Uygulama ikonu: tam taşan kare, zeminli (iOS/Android köşeyi kendisi yuvarlar).
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${defs('I', true)}${body('I', true)}</svg>`;
// Yalnız işaret, saydam zemin (Android uyarlanabilir ön katman, açılış ekranı).
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="192 162 640 640">${defs('M', false)}${body('M', false)}</svg>`;

module.exports = { ICON, MARK };
