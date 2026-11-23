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
  anger: require('../assets/traces/anger.webp'),
  regard: require('../assets/traces/regard.webp'),
  time: require('../assets/traces/time.webp'),
  grief: require('../assets/traces/grief.webp'),
  enough: require('../assets/traces/enough.webp'),
  work: require('../assets/traces/work.webp'),
  patience: require('../assets/traces/patience.webp'),
  criticism: require('../assets/traces/criticism.webp'),
  mortality: require('../assets/traces/mortality.webp'),
  uncertainty: require('../assets/traces/uncertainty.webp'),
  people: require('../assets/traces/people.webp'),
};
