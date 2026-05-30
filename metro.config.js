// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// backend/ ayrı bir Cloudflare Worker projesi — uygulama paketine dahil etme.
const extra = /.*\/backend\/.*/;
const existing = config.resolver.blockList;
config.resolver.blockList = existing ? [].concat(existing, extra) : extra;

module.exports = config;
