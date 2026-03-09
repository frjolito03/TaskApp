import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authService } from '../../src/services/auth.service';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Paso 1: Registro Inicial
const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[*@!#%&()^~{}]+/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(v => v);

  const handleSignUp = async () => {
    if (!isPasswordValid) {
      return Alert.alert("Password débil", "Asegúrate de cumplir con todos los requisitos de seguridad.");
    }

    setLoading(true);
    try {
      await authService.signUp(email, password);
      setIsPendingConfirmation(true); 
      Alert.alert("Éxito", "Código enviado a tu email.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Confirmación del Código (Requerido por Cognito)
  const handleConfirm = async () => {
    if (!code) return Alert.alert("Error", "Ingresa el código de 6 dígitos");

    setLoading(true);
    try {
      await authService.confirmSignUp(email, code);
      Alert.alert("¡Éxito!", "Cuenta confirmada. Ya puedes iniciar sesión.", [
        { text: "Ir al Login", onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert("Error de validación", error.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isPendingConfirmation ? "Confirma tu cuenta" : "Crear nueva cuenta"}
      </Text>

      {!isPendingConfirmation ? (
        // FORMULARIO DE REGISTRO
        <>
          <TextInput 
            placeholder="Correo electrónico" 
            style={styles.input} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput 
            placeholder="Contraseña" 
            style={styles.input} 
            secureTextEntry 
            onChangeText={setPassword} 
          />

          <View style={styles.validationBox}>
            <Text style={styles.validationTitle}>Requisitos de seguridad:</Text>
            <Text style={validations.length ? styles.valid : styles.invalid}>✓ Mínimo 8 caracteres</Text>
            <Text style={validations.upper ? styles.valid : styles.invalid}>✓ Al menos una Mayúscula</Text>
            <Text style={validations.number ? styles.valid : styles.invalid}>✓ Al menos un Número</Text>
            <Text style={validations.special ? styles.valid : styles.invalid}>✓ Al menos un Carácter especial (@, #, !)</Text>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Registrarse" onPress={handleSignUp} />
          )}
        </>
      ) : (
        // FORMULARIO DE CÓDIGO DE VERIFICACIÓN
        <>
          <Text style={styles.infoText}>Ingresa el código enviado a: {email}</Text>
          <TextInput 
            placeholder="Código de 6 dígitos" 
            style={styles.input} 
            onChangeText={setCode} 
            keyboardType="number-pad"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Confirmar Código" onPress={handleConfirm} color="#28a745" />
          )}
          <Button title="Volver al registro" onPress={() => setIsPendingConfirmation(false)} color="#6c757d" />
        </>
      )}

      <Pressable onPress={() => router.push('/(auth)/login')} style={styles.link}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, padding: 10, fontSize: 16 },
  infoText: { marginBottom: 15, textAlign: 'center', color: '#666' },
  link: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 16 },
  validationBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 20 },
  validationTitle: { fontWeight: 'bold', marginBottom: 5, fontSize: 13 },
  valid: { color: 'green', fontSize: 12 },
  invalid: { color: '#dc3545', fontSize: 12 },
});