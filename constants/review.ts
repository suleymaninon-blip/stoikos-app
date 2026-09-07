import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mağaza değerlendirme istemi.
 *
 * Organik keşfin en güçlü kaldıracı puan ve yorum sayısı; bu yüzden istemi
 * doğru anda ve yalnızca bir kez kullanıyoruz.
 *
 * Neden bir kez: Apple yılda en fazla 3 istem gösteriyor ve fazlasını sessizce
 * yutuyor — yani ısrar etmek kazanç getirmiyor, yalnızca fırsatı harcıyor.
 * Bir kullanıcıya bir kez sormak, o tek şansı hak edilmiş bir ana saklamak
 * demek.
 *
 * Ne zaman: kullanıcının uygulamadan gerçekten fayda gördüğü an. İki tetik var
 * (`ReviewTrigger`), ikisi de bir başarıya bağlı — rastgele bir açılışta değil.
 */

const ASKED_KEY = 'stoikos_review_asked';

/** İstemin tetiklendiği an — hangisi önce gerçekleşirse. */
export type ReviewTrigger =
  /** 7 günlük süreklilik: alışkanlık kurulmuş demektir. */
  | 'streak7'
  /** Bir program baştan sona bitirildi: tamamlanmış bir yolculuk. */
  | 'programDone';

/**
 * Uygun bir andaysa değerlendirme istemini gösterir; değilse hiçbir şey yapmaz.
 * Hata durumunda sessiz kalır — bu istem hiçbir zaman kullanıcının akışını
 * bozmamalı.
 */
export async function maybeAskForReview(_trigger: ReviewTrigger): Promise<void> {
  try {
    // Daha önce sorulduysa bir daha sorma.
    if (await AsyncStorage.getItem(ASKED_KEY)) return;

    // Web'de ve desteklenmeyen ortamlarda no-op.
    if (!(await StoreReview.isAvailableAsync())) return;

    // Bayrağı istemden ÖNCE yaz: kullanıcı istemi görüp kapatsa da, sistem
    // sessizce yutsa da bir daha sorulmasın. Amaç kaç kez gösterildiğini
    // saymak değil, bir kez denemiş olmak.
    await AsyncStorage.setItem(ASKED_KEY, '1');

    // Kısa gecikme: kutlama animasyonunun/geri bildirimin üstüne binmesin,
    // kullanıcı önce başardığı şeyi görsün.
    setTimeout(() => { StoreReview.requestReview().catch(() => {}); }, 1500);
  } catch {
    // Sessiz geç.
  }
}
