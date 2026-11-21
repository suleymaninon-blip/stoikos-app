# STOIKOS açılış animasyonu: kod yazarken uyulacak kurallar

Ekte iki dosya var:

- `_layout.tsx`: uygulamanın kök dosyası. **Bu dosyayı değiştirme.** Yalnız nasıl kullanıldığını görmen için gönderildi.
- `BrandIntro.tsx`: şu anki açılış animasyonu. Yeni kodu **bu dosyanın yerine**, aynı ad ve aynı dışa aktarımla yaz.

## 1. Kök dosyaya dokunma

`app/_layout.tsx` uygulamanın şu parçalarını kuruyor:

- yazı tipleri, tema (`ThemeProvider`), dil (`LanguageProvider`) ve abonelik (`EntitlementProvider`);
- ilk açılış tanıtımı (`Onboarding`), hatırlatıcılar (`ReminderSync`);
- web'de otomatik güncelleme ve sütun düzeni.

Bunlardan biri silinirse uygulama açılmaz. Açılış animasyonu burada şöyle çağrılıyor ve **aynen kalmalı**:

```tsx
{!introDone && <BrandIntro onFinish={() => { setIntroDone(true); markIntroDone(); }} />}
```

Bu yüzden:

- Bileşenin adı `BrandIntro` olacak, `components/BrandIntro.tsx` içinden `export function BrandIntro({ onFinish }: { onFinish: () => void })` biçiminde dışa aktarılacak.
- Yeni dosya adı (`StoikosSplash` gibi) ya da yeni prop ekleme.
- `onFinish` her durumda **tam bir kez** çağrılmalı: animasyon bitince, dokununca ve "Hareketi Azalt" açıkken.

## 2. Telefonun animasyon motoru: çökme kuralı

`useNativeDriver: true` **yalnız** `opacity` ve `transform` (`translateX`/`translateY`, `scale`, `rotate`) için kullanılabilir.

Aşağıdakiler için **`useNativeDriver: false`** şart. Yoksa iPhone'da uygulama hata verip kapanır:

- SVG çizgi çizimi: `strokeDashoffset`;
- renk geçişi: `color`, `backgroundColor`;
- genişlik, yükseklik, `borderRadius` gibi düzen değerleri.

Aynı `Animated.Value`'yu hem native hem JS sürücüsüyle kullanma. Çizgi çizimi için ayrı bir değer aç.

## 3. Logo: birebir geometri

Logo, marka tescili yapılacak işaret. Kendi Ω'nı çizme; geometriyi şuradan al:

```ts
import { MARK_CENTER, MARK_PATH, MARK_PATH_LEN, MARK_VIEWBOX } from './StoikosMark';
// MARK_VIEWBOX = '192 162 640 640'
// MARK_PATH = 'M296 688 H415 A232 232 0 1 1 609 688 H728'   (Ω kavisi)
// küre: cx 512, cy 477, r 128  (MARK_CENTER)
// çizgi kalınlığı 34 (viewBox biriminde), uçlar yuvarlak
```

Küre rengi `#f8ebc8` → `#d2b06c` → `#6e5530` (radyal), kavis rengi `#f4e2b8` → `#d4b376` → `#9a7b44` (dikey). Şu anki dosyada nasıl çizildiğine bak.

## 4. Tema: son zemin sabit krem olmasın

Kullanıcı beş temadan birini seçiyor; açık temalar (Ege, Zeytin) krem, koyu temalar (Gece mavisi, Klasik) koyu. Animasyon **temanın zemin rengiyle** bitmeli, yoksa krem açılıştan lacivert uygulamaya sert bir geçiş olur.

```ts
import { useTheme } from '../constants/themeContext';
const { C } = useTheme();
// C.bg   → son zemin rengi (temaya göre)
// C.text → STOIKOS yazısının rengi
// C.text2 → alt başlığın rengi
// C.isDark → koyu tema mı
```

Altın tonları (yıldız, halka, kemer), açık temada biraz koyu, koyu temada biraz açık olsun ki ikisinde de görünsün (`C.isDark`'a göre seç).

## 5. Dil: alt başlık sabit Türkçe olmasın

Uygulama altı dilde (TR, EN, DE, RU, FR, ES). Alt başlık çeviriden gelmeli:

```ts
import { useLang } from '../constants/i18n';
const { t } = useLang();
t('setup.tagline')   // TR: "Stoacı Yaşam Rehberi", EN: "Your Stoic Life Guide" …
```

"STOIKOS" kelimesi her dilde aynı kalır.

## 6. Dokununca geçilsin

Açılış her uygulama açılışında oynuyor. Dokunan kişi beklememeli:

- Kök öğe bir `Pressable` olsun (`accessibilityRole="button"`, `accessibilityLabel="Stoikos"`).
- Dokununca ~0,5 sn'lik sönme animasyonundan sonra `onFinish` çağrılsın.
- `pointerEvents="none"` **kullanma**.

## 7. "Hareketi Azalt"

```ts
import { useReduceMotion } from '../hooks/useReduceMotion';
const reduce = useReduceMotion();
```

`reduce` sonradan `true` olabilir (ayar okunurken), bu yüzden `useEffect`'in bağımlılığına koy: `[reduce]`.

`reduce` açıkken:

- dönme, yükselme, parıltı ve ışık patlaması olmasın;
- yalnız son hâl (logo, yazı, temanın zemini) görünsün;
- ~1,4 sn sonra sönüp `onFinish` çağrılsın.

## 8. Ekran ölçüsü

`Dimensions.get('window')` yerine:

```ts
import { appDimensions } from '../constants/layout';
const { width, height } = appDimensions();
```

Masaüstü tarayıcıda uygulama telefon genişliğinde bir sütunda çalışıyor; `Dimensions` tam pencere genişliğini verir ve her şey kayar.

## 9. Süre ve temizlik

- Toplam süre en çok ~4,5 sn olsun (sönme dahil).
- `Animated.loop` kullanırsan bileşen kapanırken mutlaka `stop()` et.
- Her `setTimeout`'u `clearTimeout` ile temizle.

## 10. Efektler: şu anki dosyada olanlar korunsun

Şu anki `BrandIntro.tsx`'te bunlar var, yeni kodda **eksilmesin**:

1. Gece laciverti → sıcak şafak degradesi → temanın zemini.
2. Çift çizgili kemer, tepeden iki yana çizilir, aşağıda zemine karışarak söner.
3. 80 yıldız tozu: baştan gökyüzünde, iki kez göz kırpar, yavaşça yükselir, sonunda soluk kalır.
4. Altı yuvarlak yarı saydam yaprak: küçük doğar, yükselirken açılır ve döner, sonra dönerek tek küreye toplanır.
5. Toplanma anında kısa, yumuşak bir ışık patlaması; kürenin etrafında sıcak ışık sisi.
6. Ω kavisi küreyi sararak çizilir.
7. Üç hale halkası sırayla dışa açılır, altlarında yumuşak ışıma, üstlerinde kayan parıltı. Dış iki halkanın parıltısı yalnız üst yarıda gezer, yazının üstünden geçmez.
8. STOIKOS harf harf (titreşimsiz), ince çizgi, çeviriden gelen alt başlık.

## 11. Yazım kuralları

- Yazı tipleri: `import { Fonts } from '../constants/theme'` → `Fonts.cinzelBold` (STOIKOS), `Fonts.cormorantItalic` (alt başlık).
- En küçük yazı boyutu 11 px.
- Emoji kullanma; simgeler SVG ile çizilsin.
- Yalnız mevcut paketleri kullan: `react-native`, `react-native-svg`, `expo-linear-gradient`. Yeni paket ekleme.
- SVG içindeki `id`'ler (gradyan adları) dosyada benzersiz olsun.
