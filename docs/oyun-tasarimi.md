# CAIRN — Oyun Tasarımı

> Bu dosya, App Store için tasarlanan ikinci ürünün — sakinleştirici bir mobil
> oyunun — tasarımını tutar. STOIKOS'un kendisiyle kod paylaşmıyor, ama
> paletini, yazı tiplerini, alıntılarını ve yayın hattını miras alıyor.
> Genel proje bilgisi `CLAUDE.md`, mağaza süreci `docs/magazaya-cikis.md`.
>
> Durum: **tasarım taslağı — onay bekliyor.** Tek satır kod yazılmadı.

## Tek cümlelik özet

Suyun kıyısında taş üst üste diziyorsun; her taş bir nota çalıyor, kule
yükseldikçe müzik yükseliyor, acele edersen her şey ağır çekimde dağılıyor.

- **Mağaza adı:** `Cairn — Denge` (cairn = üst üste dizilmiş taş yığını; tek
  kelime, altı dilde okunabiliyor, anlamı oyunun kendisi)
- **Kategori:** Games › Puzzle (ikincil: Casual)
- **Tek elle, tek parmakla, dikey.** Sesi kapalı da oynanabilir, ama açık
  oynanması için tasarlandı.

## Neden bu oyun

| Ölçüt | Karşılığı |
|---|---|
| Basit | Tek etkileşim: **dokun = taşı bırak.** Öğretici yok, ilk taş kendini anlatıyor. |
| Bağımlılık | Fizik + "az kalmıştı" duygusu. Skor kovalama, günlük tohum, süreklilik, kalıcı bahçe. |
| Sakinleştirici | Süre yok, düşman yok, kırmızı yok. **Beklemek mekanik olarak ödüllendiriliyor** (aşağıya bak). |
| Ucuz | İçerik üretimi yok: fizik + palet + 5 nota. STOIKOS'un aksine metin yazımı gerektirmiyor. |
| Canlı maliyet yok | Sunucu yok, yapay zekâ yok. Bu yüzden **abonelik değil, tek seferlik satın alma** doğru model. |

STOIKOS'un en pahalı parçası (koç) her mesajda para yakıyor; bu oyunda
kurulumdan sonra marjinal maliyet sıfır. İki ürün birbirini besliyor:
stoacı felsefe uygulamasının yanında "denge" temalı bir oyun, çapraz tanıtımda
zorlama durmuyor.

## Çekirdek döngü (30 saniye)

1. Ekranın üstünde bir taş yatay olarak salınıyor (sinüs, ~1,4 sn periyot).
2. **Dokun** → taş düşer. Gerçek fizik: düzensiz dışbükey çokgen, sürtünme,
   devrilme. Yerine oturur, kule biraz sallanır.
3. Taş oturduğu anda pentatonik dizide bir **nota** çalar. Perde yükseklikle
   artar. Kule aynı zamanda bir melodi.
4. Kamera bir taş boyu yukarı kayar. Zorluk kendiliğinden artar: salınım
   genliği büyür, taşlar daha düzensiz gelir, kule esner.
5. Kule devrilirse: **ağır çekim, yumuşak ses, ekranda bir stoacı söz.** Tek
   dokunuşla yeni oyun (<400 ms, yükleme ekranı yok).

Bir oyun 40 sn – 4 dk sürüyor. Metroda, sırada, yatakta oynanır.

## Sükûnet ölçeri — oyunun kalbi

Sakinleştirici oyunların çoğu *görünüşte* sakindir: yavaş müzik, pastel renk,
ama altında aynı aceleci mekanik. Bunda acele **oyun kuralı olarak** cezalı:

- Kule sallanırken (açısal hız eşiğin üstünde) bırakılan taş neredeyse hep
  kötü oturur — fizik bunu zaten yapıyor, biz sadece görünür kılıyoruz.
- Kulenin kenarında ince bir **sükûnet halkası** var. Kule durgunlaştıkça
  dolar (~1,2 sn). Doluyken bırakılan taş **"denge"** sayılır: kısa bir altın
  parlama, çarpan +1, nota bir oktav yukarıdan çalar.
- Üst üste 5 denge → **nefes anı**: her şey bir saniye durur, arka plandaki su
  bir kez soluk alır. Oyunu yavaşlatan bir ödül.

Yani en yüksek skoru bekleyerek alıyorsun. Oyuncuyu yavaşlatmak için ona
"sakin ol" demiyoruz; hızlı oynayan kaybediyor, bunu kendi öğreniyor.

Ölçerin ikinci işi: oyuncunun nefesini farkında olmadan yavaşlatmak. Halkanın
dolma süresi (1,2 sn) bilinçli seçildi — nefes orbunun ritmine yakın.

## Bağımlılık kancaları (dürüst olanlar)

Karanlık desen yok: enerji/can sistemi yok, bekleme süresi yok, "devam etmek
için reklam izle" yok, bildirimle suçluluk yok.

1. **Az kalmıştı.** Fizik oyunlarında devrilme neredeyse hep oyuncunun
   hatasıdır ve oyuncu bunu bilir. "Bir daha" isteğinin tek gerçek kaynağı bu.
2. **Kişisel rekor.** Tek sayı: taş adedi. Rekorun 3 taş yakınındayken halka
   rengi ısınıyor.
3. **Günün kıyısı.** Her gün tohumlu (seeded) bir taş dizisi — herkes aynı
   taşları alıyor, tek deneme. Rekabet skor tablosu değil, **paylaşım kartı**
   (STOIKOS'taki `react-native-view-shot` kartını taklit eder).
4. **Süreklilik.** Gün atlamak seriyi kırar, başka hiçbir şeyi cezalandırmaz.
5. **Bahçe.** Dizdiğin her 10 taş, kıyıdaki bahçeye kalıcı bir öge ekliyor
   (yosun, fener, bonsai, balıkçıl). Beceriden bağımsız, geri alınamaz
   birikim: kötü oyuncu da ilerliyor. Elde tutmanın en güçlü kaldıracı burası.
6. **Ses.** Kule bir enstrüman olduğu için oyun sesli izlenebilir hâle geliyor
   — TikTok/Reels'te organik keşfin tek gerçekçi yolu bu (bkz. Pazarlama).

## Duyusal tasarım

- **Palet:** STOIKOS'un sıcak altın/taş paleti (`constants/theme.ts`).
  Dört bölge (zaman/bahçe ilerlemesine göre): şafak, öğle, gün batımı, ay ışığı.
- **Yazı:** Cinzel (skor), Jost (arayüz) — ikisi de projede var.
- **Ses:** pentatonik (D majör pentatonik, 5 nota × 3 oktav = 15 örnek,
  ~200 KB). Arkada tek katmanlı ambiyans (su + rüzgâr, ~3 dk döngü, m4a).
  STOIKOS'taki `breathSound.ts` deseni birebir uygulanabilir.
- **Titreşim:** iniş anında `Haptics.impactAsync(Light)`, dengede `Medium`.
  `expo-haptics` zaten bağımlılıkta. (STOIKOS'ta kaldırılmıştı; oyunda
  dokunsal geri bildirim vazgeçilmez.)
- **Devrilme:** 0,35× hız, kamera geri çekilir, tek düşük nota, kırmızı yok,
  "GAME OVER" yazmıyor. Ekranda STOIKOS'un 164 alıntısından biri çıkıyor —
  sıfır maliyetle, marka bağını kuran an.

## Ekranlar (hepsi bu)

1. **Oyun** — HUD yok denecek kadar az: üstte taş sayısı, sağ üstte ses/duraklat.
2. **Oyun sonu** — skor, rekor, kazanılan çakıl, alıntı, iki düğme: *Yeniden*,
   *Bahçe*.
3. **Bahçe** — kaydırmalı kıyı manzarası, açılan ögeler, çakılla satın alma.
4. **Günün kıyısı** — bugünün tohumu, dünkü sonuç, süreklilik, paylaş.
5. **Ayarlar** — dil (6 dil, STOIKOS'un `i18n.tsx`'i kopyalanır), ses,
   titreşim, gizlilik/koşullar, STOIKOS bağlantısı.

## Para modeli

Abonelik **yok** — canlı maliyeti olmayan bir oyunda abonelik satmak hem
haksız hem de kategori verilerine göre işlemiyor.

- **Ücretsiz:** oyunun tamamı, sonsuz mod, günün kıyısı, bahçenin ilk bölgesi,
  ilk enstrüman. Reklam yok, kesinti yok, bekleme yok.
- **Cairn Bahçesi — tek seferlik $4,99:** 4 ek bölge (şafak/öğle/batım/ay ışığı
  temaları), 3 enstrüman paketi (taş, cam, çan), taş koleksiyonları, gece modu,
  bahçe ögeleri çakıl olmadan açılır.
- **Çakıl:** oyun içi, yalnız oynayarak kazanılıyor. **Satılmıyor** — para
  karşılığı çakıl satmak oyunu skor yerine kasa kovalamaya çevirir.
- **Destekçi paketi $9,99** (isteğe bağlı, kozmetik): adı bahçedeki bir taşa
  kazınır. Marj yüksek, oyunu bozmuyor.
- **Çapraz satış:** oyun sonu alıntısının altında tek satır — *"bu söz
  STOIKOS'tan"* → App Store bağlantısı. Israr yok.

Beklenti dürüstçe: ücretsiz oyunda tek seferlik satın almanın dönüşümü %1–3
bandındadır. Bu oyun para makinesi olarak değil, **portföyün ikinci ayağı ve
STOIKOS'un keşif kanalı** olarak yapılıyor. Böyle bakılmazsa hayal kırıklığı olur.

## Teknik plan

Ayrı repo, ayrı Expo uygulaması (`cairn`), STOIKOS'un hattını miras alır:
GitHub Pages web önizleme + EAS build + aynı GitHub Action deseni.

| Katman | Seçim | Gerekçe |
|---|---|---|
| Çatı | Expo SDK 54, expo-router | Ekip bu yığını biliyor; STOIKOS'tan kopyala-çalıştır |
| Çizim | `@shopify/react-native-skia` | 60 fps, web'de CanvasKit ile aynı kod → test edenler tarayıcıdan oynar |
| Döngü | `react-native-reanimated` frame callback | JS köprüsünü her karede geçmemek için |
| Fizik | **`planck.js`** (Box2D portu) | Yığın kararlılığı. `matter-js` üst üste dizmede titriyor — bu oyunun tek kritik senaryosu tam olarak o. |
| Zaman adımı | Sabit 1/120 s, en çok 4 alt adım/kare | Cihazdan bağımsız davranış; günün tohumunun anlamlı olması için şart |
| Ses | `expo-av` (STOIKOS deseni) | Zaten kanıtlanmış; 15 kısa örnek + 1 ambiyans |
| Kalıcılık | AsyncStorage | Sunucu yok. Bahçe ve rekor cihazda. |
| Satın alma | RevenueCat | STOIKOS'ta zaten kurulacak; tek hesap iki uygulamaya bakar |

⚠️ **Sunucu yok** kararı bilinçli: skor tablosu koymuyoruz. Global skor tablosu
hile denetimi, kimlik, KVKV yükümlülüğü ve aylık gider getirir; getirisi
paylaşım kartının getirdiğinden fazla değil.

⚠️ **Varlık boyutu:** STOIKOS'ta ses 36 MB'a çıkıp tavana dayandı. Burada bütçe
baştan konuyor: **toplam indirme < 30 MB.** Ses 15 kısa örnek + tek ambiyans
(~3,5 MB). Görseller Skia ile çiziliyor, bitmap yok.

## Yol haritası

| Hafta | Çıktı | Bitti sayılma ölçütü |
|---|---|---|
| 1 | Dikey dilim | Taş düşüyor, oturuyor, kule devriliyor. Çirkin ama oynanıyor. |
| 2 | Hissiyat | Salınım eğrisi, kamera, sükûnet halkası, notalar, titreşim. Oyun *iyi hissettiriyor.* |
| 3 | Kabuk | Oyun sonu, rekor, çakıl, alıntı, ayarlar, 6 dil |
| 4 | Bahçe + günün kıyısı | Kalıcı ilerleme, tohumlu mod, süreklilik, paylaşım kartı |
| 5 | Cila + para | Bölgeler, enstrümanlar, RevenueCat, gizlilik/koşullar, değerlendirme istemi |
| 6 | Mağaza | Ekran görüntüleri, 20 sn teaser, metinler (6 dil), TestFlight |

Tek geliştiriciyle gerçekçi takvim: **6–8 hafta.** İlk iki hafta en kritik —
2. haftanın sonunda oyun elde tutmuyorsa kavram kurtarılmaz, erken bırakılır.

## Bilinen riskler

1. **Games kategorisinde organik keşif yok.** Tek gerçekçi kanal kısa video;
   bu yüzden ses tasarımı "sonradan eklenecek cila" değil, 2. haftada yapılacak
   çekirdek iş.
2. **"Stack" oyunları kalabalık bir tür.** Ayrışma noktası tek: gerçek fizik +
   kulenin müzik çalması + bekleyenin kazanması. Bu üçü birleşmezse oyun
   sıradanlaşır.
3. **Fizik performansı.** Kule 60 taşa çıktığında eski cihazlarda kare düşebilir.
   Önlem: kamera dışındaki gövdeleri uyutmak (`setAwake(false)`), en altta
   20 taştan sonrasını statik gövdeye dönüştürmek.
4. **Apple Developer kaydı hâlâ takılı** (`docs/magazaya-cikis.md`, 10. madde).
   Bu çözülmeden ikinci uygulama da yayınlanamaz — oyunun önündeki gerçek engel
   teknik değil, idari.

## Değerlendirilip seçilmeyen iki alternatif

- **Nefes Çizgisi** — parmağını kaldırmadan tek bir çizgi çiziyorsun, çizgi
  nefesle kalınlaşıp inceliyor, ekrandaki tohumları sırayla topluyorsun.
  Daha özgün ve daha sakin, ama *bağımlılık* tarafı zayıf: kaybetme anı yok,
  dolayısıyla "bir daha" duygusu yok. Cairn tutarsa ikinci oyun bu olabilir.
- **Kum** — kum tanesi fiziğiyle renk birleştirme (merge). Bağımlılığı en güçlü
  seçenek ve ASMR tarafı çok iyi, ama merge türü doygun, üstelik parçacık
  fiziği React Native'de en pahalı yol: aynı takvimde bitmez.

## Karar bekleyen sorular

1. **Onay:** Cairn mi, yoksa iki alternatiften biri mi?
2. **Sıra:** STOIKOS mağazaya çıkmadan bu başlasın mı? (Önerim hayır —
   STOIKOS'un RevenueCat + Apple kaydı bitmeden ikinci cepheyi açmak, ikisini
   birden geciktirir. Cairn'ın 1. haftası, STOIKOS'un TestFlight beklediği
   ölü zamana yerleşir.)
3. **Repo:** Ayrı repo mu, bu repoda `game/` klasörü mü? (Önerim ayrı repo —
   STOIKOS'un web deploy hattı ve `app.json` baseUrl'i karışır.)
