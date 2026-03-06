import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { hasSeenOnboarding } from '../services/storage';
import { COLORS } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const seen = await hasSeenOnboarding();
      setShowOnboarding(!seen);
      setReady(true);
      await SplashScreen.hideAsync();
    })();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'fade',
        }}
        initialRouteName={showOnboarding ? 'onboarding' : '(tabs)'}
      >
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
