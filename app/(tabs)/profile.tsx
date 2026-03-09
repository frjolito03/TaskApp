import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Tu contexto actualizado

export default function ProfileScreen() {
  // 1. Extraemos 'user' directamente del contexto
  const { signOut, user } = useAuth(); 
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Si el usuario del contexto aún no está listo, no hacemos nada todavía
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = () => {
      setLoading(true);
      
      // 3. Usamos el objeto 'user' que viene del AuthContext
      user.getSession((err: any, session: any) => {
        if (err || !session.isValid()) {
          console.log("Sesión no válida en perfil");
          setLoading(false);
          return;
        }

        user.getUserAttributes((err, result) => {
          if (err) {
            console.error("Error obteniendo atributos:", err);
          } else if (result) {
            const map: { [key: string]: string } = {};
            result.forEach(attr => {
              map[attr.getName()] = attr.getValue();
            });
            setAttributes(map);
          }
          setLoading(false);
        });
      });
    };

    fetchProfile();
  }, [user]); // 4. Dependencia vital: se refresca si el usuario cambia

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Perfil</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>EMAIL DEL USUARIO</Text>
        {/* Usamos un fallback por si AWS tarda en responder */}
        <Text style={styles.value}>{attributes.email || 'No disponible'}</Text>
        
        <Text style={styles.label}>ID ÚNICO (SUB)</Text>
        <Text style={styles.value}>{attributes.sub || 'No detectado'}</Text>
         
        <Text style={styles.label}>ESTADO DE CUENTA</Text>
        <Text style={[styles.value, { color: '#4CAF50' }]}>Verificado por Cognito</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={signOut}
      >
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