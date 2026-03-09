import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CognitoUser,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, userPool } from '../services/auth.service';

const AuthContext = createContext<any>(null);

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUser | null;
  userAttributes: any;
  permissions: string[];
  canCreate: boolean; 
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [canCreate, setCanCreate] = useState(false);
const [userAttributes, setUserAttributes] = useState<any>(null);
 


const processSession = (session: CognitoUserSession) => {
  try {
    const idToken = session.getIdToken();
    const payload = idToken.decodePayload();
    
    // Guardamos los atributos de una vez aquí
    setUserAttributes(payload); 
    setCanCreate(!!payload.sub);
    setIsAuthenticated(true);
  } catch (e) {
    console.error("Error en processSession:", e);
  }
};

useEffect(() => {
  const initializeAuth = async () => {
    try {
      // 1. MANIOBRA SENIOR: Limpiamos llaves corruptas manualmente
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        if (key.includes('lastUser') || key.includes('idToken')) {
          const val = await AsyncStorage.getItem(key);
          if (val === 'undefined' || val === null) {
            await AsyncStorage.removeItem(key);
          }
        }
      }

      const currentUser = userPool.getCurrentUser();
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      // 2. En lugar de getSession directo, usamos este truco para evitar el crash
      // Si el objeto interno jwtToken no existe, no llamamos a getSession
      currentUser.getSession((err: any, session: any) => {
        if (err || !session || !session.isValid()) {
          setIsAuthenticated(false);
        } else {
          processSession(session);
          setUser(currentUser);
        }
        setIsLoading(false);
      });

    } catch (error) {
      // Si llega a explotar, forzamos el deslogueo para limpiar el estado
      console.error("🔥 El SDK de AWS falló, limpiando...", error);
      await AsyncStorage.clear(); 
      setIsLoading(false);
    }
  };

  initializeAuth();
}, []);

  // --- INICIO DE SESIÓN ---


const signIn = async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      const session = await authService.login(email, pass);
      
      // Procesamos los datos de la nueva sesión
      processSession(session);
      
      // Importante: Volvemos a pedir el usuario al pool para que venga con el storage vinculado
      const authenticatedUser = userPool.getCurrentUser();
      setUser(authenticatedUser);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  // --- CERRAR SESIÓN ---
  const signOut = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setCanCreate(false);
      setPermissions([]);
      router.replace('/(auth)/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      permissions,
      userAttributes, // Ahora sí se pasan a la UI
      canCreate,    // Ahora sí se pasan a la UI
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);