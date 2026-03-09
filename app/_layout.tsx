import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { View } from '@/components/Themed';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { ActivityIndicator } from 'react-native';

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
    // 1. Si el AuthContext todavía está leyendo el storage, esperamos.
    if (isLoading) return;

    // Determinamos si el usuario está en el grupo de rutas de autenticación
    const inAuthGroup = segments[0] === '(auth)';

    console.log(`🛡️ Guardia: Auth=${isAuthenticated} | EnAuthGroup=${inAuthGroup}`);

    // Usamos setImmediate o un timeout de 0 para asegurar que el Router esté listo
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // Caso: No logueado intentando entrar a la App -> Login
        console.log("🚫 Redirigiendo a Login...");
        router.replace('/(auth)/login');
      } 
      else if (isAuthenticated && inAuthGroup) {
        // Caso: Logueado intentando ver el Login -> App
        console.log("🚀 Redirigiendo a Tabs...");
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, segments]);

  // 3. Pantalla de carga limpia
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
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Nueva Tarea', headerShown: true }} />
    </Stack>
  );
}