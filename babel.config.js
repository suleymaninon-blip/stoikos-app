module.exports = function (api) {
  // Web derlemesi eski tarayıcılarda da açılsın: babel-preset-expo web'i "modern
  // motor" sayıp ES2022 sözdizimini (sınıf alanları, ??=, ||=, ?., ??) olduğu gibi
  // bırakıyor. Bunu tanımayan tarayıcılar (iOS 14 öncesi Safari, eski Android
  // WebView) paketi hiç ayrıştıramıyor ve BEYAZ EKRAN gösteriyor (Ekim 2026).
  // Native (Hermes) bunları zaten destekliyor; dönüşümler yalnız web için.
  const platform = api.caller((c) => c && c.platform);
  api.cache.using(() => platform);
  const webCompat = platform === 'web'
    ? [
        '@babel/plugin-transform-class-static-block',
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        '@babel/plugin-transform-logical-assignment-operators',
        '@babel/plugin-transform-nullish-coalescing-operator',
        '@babel/plugin-transform-optional-chaining',
      ]
    : [];
  return {
    presets: ['babel-preset-expo'],
    plugins: webCompat,
  };
};
