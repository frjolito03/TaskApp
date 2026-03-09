import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

// 1. USA ASYNCSTORAGE PARA COGNITO (Es más compatible con el SDK síncrono)
// SecureStore es excelente para el refresh_token manual, pero para los 
// datos internos de Cognito, AsyncStorage evita el "bucle de sesión vacía".


const poolData = { 
  UserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
  Storage: AsyncStorage as any, // El 'as any' es necesario para saltar la validación estricta de TS
};

export const userPool = new CognitoUserPool(poolData);

export const authService = {
  // ... signUp y confirmSignUp se mantienen igual ...

  login: (email: string, pass: string): Promise<CognitoUserSession> => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: pass,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          // Guardamos el refresh token en SecureStore por seguridad extra
          await AsyncStorage.setItem('refresh_token', session.getRefreshToken().getToken());
          resolve(session);
        },
        onFailure: (err) => {
          console.error("Error en Login:", err.message || err);
          reject(err);
        },
      });
    });
  },

  getCurrentUser: (): CognitoUser | null => {
    return userPool.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    try {
      const user = userPool.getCurrentUser();
      if (user) {
        user.signOut();
      }
      // Limpiamos AMBOS para estar seguros
      await AsyncStorage.removeItem('refresh_token');
      const keys = await AsyncStorage.getAllKeys();
      const cognitoKeys = keys.filter(key => key.includes('CognitoIdentityServiceProvider'));
      await AsyncStorage.multiRemove(cognitoKeys);
      
      console.log("--- [Service] Logout completado y storage limpio ---");
    } catch (error) {
      console.error("Error en logout:", error);
    }
  },
};