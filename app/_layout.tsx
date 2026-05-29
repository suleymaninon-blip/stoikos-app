import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cinzel_400Regular, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_KEY_STORAGE } from './setup';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular, Cinzel_600SemiBold,
    CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic,
    Jost_300Light, Jost_400Regular, Jost_500Medium,
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      const key = await AsyncStorage.getItem(API_KEY_STORAGE);
      await SplashScreen.hideAsync();
      setChecked(true);
      if (!key) {
        router.replace('/setup');
      }
    })();
  }, [fontsLoaded]);

  if (!fontsLoaded || !checked) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="setup" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
