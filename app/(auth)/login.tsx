import { useColorScheme } from '@/components/useColorScheme'; // Importamos el hook de tema
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons'; // Para el icono del ojo
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme(); // Detecta si es 'light' o 'dark'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Colores dinámicos para evitar que el texto "desaparezca" en modo oscuro
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const inputBg = colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7';
  const placeholderColor = colorScheme === 'dark' ? '#8E8E93' : '#A9A9A9';

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Usamos tus credenciales: sosacarlos200@gmail.com / TaskApp2026!#
      await signIn(email, password);
    } catch (error) {
      alert("Error de autenticación: Verifique sus credenciales");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' }]}>
      <Text style={[styles.title, { color: textColor }]}>Bienvenido a TaskApp</Text>

      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
        placeholder="Correo electrónico"
        placeholderTextColor={placeholderColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={[styles.passwordContainer, { backgroundColor: inputBg }]}>
        <TextInput
          style={[styles.passwordInput, { color: textColor }]}
          placeholder="Contraseña"
          placeholderTextColor={placeholderColor}
          secureTextEntry={!isPasswordVisible} // Lógica de visibilidad
          value={password}
          onChangeText={setPassword}
        />
        <Pressable 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off" : "eye"} 
            size={24} 
            color={placeholderColor} 
          />
        </Pressable>
      </View>

      <Pressable 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>INICIAR SESIÓN</Text>}
      </Pressable>

      <View style={styles.footer}>
  <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
  
  {/* El href debe coincidir con el nombre del archivo dentro de (auth) */}
  <Link href="/(auth)/signup" asChild>
    <TouchableOpacity>
      <Text style={styles.linkText}>Regístrate aquí</Text>
    </TouchableOpacity>
  </Link>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { height: 55, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, marginBottom: 25 },
  passwordInput: { flex: 1, height: 55, paddingHorizontal: 15, fontSize: 16 },
  eyeIcon: { padding: 10 },
  button: { backgroundColor: '#007AFF', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#666', 
  },
  linkText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: 'bold',
    paddingHorizontal: 5, 
    paddingVertical: 10,   
  },
});