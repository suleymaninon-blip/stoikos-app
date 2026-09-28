# Arkadaşınla Program — Tasarım Notu

> Durum: **taslak, yapılmadı.** Hedef sürüm: v1.1 (yayından sonraki ilk güncelleme).
> Tarih: 28 Eylül 2026.

## 1. Neden bu, neden birebir mesajlaşma değil

İstek şuydu: aboneler arasında birebir mesaj ve belge paylaşımı yapılabilen,
insanların tanışmasını sağlayan bir kanal. İhtiyaç gerçek ("bu yolda yalnız
değilim"), ama o biçim şimdilik reddedildi:

| Birebir mesaj (yabancılarla) | Arkadaşınla program |
|---|---|
| Önce gerçek hesap sistemi şart | Mevcut cihaz kimliğiyle başlayabilir |
| Apple/Google UGC kuralları: filtre, şikâyet, engelleme, 7/24 yanıt | Serbest metin yok → UGC kapsamı neredeyse yok |
| Mesajlar hassas veri (ruh sağlığı) → KVKK yükü büyük | Paylaşılan tek şey: takma ad + gün ilerlemesi |
| Belge paylaşımı: zararlı dosya, telif, yasa dışı içerik | Dosya yok |
| Moderasyon ekibi gerekir | Moderasyon gerekmez |
| Boş oda sorunu (kritik kitle gerekir) | İki kişi yeter, ilk günden dolu |
| Maliyet: gider kalemi | Her davet yeni indirme → **büyüme kanalı** |

Yol haritası: **(1) Arkadaşınla program** → (2) anonim ortak yansımalar → (3)
program başına grup kanalı → (4) birebir mesaj, ancak önceki adımların verisi
haklı çıkarırsa ve hazır bir mesajlaşma servisiyle.

## 2. Özellik tek cümlede

Kullanıcı bir programı **tanıdığı biriyle** birlikte yürür: birbirinin hangi
günde olduğunu görür, gün bitince diğerine haber gider, **hazır mesajlarla**
birbirini cesaretlendirir. Yansımalar paylaşılmaz.

## 3. Kurallar (tasarım kararları)

1. **İki kişi.** Grup değil. Aynı anda program başına tek eşleşme.
2. **Serbest metin yok.** Mesajlar sabit listeden seçilir (§6). Tek serbest alan
   takma ad (≤ 20 karakter) ve o yalnız davet edilen kişiye görünür — zaten
   tanıdığı biri.
3. **Kimse kimseyi bekletmez.** Gün kilidi kişiseldir: kendi önceki gününü
   bitiren bir sonrakine geçer. Arkadaş geride kalırsa ilerleme durmaz.
   (Bekletmek, geride kalanı suçlu hissettirip ikisini birden bıraktırır.)
4. **Yansımalar paylaşılmaz.** Günlük ve kapanış yansıması cihazda kalır. KVKK
   rızası günlük yansıma için verildi; arkadaşa göstermek ayrı bir paylaşım olurdu.
5. **Dürtme sınırlı.** Kişi başına günde en çok 1 "seni bekliyorum" türü mesaj.
   Israrlı bildirim, arkadaşlığı uygulamanın zararına çevirir.
6. **Ayrılmak tek dokunuş.** "Birlikte yürümeyi bırak" → eşleşme biter, kendi
   ilerlemen kalır. Ayrı bir engelleme gerekmez: davet tek kullanımlık, ayrılan
   kişiye yeniden ulaşmanın yolu yok.
7. **Hareketsizlik.** 14 gün hiçbir taraf bir şey işaretlemezse eşleşme
   kendiliğinden arşivlenir.

## 4. Plus ile ilişkisi — "misafir geçişi"

- **Davet eden Plus olmalı** (programlar Plus). Sunucu davet oluştururken kontrol eder.
- **Davet edilen, o tek program için ücretsiz girer** — yalnız eşleşme sürdükçe.
- Program bitince davet edilen, bitiş ekranında Plus teklifini görür:
  "Sıradaki programı da birlikte yürüyün."

Gerekçe: davet edilen kişi, Plus'ı *bir arkadaşla birlikte* deneyimlemiş
oluyor — en sıcak dönüşüm anı. Davet eden için de değerli: arkadaşını
getirebildiği bir aboneliği bırakması daha zor.

## 5. Akış ve ekranlar

**A. Davet (davet eden)**
1. Program detayında yeni satır: `👥 Bir arkadaşla yürü`.
2. Alt sayfa: takma ad ("Arkadaşın seni nasıl görsün?") → `Davet gönder`.
3. Sistem paylaşım menüsü açılır; metin: *"Ayşe seni STOIKOS'ta 'Öfkeyle
   Çalışmak' programını birlikte yürümeye çağırıyor. Kod: K7M4QP —
   stoikos.app/davet/K7M4QP"*
4. Program ekranında bekleme durumu: "Davet gönderildi · 7 gün geçerli · Kodu kopyala · İptal".

**B. Katılma (davet edilen)**
1. Bağlantı açılır:
   - Uygulama yüklüyse → `stoikos://davet/K7M4QP` → katılma ekranı.
   - Yüklü değilse → `stoikos.app/davet/K7M4QP` sayfası: davet eden + program
     adı, mağaza düğmeleri, büyük harflerle **kod**. Kurulumdan sonra
     Ayarlar'daki (ve ilk açılıştaki) "Davet kodum var" alanına girilir.
     *(Kurulum sonrası otomatik yakalama — deferred deep link — v1'de yok;
     kod yolu hem basit hem her platformda çalışıyor.)*
2. Katılma ekranı: "**Ayşe** seni **Öfkeyle Çalışmak** programına çağırıyor" +
   programın ilk gününden bir satır + takma ad alanı → `Katıl`.
3. İkisi de **1. günden** başlar. Davet edenin o programda eski tek başına
   ilerlemesi varsa sorulur: "Birlikte baştan başlayacaksınız" (onayla).

**C. Birlikte yürürken**
- Gün listesinde her satırın sağında iki nokta: sen ● / arkadaşın ●.
- Üstte durum satırı: "Ayşe bugün 4. günü bitirdi · 2 saat önce".
- Hazır mesaj şeridi (yatay çipler, §6); gelen son 3 mesaj altında.
- Gün bitince arkadaşa otomatik olay gider: "Mehmet 3. günü bitirdi 🔥".
- Ana ekranda program kartı: "Ayşe ile · Sen 3/7 · Ayşe 4/7".

**D. Bitiş**
- İkisi de bitirince ortak kutlama: "İkiniz de yedi günü tamamladınız."
- Mevcut bitiş akışı (kapanış yansıması, sıradaki program) aynen çalışır;
  sıradaki program önerisine `Birlikte başla` düğmesi eklenir.
- Biri bitirip diğeri bitirmemişse, bitiren tarafta "Ayşe'yi bekle / cesaret ver".

## 6. Hazır mesajlar

Sunucuda yalnız **anahtar** saklanır; alıcı kendi dilinde görür (6 dil,
`i18n.tsx` → `pair.msg.*`). Yani iki kişi farklı dilde konuşsa bile anlaşır.

| Anahtar | TR |
|---|---|
| `done` | Bugünü bitirdim ✓ |
| `hard` | Bugün zordu ama yaptım |
| `cheer` | Sen de yapabilirsin 💪 |
| `waiting` | Seni bekliyorum *(günde 1 sınırlı)* |
| `thinking` | Aklımdasın |
| `thanks` | Teşekkürler 🙏 |
| `fire` | 🔥 |
| `together` | Birlikte daha kolay |

## 7. Veri modeli (D1, `backend/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS pairs (
  id          TEXT PRIMARY KEY,          -- rastgele, 16+ karakter
  program_id  TEXT NOT NULL,
  invite_code TEXT UNIQUE,               -- 6 karakter, katılınca NULL
  invite_exp  INTEGER,                   -- ms; 7 gün
  status      TEXT NOT NULL DEFAULT 'open', -- open | active | ended
  created_at  INTEGER NOT NULL,
  last_activity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pair_members (
  pair_id    TEXT NOT NULL,
  member_id  TEXT NOT NULL,              -- rastgele; arkadaşa görünen kimlik
  user_id    TEXT NOT NULL,              -- ASLA istemciye dönmez
  nickname   TEXT NOT NULL,
  days_done  TEXT NOT NULL DEFAULT '[]', -- JSON dizi, ör. [0,1,2]
  role       TEXT NOT NULL,              -- host | guest
  joined_at  INTEGER NOT NULL,
  PRIMARY KEY (pair_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_pm_user ON pair_members (user_id);

CREATE TABLE IF NOT EXISTS pair_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  pair_id    TEXT NOT NULL,
  from_member TEXT NOT NULL,
  kind       TEXT NOT NULL,              -- day_done | msg
  payload    TEXT NOT NULL,              -- gün no ya da mesaj anahtarı
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pe_pair ON pair_events (pair_id, created_at);
```

⚠️ **`user_id` arkadaşa asla gönderilmez.** Bugün `userId` fiilen bir parola
gibi çalışıyor: bilen herkes o kullanıcı adına koça yazabilir, hafızasını
silebilir. Arkadaş yalnız `member_id` görür.

Kod alfabesi: karışan harfler çıkarılmış 30 karakter (`ABCDEFGHJKMNPQRSTUVWXYZ2345679`),
6 hane → ~730 milyon olasılık; `/pair/preview` ve `/pair/join` IP başına
dakikada 10 ile sınırlı (mevcut `hitLimit`).

## 8. Backend uç noktaları (`backend/src/index.ts`)

| Yöntem | Yol | Gövde / sorgu | Dönüş |
|---|---|---|---|
| POST | `/pair/create` | `userId, programId, nickname` | `{ pairId, code, expiresAt }` — Plus değilse 402 |
| GET | `/pair/preview` | `code` | `{ programId, hostNickname }` (katılmadan önce göstermek için) |
| POST | `/pair/join` | `userId, code, nickname` | `{ pairId }` — süresi geçmiş/kullanılmışsa 410 |
| GET | `/pair/state` | `userId` | kullanıcının açık eşleşmeleri: program, iki üyenin `nickname` + `days_done`, son 20 olay |
| POST | `/pair/day` | `userId, pairId, day, done` | `{ ok }` + `day_done` olayı yazar |
| POST | `/pair/msg` | `userId, pairId, key` | `{ ok }` — anahtar beyaz listede değilse 400; `waiting` günde 1 |
| POST | `/pair/leave` | `userId, pairId` | `{ ok }` — eşleşme `ended` |
| GET | `/pair/entitlement` | `userId, programId` | `{ guest: true }` — misafir geçişi kontrolü |

Hareketsizlik arşivi: Worker'a günlük `scheduled` (cron) tetik, 14 gün
`last_activity` görmemiş eşleşmeleri `ended` yapar.

Takma ad denetimi: uzunluk + kontrol karakteri temizliği yeterli; ayrıca mevcut
`moderateQuote` desenindeki Haiku çağrısıyla hakaret kontrolü (ucuz, tek sefer).

## 9. İstemci değişiklikleri

- `constants/pairs.ts` (yeni) — API sarmalayıcıları + `usePairState()` (ekran
  odaklanınca ve 60 sn'de bir yeniler; gerçek zamanlı bağlantı gerekmez).
- `app/programs.tsx` — `👥` satırı, iki noktalı gün listesi, durum satırı,
  mesaj şeridi, ortak bitiş. Gün işaretleme eşleşme varsa `/pair/day`'e de gider
  (önce yerel, sonra sunucu; başarısızsa kuyruğa al).
- `app/join/[code].tsx` (yeni) — katılma ekranı; `stoikos://davet/<kod>` bunu açar.
- `app/settings.tsx` + Onboarding — "Davet kodum var" alanı.
- `app/(tabs)/index.tsx` — ana ekranda eşleşme kartı.
- Plus kapısı: `plusOk = plus || !ENFORCE_PLUS_GATE || isGuestFor(programId)`.
- `public/davet.html` — web açılış sayfası (kod + mağaza bağlantıları); GitHub
  Pages'te `…/davet.html?c=KOD`, alan adına taşınınca `stoikos.app/davet/KOD`.
- `constants/i18n.tsx` — `pair.*` anahtarları, 6 dil (~35 anahtar).

**Bildirimler (faz 2):** "Ayşe 3. günü bitirdi" push bildirimi en değerli
parça, ama Expo push token'ı + sunucudan gönderim ister ve web'de yok. v1:
uygulama içi (ana ekran kartında nokta). v1.1: push.

## 10. Ön koşullar

1. **Yayın.** Bu özellik v1.1; mağazaya çıkışı geciktirmemeli.
2. **Kimlik.** Cihaz kimliği kaybolursa (telefon değişimi, uygulamayı silme)
   eşleşme de kaybolur. v1 için kabul edilebilir, ama RevenueCat bağlanırken
   zaten kurulacak olan kalıcı kimlik (Apple/Google ile giriş ya da RevenueCat
   `appUserId`) bu özelliği de sağlamlaştırır — sıralama: **önce RevenueCat.**
3. **Gizlilik politikası.** Yeni paylaşım: takma ad ve gün ilerlemesi eşleşilen
   kişiye gösterilir; sunucuda eşleşme bitiminden 30 gün sonra silinir.
   TR + EN metne eklenmeli, avukat kontrolüne dahil edilmeli.
4. **Mağaza.** Serbest metin olmadığı için UGC kapsamına girmemesi beklenir;
   inceleme notuna "kullanıcılar yalnız önceden tanımlı mesajlar gönderebilir"
   yazılmalı.

## 11. Ölçüm — işe yaradı mı?

| Metrik | Başarı eşiği |
|---|---|
| Eşleşmeli program tamamlama oranı vs. tek başına | **en az 1,5 kat** |
| Davetin kabul oranı | %30+ |
| Davet başına yeni kurulum (K-faktörü katkısı) | 0,2+ |
| Misafir → Plus dönüşümü (bitişten 14 gün içinde) | tek başına deneme dönüşümünden yüksek |

Tamamlama oranı artmıyorsa bir sonraki adıma (anonim ortak yansımalar)
geçmeden önce neden artmadığı anlaşılmalı.

## 12. Kaba iş tahmini

| Parça | Süre |
|---|---|
| D1 şema + 8 uç nokta + cron + testler | 2–3 gün |
| Program ekranı değişiklikleri + katılma ekranı + ana ekran kartı | 3–4 gün |
| 6 dil metinleri, web davet sayfası | 1 gün |
| Uçtan uca test (iki cihaz), gizlilik metni | 1–2 gün |
| **Toplam (push hariç)** | **~1,5–2 hafta** |
| Push bildirimleri (faz 2) | +2–3 gün |

## 13. Açık sorular

- Davet eden abonelikten çıkarsa misafir ne olur? *Öneri:* devam eden program
  bitene kadar ikisi de devam eder; yeni eşleşme kurulamaz.
- Aynı anda birden fazla programda birlikte yürümek? *Öneri:* v1'de kullanıcı
  başına tek aktif eşleşme — basit tutmak için.
- Tek başına ilerlemeyle eşleşmeli ilerleme ayrı mı tutulsun? *Öneri:* evet;
  eşleşme bitince kullanıcı kaldığı günle tek başına devam edebilir (ilerleme
  yerel anahtara kopyalanır).
