# Telefon uygulamasını derlemek (EAS Build)

> Hazırlandı: 22 Ekim 2026. Uygulamanın iPhone ve Android sürümü Expo'nun bulut
> derleme hizmetinde (EAS) üretilir; bilgisayara Xcode ya da Android Studio
> kurmak gerekmez. Derleme GitHub'dan tek tıkla başlatılabilir.

## Ne hazır

| Ayar | Değer |
|---|---|
| Uygulama kimliği | iOS `com.stoikos.app` · Android `com.stoikos.app` |
| Kullanıcıya görünen sürüm | `1.0.0` (`app.json` → `version`) |
| Derleme numarası | EAS tutar ve her mağaza derlemesinde kendiliğinden artırır (`appVersionSource: remote`, `autoIncrement`) |
| Şifreleme beyanı | `ITSAppUsesNonExemptEncryption: false` — App Store her yüklemede "ihracat uyumluluğu" sormaz |
| Android izinleri | yalnız internet, ses ayarı ve titreşim; mikrofon, depolama ve ekran üstü pencere izinleri **kaldırıldı** (uygulama kullanmıyor; Play'de gereksiz izin inceleme sebebi) |
| Bildirim simgesi | `assets/notification-icon.png` — beyaz, saydam işaret (Android renkli simgeyi beyaz kare gösterir) |
| Açılış ekranı | `expo-splash-screen` eklentisi, `assets/splash.png`, zemin `#1a1814` |
| Koyu tema | `expo-system-ui` eklendi; `userInterfaceStyle: dark` artık telefonda da geçerli |

**Profiller** (`eas.json`):

- **`preview`** — denemelik sürüm. Android'de doğrudan telefona kurulabilen **APK** üretir; Play hesabı gerekmez. iPhone'da yalnız kaydı yapılmış cihazlara kurulur (TestFlight daha kolay, aşağıda).
- **`production`** — mağaza sürümü. iOS için App Store/TestFlight, Android için Play'e yüklenecek **AAB** dosyası.

## Bir kez yapılacaklar

### 1. Expo erişim anahtarı → GitHub
1. https://expo.dev → giriş yap (projeyi oluşturan hesapla) → sağ üstte profil → **Access tokens** → **Create token** (adı: `github`).
2. Çıkan anahtarı kopyala.
3. GitHub'da depo → **Settings → Secrets and variables → Actions → New repository secret** → adı `EXPO_TOKEN`, değeri kopyaladığın anahtar.

Bu kadarla **Android denemelik APK** hemen derlenebilir.

### 2. iOS imzalama (Apple onayı geldikten sonra)
1. **App Store Connect → Uygulamalar → +** → Yeni uygulama: ad `Stoikos`, dil Türkçe, paket kimliği `com.stoikos.app`, SKU `stoikos-ios`.
2. **App Store Connect → Kullanıcılar ve Erişim → Entegrasyonlar → App Store Connect API → +** → ad `EAS`, erişim **App Manager** → `.p8` dosyasını indir (bir kez indirilebilir), **Key ID** ve **Issuer ID**'yi not al.
3. https://expo.dev → stoikos → **Credentials → iOS → App Store Connect API Key → Add** → üç bilgiyi gir.
4. Bundan sonra EAS sertifikaları ve profilleri kendisi üretir; GitHub'dan başlatılan iOS derlemesi soru sormadan çalışır.

### 3. Android'de Play'e gönderme (Play doğrulaması bittikten sonra)
- Google, **ilk** AAB dosyasının Play Console'a **elle** yüklenmesini istiyor (Play Console → Test → İç test → Yeni sürüm → AAB'yi sürükle). Dosya, production derlemesi bitince expo.dev'deki derleme sayfasından indirilir.
- Sonrakiler için otomatik gönderme istenirse Google Cloud'da bir hizmet hesabı (JSON anahtar) oluşturulup expo.dev → Credentials → Android'e eklenir.

## Derleme başlatmak

GitHub → **Actions → EAS Build → Run workflow**:

| Ne istiyorsun | Platform | Profil | Mağazaya gönder |
|---|---|---|---|
| Arkadaşlarına Android'de denetmek | android | preview | — |
| iPhone'da TestFlight ile denemek | ios | production | ✓ |
| Play iç test | android | production | (ilk seferde elle yükle) |

İş birkaç dakikada "başlatıldı" der ve biter; asıl derleme Expo'da **10–30 dakika** sürer (ücretsiz planda kuyruk olabilir; ayda sınırlı sayıda derleme hakkı var). Bitince expo.dev → stoikos → **Builds** sayfasında indirme bağlantısı ve QR kodu çıkar; iOS'ta "gönder" seçildiyse derleme TestFlight'a kendiliğinden düşer (Apple işlemesi ~15 dk daha).

Bilgisayardan da başlatılabilir: `npm i -g eas-cli && eas login && eas build -p android --profile preview`.

## Yayından önce kontrol (mağaza derlemesinden önce)

- [ ] RevenueCat bağlandı mı? (Bağlanınca `react-native-purchases` eklenir — **yeni bir derleme gerekir**, web gibi kendiliğinden güncellenmez.)
- [ ] `backend/src/index.ts` → `WEEKLY_FREE_QUOTA = true`
- [ ] `constants/config.ts` → `ENFORCE_PLUS_GATE = true` (en son)
- [ ] TestFlight'ta: hatırlatıcı bildirimleri, nefes sesi, ikon ve açılış ekranı, koç, satın alma

## Bilmekte fayda var

- **Web'deki değişiklikler telefona kendiliğinden gitmez.** stoikos.app/app anında güncellenir; mağazadaki uygulama ise ancak yeni bir derleme + mağaza onayıyla güncellenir.
- İkon, açılış ekranı ve izin değişiklikleri yalnız yeni derlemede görünür.
- Derleme numarasını elle değiştirme; EAS tutuyor. Kullanıcıya görünen sürümü (`1.0.0` → `1.0.1`) yeni bir mağaza sürümünde `app.json`'dan artır.
