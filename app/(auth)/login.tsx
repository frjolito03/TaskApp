import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth(); 
  const colorScheme = useColorScheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estilos dinámicos para Dark Mode
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const inputBg = colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7';
  const placeholderColor = colorScheme === 'dark' ? '#8E8E93' : '#A9A9A9';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos incompletos", "Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      // Llamamos al signIn del contexto. 
      // Este por dentro usa Amplify y luego hace el router.replace('/(tabs)')
      await signIn(email.trim(), password);
      console.log("✅ Sesión iniciada correctamente");
    } catch (error: any) {
      console.error("❌ Error en LoginScreen:", error);
      // El alert ahora es más limpio
      Alert.alert("Error de Acceso", "Correo o contraseña incorrectos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Bienvenido a TaskApp</Text>
        <Text style={[styles.subtitle, { color: placeholderColor }]}>Gestiona tus proyectos de forma eficiente</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: textColor }]}>Correo Electrónico</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          placeholder="ejemplo@correo.com"
          placeholderTextColor={placeholderColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: textColor }]}>Contraseña</Text>
        <View style={[styles.passwordContainer, { backgroundColor: inputBg }]}>
          <TextInput
            style={[styles.passwordInput, { color: textColor }]}
            placeholder="••••••••"
            placeholderTextColor={placeholderColor}
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off" : "eye"} 
              size={22} 
              color={placeholderColor} 
            />
          </Pressable>
        </View>

        <TouchableOpacity 
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
          )}
        </TouchableOpacity>

             <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </Link>
      
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: placeholderColor }]}>¿No tienes una cuenta?</Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}> Regístrate aquí</Text>
          </TouchableOpacity>
        </Link>

   
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { height: 55, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 30 },
  passwordInput: { flex: 1, height: 55, paddingHorizontal: 15, fontSize: 16 },
  eyeIcon: { paddingRight: 15 },
  button: { backgroundColor: '#007AFF', height: 58, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontSize: 15 },
  linkText: { fontSize: 15, color: '#007AFF', fontWeight: '700' },
forgotPasswordContainer: {
    marginTop: 20,     
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
});