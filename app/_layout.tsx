import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-get-random-values';
import 'react-native-reanimated';

import { View } from '@/components/Themed';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
// --- 1. CONFIGURACIÓN DE AMPLIFY ---
// Esto debe ejecutarse antes de que cualquier componente intente usar Auth
import { Amplify } from 'aws-amplify';
import { ActivityIndicator } from 'react-native';

Amplify.configure({
  Auth: {
    Cognito: {
      // El "!" le quita el error de 'undefined'
      userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      }
    }
  }
});

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log(`🛡️ Guardia: Auth=${isAuthenticated} | EnAuthGroup=${inAuthGroup}`);

    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // No logueado -> Al Login
        router.replace('/(auth)/login');
      } 
      else if (isAuthenticated && inAuthGroup) {
        // Logueado -> A la App
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal', 
          headerShown: true, 
          title: 'Nueva Tarea' 
        }} 
      />
    </Stack>
  );
}