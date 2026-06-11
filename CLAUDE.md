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
- `constants/config.ts` — `FEATURES.meydanOkuma=false` (gizli), `APP_INFO` (destek e-posta/mağaza linkleri + `privacyUrl` — **PLACEHOLDER, doldurulacak**).
- **Gizlilik politikası**: kaynak `docs/gizlilik-politikasi.md` (md taslak) + yayınlanan `public/gizlilik.html` (export'ta `dist/`'e kopyalanır → `…/stoikos-app/gizlilik.html`). Ayarlar→Hakkında'da "🔒 Gizlilik Politikası" satırı `APP_INFO.privacyUrl`'i açar. İçindeki 〔...〕 alanları + EN çevirisi + avukat kontrolü bekliyor.
- `constants/breathSound.ts` — orb nefes sesi: `assets/audio/breath-orb.m4a` (AAC, ~4dk, expo-av, native+web). Orb **basılı tutulunca çalar (döngü), bırakılınca durur**. Sağ üstteki 🔊/🔇 yalnız aç/kapa (sessize alma) tercihi, varsayılan AÇIK. (Eski Web-Audio synth ambiyans kaldırıldı.) `metro.config.js`'e `m4a` assetExt eklendi.
- (Titreşim/haptics özelliği kaldırıldı: `constants/breathHaptics.ts` silindi, orb'daki 📳 toggle çıkarıldı.)
- `constants/audioManifest.ts` — OTOMATİK üretilir (`npm run gen-audio`), 216 mp3. Elle düzenleme.
- `scripts/generate-audio.ts` — ElevenLabs ses üretimi. Sesler: tr=Sukru Terzi, en=Donovan, de=David, ru=Artem Lebedev, fr=Yann, es=Miguel. `npm run gen-audio` (yalnız kavram; `--all` ile hepsi).
- `components/BreathOrb.tsx` — bas-tut nefes orbu: sürekli nefes; basılı tutunca rezonanslı renk parlama; bırakınca normal. Sağ üstte yalnız ses toggle (titreşim kaldırıldı).
- `components/Onboarding.tsx` — ilk açılış **6 slayt**: logo animasyonu (Ω SVG stroke ~4s, sessiz sahne) + dil seçimi + pratik + koç + bilgelik&nefes + hatırlatıcı; `_layout.tsx`'te `stoikos_onboarded` bayrağıyla bir kez. **Tekrar izleme:** İlerleme ekranında "✨ Tanıtımı tekrar göster" butonu → `constants/onboarding.ts` (`replayOnboarding`/`onReplayOnboarding`) bayrağı silip root'taki Onboarding'i canlı tetikler.
- `app/(tabs)/index.tsx` — Ana: selamlama, nefes orbu, günün alıntısı, BUGÜN modül listesi (♥ "Nasıl hissediyorsun?" → /wisdom dahil), süreklilik.
- `app/(tabs)/wisdom.tsx` — Bilgelik: alıntılar. **Mod anahtarı + tek tekerlek** (Alternatif 1): "FİLTRE" altında segment `Filozof | Ruh Hali` (`mode` state) + ayrı **♥ favori** düğmesi; altında moda göre içerik gösteren TEK `WheelSelector` (`key={mode}` ile remount, itemW author=168/mood=132). `switchMode` boyut değişince filtre o boyuta ait değilse 'all'a döner. `filter` tek state: 'all' | 'fav' | authorId | 'mood:<tema>'. Tekerlek: sonsuz döngü, oklar yok, parmakla kaydırma, yanlar perspektifle silik. Altında `wheelCount` ("{n} alıntı"). Boş liste → `ListEmptyComponent` (Favoriler boşsa özel mesaj). Ana ekran mood kısayolu `mode='mood'` yapar. (Eski iki-yığılı tekerlek ve `FilterDropdown` kaldırıldı.) Kavramlar: modal + sesli okuma + pratik bağ. **3. sekme "Filozoflar"**: 10 Stoacı düşünür kartı (`PHILOSOPHERS_RAW`/`getPhilosophers` content.ts; id'ler AUTHORS ile aynı), Kavramlar kart/detay desenini taklit eder (monogram + isim + dönem + tek satır → modal: hikâye + "Stoacılığa katkısı"). Alıntıdaki yazar adı (filozof kartı olanlar) `›` ile dokunulabilir → `openPhilosopher` ile sekme+kart açar (`PHILOSOPHER_IDS`). İçerik TR; diğer diller `pick()` ile TR'ye düşer (çevrilecek).
- `app/(tabs)/coach.tsx` — Claude koç (backend `sendCoach`), `>` ile alıntı parse, sessiz (sesli okuma yok).
- `app/(tabs)/practice.tsx`, `progress.tsx` (İlerleme: **yalnız istatistik** — süreklilik/haftalık/son7/egzersiz dağılımı/söz; sağ üstte ⚙ → Ayarlar).
- `app/settings.tsx` — **Ayarlar** (push'lu ekran, ⚙ ile açılır): dil, bildirim, ✨ tanıtımı tekrar göster, 🧠 koç hafıza reset, Destek & Hakkında, sürüm, admin (Meydan Okuma bayrağı arkasında). Ayarlar buraya İlerleme'den taşındı.
- `app/journal.tsx` — **Yansımaların** (push'lu, Pratik'teki "Geçmiş →" linkiyle açılır): geçmiş günlük yansımalar, tarihli kartlar (AsyncStorage `stoikos_journal_<tarih>`). Günlük yansıma kaydedilince, **yalnız kullanıcı açık rıza verdiyse** (KVKK; `COACH_CONSENT_KEY='stoikos_journal_coach_consent'`, **varsayılan KAPALI**, günlük kartındaki onay kutusu) koç hafızasına işlenir: `addReflectionToMemory` (api.ts) → backend `POST /memory/note` → `updateMemory` ile KV'ye merge (günde 20 limit). Rıza kapalıyken yansıma **yalnız cihazda** kalır, hiçbir yere gönderilmez. (Bekleyen: gizlilik politikası metni.)
- `app/programs.tsx`, `challenge*.tsx`.
- `app/breathe.tsx` — eski tam ekran nefes (artık erişilemez, silinmedi).

## Önemli kararlar
- Para modeli: içerik gömülü (bedava), koç tek canlı maliyet → freemium (koç abonelik olacak).
- Mood temaları yalnız 128 yeni alıntıda var; eski 36'da yok (Tümü'de hepsi görünür).
- Meydan Okuma feature flag arkasında gizli (kod/D1 duruyor).

## BEKLEYEN İŞLER (öncelik sırası)
1. ✅ ~~Koç backend rate limit~~ — KV tabanlı (`hitLimit`/`coachRateLimited`, `backend/src/index.ts`). userId: 6/dk + 120/gün; IP (`CF-Connecting-IP`): 12/dk + 300/gün. Aşımda 429 + Türkçe `reason`. Frontend: `sendCoach` 429'da `e.userMessage`, coach.tsx onu balon olarak gösterir. Deploy edildi + canlı test geçti.
2. ✅ ~~`constants/content.ts` alıntılar & filozoflar çevirisi~~ — Alıntılar 37–164 (128 adet) + 10 filozof tüm alanları EN/DE/RU/FR/ES'e çevrildi (commit 6ed2b650).
3. ✅ ~~Logo animasyon sahnesi~~ — Tanıtım turuna slayt 0 olarak eklendi: `LogoSceneBoundary` (SVG stroke draw ~2.5s → nefes parlaması → STOIKOS fade-in); native hata için `OmegaFallback` + ErrorBoundary.
4. 💳 **Para kazanma**: RevenueCat ödeme duvarı + koç'u aboneliğe gate + EAS native build + mağaza (Apple $99/yıl, Google $25).
4. 📧 `constants/config.ts` `APP_INFO`: gerçek destek e-postası + mağaza linkleri.
5. 🔒 Gizlilik politikası: taslak + yayın + uygulama içi link **hazır** (`public/gizlilik.html`, `docs/gizlilik-politikasi.md`). **KALAN:**
   - (kullanıcı) 〔...〕 alanlarını doldurur (ad/unvan, adres, **gerçek destek e-postası**, yaş sınırı, tarih).
   - ⏳ **Kullanıcı doldurunca → `gizlilik.html`'i İngilizceye çevir** (`gizlilik-en.html` + Hakkında'da link / dile göre seç). Gerekiyorsa DE/RU/FR/ES.
   - `config.ts` `supportEmail` placeholder'ını gerçeğiyle değiştir.
   - Avukat/danışman son kontrolü.
6. 🔊 Orb sesi: gerçek dosya (`assets/audio/breath-orb.m4a`) **eklendi**; istenirse daha kısa/seamless loop'a uygun kesitle değiştirilebilir.
7. 🏪 Mağaza materyalleri (ekran görüntüleri, açıklamalar, eas.json).

## Güvenlik
- ElevenLabs anahtarı paylaşıldıysa **iptal/yenile**.
