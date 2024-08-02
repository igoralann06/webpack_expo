/* eslint-disable react/react-in-jsx-scope */
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/core';
import { useThemeConfig } from '@/core/hooks/use-theme-config';

export { ErrorBoundary } from 'expo-router';

// Import  global CSS file
import '../../global.css';

import { useFonts } from 'expo-font';
import type { User } from 'firebase/auth';
import { useCallback, useEffect } from 'react';

import { useAuthStore } from '@/core/hooks/use-auth';
import { trackUserState } from '@/firebase/auth';
import { getServerUserData } from '@/firebase/firestore';
import { View } from '@/ui';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setUserData } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    'roboto-black': require('../../assets/fonts/Roboto-Black.ttf'),
    'roboto-black-italic': require('../../assets/fonts/Roboto-BlackItalic.ttf'),
    'roboto-bold': require('../../assets/fonts/Roboto-Bold.ttf'),
    'roboto-bold-italic': require('../../assets/fonts/Roboto-BoldItalic.ttf'),
    'roboto-italic': require('../../assets/fonts/Roboto-Italic.ttf'),
    'roboto-light': require('../../assets/fonts/Roboto-Light.ttf'),
    'roboto-light-italic': require('../../assets/fonts/Roboto-LightItalic.ttf'),
    'roboto-medium': require('../../assets/fonts/Roboto-Medium.ttf'),
    'roboto-medium-italic': require('../../assets/fonts/Roboto-MediumItalic.ttf'),
    'roboto-regular': require('../../assets/fonts/Roboto-Regular.ttf'),
    'roboto-thin': require('../../assets/fonts/Roboto-Thin.ttf'),
    'roboto-thin-italic': require('../../assets/fonts/Roboto-ThinItalic.ttf'),
    TwemojiMozilla: require('../../assets/fonts/Roboto-Medium.ttf'),
  });

  const navigationRef = useNavigationContainerRef();

  const onAuthStateChanged = useCallback(
    (u: User | null) => {
      getServerUserData(u ? u.uid : null).then(
        (value) => value && setUserData(value)
      );
      setUser(u);
      // if (initializing) setInitializing(false);
    },
    [setUser, setUserData]
  );

  useEffect(() => {
    const unsubscribe = trackUserState(onAuthStateChanged);
    return () => unsubscribe();
  }, [onAuthStateChanged]);

  useReactNavigationDevTools(navigationRef);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View className="mx-auto my-0 h-full w-[1024px] max-w-5xl">
      <RootLayoutNav />
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Providers>
      <Stack initialRouteName="auth">
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <ThemeProvider value={theme}>
        <APIProvider>
          <BottomSheetModalProvider>
            {children}
            <FlashMessage position="top" />
          </BottomSheetModalProvider>
        </APIProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
