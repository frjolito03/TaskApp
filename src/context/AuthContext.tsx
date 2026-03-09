import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

// 1. Definimos el "contrato" de datos para que TypeScript no moleste
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userAttributes: any;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 2. Creamos el contexto vacío (se llenará con el Provider)
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAttributes, setUserAttributes] = useState<any>(null);

  // --- REVISIÓN DE SESIÓN (Hidratación) ---
  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      
      if (session.tokens?.idToken) {
        // Guardamos los datos del usuario (email, sub, etc.)
        setUserAttributes(session.tokens.idToken.payload);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("ℹ️ Sin sesión activa");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // --- ACCIÓN DE LOGIN ---
  const signInAction = async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login(email, pass);
      
      if (result.isSignedIn) {
        await checkSession(); // Actualizamos el estado con los datos del nuevo usuario
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      throw error; // Lanzamos el error para que el LoginScreen lo atrape y muestre el Alert
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACCIÓN DE LOGOUT ---
  const signOutAction = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUserAttributes(null);
      router.replace('/(auth)/login');
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    }
  };

  // 3. Retornamos el proveedor con todos los datos y funciones
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      userAttributes, 
      signIn: signInAction, 
      signOut: signOutAction 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. EXPORTACIÓN DEL HOOK (Esto es lo que importas en LoginScreen)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};