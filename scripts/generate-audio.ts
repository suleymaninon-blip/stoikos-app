/**
 * Sabit içeriğin (alıntılar + kavramlar) seslerini ElevenLabs ile bir kez
 * üretir ve assets/audio/ altına mp3 olarak yazar; constants/audioManifest.ts
 * dosyasını günceller. Üretilen sesler uygulamaya gömülür → son kullanıcı
 * için bedava, kalıcı, internetsiz çalışır.
 *
 * Çalıştır:
 *   ELEVEN_API_KEY=<anahtarın> npm run gen-audio
 * İsteğe bağlı farklı ses:
 *   ELEVEN_API_KEY=<...> ELEVEN_VOICE=<voiceId> npm run gen-audio
 *
 * Mevcut dosyaları atlar (tekrar çalıştırınca sadece eksikleri üretir).
 */
import { getAudioItems } from '../constants/content';
import type { Lang } from '../constants/i18n';
import * as fs from 'fs';
import * as path from 'path';

const KEY = process.env.ELEVEN_API_KEY;
const MODEL = 'eleven_multilingual_v2';

// Her dile o dilin ana dili konuşan sesi
const VOICE_BY_LANG: Partial<Record<Lang, string>> = {
  tr: 'pMQM2vAjnEa9PmfDvgkY', // Sukru Terzi
  en: 'DMyrgzQFny3JI1Y1paM5', // Donovan
  de: 'kaGxVtjLwllv1bi2GFag', // David (de)
  ru: 'rQOBu7YxCDxGiFdTm28w', // Artem Lebedev (ru)
  // fr/es: ses henüz üretilmedi (canlı koç tüm dillerde çalışır)
};

if (!KEY) {
  console.error('HATA: ELEVEN_API_KEY ortam değişkeni gerekli.');
  console.error('Örnek: ELEVEN_API_KEY=sk_xxx npm run gen-audio');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'audio');
fs.mkdirSync(OUT, { recursive: true });

async function synth(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

(async () => {
  const items = getAudioItems();
  console.log(`Toplam ${items.length} klip. Üretim başlıyor...\n`);
  let made = 0;
  const available: string[] = [];

  for (const it of items) {
    const file = path.join(OUT, `${it.key}.mp3`);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) {
      available.push(it.key);
      continue;
    }
    const voiceId = VOICE_BY_LANG[it.lang];
    if (!voiceId) continue; // bu dil için ses tanımlı değil (fr/es)
    try {
      const buf = await synth(it.text, voiceId);
      fs.writeFileSync(file, buf);
      available.push(it.key);
      made++;
      process.stdout.write(`✓ ${it.key}  `);
      if (made % 6 === 0) process.stdout.write('\n');
      await new Promise((r) => setTimeout(r, 250)); // hız limiti için nazik bekleme
    } catch (e: any) {
      console.error(`\n✗ ${it.key}: ${e.message}`);
    }
  }

  // Manifest'i mevcut dosyalara göre üret
  const lines = available
    .filter((k) => fs.existsSync(path.join(OUT, `${k}.mp3`)))
    .map((k) => `  '${k}': require('../assets/audio/${k}.mp3'),`)
    .join('\n');

  const manifest =
    `// OTOMATİK ÜRETİLDİ — elle düzenleme. (npm run gen-audio)\n` +
    `export const AUDIO: Record<string, number> = {\n${lines}\n};\n`;

  fs.writeFileSync(path.join(ROOT, 'constants', 'audioManifest.ts'), manifest);
  console.log(`\n\nBitti. Yeni üretilen: ${made}, toplam mevcut: ${available.length}.`);
  console.log('constants/audioManifest.ts güncellendi.');
})();
