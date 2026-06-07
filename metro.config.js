// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// m4a (AAC) ses dosyasını asset olarak bundle'a dahil et (orb nefes sesi).
if (!config.resolver.assetExts.includes('m4a')) {
  config.resolver.assetExts.push('m4a');
}

// backend/ ayrı bir Cloudflare Worker projesi — uygulama paketine dahil etme.
const extra = /.*\/backend\/.*/;
const existing = config.resolver.blockList;
config.resolver.blockList = existing ? [].concat(existing, extra) : extra;

module.exports = config;
