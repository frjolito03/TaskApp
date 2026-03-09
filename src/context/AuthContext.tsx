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

  // --- LÓGICA DE PERMISOS PARA LA PRUEBA ---
  const extractPermissions = (session: CognitoUserSession) => {
    console.log("IdToken:", session.getIdToken()?.getJwtToken());
    console.log("AccessToken:", session.getAccessToken()?.getJwtToken());
    console.log("RefreshToken:", session.getRefreshToken()?.getToken());
  const idToken = session?.getIdToken();
  if (!idToken || !idToken.getJwtToken()) {
    console.warn("⚠️ IdToken no disponible o inválido");
    setPermissions([]);
    setCanCreate(false);
    return null;
  }

  const payload: any = idToken.decodePayload();
  const groups = payload['cognito:groups'] || [];

  const hasActiveProfile = !!payload.sub;
  setPermissions(groups);
  setCanCreate(hasActiveProfile);
  return payload;
};


// --- HIDRATACIÓN INICIAL ---
  useEffect(() => {
    const checkSession = async () => {
      // 🛡️ SEGURO: Si después de 4 segundos no hay respuesta...
      const forceStopLoading = setTimeout(() => {
        // Usamos el estado anterior para verificar si sigue cargando
        setIsLoading((loading) => {
          if (loading) console.log("⏰ Tiempo de espera agotado para Cognito.");
          return false;
        });
      }, 4000);

      try {
        const currentUser = userPool.getCurrentUser();
        
        if (currentUser) {
       currentUser.getSession((err: any, session: CognitoUserSession | null) => {
        clearTimeout(forceStopLoading);

  if (err || !session || !session.isValid()) {
    console.log("⚠️ Sesión inválida o error al recuperar la sesión", err);
    setIsLoading(false);
    return;
  }

  if (!session.getIdToken() || !session.getIdToken().getJwtToken()) {
    console.log("⚠️ IdToken no disponible en la sesión");
    setIsLoading(false);
    return;
  }

  console.log("✅ Sesión recuperada con éxito para:", currentUser.getUsername());
  extractPermissions(session);
  setUser(currentUser);
  setIsAuthenticated(true);
  setIsLoading(false);
});
        } else {
          console.log("ℹ️ No se encontró usuario persistido.");
          clearTimeout(forceStopLoading);
          setIsLoading(false);
        }
      } catch (error) {
        clearTimeout(forceStopLoading);
        console.error("💥 Error crítico:", error);
        setIsLoading(false);
      }
    };

    // 🚀 IMPORTANTE: Llamamos a la función
    checkSession();
  }, []);

  // --- INICIO DE SESIÓN ---
  const signIn = async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      const session: any = await authService.login(email, pass);
      const payload = extractPermissions(session);
      
    const currentUser = new CognitoUser({
  Username: email, 
  Pool: userPool
});

      setUser(currentUser);
      setIsAuthenticated(true);
      
      router.replace('/(tabs)');
    } catch (error: any) {
      alert("Error de acceso: " + error.message);
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
      permissions, // Ahora sí se pasan a la UI
      canCreate,    // Ahora sí se pasan a la UI
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);