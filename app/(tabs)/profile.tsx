import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Tu contexto actualizado

export default function ProfileScreen() {
  // 1. Extraemos 'user' directamente del contexto
const { userAttributes, signOut } = useAuth(); // Usamos los datos ya procesados  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
if (!userAttributes) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Perfil</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>EMAIL DEL USUARIO</Text>
        <Text style={styles.value}>{userAttributes.email || 'No disponible'}</Text>
        
        <Text style={styles.label}>ID ÚNICO (SUB)</Text>
        <Text style={styles.value}>{userAttributes.sub || 'No detectado'}</Text>
         
        <Text style={styles.label}>ESTADO DE CUENTA</Text>
        <Text style={[styles.value, { color: '#4CAF50' }]}>Verificado por Cognito</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </View>
  );
}

// ... tus estilos se mantienen igual

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#F2F2F7', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: '#1C1C1E' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  label: { fontSize: 10, color: '#8E8E93', fontWeight: 'bold', letterSpacing: 1 },
  value: { fontSize: 16, color: '#1C1C1E', marginBottom: 20, marginTop: 4 },
  logoutBtn: { marginTop: 30, backgroundColor: '#FF3B30', padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});