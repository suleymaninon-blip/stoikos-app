# Stoikos — Gizlilik Politikası ve Aydınlatma Metni

**Son güncelleme:** 12.06.2026
**Sürüm:** 1.0

> Bu metin hem 6698 sayılı **KVKK** kapsamında aydınlatma metni hem de genel bir gizlilik politikası olarak hazırlanmıştır. Yayın öncesi bir hukuk danışmanına son kontrol ettirilmesi önerilir.

---

## 1. Veri Sorumlusu

- **Veri sorumlusu:** Bilge İnön
- **Adres:** Cumhuriyet Mah. 1113 Sk. No:24/A Premium Green Life 1 Sitesi C Blok Daire 10 Didim/Aydın
- **İletişim / başvuru:** support@stoikos.app

Stoikos ("Uygulama"), Stoacı felsefe ve farkındalık temelli bir kişisel gelişim uygulamasıdır. Bu metin, Uygulama'yı kullandığında hangi verilerin işlendiğini, neden işlendiğini, kimlerle paylaşıldığını ve haklarını açıklar.

---

## 2. Kısaca Özet

- Stoikos'u kullanmak için **hesap açman, ad-soyad, e-posta ya da telefon vermen gerekmez.**
- Verilerinin **büyük çoğunluğu yalnızca senin cihazında** saklanır ve hiçbir yere gönderilmez.
- Cihaz dışına yalnızca şu durumlarda veri gider:
  1. **Koç (sohbet)** özelliğini kullandığında — yazdığın mesajlar yanıt üretmek için yapay zekâ hizmetine iletilir.
  2. **Günlük yansımalarını koça iletmeye açık rıza verdiğinde** — yalnızca onay kutusunu işaretlersen.
- **Reklam yok, üçüncü taraf takip/analitik yok, veri satışı yok.**

---

## 3. İşlenen Veriler

### 3.1. Yalnızca cihazında saklanan veriler (sunucuya gönderilmez)

Bu veriler cihazının yerel deposunda (AsyncStorage) tutulur; uygulamayı silersen ya da "sıfırla" dersen kaybolur:

- Egzersiz tamamlama kayıtların ve süreklilik (streak) bilgisi
- **Günlük yansıma (günlük) metinlerin** — rıza vermediğin sürece cihazdan çıkmaz
- Dil tercihin, bildirim ve ses tercihlerin, tanıtım (onboarding) durumu
- Koç sohbet geçmişin (cihazında saklanır)
- Koça iletme **rıza tercihin** (açık/kapalı)
- Cihaza özel rastgele bir **kullanıcı kimliği** (`user_id`) — kimliğinle ilişkilendirilemeyen, rastgele üretilmiş bir numaradır; koç hafızasını cihazına bağlamak için kullanılır.

### 3.2. Sunucuya/üçüncü tarafa iletilen veriler

- **Koç sohbeti:** Koç sekmesinde mesaj yazdığında; rastgele `user_id`, dil bilgin ve **mesaj içeriğin** sunucumuza (Cloudflare Worker), oradan yapay zekâ sağlayıcısına (Anthropic) iletilir. Koçun seni hatırlayabilmesi için konuşmadan kısa bir **özet ("hafıza")** çıkarılır ve sunucumuzda (Cloudflare KV) saklanır.
- **Günlük yansımanın koça iletilmesi (yalnızca açık rıza ile):** Günlük kartındaki onay kutusunu işaretlersen, kaydettiğin yansıma metni `user_id` ve dil bilgisiyle birlikte sunucumuza, oradan Anthropic'e iletilir ve koç hafızana işlenir. **Onay kutusu kapalıyken bu aktarım yapılmaz.**

### 3.3. Otomatik toplanmayan veriler

- Konum, kişi listesi, reklam kimliği, çerez tabanlı takip **toplanmaz.**
- Bildirimler cihazında yerel olarak planlanır; bildirim için sunucuya veri gönderilmez.

---

## 4. İşleme Amaçları ve Hukuki Sebepler (KVKK md. 5)

| Veri / işleme | Amaç | Hukuki sebep |
|---|---|---|
| Cihazdaki tüm yerel veriler | Uygulamanın temel işlevini sağlamak (ilerleme, günlük, tercihler) | Sözleşmenin/hizmetin ifası; meşru menfaat |
| Koç sohbeti (mesaj → Anthropic) | Talep ettiğin yapay zekâ koç yanıtını üretmek | Hizmetin ifası — işlemi sen başlatırsın |
| Koç hafızası (özet, KV) | Koçun seni hatırlaması, kişiselleştirme | Hizmetin ifası |
| **Günlük yansımanın koça iletilmesi** | Koçun seni daha iyi tanıması | **Açık rıza (KVKK md. 5/1, md. 6)** — kutu kapalıyken işlenmez |

Günlük yansımalar ruh hali, ilişkiler veya sağlık gibi **özel nitelikli kişisel veri** içerebileceğinden, bunların koça iletilmesi yalnızca **açık rızana** dayanır ve varsayılan olarak **kapalıdır**. Rızanı istediğin an geri çekebilirsin.

---

## 5. Üçüncü Taraflar ve Yurt Dışına Aktarım (KVKK md. 9)

Stoikos, işlevini sağlamak için aşağıdaki hizmet sağlayıcıları (veri işleyenleri) kullanır:

- **Anthropic, PBC (ABD)** — Yapay zekâ koç yanıtlarını ve hafıza özetini üretir. Koç mesajların ve (rıza verirsen) yansımaların bu hizmete **ABD'ye aktarılır.**
- **Cloudflare, Inc. (ABD/küresel)** — Sunucu (Worker) barındırma ve koç hafızasının saklandığı depolama (KV).
- **GitHub Pages (web sürümü)** ve **Apple App Store / Google Play (mobil)** — uygulamanın dağıtımı/barındırılması.

Bu sağlayıcılar yurt dışında bulunduğundan, koç özelliğini kullanman ve/veya yansıma rızası vermen halinde kişisel verilerin **yurt dışına aktarılır.** Koç sohbetini kullanman bu aktarımı zorunlu kılar; yansıma aktarımı ise yalnızca açık rızanla yapılır.

Anthropic'in API üzerinden gönderilen verileri model eğitimi için kullanmadığını beyan ettiğini not ederiz; güncel koşullar için sağlayıcının kendi politikaları geçerlidir.

---

## 6. Saklama Süreleri

- **Cihazdaki veriler:** Sen silene kadar (uygulamayı kaldırma veya ilgili "sıfırla" işlemi) cihazında kalır.
- **Koç hafızası (sunucu/KV):** Ayarlar → "Koç hafızasını sıfırla" ile silinene kadar saklanır.
- **Koç mesajlarının iletimi:** Yanıt üretimi için anlık olarak işlenir; kalıcı sohbet kaydı sunucumuzda tutulmaz (sohbet geçmişi yalnızca cihazındadır). Sağlayıcıların kendi geçici log süreleri kendi politikalarına tabidir.

---

## 7. Haklarının Kullanımı (KVKK md. 11)

Aşağıdaki haklara sahipsin:

- Kişisel verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme,
- İşlenme amacını öğrenme, eksik/yanlış işlenmişse düzeltilmesini isteme,
- **Silinmesini/yok edilmesini isteme,**
- **Açık rızanı geri çekme.**

Uygulamadan doğrudan kullanabileceğin kontroller:

- **Koç hafızasını sil:** Ayarlar → "Koç hafızasını sıfırla".
- **Yansıma rızasını geri çek:** Günlük kartındaki onay kutusunu kapat — sonraki yansımalar artık iletilmez.
- **Tüm yerel veriyi sil:** Uygulamayı cihazından kaldır.

Diğer talepler için support@stoikos.app adresinden bize ulaşabilirsin; başvurun KVKK'da öngörülen sürede yanıtlanır.

---

## 8. Çocukların Gizliliği

Stoikos 13 yaş altındaki kişilere yönelik değildir ve bilerek bu yaş altından veri toplamaz.

---

## 9. Güvenlik

Veriler aktarım sırasında şifreli bağlantı (HTTPS) ile taşınır. Hiçbir sistem %100 güvenli olmasa da, verilerini korumak için makul teknik ve idari önlemler alınır. Koç yapay zekâ anahtarı sunucu tarafında güvenle saklanır; uygulamada tutulmaz.

---

## 10. Değişiklikler

Bu politika zaman zaman güncellenebilir. Önemli değişikliklerde uygulama içinde veya bu sayfada bilgilendirme yapılır. "Son güncelleme" tarihi en güncel sürümü gösterir.

---

## 11. İletişim

Soruların veya talepler için:
**support@stoikos.app** — Bilge İnön

---

### 📝 Kalan işler
- Bu metnin **İngilizce (ve gerekiyorsa DE/RU/FR/ES)** çevirileri.
- Bir avukat/danışman son kontrolü.
- `public/gizlilik.html` güncellenmeli (bu md ile senkronize edilecek).
