// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// m4a asset uzantısı. Orb nefes sesi Eylül 2026'da MP3'e geçti (eski .m4a
// aslında video içeriyordu ve tarayıcıda çalmıyordu, bkz. constants/breathSound.ts),
// yani şu an m4a kullanan dosya yok — kayıt ileride gerekirse dursun diye bırakıldı.
if (!config.resolver.assetExts.includes('m4a')) {
  config.resolver.assetExts.push('m4a');
}

// backend/ ayrı bir Cloudflare Worker projesi — uygulama paketine dahil etme.
const extra = /.*\/backend\/.*/;
const existing = config.resolver.blockList;
config.resolver.blockList = existing ? [].concat(existing, extra) : extra;

module.exports = config;
