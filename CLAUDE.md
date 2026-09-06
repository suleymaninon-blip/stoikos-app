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
- **Backend**: Cloudflare Worker `stoikos-backend.stoikos-app.workers.dev` (wrangler). Koç (Claude proxy, KV hafıza) + Meydan Okuma (D1). **Otomatik deploy:** `backend/` değişip `main`'e push edilince `.github/workflows/deploy-backend.yml` Worker'ı deploy eder (repo secret `CLOUDFLARE_API_TOKEN`; deploy öncesi tsc). Elle gerekirse `cd backend && npx wrangler deploy`.

## Mimari / Önemli dosyalar
- `constants/i18n.tsx` — 6 dil (TR/EN/DE/RU/FR/ES), `LanguageProvider`, `useLang`, tüm UI metinleri. Dil whitelist'i `LANGUAGES`'tan türer.
- `constants/content.ts` — AUTHORS (15, "tradition" dahil), SOURCES, **164 alıntı** (`QUOTES_RAW`, id 1-164, yenilerde `theme`), **12 kavram** (`CONCEPTS_RAW`, `practice` alanı), egzersizler, koç. `type L = Partial<...>` + `pick()` (eksik dil → İng/TR yedek). `getAudioItems` (yalnız tr/en/de/ru/fr/es kavram sesi).
- `constants/theme.ts` — sıcak altın/taş paleti (`Colors`, `colors`, `Fonts`).
- `constants/config.ts` — `FEATURES.meydanOkuma=false` (gizli), `APP_INFO` (destek e-posta/mağaza linkleri + `privacyUrl` — **PLACEHOLDER, doldurulacak**).
- **Gizlilik politikası**: kaynak `docs/gizlilik-politikasi.md` (md taslak) + yayınlanan `public/gizlilik.html` (export'ta `dist/`'e kopyalanır → `…/stoikos-app/gizlilik.html`). Ayarlar→Hakkında'da "🔒 Gizlilik Politikası" satırı `APP_INFO.privacyUrl`'i açar. İçindeki 〔...〕 alanları + EN çevirisi + avukat kontrolü bekliyor.
- **Kullanım koşulları (EULA)**: `public/terms.html` (TR) + `public/terms-en.html` (EN). Apple abonelik satan uygulamada zorunlu tutuyor, yoksa reddediyor. Gizlilik politikasının tasarımını izler. **Avukat kontrolü bekliyor.** Henüz uygulama içinden bağlantı verilmiyor — Paywall'da yalnızca metin olarak anılıyor, tıklanabilir değil (RevenueCat bağlanırken eklenecek).
- **Mağaza görselleri**: `store-assets/` — ekran görüntüleri (iPhone 1290×2796, Android 1080×1920), Play öne çıkan görseli (1024×500, 6 dil), alfasız kare simgeler. Üretim betikleri `scripts/shoot-store.js`, `scripts/shoot-feature.js`, `scripts/make-store-icons.js`. Ayrıntı ve tuzaklar: `store-assets/README.md`. Ekran görüntüsü çekmek için Expo web sunucusu bu ortamda `--offline` ister (`EXPO_OFFLINE=1 … --offline`), yoksa `api.expo.dev`'e ulaşamayıp çöker.
- `constants/breathSound.ts` — orb nefes sesi: `assets/audio/breath-orb.m4a` (AAC, ~4dk, expo-av, native+web). Orb **basılı tutulunca çalar (döngü), bırakılınca durur**. Sağ üstteki 🔊/🔇 yalnız aç/kapa (sessize alma) tercihi, varsayılan AÇIK. (Eski Web-Audio synth ambiyans kaldırıldı.) `metro.config.js`'e `m4a` assetExt eklendi.
- (Titreşim/haptics özelliği kaldırıldı: `constants/breathHaptics.ts` silindi, orb'daki 📳 toggle çıkarıldı.)
- `constants/audioManifest.ts` — OTOMATİK üretilir (`npm run gen-audio`), 216 mp3. Elle düzenleme.
- `scripts/generate-audio.ts` — ElevenLabs ses üretimi. Sesler: tr=Sukru Terzi, en=Donovan, de=David, ru=Artem Lebedev, fr=Yann, es=Miguel. `npm run gen-audio` (yalnız kavram; `--all` ile hepsi).
- `components/BreathOrb.tsx` — bas-tut nefes orbu: sürekli nefes; basılı tutunca rezonanslı renk parlama; bırakınca normal. Sağ üstte yalnız ses toggle (titreşim kaldırıldı).
- `components/Onboarding.tsx` — ilk açılış **6 slayt**: logo animasyonu (Ω SVG stroke ~4s, sessiz sahne) + dil seçimi + pratik + koç + bilgelik&nefes + hatırlatıcı; `_layout.tsx`'te `stoikos_onboarded` bayrağıyla bir kez. **Tekrar izleme:** İlerleme ekranında "✨ Tanıtımı tekrar göster" butonu → `constants/onboarding.ts` (`replayOnboarding`/`onReplayOnboarding`) bayrağı silip root'taki Onboarding'i canlı tetikler.
- `app/(tabs)/index.tsx` — Ana: selamlama, nefes orbu, günün alıntısı, BUGÜN modül listesi (♥ "Nasıl hissediyorsun?" → /wisdom dahil), süreklilik.
- `app/(tabs)/wisdom.tsx` — Bilgelik: alıntılar. **Mod anahtarı + tek tekerlek** (Alternatif 1): "FİLTRE" altında segment `Filozof | Ruh Hali` (`mode` state) + ayrı **♥ favori** düğmesi; altında moda göre içerik gösteren TEK `WheelSelector` (`key={mode}` ile remount, itemW author=168/mood=132). `switchMode` boyut değişince filtre o boyuta ait değilse 'all'a döner. `filter` tek state: 'all' | 'fav' | authorId | 'mood:<tema>'. Tekerlek: sonsuz döngü, oklar yok, parmakla kaydırma, yanlar perspektifle silik. Altında `wheelCount` ("{n} alıntı"). Boş liste → `ListEmptyComponent` (Favoriler boşsa özel mesaj). Ana ekran mood kısayolu `mode='mood'` yapar. (Eski iki-yığılı tekerlek ve `FilterDropdown` kaldırıldı.) Kavramlar: modal + sesli okuma + pratik bağ. **3. sekme "Filozoflar"**: 10 Stoacı düşünür kartı (`PHILOSOPHERS_RAW`/`getPhilosophers` content.ts; id'ler AUTHORS ile aynı), Kavramlar kart/detay desenini taklit eder (monogram + isim + dönem + tek satır → modal: hikâye + "Stoacılığa katkısı"). Alıntıdaki yazar adı (filozof kartı olanlar) `›` ile dokunulabilir → `openPhilosopher` ile sekme+kart açar (`PHILOSOPHER_IDS`). İçerik TR; diğer diller `pick()` ile TR'ye düşer (çevrilecek).
- `app/(tabs)/coach.tsx` — Claude koç (backend `sendCoach`), `>` ile alıntı parse, sessiz (sesli okuma yok). Başlıkta **kalan ücretsiz hak rozeti** (`getCoachQuota`), hak bitince yazma alanı yerine tek eylem butonu + `components/Paywall.tsx`. Backend 429'da `scope` (`minute`/`day`) döner, çeviri uygulamada (`coach.tooFast`/`coach.dailyLimit`); 402'de balon yok, doğrudan duvar açılır.
- **Sohbet geçmişi kırpma**: backend `MAX_HISTORY_MESSAGES=12` ile kırpar (yetkili yer; `trimHistory` ilk mesajın `user` olmasını garanti eder — Claude şart koşuyor). Uygulama yüklemeyi son 24 mesajla sınırlar. Kırpma güvenli çünkü kalıcı bilgiler `mem:<userId>` hafızasında. Öncesinde maliyet konuşma uzadıkça büyüyordu (50. mesaj 10.'nun ~4 katı, tavansız); şimdi mesaj başına sabit ~$0,025.
- `app/(tabs)/practice.tsx`, `progress.tsx` (İlerleme: **yalnız istatistik** — süreklilik/haftalık/son7/egzersiz dağılımı/söz; sağ üstte ⚙ → Ayarlar).
- `app/settings.tsx` — **Ayarlar** (push'lu ekran, ⚙ ile açılır): dil, bildirim, ✨ tanıtımı tekrar göster, 🧠 koç hafıza reset, Destek & Hakkında, sürüm, admin (Meydan Okuma bayrağı arkasında). Ayarlar buraya İlerleme'den taşındı.
- `app/journal.tsx` — **Yansımaların** (push'lu, Pratik'teki "Geçmiş →" linkiyle açılır): geçmiş günlük yansımalar, tarihli kartlar (AsyncStorage `stoikos_journal_<tarih>`). Günlük yansıma kaydedilince, **yalnız kullanıcı açık rıza verdiyse** (KVKK; `COACH_CONSENT_KEY='stoikos_journal_coach_consent'`, **varsayılan KAPALI**, günlük kartındaki onay kutusu) koç hafızasına işlenir: `addReflectionToMemory` (api.ts) → backend `POST /memory/note` → `updateMemory` ile KV'ye merge (günde 20 limit). Rıza kapalıyken yansıma **yalnız cihazda** kalır, hiçbir yere gönderilmez. (Bekleyen: gizlilik politikası metni.)
- `app/programs.tsx` + `constants/programs.ts` — **Programlar**: rehberli çok günlük yolculuklar. 2 program × 7 gün (Kontrol Dairesi, İç Sakinlik), altı dilde tam (fr/es Eylül 2026'da eklendi). İlerleme cihazda (`stoikos_program_<id>`), her gün bir öncekini tamamlayınca açılıyor. Ana ekrandan erişiliyor. **Elde tutmanın en ucuz kaldıracı burası** — üretim maliyeti yalnız metin, ve koç aboneliğinin aksine ChatGPT ikame edemez.
- `app/challenge*.tsx`.
- `app/breathe.tsx` — eski tam ekran nefes (artık erişilemez, silinmedi).

## Önemli kararlar
- Para modeli: içerik gömülü (bedava), koç tek canlı maliyet → freemium (koç abonelik olacak).
- Mood temaları yalnız 128 yeni alıntıda var; eski 36'da yok (Tümü'de hepsi görünür).
- Meydan Okuma feature flag arkasında gizli (kod/D1 duruyor).

## BEKLEYEN İŞLER (öncelik sırası)

> 📋 **Ürün ve pazar değerlendirmesi: `docs/urun-degerlendirmesi.md`**
> (Eylül 2026). Uygulama baştan sona incelendi; içerik envanteri, bulgular,
> rakip ve fiyat verisi orada. Çıkan **yayın öncesi** dört madde:
> 1. ✅ ~~Atıf dilini yumuşat~~ — yapıldı (6 Eylül 2026). Uyarlama işareti
>    künyenin parçası oldu (`content.ts` → `sourceName`): "Meditationes ·
>    serbest uyarlama", altı dilde. Kart, paylaşım metni ve paylaşım görseli
>    üçü birden düzeldi. Koç promptuna uydurma atıf yasağı eklendi.
> 2. **Ücretsiz kotayı yenilenen hakka çevir** — 5 ömür boyu mesaj, satılan
>    özelliğin (hafıza) yaşanmasını yapısal olarak engelliyor.
> 3. **Yıllık plan ekle** — kategorinin ana gelir kanalı; aylık planla ücretli
>    reklam matematiksel olarak geri dönmüyor.
> 4. **Değerlendirme istemi ekle** (`expo-store-review`) — hiç yok; organik
>    keşfin en güçlü kaldıracı.

1. ✅ ~~Koç backend rate limit~~ — KV tabanlı (`hitLimit`/`coachRateLimited`, `backend/src/index.ts`). userId: 6/dk + 120/gün; IP (`CF-Connecting-IP`): 12/dk + 300/gün. Aşımda 429 + Türkçe `reason`. Frontend: `sendCoach` 429'da `e.userMessage`, coach.tsx onu balon olarak gösterir. Deploy edildi + canlı test geçti.
2. ✅ ~~`constants/content.ts` alıntılar & filozoflar çevirisi~~ — Alıntılar 37–164 (128 adet) + 10 filozof tüm alanları EN/DE/RU/FR/ES'e çevrildi (commit 6ed2b650).
3. ✅ ~~Logo animasyon sahnesi~~ — Tanıtım turuna slayt 0 olarak eklendi: `LogoSceneBoundary` (SVG stroke draw ~2.5s → nefes parlaması → STOIKOS fade-in); native hata için `OmegaFallback` + ErrorBoundary.
4. ✅ ~~Alan adı & e-posta~~ — `stoikos.app` (Squarespace), DNS Cloudflare'e bağlandı, `support@stoikos.app` → Gmail yönlendirmesi aktif.
5. ✅ ~~Gizlilik politikası~~ — TR (`public/gizlilik.html`) + EN (`public/privacy.html`) tamamlandı, GitHub Pages'te yayında. Ayarlar'da dile göre doğru link açılıyor. **Kalan: avukat kontrolü.**
6. ✅ ~~`config.ts` destek e-postası~~ — `support@stoikos.app` güncellendi.
7. 💳 **Para modeli: STOIKOS PLUS** (6 Eylül 2026'da genişletildi)
   👉 Gerekçe `docs/urun-degerlendirmesi.md`, mağaza süreci `docs/magazaya-cikis.md`.
   - **Hep ücretsiz:** 164 alıntı, 12 kavram, 10 filozof, nefes orbu, günlük pratik, ilerleme. İndirme sebebi ve mağaza puanı motoru burası; kapatılmıyor.
   - **Plus:** koç, tüm programlar, kavramların sesli anlatımı, sonradan eklenen içerik. **$6,99/ay veya $49,99/yıl** (%40 tasarruf, yıllık önseçili), **14 gün ücretsiz deneme.**
   - **Neden genişletildi:** yalnız koç satmak, taklit edilmesi en kolay şeyi satıp taklit edilmesi zor olan her şeyi bedava vermek demekti. Sektör verisi de yapay zekâ aboneliklerinin en kötü elde tutan tür olduğunu gösteriyor (aylık planda 12. ay %6,1 — RevenueCat). Paket, kullanıcı koçtan sıkıldığında da ayakta kalıyor. Ayrım: **metalaşmış olan bedava, üretilmiş olan paralı.**
   - **Deneme uygulamada SAYILMIYOR** — mağazanın *introductory offer* mekanizmasıyla veriliyor, makbuza ve Apple ID / Google hesabına bağlı, silip kurunca sıfırlanmıyor. Kendi sayacımız `userId` cihazda üretildiği için baypas edilirdi. Deneme sürerken RevenueCat kullanıcıyı zaten abone döner.
   - **Tek yetki kaynağı:** `constants/entitlement.tsx` → `usePlus()`, backend `GET /entitlement`. Ağ hatasında son bilinen değer önbellekten kullanılır (abone çevrimdışı erişimini kaybetmesin). Kapılar: `app/programs.tsx`, `app/(tabs)/wisdom.tsx` (sesli anlatım); koç zaten sunucuda korunuyor.
   - ⚠️ **Yerel içeriğin kilidi istemcide** — programlar ve ses uygulamayla birlikte geliyor, kilit bir hız kesici, kırılmaz duvar değil. Bilerek kabul edildi; asıl kapı koçta ve o sunucuda.
   - `hasActiveSubscription()` hâlâ KV stub'ı (`sub:<userId>`=`'1'`). Gerçek doğrulama **sunucuda** RevenueCat REST ile yapılacak; `appUserId` = bizim `userId`.
   - ✅ Bitti: EULA (TR+EN), ödeme ekranında fiyat/süre/koşullar metni, atıf dili yumuşatıldı, Plus paketi + kapılar + 6 dilde metinler, mağaza metinleri yeni modele göre güncellendi.
   - ⏸️ **`FREE_COACH_MESSAGES` bilerek 50'de bırakıldı.** RevenueCat bağlanmadan düşürülmemeli: `backend/` `main`'e girince Worker deploy oluyor ve kullanıcı satın alınamayan bir duvara çarpar.
   - ⏳ Kalan: **RevenueCat** (`Paywall`'ın `onSubscribe` prop'u artık seçilen planı alıyor: `(plan: 'annual' | 'monthly') => void`; verilmezse buton kasten "YAKINDA"), **yerelleştirilmiş fiyat** (dört fiyat dizesi de sabit yazılı, RevenueCat'ten gelmeli), **EULA'ya tıklanabilir bağlantı**.
8. 🏪 **Mağaza materyalleri** — metinler ve **görseller hazır**.
   - Metinler: 6 dil, karakter sınırları doğrulanmış (bağlantı `docs/magazaya-cikis.md` içinde).
   - Görseller: `store-assets/` — ekran görüntüleri, Play öne çıkan görseli, alfasız simgeler. Üretim betikleriyle birlikte, yeniden çekmek tek komut.
   - Kalan: `config.ts` `storeUrl` (yayına girmeden doldurulamaz), yaş sınırı anketi, kategori seçimi.
9. 🎬 **Video teaser** — 20 sn konsept hazır (storyboard + 6 dilde seslendirme + prodüksiyon künyesi), bağlantı `docs/magazaya-cikis.md` → Pazarlama. Çekilebilir; yalnız kapanıştaki "bio'da link" için yayın beklesin.
10. 🍎 **Apple Developer kaydı takıldı** — 2FA açık ama kayıt "tamamlanamadı" veriyor, hesap programa kayıtlı değil, $99 ödenmedi. Sırayla denenecek: bekleyip tekrar → Apple Developer **uygulamasından** kayıt → Developer Support. Ayrıntı `docs/magazaya-cikis.md`.
11. 🤖 **Google Play** — hesap açık, üç doğrulama bekliyor (kimlik, telefon, **Android cihaz**). Elde Android telefon yok, bu çözülmeden Play'de uygulama oluşturulamıyor.
12. 🔊 Orb sesi: mevcut `assets/audio/breath-orb.m4a` çalışıyor; seamless loop istenirse değiştirilebilir.

## Güvenlik
- ElevenLabs anahtarı paylaşıldıysa **iptal/yenile**.
