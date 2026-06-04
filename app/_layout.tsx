import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cinzel_400Regular, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from '../constants/i18n';
import { BrandIntro } from '../components/BrandIntro';
import { Onboarding } from '../components/Onboarding';

SplashScreen.preventAutoHideAsync();

const ONBOARDED_KEY = 'stoikos_onboarded';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular, Cinzel_600SemiBold,
    CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic,
    Jost_300Light, Jost_400Regular, Jost_500Medium,
  });

  const [introDone, setIntroDone] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null); // null = yükleniyor

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then((v) => setOnboarded(v === '1'))
      .catch(() => setOnboarded(true)); // hata olursa gösterme
  }, []);

  const finishOnboarding = () => {
    setOnboarded(true);
    AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
  };

  if (!fontsLoaded) return null;

  const showOnboarding = introDone && onboarded === false;

  return (
    <LanguageProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="programs" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="challenge" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="challenge-admin" options={{ animation: 'slide_from_right' }} />
      </Stack>
      {showOnboarding && <Onboarding onDone={finishOnboarding} />}
      {!introDone && <BrandIntro onFinish={() => setIntroDone(true)} />}
    </LanguageProvider>
  );
}
