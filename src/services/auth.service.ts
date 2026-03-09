import { fetchAuthSession, getCurrentUser, signIn, signOut } from 'aws-amplify/auth';

export const authService = {
  login: async (email: string, pass: string) => {
    return await signIn({ username: email, password: pass });
  },

  logout: async () => {
    return await signOut();
  },

  // Para obtener los datos del usuario actual de forma segura
  getCurrentUser: async () => {
    try {
      return await getCurrentUser();
    } catch {
      return null;
    }
  },

  // Para obtener los tokens y el payload 
  getSession: async () => {
    return await fetchAuthSession();
  }
};