# Arkadaşınla Program — Tasarım Notu

> Durum: **taslak, yapılmadı.** Ekranlar, veri altyapısı ve API sözleşmesinin ayrıntısı en alttaki **Ek A–E**'de.
> Hedef sürüm: v1.1 (yayından sonraki ilk güncelleme).
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

---

# EKLER — Uygulama düzeyinde ayrıntı

> Aşağıdaki üç ek, yukarıdaki kararları kodlanabilir hâle getirir. Çelişki
> olursa **ekler geçerlidir** (daha sonra ve daha ayrıntılı yazıldılar).

## Ek A — Ekranlar

Mevcut yapı: `app/programs.tsx` tek ekran — program listesi, `openId` ile
açılan program detayı (gün listesi) ve `dayIdx` ile açılan gün modalı. Ana
ekranda programlara giden tek satır var (`ModuleRow` "❖"). Yeni tasarım bu
yapıyı bozmaz; üstüne katman ekler.

### A1. Program listesi (değişiklik küçük)

```
┌──────────────────────────────────────┐
│ ◎  Kontrol Dairesi            3/7    │
│    7 günde huzurun temeli            │
│    👥 Ayşe ile · Ayşe 4/7            │  ← yalnız eşleşme varsa
├──────────────────────────────────────┤
│ ▲  Öfkeyle Çalışmak           0/7    │
│    👥 Davet bekleniyor · 6 gün       │  ← açık davet varsa
└──────────────────────────────────────┘
```

Durumlar: eşleşme yok → satır yok · davet açık → "Davet bekleniyor · N gün" ·
aktif → "<ad> ile · <ad> n/7" · arkadaş bugün bir şey yaptıysa satır başında
altın nokta (okunmamış olay).

### A2. Program detayı — tek başına (yeni satır)

Gün listesinin **üstüne**, program başlığının altına:

```
  ┌────────────────────────────────────┐
  │ 👥  Bir arkadaşla yürü           › │
  │     Birbirinizin ilerlemesini görün │
  └────────────────────────────────────┘
```

Görünürlük kuralları:
| Durum | Satır |
|---|---|
| Plus + eşleşme yok + kullanıcının başka aktif eşleşmesi yok | görünür |
| Plus değil | görünür, dokununca Paywall (metin: "Arkadaşını davet etmek Plus'a dahil") |
| Başka programda aktif eşleşme var | gizli (v1: tek aktif eşleşme) |
| Web | görünür (özellik web'de de çalışır; yalnız push yok) |

### A3. Davet alt sayfası (yeni, `components/PairInviteSheet.tsx`)

Üç adım, aynı sayfada sırayla:

```
Adım 1 — Ad                      Adım 2 — Hazır                 Adım 3 — Beklerken
┌─────────────────────────┐      ┌─────────────────────────┐    ┌─────────────────────────┐
│ Arkadaşın seni nasıl    │      │     K 7 M 4 Q P         │    │ Davet gönderildi        │
│ görsün?                 │      │                         │    │ 7 gün geçerli           │
│ [ Ayşe              ]   │      │ [  Davet gönder  ↗  ]   │    │                         │
│ En çok 20 karakter      │      │ [  Kodu kopyala     ]   │    │ K7M4QP  · Kopyala       │
│                         │      │                         │    │ Tekrar gönder           │
│ [   Devam   ]           │      │ Arkadaşın katılınca     │    │ Daveti iptal et         │
└─────────────────────────┘      │ burada göreceksin.      │    └─────────────────────────┘
                                 └─────────────────────────┘
```

- Takma ad `stoikos_pair_nickname` anahtarında hatırlanır; ikinci davette dolu gelir.
- "Davet gönder" → `Share.share` (web'de `navigator.share`, yoksa panoya kopyala +
  "Kopyalandı" bildirimi — `Alert` değil, `constants/dialog.ts` → `notify`).
- Hata durumları: 402 → Paywall · 409 (zaten aktif eşleşme) → mesaj · ağ hatası →
  "Bağlanılamadı, tekrar dene" ve adım 1'de kal.
- Yeniden başlatma uyarısı: kullanıcının o programda tek başına ilerlemesi
  varsa adım 1'in altında: "Birlikte 1. günden başlayacaksınız. Tek başına
  ilerlemen (3/7) saklanır." (Ek B4'e bak — silinmez.)

### A4. Katılma ekranı (yeni, `app/join/[code].tsx`)

Giriş yolları: `stoikos://davet/K7M4QP` · web `…/stoikos-app/join/K7M4QP` ·
Ayarlar/Onboarding'deki "Davet kodum var" alanı → `router.push('/join/' + kod)`.

```
┌──────────────────────────────────────┐
│                 ▲                    │
│   Ayşe seni birlikte yürümeye        │
│   çağırıyor                          │
│                                      │
│   ÖFKEYLE ÇALIŞMAK · 7 gün           │
│   "Öfke geldiğinde ilk iş: ertele."  │  ← 1. günün ilk cümlesi
│                                      │
│   Ayşe seni nasıl görsün?            │
│   [ Mehmet            ]              │
│                                      │
│   [        Katıl        ]            │
│   Vazgeç                             │
│                                      │
│   Görünen: takma adın ve hangi       │
│   günde olduğun. Yansımaların        │
│   paylaşılmaz.                       │  ← gizlilik özeti, her zaman görünür
└──────────────────────────────────────┘
```

Durumlar (`GET /pair/preview` yanıtına göre):
| Yanıt | Ekran |
|---|---|
| 200 | yukarıdaki |
| 404 `not_found` | "Bu kod bulunamadı. Harfleri kontrol et." + kod giriş alanı |
| 410 `expired` / `used` | "Bu davetin süresi dolmuş / kullanılmış. Ayşe'den yenisini iste." |
| 409 `self` | "Kendi davetine katılamazsın." (aynı userId) |
| 409 `already_paired` | "Zaten bir programı birlikte yürüyorsun. Önce onu bırak." |
| ağ hatası | tekrar dene düğmesi |

Katıl → `POST /pair/join` → başarıda `router.replace('/programs?open=<programId>')`.
Onboarding tamamlanmamışsa katılma ekranı onboarding **sonrasına** ertelenir
(kod `stoikos_pending_invite`'ta bekler).

### A5. Program detayı — birlikte (değişen ekran)

```
┌──────────────────────────────────────┐
│ ▲ Öfkeyle Çalışmak                   │
│ 👥 Ayşe ile          Sen 3/7 · A 4/7 │
│ Ayşe 4. günü bitirdi · 2 sa önce     │
├──────────────────────────────────────┤
│ 1  Ertele                     ● ●    │  ← sol nokta sen, sağ nokta Ayşe
│ 2  İstemsiz olanı ayır        ● ●    │     dolu: bitti · boş halka: bitmedi
│ 3  Yargıyı bul                ● ●    │
│ 4  Yargıyı değiştir           ○ ●    │
│ 5  Bedeli gör  🔒             ○ ○    │
├──────────────────────────────────────┤
│ AYŞE'YE YAZ                          │
│ (Bugünü bitirdim ✓)(Aklımdasın)(🔥)… │  ← yatay kaydırılan çipler
│                                      │
│ Ayşe: Sen de yapabilirsin 💪 · dün   │  ← son 3 olay (mesaj + gün bitirme)
│ Sen:  Teşekkürler 🙏 · dün           │
├──────────────────────────────────────┤
│ Birlikte yürümeyi bırak              │  ← en altta, sönük
└──────────────────────────────────────┘
```

- Nokta renkleri program rengini kullanır; erişilebilirlik için her nokta
  `accessibilityLabel` alır ("Ayşe: tamamladı").
- Çipe dokununca iyimser güncelleme: olay listeye hemen eklenir, çip 1 sn
  "Gönderildi ✓" olur; sunucu reddederse geri alınır ve çipin altında neden
  yazar (ör. `waiting` günlük sınırı: "Bugün zaten haber verdin").
- `waiting` çipi yalnız arkadaş **en az 1 gün geride** ise görünür.
- "Birlikte yürümeyi bırak" → `confirmAction` (iki dokunuş değil, onay kutusu;
  geri alınamaz) → `POST /pair/leave`.
- Arkadaş ayrıldıysa: üst satır "Ayşe birlikte yürümeyi bıraktı. Tek başına
  devam edebilirsin." ve ekran tek başına görünüme döner (ilerleme korunur).

### A6. Gün modalı (küçük değişiklik)

"Tamamladım" işaretlenince mevcut kapanma davranışı aynen kalır. Eşleşme
varsa modalın alt notu: "Ayşe'ye haber verildi." Bu, gün bitirmenin
arkadaşa görünür olduğunu ilk kullanımda açıkça söyler.

### A7. Bitiş (mevcut bitiş akışına ek)

| Durum | Ek blok (kapanış yansımasının **üstünde**) |
|---|---|
| İkisi de bitirdi | "İkiniz de yedi günü tamamladınız." + `Sıradakini birlikte başlat` |
| Sen bitirdin, arkadaş bitirmedi | "Ayşe 4. günde. Ona cesaret ver." + çip şeridi |
| Arkadaş bitirdi, sen bitirmedin | (bitiş ekranı henüz yok; A5'teki durum satırı yeter) |
| Misafirsin ve ikiniz de bitirdiniz | `Sıradakini birlikte başlat` → Paywall (misafir geçişi bitti) |

`Sıradakini birlikte başlat` → yeni program için `POST /pair/create` +
`autoInvite: pairId` (Ek C3): arkadaşa kod göndermeye gerek kalmadan aynı iki
kişi yeni eşleşmeye düşer; arkadaşın ekranında "Ayşe sıradaki programı
önerdi · Katıl / Şimdi değil".

### A8. Diğer yerler

- **Ana ekran:** `ModuleRow` "❖ Programlar" açıklaması eşleşme varsa değişir:
  "Ayşe ile · Ayşe bugün 4. günü bitirdi". Okunmamış olay varsa altın nokta.
- **Ayarlar:** "Davet kodum var" satırı → 6 haneli kod alanı (büyük harfe
  çevirir, alfabe dışı karakterde uyarır — Ek B3) → A4.
- **Onboarding:** son slayda küçük bağlantı "Davet kodun mu var?" (yalnız
  uygulamayı bir davetle indirenler için; bağlantı sönük).

## Ek B — Veri altyapısı

### B1. Sunucu (D1) — kesin şema

§7'deki şemanın yerine geçer. Değişiklikler: gün ilerlemesi JSON yerine ayrı
tablo (tekil işaretleme çakışmasız olsun diye), `pair_reads` (okunmadı
noktası), `invites` ayrı tablo (bir eşleşme birden çok davet geçmişi taşıyabilsin).

```sql
-- Eşleşme: iki kişilik program yolculuğu
CREATE TABLE IF NOT EXISTS pairs (
  id            TEXT PRIMARY KEY,               -- 'p_' + 20 rastgele karakter
  program_id    TEXT NOT NULL,                  -- programs.ts id'si
  status        TEXT NOT NULL DEFAULT 'open',   -- open | active | ended
  end_reason    TEXT,                           -- left | inactive | cancelled
  prev_pair_id  TEXT,                           -- "sıradakini birlikte" zinciri
  created_at    INTEGER NOT NULL,
  last_activity INTEGER NOT NULL,
  ended_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pairs_status_act ON pairs (status, last_activity);

-- Üyeler. user_id YALNIZ sunucuda; istemciye member_id gider.
CREATE TABLE IF NOT EXISTS pair_members (
  pair_id    TEXT NOT NULL,
  member_id  TEXT NOT NULL,                     -- 'm_' + 12 rastgele karakter
  user_id    TEXT NOT NULL,
  nickname   TEXT NOT NULL,
  role       TEXT NOT NULL,                     -- host | guest
  joined_at  INTEGER NOT NULL,
  left_at    INTEGER,
  PRIMARY KEY (pair_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_pm_user ON pair_members (user_id, left_at);

-- Davet kodları
CREATE TABLE IF NOT EXISTS pair_invites (
  code       TEXT PRIMARY KEY,                  -- 6 karakter, alfabe Ek B3
  pair_id    TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER,
  used_by    TEXT                               -- member_id
);

-- Gün ilerlemesi (eşleşme içindeki)
CREATE TABLE IF NOT EXISTS pair_days (
  pair_id   TEXT NOT NULL,
  member_id TEXT NOT NULL,
  day       INTEGER NOT NULL,                   -- 0 tabanlı, programs.ts ile aynı
  done_at   INTEGER NOT NULL,
  PRIMARY KEY (pair_id, member_id, day)
);

-- Olay akışı: gün bitirme + hazır mesaj + sistem olayları
CREATE TABLE IF NOT EXISTS pair_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  pair_id     TEXT NOT NULL,
  from_member TEXT NOT NULL,                    -- sistem olayında 'sys'
  kind        TEXT NOT NULL,                    -- day_done | msg | joined | left | next_proposed
  payload     TEXT NOT NULL,                    -- gün no | mesaj anahtarı | yeni pair_id
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pe_pair ON pair_events (pair_id, id);

-- Okundu imleci (altın nokta için)
CREATE TABLE IF NOT EXISTS pair_reads (
  pair_id    TEXT NOT NULL,
  member_id  TEXT NOT NULL,
  last_event INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (pair_id, member_id)
);
```

Neden D1, KV değil: eşleşme ilişkisel (iki üye, olaylar, "kullanıcının aktif
eşleşmesi var mı" sorgusu); KV'de bu sorgular tam tarama ister. D1 zaten
Meydan Okuma için bağlı (`env.DB`), yeni kaynak gerekmez.

### B2. Veri yaşam döngüsü

| Olay | Ne olur |
|---|---|
| Davet oluşturuldu | `pairs(open)` + `pair_members(host)` + `pair_invites` |
| 7 gün katılım yok | davet geçersiz; cron `pairs` → `ended/cancelled` |
| Katılım | `status=active`, `used_at`, `pair_members(guest)`, `joined` olayı |
| Ayrılma | `left_at`, `status=ended/left`, `left` olayı |
| 14 gün hareketsiz | cron → `ended/inactive` |
| `ended` + 30 gün | cron **fiziksel olarak siler**: 5 tablodaki tüm satırlar |
| Hafıza sıfırlama (`/memory/reset`) | eşleşmelere dokunmaz (ayrı veri; gizlilik metni bunu söylemeli) |

Silme süresi (30 gün) gizlilik politikasına aynen yazılmalı.

### B3. Kimlikler ve kodlar

- `pair_id`, `member_id`: `crypto.getRandomValues` ile, Worker'da.
- Davet kodu alfabesi: `ABCDEFGHJKMNPQRSTUVWXYZ2345679` (30 karakter; `I L O 0 1 8`
  yok). 6 hane → 30⁶ ≈ 729 milyon. Çakışmada yeniden üret (en çok 5 deneme).
- İstemci girişini normalleştirme: büyük harfe çevir, boşluk ve tireyi sil.
  Alfabede olmayan karakter (`I L O 0 1 8`) görülürse **tahmin edip
  düzeltme yapılmaz** — yanlış bir koda eşleştirebilir; bunun yerine
  "Bu karakter kodlarda yok" uyarısı gösterilir.
- **`user_id` hiçbir yanıtta yer almaz.** Test: her `/pair/*` yanıtı
  `JSON.stringify` edilip `u_` öneki aranır; birim testte zorunlu.

### B4. İstemci (AsyncStorage)

| Anahtar | İçerik | Not |
|---|---|---|
| `stoikos_pair_state` | son `/pair/state` yanıtı | çevrimdışı görünüm için önbellek |
| `stoikos_pair_outbox` | gönderilemeyen `day`/`msg` istekleri | Ek B5 |
| `stoikos_pair_nickname` | son kullanılan takma ad | |
| `stoikos_pending_invite` | onboarding bitmeden gelen kod | |
| `stoikos_program_<id>` | **tek başına** ilerleme — dokunulmaz | |
| `stoikos_program_pair_<pairId>` | eşleşmeli ilerlemenin yerel kopyası | |

İki ilerleme bilerek ayrı: eşleşme bitince kullanıcıya "Kaldığın yerden tek
başına devam et" sunulur → `stoikos_program_pair_<pairId>` içeriği
`stoikos_program_<id>`'ye kopyalanır (tek başına ilerleme daha ileriyse
dokunulmaz — büyük olan kazanır).

Gün kilidi (`isUnlocked`) eşleşme varsa `stoikos_program_pair_<pairId>`'e
bakar; kural aynı: kendi önceki günün bitmişse açık.

### B5. Senkronizasyon

- **Çekme:** program ekranı odaklanınca + açıkken 60 sn'de bir + uygulama
  ön plana gelince `GET /pair/state?since=<son olay id>`. Gerçek zamanlı
  bağlantı (WebSocket/Durable Object) **gerekmez**: olaylar günde birkaç tane.
- **Gönderme:** yerel yazım önce (`stoikos_program_pair_<pairId>`), sonra
  `POST`. Başarısızsa `stoikos_pair_outbox`'a eklenir; sonraki çekmede sırayla
  yeniden denenir. İstekler **idempotent**: `pair_days` birincil anahtarı aynı
  günün iki kez yazılmasını engeller; mesajlar istemci üretimli `clientId`
  taşır (Ek C), sunucu aynı `clientId`'yi ikinci kez yazmaz.
- **Çakışma:** tek yazarlı veri (her üye yalnız kendi günlerini yazar), bu
  yüzden birleştirme kuralı gerekmez.

### B6. Maliyet

Kullanıcı başına günde ~3 yazma + ~30 okuma (60 sn çekme, ekran açıkken).
D1 ücretsiz katmanı günde 5 milyon okuma / 100 bin yazma → ~30 bin günlük
aktif eşleşmeli kullanıcıya kadar ek maliyet yok. Claude çağrısı yalnız takma
ad denetiminde (eşleşme başına 2 × Haiku, ~$0,0002).

## Ek C — Backend uç noktaları (API sözleşmesi)

Ortak kurallar:
- Tüm yollar `backend/src/index.ts` içinde, `/pair/` önekiyle; mevcut `json()`
  ve `CORS` kullanılır.
- Kimlik: şimdilik diğer uçlarla aynı — `userId` gövdede (POST) ya da sorguda
  (GET). RevenueCat'e geçişte hepsi birlikte değişecek.
- Hata biçimi: `{ "error": "<kod>" }` + HTTP durumu. **Kullanıcıya görünen
  metin istemcide çevrilir** (koçtaki `scope` deseni); sunucu Türkçe cümle döndürmez.
- Hız sınırı: mevcut `hitLimit`. Varsayılan kullanıcı başına dakikada 20,
  kod deneyen uçlarda (`preview`, `join`) IP başına dakikada 10 + günde 100.
- Takma ad: `trim`, kontrol karakterleri silinir, 1–20 karakter, sonra Haiku
  denetimi (`moderateNickname`, `moderateQuote` deseni). Reddedilirse
  `400 nickname_rejected`.

### C1. `POST /pair/create`

```json
// istek
{ "userId": "u_…", "programId": "anger", "nickname": "Ayşe",
  "autoInvite": "p_önceki" }            // isteğe bağlı, A7
// 200
{ "pairId": "p_x9…", "code": "K7M4QP", "expiresAt": 1759700000000,
  "link": "https://stoikos.app/davet/K7M4QP" }
```
Hatalar: `402 plus_required` · `409 already_paired` (açık/aktif eşleşme var;
yanıtta `pairId` döner, istemci onu açar) · `400 bad_program` ·
`400 nickname_rejected` · `429 rate_limited`.
`autoInvite` verilirse: önceki eşleşmenin iki üyesi de bu eşleşmeye doğrudan
eklenir, davet kodu üretilmez, diğer üyeye `next_proposed` olayı yazılır;
üye kabul edene kadar `status=open` kalır (kabul: C3 `join` + `pairId`).
Misafir önceki eşleşmede misafirse bu kez de Plus kontrolü **davet eden** için yapılır.

### C2. `GET /pair/preview?code=K7M4QP&userId=u_…`

```json
// 200
{ "programId": "anger", "hostNickname": "Ayşe", "expiresAt": 1759700000000 }
```
Hatalar: `404 not_found` · `410 expired` · `410 used` · `409 self` ·
`409 already_paired`. **Kimseyi katmaz**, yalnız okur.

### C3. `POST /pair/join`

```json
// istek (kodla)
{ "userId": "u_…", "code": "K7M4QP", "nickname": "Mehmet" }
// istek (A7 önerisini kabul)
{ "userId": "u_…", "pairId": "p_yeni" }
// 200
{ "pairId": "p_x9…", "memberId": "m_…", "programId": "anger", "guest": true }
```
Hatalar: C2'ninkiler + `400 nickname_rejected`. İşlem tek D1 `batch` içinde:
kod `used_at IS NULL` koşuluyla güncellenir, etkilenen satır 0 ise `410 used`
(aynı anda iki kişinin katılması yarışını böyle kapatır).
`guest`: katılanın kendi Plus'ı yoksa `true`.

### C4. `GET /pair/state?userId=u_…&since=0`

```json
// 200
{
  "pair": {                              // aktif ya da açık eşleşme yoksa null
    "pairId": "p_x9…", "programId": "anger", "status": "active",
    "me":     { "memberId": "m_a…", "nickname": "Mehmet", "role": "guest",
                "days": [0,1,2] },
    "friend": { "memberId": "m_b…", "nickname": "Ayşe", "role": "host",
                "days": [0,1,2,3], "left": false },
    "invite": null,                      // açıkken { "code", "expiresAt" }
    "guest":  true,
    "waitingSentToday": false,
    "proposal": null                     // A7: { "pairId", "programId" }
  },
  "events": [
    { "id": 812, "from": "m_b…", "kind": "day_done", "payload": "3", "at": 1759… },
    { "id": 813, "from": "m_b…", "kind": "msg", "payload": "cheer", "at": 1759… }
  ],
  "unread": 2,
  "lastEventId": 813
}
```
`since` verilirse yalnız daha yeni olaylar döner (en çok 50). `me.days`
sunucudaki kayıttır; istemci kendi yerel kopyasıyla birleştirip eksikleri
outbox'tan gönderir.

### C5. `POST /pair/day`

```json
{ "userId": "u_…", "pairId": "p_x9…", "day": 3, "done": true }
// 200
{ "ok": true, "days": [0,1,2,3] }
```
Kurallar: `day` aralık dışıysa `400 bad_day` · önceki gün bitmemişse
`409 locked` (istemci zaten engelliyor; sunucu tutarlılık için) ·
`done:false` işareti kaldırır, olay **yazmaz** (arkadaşa "geri aldı"
bildirimi gitmesin) · `done:true` ilk kez yazılıyorsa `day_done` olayı.
`last_activity` güncellenir.

### C6. `POST /pair/msg`

```json
{ "userId": "u_…", "pairId": "p_x9…", "key": "cheer", "clientId": "c_17…" }
// 200
{ "ok": true, "eventId": 814 }
```
Kurallar: `key` beyaz listede (`done hard cheer waiting thinking thanks fire
together`) değilse `400 bad_key` · `waiting` günde 1 → `429 waiting_limit` ·
genel sınır eşleşme başına kişi başı günde 20 mesaj → `429 rate_limited` ·
aynı `clientId` ikinci kez → önceki `eventId` ile `200` (idempotent).

### C7. `POST /pair/read`

```json
{ "userId": "u_…", "pairId": "p_x9…", "lastEventId": 814 }
// 200
{ "ok": true }
```
Altın noktayı söndürür. Program detayı açıldığında çağrılır.

### C8. `POST /pair/leave`

```json
{ "userId": "u_…", "pairId": "p_x9…" }
// 200
{ "ok": true, "days": [0,1,2] }         // tek başına devam için
```
Açık davetteyse (arkadaş henüz katılmadıysa) aynı uç daveti iptal eder
(`end_reason=cancelled`).

### C9. `GET /pair/entitlement?userId=u_…&programId=anger`

```json
{ "guest": true }
```
İstemcide `usePlus()` ile birlikte okunur ve önbelleklenir (Plus kararındaki
çevrimdışı ilke aynen). `plusOk = plus || !ENFORCE_PLUS_GATE || guest`.
Misafir geçişi eşleşme `active` iken ve eşleşmenin `program_id`'si için geçerli;
eşleşme bitince o programı **bitirmesine** izin verilir (yarıda kesilmez),
yeni programa geçemez.

### C10. Zamanlanmış iş (`scheduled`, günde 1)

`wrangler.toml` → `[triggers] crons = ["17 3 * * *"]`.
1. Süresi geçmiş açık davetler → `ended/cancelled`.
2. 14 gün `last_activity` olmayan aktifler → `ended/inactive` + `left` olayı ('sys').
3. `ended_at` 30 günden eski eşleşmeler → 5 tablodan fiziksel silme.

### C11. Test listesi (backend)

- İki kullanıcı: davet → önizleme → katılma → iki taraf da `state`'te birbirini görüyor.
- Aynı koda eşzamanlı iki katılım → biri `410 used`.
- Kendi koduna katılma → `409 self`.
- Aktif eşleşme varken yeni davet → `409 already_paired`.
- `waiting` iki kez aynı gün → ikincisi `429`.
- Aynı `clientId` iki kez → tek olay.
- `done:false` → olay yok.
- Ayrıl → arkadaşın `state`'inde `friend.left = true`; misafir o programı bitirebiliyor.
- Hiçbir yanıtta `u_` öneki yok.
- Cron: 14 gün sonrası `inactive`, 44 gün sonrası satır yok.

## Ek D — Metin anahtarları (i18n, 6 dil)

`pair.row`, `pair.rowSub`, `pair.plusNeeded`, `pair.nickQ`, `pair.nickHint`,
`pair.continue`, `pair.send`, `pair.copy`, `pair.copied`, `pair.sentTitle`,
`pair.validDays`, `pair.resend`, `pair.cancelInvite`, `pair.restartNote`,
`pair.shareMsg`, `pair.joinTitle`, `pair.join`, `pair.notNow`, `pair.privacyNote`,
`pair.err.notFound`, `pair.err.expired`, `pair.err.used`, `pair.err.self`,
`pair.err.alreadyPaired`, `pair.err.nickRejected`, `pair.err.network`,
`pair.with`, `pair.friendDid`, `pair.writeTo`, `pair.sentOk`, `pair.waitingLimit`,
`pair.leave`, `pair.leaveConfirm`, `pair.friendLeft`, `pair.continueSolo`,
`pair.notified`, `pair.bothDone`, `pair.nudgeFriend`, `pair.nextTogether`,
`pair.proposal`, `pair.haveCode`, `pair.badChar`, `pair.pending`,
`pair.msg.done|hard|cheer|waiting|thinking|thanks|fire|together` → **~50 anahtar × 6 dil**.

## Ek E — Yapım sırası

Her adım kendi başına birleştirilebilir, önceki adım olmadan çalışmayan bir
şey yayına çıkmaz (hepsi `FEATURES.pairs = false` bayrağı arkasında):

1. Şema + C1–C4 + C8 + testler (backend, bayrak arkasında zararsız).
2. `constants/pairs.ts` + A3 davet + A4 katılma → iki cihazda uçtan uca katılma.
3. A5 birlikte görünüm + C5–C7 + outbox.
4. A1, A7, A8 + C9 misafir geçişi.
5. C10 cron, gizlilik metni, i18n tamamlama.
6. Bayrağı aç.
