import * as Font from 'expo-font';
import { Literata_400Regular, Literata_400Regular_Italic, Literata_600SemiBold, Literata_700Bold } from '@expo-google-fonts/literata';
import { SourceSans3_300Light, SourceSans3_400Regular, SourceSans3_600SemiBold } from '@expo-google-fonts/source-sans-3';
import { Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { Lora_500Medium, Lora_500Medium_Italic } from '@expo-google-fonts/lora';
import type { FontSetId } from './theme';

/** Seçilen setin dosyaları yalnız seçilince yüklenir (web'de açılışı ağırlaştırmasın). Klasik kökte zaten yüklü. */
const FILES: Record<FontSetId, Record<string, any>> = {
  klasik: {},
  kitap: { Literata_400Regular, Literata_400Regular_Italic, Literata_600SemiBold, Literata_700Bold, SourceSans3_300Light, SourceSans3_400Regular, SourceSans3_600SemiBold },
  yumusak: { Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Lora_500Medium, Lora_500Medium_Italic },
};

export async function loadFontSet(id: FontSetId): Promise<void> {
  const files = FILES[id];
  if (Object.keys(files).length) await Font.loadAsync(files);
}
