import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cinzel_400Regular, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEY_STORAGE } from './setup';
import { LanguageProvider } from '../constants/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular, Cinzel_600SemiBold,
    CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic,
    Jost_300Light, Jost_400Regular, Jost_500Medium,
  });
  const [checked, setChecked] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  // API key'i bir kez kontrol et (font yüklenmesinden bağımsız)
  useEffect(() => {
    AsyncStorage.getItem(API_KEY_STORAGE).then((key) => {
      setHasKey(!!key);
      setChecked(true);
    });
  }, []);

  // Hazır olduğunda splash'i gizle
  useEffect(() => {
    if (fontsLoaded && checked) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, checked]);

  // Yönlendirme: Stack mount edildikten SONRA, sadece bir kez çalışır
  useEffect(() => {
    if (fontsLoaded && checked && !hasKey) {
      router.replace('/setup');
    }
  }, [fontsLoaded, checked, hasKey]);

  if (!fontsLoaded || !checked) return null;

  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="setup" options={{ animation: 'fade' }} />
        <Stack.Screen name="programs" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </LanguageProvider>
  );
}
