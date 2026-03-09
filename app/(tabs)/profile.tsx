import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  // Extraemos lo necesario del contexto
  const { userAttributes, signOut, isLoading: authLoading } = useAuth();
  
  // Eliminamos el estado 'loading' local porque usaremos el 'isLoading' del contexto
  // que ya sabe cuándo terminó de hidratar la sesión.

  if (authLoading || !userAttributes) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#8E8E93' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Perfil</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>EMAIL DEL USUARIO</Text>
        <Text style={styles.value}>{userAttributes.email || 'No disponible'}</Text>
        
        <Text style={styles.label}>ID ÚNICO (SUB)</Text>
        <Text style={styles.value}>{userAttributes.sub || 'No detectado'}</Text>
         
        <Text style={styles.label}>ESTADO DE CUENTA</Text>
        <Text style={[styles.value, { color: '#4CAF50', fontWeight: 'bold' }]}>
          Verificado por Cognito (Amplify)
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#F2F2F7', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: '#1C1C1E' },
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
  label: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#1C1C1E', marginBottom: 20, marginTop: 4 },
  logoutBtn: { 
    marginTop: 30, 
    backgroundColor: '#FF3B30', 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});