# STOIKOS — Proje Durumu & Devam Notları

> Bu dosya, yeni bir Claude Code oturumunun projeyi hızla devralması için yazıldı.
> Stoacı felsefe + mindfulness mobil uygulaması (Expo / React Native, expo-router).

## Çalıştırma
- Proje kökü: `~/stoikos` (iCloud/TCC sorunları için Desktop'tan taşındı).
- Web önizleme: `EXPO_BASE_URL= npx expo start --web --port 8081`
- Telefonda (Expo Go, native): `npx expo start --tunnel --port 8082` → QR okut.
- tsc: `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` (backend/ hataları Cloudflare tipleri, alakasız).
- Web yayını: `EXPO_BASE_URL=/stoikos-app node node_modules/expo/bin/cli export --platform web`

## Yayın / Deploy
- **GitHub Pages**: https://suleymaninon-blip.github.io/stoikos-app (push to `main` → GitHub Action otomatik deploy). Test edenler bu linki kullanıyor.
- **app.json** `experiments.baseUrl: "/stoikos-app"` ŞART (kaldırılırsa web "Unmatched Route" verir). Web-only; native'i etkilemez.
- **Otomatik güncelleme (web):** `public/sw.js` (ağ-öncelikli HTML → bayat sürüm kalmaz, hash'li varlık cache-first, skipWaiting+clientsClaim, eski cache temizlenir) + `constants/registerSW.ts` (`_layout.tsx`'te çağrılır; native no-op; yeni sürümde açık sekmeyi 1 kez otomatik yeniler; `readyState` guard'lı). Test edenlerin cache temizleme derdi bitti. SW yolu `process.env.EXPO_BASE_URL`'den türer (export'ta gömülür).
- **Backend**: Cloudflare Worker `stoikos-backend.stoikos-app.workers.dev` (wrangler). Koç (Claude proxy, KV hafıza) + Meydan Okuma (D1). Değişince `cd backend && npx wrangler deploy`.

## Mimari / Önemli dosyalar
- `constants/i18n.tsx` — 6 dil (TR/EN/DE/RU/FR/ES), `LanguageProvider`, `useLang`, tüm UI metinleri. Dil whitelist'i `LANGUAGES`'tan türer.
- `constants/content.ts` — AUTHORS (15, "tradition" dahil), SOURCES, **164 alıntı** (`QUOTES_RAW`, id 1-164, yenilerde `theme`), **12 kavram** (`CONCEPTS_RAW`, `practice` alanı), egzersizler, koç. `type L = Partial<...>` + `pick()` (eksik dil → İng/TR yedek). `getAudioItems` (yalnız tr/en/de/ru/fr/es kavram sesi).
- `constants/theme.ts` — sıcak altın/taş paleti (`Colors`, `colors`, `Fonts`).
- `constants/config.ts` — `FEATURES.meydanOkuma=false` (gizli), `APP_INFO` (destek e-posta/mağaza linkleri — **PLACEHOLDER, doldurulacak**).
- `constants/breathSound.ts` — Web Audio doğa ambiyansı (placeholder; gerçek ses kaydıyla değiştirilecek). Web-only.
- (Titreşim/haptics özelliği kaldırıldı: `constants/breathHaptics.ts` silindi, orb'daki 📳 toggle çıkarıldı.)
- `constants/audioManifest.ts` — OTOMATİK üretilir (`npm run gen-audio`), 216 mp3. Elle düzenleme.
- `scripts/generate-audio.ts` — ElevenLabs ses üretimi. Sesler: tr=Sukru Terzi, en=Donovan, de=David, ru=Artem Lebedev, fr=Yann, es=Miguel. `npm run gen-audio` (yalnız kavram; `--all` ile hepsi).
- `components/BreathOrb.tsx` — bas-tut nefes orbu: sürekli nefes; basılı tutunca rezonanslı renk parlama; bırakınca normal. Sağ üstte yalnız ses toggle (titreşim kaldırıldı).
- `components/Onboarding.tsx` — ilk açılış 4 slayt (dil seçimi, pratik, koç, bilgelik&nefes) + hatırlatıcı; `_layout.tsx`'te `stoikos_onboarded` bayrağıyla bir kez.
- `app/(tabs)/index.tsx` — Ana: selamlama, nefes orbu, günün alıntısı, BUGÜN modül listesi (♥ "Nasıl hissediyorsun?" → /wisdom dahil), süreklilik.
- `app/(tabs)/wisdom.tsx` — Bilgelik: alıntılar. **Mod anahtarı + tek tekerlek** (Alternatif 1): "FİLTRE" altında segment `Filozof | Ruh Hali` (`mode` state) + ayrı **♥ favori** düğmesi; altında moda göre içerik gösteren TEK `WheelSelector` (`key={mode}` ile remount, itemW author=168/mood=132). `switchMode` boyut değişince filtre o boyuta ait değilse 'all'a döner. `filter` tek state: 'all' | 'fav' | authorId | 'mood:<tema>'. Tekerlek: sonsuz döngü, oklar yok, parmakla kaydırma, yanlar perspektifle silik. Altında `wheelCount` ("{n} alıntı"). Boş liste → `ListEmptyComponent` (Favoriler boşsa özel mesaj). Ana ekran mood kısayolu `mode='mood'` yapar. (Eski iki-yığılı tekerlek ve `FilterDropdown` kaldırıldı.) Kavramlar: modal + sesli okuma + pratik bağ.
- `app/(tabs)/coach.tsx` — Claude koç (backend `sendCoach`), `>` ile alıntı parse, sessiz (sesli okuma yok).
- `app/(tabs)/practice.tsx`, `progress.tsx` (İlerleme: istatistik + dil + bildirim + koç hafıza reset + **Destek & Hakkında** menüsü + admin), `app/programs.tsx`, `challenge*.tsx`.
- `app/breathe.tsx` — eski tam ekran nefes (artık erişilemez, silinmedi).

## Önemli kararlar
- Para modeli: içerik gömülü (bedava), koç tek canlı maliyet → freemium (koç abonelik olacak).
- Mood temaları yalnız 128 yeni alıntıda var; eski 36'da yok (Tümü'de hepsi görünür).
- Meydan Okuma feature flag arkasında gizli (kod/D1 duruyor).

## BEKLEYEN İŞLER (öncelik sırası)
1. ✅ ~~Koç backend rate limit~~ — KV tabanlı (`hitLimit`/`coachRateLimited`, `backend/src/index.ts`). userId: 6/dk + 120/gün; IP (`CF-Connecting-IP`): 12/dk + 300/gün. Aşımda 429 + Türkçe `reason`. Frontend: `sendCoach` 429'da `e.userMessage`, coach.tsx onu balon olarak gösterir. Deploy edildi + canlı test geçti.
2. 💳 **Para kazanma**: RevenueCat ödeme duvarı + koç'u aboneliğe gate + EAS native build + mağaza (Apple $99/yıl, Google $25).
3. 📧 `constants/config.ts` `APP_INFO`: gerçek destek e-postası + mağaza linkleri.
4. 🔒 Gizlilik politikası + KVKK/şartlar (mağaza zorunlu).
5. 🌐 fr/es için 164 alıntının çevirisi (şu an TR'ye düşüyor; kavramlar+UI tam).
6. 🔊 Orb sesini gerçek doğa kaydıyla değiştir (expo-av + .mp3).
7. 🏪 Mağaza materyalleri (ekran görüntüleri, açıklamalar, eas.json).

## Güvenlik
- ElevenLabs anahtarı paylaşıldıysa **iptal/yenile**.
