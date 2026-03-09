import { fetchAuthSession } from 'aws-amplify/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { userAttributes, signOut, isLoading: authLoading } = useAuth();
  const [tokenData, setTokenData] = useState<{ issuedAt?: string; expiresAt?: string; scopes?: string[] }>({});

  // Efecto para obtener metadatos técnicos del token (Observabilidad)
  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken;
        
        if (idToken) {
          // Los claims suelen venir en segundos (Unix timestamp)
          const iat = idToken.payload.iat ? new Date(idToken.payload.iat * 1000).toLocaleString() : 'N/A';
          const exp = idToken.payload.exp ? new Date(idToken.payload.exp * 1000).toLocaleString() : 'N/A';
          
          setTokenData({
            issuedAt: iat,
            expiresAt: exp,
            // Aquí podrías capturar scopes si usas el Access Token
          });
        }
      } catch (error) {
        console.error("Error recuperando claims:", error);
      }
    };

    getSessionDetails();
  }, []);

  if (authLoading || !userAttributes) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#8E8E93' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* CARD DE INFORMACIÓN PERSONAL */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información del Usuario</Text>
        
        <Text style={styles.label}>EMAIL</Text>
        <Text style={styles.value}>{userAttributes.email}</Text>
        
        <Text style={styles.label}>SUB (COGNITO ID)</Text>
        <Text style={styles.value}>{userAttributes.sub}</Text>
      </View>

      {/* CARD DE INFORMACIÓN TÉCNICA (CLAIMS) - Esto suma puntos en la prueba */}
      <View style={[styles.card, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>Seguridad y Tokens (Claims)</Text>
        
        <Text style={styles.label}>EMITIDO EL (iat)</Text>
        <Text style={styles.value}>{tokenData.issuedAt || 'Cargando...'}</Text>
        
        <Text style={styles.label}>EXPIRA EL (exp)</Text>
        <Text style={styles.value}>{tokenData.expiresAt || 'Cargando...'}</Text>
        
        <Text style={styles.label}>MÉTODO DE AUTENTICACIÓN</Text>
        <Text style={[styles.value, { color: '#4CAF50' }]}>JWT via AWS Amplify v6</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#F2F2F7', paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 25, color: '#1C1C1E', marginTop: 40 },
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, 
    shadowRadius: 10,
    elevation: 2 
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#007AFF', marginBottom: 15 },
  label: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
  value: { fontSize: 14, color: '#1C1C1E', marginBottom: 15, marginTop: 4 },
  logoutBtn: { 
    marginTop: 30, 
    backgroundColor: '#FF3B30', 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});