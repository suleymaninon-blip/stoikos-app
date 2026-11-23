import type { ImageSourcePropType } from 'react-native';

/**
 * İzler sikkelerinin fotoğrafları (Gemini ile üretildi, 23 Kasım 2026).
 * Kaynak: docs/izler/kaynak/<id>.jpg → `bash scripts/brand/cut-trace-coins.sh` →
 * assets/traces/<id>.webp (320 px, saydam daire). Fotoğrafı olmayan program
 * `TraceCoin`'de kodla çizilen bronz sikkeye düşer.
 * Komutlar ve üslup örneği: docs/izler/gemini-komutlari.md.
 */
export const TRACE_IMAGES: Record<string, ImageSourcePropType> = {
  control: require('../assets/traces/control.webp'),
  calm: require('../assets/traces/calm.webp'),
};
