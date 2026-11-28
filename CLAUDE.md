# STOIKOS — Güncel Kurallar & Bekleyen İşler

> Stoacı felsefe + mindfulness mobil uygulaması (Expo / React Native, expo-router).
> Bu dosya yalnız **bugün geçerli** kuralları, yapıyı ve bekleyen işleri tutar.
> Ayrıntılı geçmiş (hangi hata nasıl bulundu, tasarım bağlantıları, eski sürümler, video
> üretim notları): **`docs/tarihce.md`** — bir şeyin neden öyle olduğunu merak edince
> önce orada ara (ör. `grep -n "Kontrol Eleği" docs/tarihce.md`).
> Yeni ayrıntılı not → `docs/tarihce.md` sonuna, tarihli. Buraya yalnız kural/karar özeti.

## Çalışma biçimi (kullanıcı tercihleri)
- Kullanıcıya **"Süleyman"** diye hitap et, Türkçe yaz; teknik terimleri sade anlat.
- Büyük ekran değişikliğinde **önce tasarım** (artifact: solda önce/sonra, sağda dokunulabilir prototip), onaydan sonra uygula. Küçük düzeltmeleri doğrudan yap.
- İstenen neyse onu yap; istenmeyen yeniden tasarımı uygulama (öner, bekle).
- Akış: oturumun `claude/…` dalı → PR → squash merge → dalı `origin/main`'e sıfırla → Cloudflare derlemesini bekle (GitHub check-runs) → özet. Commit sonu: `Co-Authored-By` + `Claude-Session:` satırı.
- Dış araçta (Gemini vb.) yazdırılmış kod gelirse: fark + tsc + ekran görüntüsüyle kontrol et; proje kurallarını (Hareketi Azalt, metindeki oklar, notlar, ortak bileşenler) bilmez. Açılış kodu yazdırılacaksa `docs/acilis/dis-arac-kurallari.md` verilir.
- Bir madde bitince: bu dosyadaki bekleyen işten çıkar, `docs/yayin-oncesi/eksikler.html` → `node docs/yayin-oncesi/make-pdf.js`.

## Çalıştırma & doğrulama
- Web önizleme: `EXPO_BASE_URL= npx expo start --web --port 8081` (bu ortamda `EXPO_OFFLINE=1 … --offline` şart).
- Telefonda (Expo Go): `npx expo start --tunnel --port 8082`.
- tsc: `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json` + `cd backend && npx tsc --noEmit` (ikisi de temiz çıkmalı).
- Site: `EXPO_OFFLINE=1 bash scripts/build-site.sh` → `site/`; statik sunucu + Playwright ekran görüntüsü. Canlı stoikos.app bu ortamdan açılmıyor.
- ES2019 kontrolü: `npx acorn --ecma2019 site/app/_expo/static/js/web/*.js`. Babel değişince `npx expo export -c`.
- Yeni route sonrası tsc `router.push` hatası verirse: expo web'i birkaç saniye çalıştır (`.expo/types/router.d.ts` yenilenir).
- Koç web'de: istek `page.route('**/coach', …)` ile taklit edilir (sunucuya erişim yok). Saat taklidi: Playwright `clock`.
- Native derleme (EAS): `docs/eas-build.md`; GitHub Actions → **EAS Build** (sır `EXPO_TOKEN`). Yeni ikon/splash/native modül yalnız yeni EAS derlemesinde görünür.

## Yayın / Deploy
- **Site https://stoikos.app** = Cloudflare Pages `stoikos-app`; `main`'e push → otomatik derleme (`bash scripts/build-site.sh`, çıktı `site`). Diğer dallar önizleme.
  - `/` tanıtım sayfası `website/index.html` (TR/EN, sözlük sayfadaki `EN` nesnesi; foto yuvaları `PHOTOS`; `.hero .photo` `z-index:-2` şart). `/app/` Expo web. Yasal: `/gizlilik.html`, `/privacy.html`, `/terms.html`, `/terms-en.html`. `/404.html` → `/app/`.
  - `app.json` `experiments.baseUrl: "/app"` = `build-site.sh` içindeki `BASE` (farklıysa Unmatched Route / 404).
  - Cloudflare `node_modules` klasörlerini yayınlamaz → build betiği `assets/vendor/` yapar; dist'te `node_modules` kalırsa derleme hata verir.
  - Babel yalnız web için ES2022 sözdizimini dönüştürür (eski Safari'de beyaz ekran olmasın).
  - Site yazı tipleri kendi sunucumuzda (`website/fonts/`); **`fonts.googleapis.com` kullanma**.
  - Görseller: iStock/Shutterstock/Getty (filigranlı) **yasak**; Unsplash/Pexels'i kullanıcı indirip gönderir.
- ⚠️ DNS'te **MX ve TXT** kayıtlarına dokunma (`support@stoikos.app`, Cloudflare Email Routing).
- GitHub Pages yalnız eski adresten yönlendirme (`.github/workflows/deploy.yml`).
- Web otomatik güncelleme: `public/sw.js` + `constants/registerSW.ts`.
- **Backend**: Cloudflare Worker `stoikos-backend.stoikos-app.workers.dev` (`backend/`). `backend/` değişip `main`'e girince **otomatik deploy** olur (`deploy-backend.yml`) — sunucu davranışını değiştiren her şey hemen canlıya çıkar. Koç (Claude proxy, KV hafıza), D1: meydan okuma, birlikte nefes, Stoa nabzı. Tablolar ilk istekte kurulur. Yerel deneme `wrangler dev --local`.

## Kod kuralları (yeni kod yazarken)
**Tema**
- `const makeStyles = (Colors: Palette) => StyleSheet.create({...})` + `const styles = useStyles(makeStyles)`; satır içi renk `const { C: Colors } = useTheme()`. Modül düzeyinde renk sabiti, `'#…'`/`rgba(…)` yazma → palet anahtarı ya da `Colors.tint/overlay/moonA/petal`. Vurgulu düğmede yazı `Colors.onAccent`, uyarı `Colors.danger`.
- Bilerek **temasız (klasik siyah-altın)**: söz paylaşım kartı + görseli, Hayat haftaları duvar kağıdı, `StoikosMark`, native splash/ikon (`PALETTES.classic`).
- Her `TextInput`'ta `keyboardAppearance` temaya göre.

**Yazı**
- Ekran kodu klasik adları yazar (`Fonts.cinzel`, `Fonts.jost`…); `useStyles` setlere çevirir ve ölçekler. **Satır içi `fontFamily`/`fontSize` dönüşmez → yazı stilini `makeStyles`'a koy.**
- En küçük yazı **11 px**; uzun okuma metni **16 px / 24–26 satır**; yazı alanı 16 px (iOS yakınlaştırmasın).
- Uzun metinde italik yok; italik yalnız kısa alıntı/başlık.
- Büyük harf: `textTransform: 'uppercase'` değil **`upper(s, lang)`** (Türkçe İ). Tarihte `capitalize` kullanma.
- Cinzel'de Kiril yok → RU başlıklar Cormorant'a düşer.
- 6 dil (TR/EN/DE/RU/FR/ES) her yeni metinde tam (`constants/i18n.tsx`). Bazı metinlerde ok (→) zaten var (`home.*`, `practice.journalHistory/readMore`, `wisdom.more`…) — kodda ikinci ok ekleme.

**Simge**
- Emoji karşılığı olan glif kullanma (☀ ♥ ✉ ↗ 🔔 …: iOS renkli çizer) → `components/Icons.tsx` SVG simgeleri.
- Bir stili hem View/SVG'ye hem `<Text>`'e uygulama (metin glifi `fontSize`+`color` ister).

**Hareket**
- Ortak bileşenler: `CalmPressable` (basınca içe göçme; `flex` dıştaki Pressable'a da), `StaggerSection` (sırayla belirme, açılış animasyonunu bekler `onIntroDone`). Kopyasını yazma.
- Her hareket **Hareketi Azalt**'a uyar (`hooks/useReduceMotion.ts`). Native driver yalnız `transform`/`opacity`.
- ScrollView içinde doğrudan duran `CalmPressable` tam genişliğe yayılır → küçük düğmeyi `flexDirection:'row'` satıra koy.
- `PaperBg` (kâğıt dokusu) kendini kırpar; karta **`overflow:'hidden'` verme** (iOS gölgeyi siler).
- `FirstTip`: kök View `ref={container}`, hedef `ref={target}` + `collapsable={false}`, bileşen kökün son çocuğu; anahtar `stoikos_tip_<id>`.

**Platform / veri**
- `Alert.alert` web'de no-op → **`constants/dialog.ts`** (`notify`, `confirmAction`).
- Hatırlatıcı/bildirim web'de yok (`REMINDERS_SUPPORTED`); yalnız native'de test edilir.
- Tarih anahtarı ayrıştırma: `new Date("Mon Nov 23 2026")` değil **`parseDayKey`**.
- Günlük: tek yetki `constants/journal.ts`; anahtar `stoikos_journal_<toDateString>`, günde tek kayıt, **ekle, üzerine yazma** (`appendToJournalToday`). `stoikos_journal_` önekiyle günlük dışı anahtar açma (rıza anahtarı istisnası `loadJournalEntries`'te atlanıyor).
- Egzersiz/nefes kaydı: `stoikos_completed_<tarih>` — depodan okuyup tek öğe ekle/çıkar (üzerine yazma).
- Ekranlar başka ekranın yazdığını ezmesin: odaklanınca depodan yeniden oku (`useFocusEffect`); "Tüm verilerimi sil" → `constants/dataReset.ts` olayını dinle.
- Sunucu cevabını doğrula (eksik alan ekranı çökertmesin).
- Bütün depolama anahtarları `stoikos_` önekli ("Tüm verilerimi sil" bunlara bakar).

## İçerik kuralları
- **Alıntı**: söz gerçekten o yazarda geçmeli (eser/bölüm bilinmeli), internet sözlerine güvenme, tekrar etmesin. Künye "serbest uyarlama" (`sourceName`). 142–164 "Stoacı Gelenek" bilerek kişiye atfedilmiyor. Paylaşım kartlarında yalnız uygulamadaki doğrulanmış sözler.
- **Kavram metni** (`CONCEPTS_RAW.desc`): beş adım (yaşanan andan aç · "sen" · yanlış anlaşılmayı çürüt · tek imge kendi paragrafında · duyguyla kapan), akademik gönderme yok. ⚠️ **İlk paragrafa dokunma** (ses + kart önizlemesi oradan; değişirse `npm run gen-audio`). Yeni kavram → çizimi `scripts/brand/concept-icons.js`.
- **Ses**: `assets/audio` 72 kavram mp3'ü (~20 MB); gömülü sesi uzatma (önce talep üzerine indirme mimarisi). Yeni ses MP3 olsun, `ffmpeg -i` ile akışları ve ilk 5 sn seviyesini ölç. iOS: `play()` dokunuşla aynı görevde, araya `await` yok (`createAsync(..., {shouldPlay:true})`). `constants/audioManifest.ts` otomatik (`npm run gen-audio`, ElevenLabs).
- **Yeni program** (`constants/programs.ts` → `PROGRAMS_RAW`): ayrı simge + renk; her gün `read` (≈1 dk, beş adım) + `ask` (akşam sorusu) + `body`, 6 dilde; `TRACE_MOTIFS` + `TRACE_RGB` (`constants/traces.ts`) + `trace.m.<id>` (6 dil) + Gemini sikkesi (`docs/izler/gemini-komutlari.md`, `bash scripts/brand/cut-trace-coins.sh <id>`). Stokta bekleyen: `upcoming: true`; yayın = `releaseAt: 'YYYY-MM-DD'` (o gün kendiliğinden açılır). Akış: TR konu+başlıklar → onay → TR tam metin → onay → 6 dil JSON (`docs/programlar/`). Zor konularda (yas, beden, tükenmişlik) uzman/güvenlik notu.
- **Günde bir gün** (28 Kasım 2026, kullanıcı kararı): bir programda gün bitince sıradaki gün **ertesi takvim gününde** açılır (`dayState` → 'tomorrow', not "Yarın açılır. Bugünün pratiğini yaşamaya vakit tanı."); biten günler hep açık, programlar birbirini engellemez, tarihi olmayan eski kayıtlar kilitlemez (`stoikos_program_done_at_<id>`).
- Dışarıya söz **"her ay en az bir yeni program"**; "ilk 3 ay ayda iki" vaat edilmez.
- **Paylaşım = öneri, övünme değil**: İzler'de yalnız kazanılmış sikke, "Bir arkadaşına öner" (yalnız sikke ayrıntısında; mühür ekranında paylaş düğmesi yok). Kartta tarih/sayı/üye numarası/yazılanlar yok.
- **Topluluk**: yalnız toplam sayılar, isim yok, **sıralama/yarış/kıyas yok**, uydurma sayı/ışık yok; eşiklerin altında sayısız cümle (`NOW_MIN`, `TODAY_MIN`, `PULSE_MIN`, `HEART_MIN`…). Reklam/videoda da uydurma toplam yok.
- Koç cevabında uydurma atıf yasağı (prompt'ta). Koç terapi değildir notu kalır.

## Gizlilik / hukuk
- Sunucuya **yeni veri** (KV anahtarı, D1 tablosu, sağlayıcı, sayaç) eklenirse `public/gizlilik.html` + `public/privacy.html` güncellenir (sürüm numarası artar; şu an **1.5.1**). Koşullar `public/terms*.html` (1.3). `docs/gizlilik-politikasi.md` eski taslak.
- Günlük yazısı yalnız cihazda; koç hafızasına yalnız açık rıza ile (`stoikos_journal_coach_consent`, varsayılan kapalı). Program kapanış yansıması ve Kontrol Eleği yazıları **hiçbir zaman** gönderilmez.
- IP yalnız kısa süreli sınır sayaçlarında. Yaş sınırı 18+ (koşullar §5); uygulamada yaş sorulmuyor; mağaza etiketi ankete göre dürüst.
- Apple Sağlık / Health Connect: yalnız **yazma** (farkındalık dakikası), varsayılan kapalı.

## Yapı haritası (nerede ne var)
- **Sabitler**: `constants/i18n.tsx` (metinler), `content.ts` (15 yazar, 164 alıntı, 12 kavram, 10 filozof, egzersizler, `REFLECTION_PROMPTS`, `MOOD_THEMES`), `programs.ts` (10 yayında + 4 stokta), `theme.ts` + `themeContext.tsx` (5 tema: Otomatik/Ege/Zeytin/Gece mavisi/Klasik; yazı seti Klasik/Kitap/Yumuşak, boyut ×1,15), `fontLoader.ts`, `config.ts` (`FEATURES`, `APP_INFO`, `ENFORCE_PLUS_GATE`), `entitlement.tsx` (`usePlus`), `notify.ts` (14 günlük tarihli bildirim, pazar hatırlatması, `scheduleAll` sıralı), `journal.ts`, `breathLog.ts` (ritimler), `together.ts`, `stoa.ts`, `focus.ts`, `traces.ts`, `health*.ts`, `review.ts`, `dialog.ts`, `dataReset.ts`, `audio.ts`, `shareCard.ts`, `lifeWeeks.ts`.
- **Sekmeler** `app/(tabs)/`: `index` (Ana: selamlama + nabız · nefes çiçeği · Kontrol Eleği satırı · Kaldığın yer · duygu çiçeği · günün sözü · kısayollar · süreklilik), `practice` (Bugün | Programlar), `coach`, `wisdom` (Alıntılar/Kavramlar/Filozoflar, tek tekerlek, katlanan başlık), `progress` (istatistik + İzler).
- **Ekranlar** `app/`: `programs`, `sieve` (Kontrol Eleği), `journal`, `settings` (5 katlanır bölüm), `help`, `wallpaper` (Hayat haftaları), `challenge*` (gizli), `breathe` (eski, erişilemez).
- **Bileşenler**: `BreathOrb`, `TogetherBreath`, `MoodBloom`, `ConceptModal`, `ConceptGlyph`, `EmbossTile`, `PaperBg`, `QuoteCard`, `QuoteShareModal`, `TraceCoin/TraceSeal/TracesSection`, `StoaPulse`, `Paywall`, `CoachWaiting`, `DoneMark`, `FirstTip`, `Onboarding`, `BrandIntro`, `StoikosMark`, `ThemePicker`, `TypePicker`, `PracticePrograms`, `ReminderSync`, `Icons`.
- **Eşleşmesi gereken kopyalar** (biri değişirse öteki de):
  - Marka işareti: `components/StoikosMark.tsx` ↔ `scripts/brand/mark.js` ↔ `website/index.html` `<symbol id="mark">` (+ `scripts/feature-graphic.html`). İkonlar `node scripts/brand/render-icons.js`.
  - Paylaşım kartları (söz + İzler sikkesi): native `QuoteShareModal` / `TraceShare` ↔ web `constants/shareCard.ts` (360×640 tuval, ortak `SHEET` çerçevesi, `traceCardLayout`, `traceTitleSize`).
  - Hayat haftaları: `components/WeeksWallpaper.tsx` ↔ `constants/weeksCanvas.ts` (geometri `lifeWeeks.ts`).
  - Otomatik üretilen, elle düzenlenmeyen: `audioManifest.ts`, `conceptIcons.ts`, `philosopherIcons.ts`.
- **Mağaza görselleri**: `store-assets/` (+ `README.md`), betikler `scripts/shoot-store.js`, `shoot-feature.js`. Ekran değişince site görselleri de (`website/img/`, webp).
- **Sosyal medya**: Instagram **@stoikos.app** (dünyaya hitap: EN video + kısa TR satır; yapay zekâ videosunda etiket). Videolar ve kurgu betikleri `docs/sosyal-medya/`, `scripts/social/`, `scripts/teaser/`; üretim dersleri tarihçede. **Yandan kayan animasyon düzeneği** (Kasım 2026: Yolculuk, Bir Stoacı Gün, Kontrol Eleği): Gemini resimleri (kadın + manzara + yeşil zeminli ön katman, kadın resmi üslup örneği) + kodla hareket; `scripts/teaser/yolculuk.html` kalıbı. Kurallar: kadının ayak çizgisi sabit (`FEET_BAND`), STOIKOS kodla nesneye yazılır, ses aç-kapa kapılı değil ve iki geçişli düzey; müzikler `docs/sosyal-medya/muzik/KAYNAKLAR.md` (yalnız kamu malı/CC0).

## Para modeli: STOIKOS PLUS
- **Hep ücretsiz**: alıntılar, kavramlar, filozoflar, nefes çiçeği, günlük pratik, ilerleme, Kontrol Eleği, Birlikte nefes.
- **Plus**: koç, tüm programlar, kavram sesli anlatımı, yeni içerik. **$6,99/ay · $49,99/yıl** (yıllık önseçili), **14 gün deneme** (mağazanın introductory offer'ı; uygulamada sayılmaz). Türkiye fiyatı elle (yıllık 999–1.199 TL, aylık 129–149 TL). Haftalık ve ömür boyu plan yok.
- Tek yetki: `usePlus()` + backend `GET /entitlement`; yerel içerik kilidi istemcide (bilerek), asıl kapı koçta (sunucu). `hasActiveSubscription()` hâlâ KV stub'ı.
- Ücretsiz koç: kod hazır, anahtar kapalı — ilk hafta 5, sonra haftada 3 soru (`WEEKLY_FREE_QUOTA`). `FREE_COACH_MESSAGES` bilerek 50'de (RevenueCat'ten önce düşürme: Worker otomatik deploy olur, kullanıcı satın alınamayan duvara çarpar).
- Koç geçmişi sunucuda 12 mesaja kırpılır (~$0,025/mesaj). Sınır: kullanıcı 6/dk + 120/gün, IP 12/dk + 300/gün.

---

## 🚨 BEKLEYEN İŞLER

### Yayından önce mutlaka
1. **`ENFORCE_PLUS_GATE = true`** (`constants/config.ts`) — test için kapalı; şu an programlar ve sesli anlatım herkese açık. RevenueCat bağlanınca, en son adım.
2. **Yayıncı değişikliği** (22 Kasım 2026): uygulama Bilge İnön değil **Okyay Adıgüzel** adına yayınlanacak (vergi/Bağ-Kur). Okyay Bey kendi Apple Kimliğiyle yeniden kaydolacak; Bilge Hanım'ın hesabında otomatik yenileme kapatılacak. Kayıt bitince: gizlilik TR+EN (veri sorumlusu + adres, sürüm 1.6), koşullar TR+EN, `docs/apple-kurulum.md`, eksikler listesi. **Kullanıcıdan beklenen**: herkese açık adres (iş adresi önerildi), Google Play hesabının sahibi. Öneriler: mali müşavir (App Store geliri), Süleyman–Okyay yazılı anlaşma.
3. **Apple kurulum → App Store Connect → abonelikler → RevenueCat → TestFlight** (`docs/apple-kurulum.md`: ürünler `com.stoikos.app.plus.annual` / `.monthly`, grup "Stoikos Plus", SKU `stoikos-ios`).
4. **RevenueCat günü yapılacaklar**:
   - `Paywall` `onSubscribe(plan)` bağla (yoksa düğme kasten "YAKINDA"), yerelleştirilmiş fiyat (şu an sabit dizeler), EULA'ya tıklanabilir bağlantı, **Satın alımları geri yükle**.
   - Sunucuda gerçek abonelik doğrulaması (RevenueCat REST, `appUserId` = `userId`).
   - `WEEKLY_FREE_QUOTA = true`.
   - **Plus koçuna günde 30 mesaj** (`coachRateLimited`) + `coach.plusCta` "Sınırsız sohbet" ve tanıtım `onb.p2d` "sınırsızı Plus'ta" metinlerini 6 dilde dürüst cümleye çevir.
   - "Tüm verilerimi sil" `stoikos_user_id`'yi siliyor — geri yükleme ile birlikte karar ver.
   - Deneme bitmeden hatırlatma.
5. **TestFlight'ta gerçek cihazda denenecekler**: bildirimler (sabah/akşam/pazar/birlikte nefes/yeni program), kavram sesi, ikon ve açılış, İzler öneri kartının görsel olarak paylaşılması, Sağlık yazma, kilitli ekranda seans, duvar kağıdı kaydetme, `expo-document-picker` (yedekten geri yükle), `Intl.DisplayNames` (Hermes, nabız ülke adları), sistem pencerelerinin koyu kalması, **hafif titreşim** (yalnız Bilgelik tekerleği seçimi + egzersiz işareti; nefese değil; rahatsız ederse hiç eklenmez).
6. **Google Play**: Android cihaz doğrulaması bekliyor (elde Android yok).
7. **Kullanıcı tarafı**: avukat kontrolü (gizlilik + koşullar), marka tescili (Türkiye, 9+41+42, şekil + kelime, `docs/marka/`; yayından ve reklamdan önce), `config.ts` `storeUrl` (yayında), yaş anketi, kategori.
8. **App Store öne çıkarılma başvurusu**: taslak `docs/apple-one-cikarilma.md`; TestFlight bağlantısıyla, yayından birkaç hafta önce.

### Karar / seçim bekleyen
- **Hayat haftaları duvar kağıdı**: kullanıcı son hâli beğenmedi ("sonra kaldıralım ya da değiştirelim"). Ne beğenilmediğini sormadan değiştirme. Kaldırılırsa liste tarihçede (⚠️ `stoikos_weeks_sunday` bayrağını silip takvimi yeniden kur).
- **Videolarda müzik**: gövdede videoya göre farklı telifsiz kayıt + logoda sabit ses imzası (adaylar `docs/sosyal-medya/muzik/imza-adaylari/`).
- **"Kurucu üye fiyatı"** fikri (ilk 10.000'e ilk yıl ~$29,99) — karar yok; Apple'da deneme ile indirimli dönem birlikte verilemez.
- **Plus fiyatı**: yayından sonra RevenueCat deneyiyle sınanacak. Reklam: önce ayda $300–500 ile kurulum bedelini ölç.

### Hazır, kod bekleyen
- **Stoa paneli** (yönetim sayfası, tasarım onaylı https://claude.ai/artifact/6EXUBYBbmCVRBGrj64E5tU): yalnız toplamlar; Worker `GET /admin/stats?range=`, `website/panel/` → `stoikos.app/panel`, Cloudflare Access ile yalnız kullanıcı. Koç mesaj sayacı eklenirse gizlilik metnine bak. Kullanıcı "yap" deyince.
- **Topluluk 2. aşama** (`docs/topluluk/asama-2.html`): Program grubu + davet zinciri. Ön koşul App Store yayını.

### Program takvimi
- Stok (25 Kasım 2026): **4 program hazır, 6 dilde, `upcoming: true`, `releaseAt` yok** — sıra Ölümlülük (`mortality`) → Belirsizlikle Yaşamak (`uncertainty`) → Zor İnsanlar (`people`) → Beden Disiplini (`body`). Yayın günü belli olunca tarihler birlikte yazılır (ilk 3 ay 1. ve 3. pazartesi, sonra her ayın 1. pazartesisi).
- **Stok kuralı ≥3** → yayından sonraki ilk ay içinde **5. program "Yeni Başlangıç"** yazılmalı (ocağa denk gelsin). Sonraki adaylar: Karar Vermek, Akşamı Kapatmak, Şükran, Kıskançlık, Yalnızlık.
- "Stoacı Yıl" (52 hafta) ve koçtan aylık mektup: altı ay sonraki veriye bağlı.

### TestFlight / yayın sonrası
- **Widget** (A · Sade seçildi, `docs/widget/`): yalnız iPhone, WidgetKit, App Group; kilit ekranındaki nefes kısayolu henüz onaylanmadı. İlk TestFlight derlemesinden sonra.
- **Nefes kapısı** (v1.1): seçilen uygulama açılınca önce nefes durağı (kilit değil); Family Controls yetkisi başvurusu gerekir.
- **Arkadaşınla program** (v1.1, `docs/arkadasla-program.md`): hazır mesajlar, serbest metin yok; `userId` asla paylaşılmaz.
- **iCloud senkronizasyonu** (v1.1, sunucuya değil). **Apple Watch** (v1.2 adayı, talep görülürse). Android widget sonra.
- Ses talep üzerine indirme (sesli anlatımı genişletmenin ön koşulu); insan sesiyle anlatım; "Benim ilkelerim".
- Sikkeyle açılan armağanlar (yalnız nefes çiçeği rengi + paylaşım kartı çerçevesi) — kullanıcı kararı bekliyor.

## Güvenlik
- ElevenLabs anahtarı paylaşıldıysa iptal/yenile. Depo sırları: `EXPO_TOKEN`, `CLOUDFLARE_API_TOKEN` — koda yazma.
