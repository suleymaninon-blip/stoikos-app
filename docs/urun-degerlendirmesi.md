# Ürün ve Pazar Değerlendirmesi

> 5–6 Eylül 2026'da yapılan inceleme. Soru şuydu: insanlar bu uygulamayı
> indirmek ve buna para vermek ister mi?
>
> Genel proje bilgisi `CLAUDE.md`, mağaza süreci `docs/magazaya-cikis.md`.

## Nasıl yapıldı, neye güvenilir

**Ürün tarafı doğrudan ölçüldü.** Uygulama yerelde çalıştırıldı, sekiz ekran
gezildi, içeriğin tamamı okundu, koç promptu ve para akışı incelendi.
Buradaki sayılar sayıldı, tahmin değil.

**Pazar tarafı ikinci elden.** Mağaza sayfalarına ağ politikası nedeniyle
doğrudan erişilemedi; rakip fiyatları ve puanları arama özetlerinden geliyor
ve **yayına çıkmadan elle doğrulanmalı**. Sektör verileri (RevenueCat,
Adapty) güçlü ve birinci elden.

## Ölçülen envanter

Bir daha saymaya gerek kalmasın:

| | |
|---|---|
| Alıntı | 164 · altı dilde tam |
| — belirli bir esere atıf yapan | **104** |
| — "Stoacı Gelenek" diye dürüstçe etiketlenen | 23 |
| — erken Stoacılara "fragman" olarak atfedilen | 30 |
| Kavram | 12 · altı dilde tam (7'si ~120 karakter, 5'i ~700) |
| Filozof | 10 · altı dilde tam |
| Egzersiz | 5 (3 sabah, 2 akşam) |
| Program | 2 × 7 gün = 14 gün · altı dilde tam (Eylül 2026'da fr/es eklendi) |
| Arayüz metni | 234 anahtar × 6 dil · eksiksiz |
| Çalışma sağlığı | 8 ekranın hiçbirinde yakalanmamış istisna yok |

## Gerçekten iyi olan

Bunlar korunmalı, üstüne inşa edilmeli:

- **Tasarım şablon değil.** Tek bir görsel dil, tutarlı tipografi, nefes orbu.
  Bu kategorinin çoğu uygulaması birbirinin kopyası; bu değil.
- **İçerik entelektüel olarak dürüst.** Apatheia'nın "duygusuzluk değildir"
  diye düzeltilmesi, Oikeiōsis'in Hierokles'in halkalarıyla anlatılması —
  popüler Stoacılık içeriğinin genelde beceremediği şeyler.
- **Filozof hikâyeleri özellikle iyi.** Seneca "yoksulluğu öv ama saraylarda
  yaş" eleştirisiyle birlikte, kendi ağzından *"bilge değilim, iyileşmeye
  çalışan bir hastayım"* diye anlatılıyor. Azizleştirme değil, portre.
- **Altı dil gerçekten altı dil.** Çoğu bağımsız geliştiricinin yapmadığı iş.
- **Koç promptu iyi yazılmış.** Sürekli soru sorma, alıntı makinesi olma ve
  kriz anında felsefeye girme tuzaklarının hepsinden kaçınılmış.

---

# Bulgular

## 1. ✅ Atıf bütünlüğü — çözüldü (6 Eylül 2026)

> **Yapılan:** Uyarlama işareti künyenin parçası hâline getirildi
> (`content.ts` → `sourceName`): artık her yerde
> "Meditationes · serbest uyarlama" yazıyor, altı dilde. Künyeyi tüketen üç
> yüzey (ana ekran kartı, bilgelik listesi, paylaşım metni ve görseli) tek
> değişiklikle düzeldi — işaret alıntı uygulamadan çıkarken de birlikte
> gidiyor. "Stoacı Gelenek" ve "Rivayet" kaynakları zaten iddiasız olduğu
> için işaretsiz bırakıldı. Koç promptuna da uydurma atıf yasağı eklendi.
>
> Aşağıdaki tespit, ne yapıldığının ve neden yapıldığının kaydı olarak duruyor.

**Durum (düzeltmeden önce).** 164 alıntının **104'ü** "Marcus Aurelius, *Meditationes*" gibi
belirli ve doğrulanabilir bir esere atıf yapıyor. Ama uygulamanın kendisi
`wisdom.attribution` ile şunu söylüyor:

> *"Sözler, antik Stoacı kaynaklardan esinlenerek sadeleştirilmiştir."*

Yani bunların birebir alıntı olmadığı zaten biliniyor. İki sorun var:

**a) Not yanlış yerde.** Her kartta kaynak künyesi göze çarpıyor; uyarı 164
alıntının en altında `ListFooterComponent` olarak duruyor. Kimse oraya inmiyor.

**b) Paylaşımda not tamamen düşüyor.** `components/QuoteShareModal.tsx`
dışarı şunu çıkarıyor:

```
"Yalın yaşa. Çoğu şey gereksiz; çıkar onları, huzur kalır."
— Marcus Aurelius, Meditationes
— Stoikos
```

Marcus bunu yazmadı ve bu satır artık Stoikos imzasıyla dolaşıyor. Sahte
alıntının yayılma mekanizması tam olarak budur.

**c) Koç yenilerini üretebiliyor.** `backend/src/index.ts` promptu alıntıyı
`> "Söz" — Yazar, Kaynak` biçiminde vermesini söylüyor ama **hiçbir yerde
"yalnızca gerçek alıntı kullan" demiyor.** Dil modelleri klasik yazarlara
kendinden emin biçimde uydurma atıf yapar.

**Neden önemli.** Stoacılık kitlesi alışılmadık ölçüde okur; r/Stoicism ve
Ryan Holiday çevresi sahte alıntı avlar. Uydurma bir *Meditationes*
alıntısının ekran görüntüsü viral olursa uygulamanın adı ona yapışır.

**Ne yapmalı** (üçü de ucuz):
1. Kaynak satırını yumuşat — "Marcus Aurelius, *Meditationes*" yerine
   "Marcus Aurelius'tan esinlenerek". Kartta, paylaşımda, koç yanıtında.
2. Paylaşım metnine ve görseline notu ekle.
3. Koç promptuna kural yaz: ya uygulamanın kendi 164 alıntısından seçsin,
   ya da kaynak künyesi vermeden atıfsız aktarsın.

23 alıntı zaten "Stoacı Gelenek" diye açıkça etiketlenmiş — doğru içgüdü.
Aynısını 104'e uygulayın.

> **Not:** Uygulamanın en iyi içeriği zaten antik alıntı olmayan kısmı —
> filozof hikâyeleri ve derin kavram metinleri özgün ve dürüst. Zayıf halka,
> antik olmadığı hâlde antik görünen kısım.

## 2. Satılan şey denenemiyor

**Durum.** Koçun rakiplerden farkı **hafıza**. Bu, tanıtım turunda
(*"Koç seni zamanla hatırlar"*) ve ödeme duvarında (*"Seni hatırlayan,
süregelen bir konuşma"*) açıkça vaat ediliyor.

Ama `FREE_COACH_MESSAGES = 5` ve **ömür boyu, yenilenmiyor**.

Hafızanın değeri ilk oturumda görünmez; ertesi hafta dönüp koçun seni
hatırladığını gördüğünde görünür. 5 mesajını tek oturumda harcayan kullanıcı,
**para vermesini istediğiniz özelliği hiç yaşamadan** duvara çarpıyor.

Rakip karşılaştırması: nişteki *"Daily Stoic: Stoicism"* ücretsiz katmanda
**günde 5** sohbet veriyor (doğrulanmalı). Siz **ömür boyu 5** veriyorsunuz.

**Maliyet** (mesaj başına ~$0,025, kendi hesabımız):

| Model | Etkin ücretsiz kullanıcı başına aylık | Hafıza yaşanır mı |
|---|---|---|
| 5 ömür boyu (şu an) | $0,125 tek sefer | **Hayır** |
| Haftada 3 | $0,33 | Evet |
| Haftada 5 | $0,54 | Evet |
| Günde 3 | $2,28 | Evet ama pahalı |

$6,99'dan elinize $4,89 geçiyor; bir abone haftada 3 mesaj alan ~15 ücretsiz
kullanıcıyı finanse eder. Tipik dönüşüm %2–5 olduğu için **süresiz** haftalık
hak zarar ettirir, **süreli** olan tutar.

**Öneri:** İlk 3 hafta haftada 3 mesaj (~9 mesaj, 3 ayrı oturum — hafızayı
görmeye yeter), sonra ayda 1 tadımlık. Etkin kullanıcı başına ~$0,22.

**Ayrıca deneme süresi uzatılmalı:** 17–32 günlük denemeler %42,5 dönüşüyor,
4 günden kısa olanlar %25,5 (RevenueCat).

## 3. Kimlik cihaza bağlı — hafıza ve kota delik

`constants/api.ts` → `getUserId()`: kimlik cihazda üretilen rastgele bir dize,
`AsyncStorage`'da. Sonuçları:

- **Kota delik.** Uygulama silinip kurulunca yeni kimlik → 5 hak sıfırlanır.
  "Ömür boyu" sınır teknik olarak yok; gerçek tavan yalnızca IP limitleri.
- **Hafıza kayboluyor.** Telefon değiştiren ya da uygulamayı yeniden kuran
  kullanıcı koçun hafızasını kaybediyor. Para ödenen "seni hatırlıyor"
  özelliği için bu ciddi bir güven sorunu.

**Ne yapmalı:** Bir tür süreklilik — Apple ile Giriş, ya da en azından
yedekleme/geri yükleme kodu. (Üçüncü parti girişi eklenirse Apple, Apple ile
Giriş'i de zorunlu tutuyor; KVKK/GDPR yükü de artar.)

## 4. Değerlendirme istemi hiç yok

`expo-store-review` kullanılmıyor; uygulama hiç puan istemiyor. Organik
keşfin en güçlü kaldıracı mağaza puanı ve yorum sayısıdır. İyi zamanlanmış
tek bir `StoreReview.requestReview()` — 7 günlük süreklilikte ya da bir
program bitiminde — bu listedeki muhtemelen **en yüksek getirili tek satır**.

## 5. Elde tutma ince

5 egzersiz sonsuza dek tekrar ediyor; 2 program = 14 gün. 30. günde kullanıcıyı
geri getiren şey belirsiz.

Programların üretim maliyeti sıfır (yalnız metin) ve koç aboneliğinin aksine
ChatGPT ikame edemez — tasarlanmış, sıralanmış, ilerlemesi izlenen bir şey.
Elde tutmanın en ucuz ve en doğal kaldıracı bu.

## 6. Kavram derinliği ikiye bölünmüş

İlk 7 kavram ~120 karakter (bir-iki cümle), son 5 kavram ~700 karakter (gerçek
deneme). Kullanıcı bu farkı hisseder. İlk 7'yi son 5'in seviyesine çıkarmak
ücretsiz içeriğin omurgasını güçlendirir.

Ayrıca: Eudaimonia'da `practice` alanı yok; son 5 kavramda `example` boş.
Arayüz bunları güvenle atlıyor (`concept.example ? ... : null`), görsel hata
çıkmıyor — ama içerik tutarsız.

## 7. Ufak ama görünür

- **Emoji paleti bozuyor.** Ana ekrandaki 🔊 ve Pratik'teki 🌙 kendi parlak
  renklerinde çiziliyor, sıcak altın-taş paletinin içinde yabancı duruyor.
  SVG ikonla değiştirilmeli.
- **Gizlilik bağlantısı `github.io` gösteriyor.** `stoikos.app` alan adı
  sizin; mağaza incelemesinde kurumsal görünmüyor.
- ~~Programlarda fr/es yok~~ — 6 Eylül 2026'da tamamlandı.

---

# Pazar

## Resmi değiştiren bulgu

RevenueCat, 1 milyar+ işlem / 115.000+ uygulama:

| 12 aylık abone elde tutma | Yapay zekâlı | Yapay zekâsız |
|---|---|---|
| Yıllık plan | **%21,1** | %30,7 |
| Aylık plan | **%6,1** | %9,5 |

Yapay zekâ uygulamaları medyanda **%30 daha hızlı iptal** ediliyor.
RevenueCat'in teşhisi: *"Bu uygulamalar uzun vadede neredeyse hiç
kullanılmıyor."*

Yapay zekâ sohbeti bir aboneliği **başlatıyor, sürdürmüyor.** Ve bu modelde
abonelikte tutan başka hiçbir şey yok, çünkü geri kalan her şey ücretsiz.
**Aylık plan + yapay zekâ, tablodaki en kötü kutu — şu an tam orada.**

## Rakipler yapay zekâyı ücretsizleştiriyor

- **Headspace'in Ebb'i** yıllık aboneliğe dahil, ayrı satılmıyor
- **Ash** (a16z, $93M yatırım) tamamen ücretsiz
- Niş içinde: *"Daily Stoic: Stoicism"* ücretsiz katmanda günde 5 sohbet

## Fiyat sorun değil — yokluğu sorun

| | Aylık | Yıllık |
|---|---|---|
| Global medyan | $12,99 | $38,42 |
| stoic. Premium | $6,99 | $39,99 |
| **stoic. Premium + AI** | **$12,99** | **$99,99** |
| Stoa | $9,99 | ~$69,99 |
| **Stoikos** | **$6,99** | **yok** |

$6,99 pahalı değil — global medyanın ve nişin altında. Lider yapay zekâyı
$12,99'a satıyor; biz onu ana ürün yapıp yarı fiyata veriyoruz.

**Asıl hata yıllık planın olmaması.** Sağlık & Fitness'ta gelirin **%60–68'i**
yıllık planlardan geliyor. Nişteki tipik indirim %40–55 → **$44,99–49,99/yıl**.

Ve bu matematiksel bir zorunluluk:

> Sağlık & Fitness'ta ödeyen abone başına edinme maliyeti **$50–100**.
> $6,99'dan net ~$5,94 → geri kazanım **9–17 ay**. Aylık + yapay zekâ planında
> 12. ay elde tutma **%6,1**. Yani **aylık planla ücretli reklam matematiksel
> olarak imkânsız.**

## Nişin büyüklüğü — ayık bakış

Kategori lideri **stoic.** (2,5M+ Android indirme, 34.000 iOS değerlendirmesi,
Y Combinator, ~10 kişi): tahmini **~$1,5M yıllık gelir** (kaynak zayıf).
**Stoa**: 100K indirme, ayda ~1.000 yeni. Stoic Week 2026'ya dünyada 3.300 kişi.

Küçük bir ekip için **iyi bir iş** olabilir; ölçekli bir pazar değil.
Beklentiyi buna göre kurun.

## Keşfedilebilirlik

Ayda **14.700 yeni abonelik uygulaması** çıkıyor. Yeni uygulamaların yalnızca
**%4,6'sı** iki yılda aylık $10.000 gelire ulaşıyor. 2020 öncesi çıkanlar hâlâ
abonelik gelirinin %69'unu alıyor.

Saf organik ASO ile bu nişte çıkış yapmak zor; ücretli edinme ya da bir içerik/
topluluk kanalı gerekiyor.

**Eksik kritik veri:** "stoic" / "stoicism" anahtar kelimelerinin mağaza arama
hacmi ve zorluk skoru. Ancak AppTweak/Appfigures gibi bir araçla öğrenilir;
reklam bütçesi kararından önce bakılmalı.

## Türkiye

Türkçe-öncelikli ciddi bir Stoacılık uygulaması **yok** — Stoa'nın Türkçe
yorumlarında açık şikâyet var: *"tamamen İngilizce."* Boşluk gerçek.

Ama ödeme tarafı zayıf: ödeyen kullanıcı başına ilk yıl değeri Kuzey
Amerika'da $32, Batı Avrupa'da $25, düşük bantta $14 civarı.

**Okuma:** Türkçe'yi farklılaştırıcı ve organik büyüme motoru olarak kullan,
geliri altı dildeki batı pazarlarından bekle. Türkiye fiyatını ayrıca düşür —
yerel fiyat testleri veri setindeki en yüksek getirili deney türü (%62,3 LTV).

---

# Stratejik okuma

> **Taklit edilmesi zor olan her şey bedava veriliyor, kolay olan tek şey
> satılıyor.**

Küratörlük, tasarım, çeviri, felsefi doğruluk — bunlar yıllar alır ve
kopyalanamaz; hepsi ücretsiz. Satılan şey ise bir dil modeli sohbeti, ki
ChatGPT'nin ücretsiz katmanı bunu bugün yapıyor **ve** sektör verisi bunun
aboneliği en kötü sürdüren şey olduğunu söylüyor.

İki yol var:

**Asgari yol — mekaniği düzelt, model aynı kalsın.**
Yıllık plan, yenilenen ücretsiz kota, uzun deneme, Türkiye'ye ayrı fiyat.
Hiçbiri modeli değiştirmiyor, hepsi zaten yapılmalı.

**Daha sağlam yol — aboneliğe ikinci bacak tak.**
Elde sıfır marjinal maliyetli iki varlık daha var: **programlar** ve
**216 dosyalık sesli anlatım**. Bunlar büyüyen bir premium katmana konursa,
kullanıcı koçtan sıkıldığında abonelik ölmez.

Bu, "içerik hep ücretsiz" sözünü bozmaz: **mevcut** içerik ücretsiz kalır,
lansmandan sonra **eklenen** programlar ve sesli kurslar premium olur.
stoic. tam olarak bunu yapıyor (Premium ayrı, yapay zekâ ayrı); Headspace
yapay zekâyı ana aboneliğe katıyor. İkisi de yapay zekâyı tek satış gerekçesi
yapmıyor.

---

# Öncelik listesi

**Yayından önce**
1. ✅ ~~Atıf dilini yumuşat~~ — yapıldı 6 Eylül 2026
2. **Ücretsiz kotayı haftalığa çevir + 14–30 günlük deneme** — sattığınız şey denenebilsin
3. **Yıllık plan ekle** ($44,99–49,99) — kategorinin ana gelir kanalı, reklamın tek matematiksel yolu
4. **EULA'yı uygulamaya bağla, fiyatı RevenueCat'ten al** — ayrıntı `docs/magazaya-cikis.md`
5. **Değerlendirme istemi ekle** (`expo-store-review`) — organik keşfin en büyük kaldıracı

**Yayından hemen sonra**
6. Türkiye'ye ayrı fiyat
7. Program sayısını artır — elde tutma
8. D30/D90 abone elde tutmasını ölçmeye başla — yapay zekâ aboneliklerinin
   zayıf noktası burada; ölçmezseniz sorunu yıllık yenilemede görürsünüz

**Sonra**
9. İlk 7 kavramı derinleştir
10. Hafıza sürekliliği (kimlik cihaza bağlı olmasın)
11. Emoji → SVG ikon; gizlilik bağlantısını `stoikos.app`'e taşı
12. Aboneliğe ikinci bacak: yeni programlar + sesli kurslar premium katmanda

---

# Doğrulanmamışlar

Bunlara dayanarak karar vermeden önce elle bakın:

- **Hiçbir mağaza sayfası birinci elden okunamadı.** Rakip fiyatları ve puanları
  arama özetlerinden.
- **Çelişen veriler:** stoic. yıllık fiyatı ($39,99 mu $49,99 mu), stoic.
  değerlendirme sayısı (34K vs "100K+"), Stoa yıllık ($69,99 vs $89,99),
  meditasyon pazarı büyüklüğü (2,6 vs 6,6 milyar $).
- **Bulunamadı:** "stoic"/"stoicism" ASO arama hacmi ve zorluğu; Türkiye'ye
  özel ARPPU/LTV; Türk Stoacılık uygulamalarının indirme sayıları.
- **Kaynak zayıf:** tüm gelir/ARR tahminleri (getlatka, Apptopia).
- **Güçlü ve güvenilir:** RevenueCat ve Adapty sektör raporları — elde tutma,
  fiyat medyanları, CAC, deneme dönüşümü rakamları buradan.
