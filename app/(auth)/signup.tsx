import { confirmSignUp, signUp } from 'aws-amplify/auth'; // Importamos directo de Amplify
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Tu lógica de validación (está perfecta, la mantenemos)
  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[*@!#%&()^~{}]+/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(v => v);

  // PASO 1: Registro con Amplify
  const handleSignUp = async () => {
    if (!isPasswordValid) {
      return Alert.alert("Seguridad", "La contraseña no cumple los requisitos.");
    }

    setLoading(true);
    try {
      // En Amplify v6 se pasa un objeto con username, password y opcionalmente attributes
      const { isSignUpComplete, nextStep } = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          }
        }
      });

      // Si el siguiente paso es confirmar el email, mostramos el campo del código
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setIsPendingConfirmation(true);
        Alert.alert("Verificación", "Se ha enviado un código a tu correo.");
      }
    } catch (error: any) {
      console.error("Error en SignUp:", error);
      Alert.alert("Error de registro", error.message || "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Confirmación del Código
  const handleConfirm = async () => {
    if (!code) return Alert.alert("Error", "Ingresa el código de 6 dígitos");

    setLoading(true);
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email.trim(),
        confirmationCode: code
      });

      if (isSignUpComplete) {
        Alert.alert("¡Éxito!", "Cuenta confirmada correctamente.", [
          { text: "Ir al Login", onPress: () => router.replace('/(auth)/login') }
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error de validación", error.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isPendingConfirmation ? "Verifica tu Email" : "Únete a TaskApp"}
      </Text>

      {!isPendingConfirmation ? (
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
            <Text style={styles.validationTitle}>Requisitos mínimos:</Text>
            <Text style={validations.length ? styles.valid : styles.invalid}>
              {validations.length ? '●' : '○'} 8 caracteres
            </Text>
            <Text style={validations.upper ? styles.valid : styles.invalid}>
              {validations.upper ? '●' : '○'} Una Mayúscula
            </Text>
            <Text style={validations.number ? styles.valid : styles.invalid}>
              {validations.number ? '●' : '○'} Un Número
            </Text>
            <Text style={validations.special ? styles.valid : styles.invalid}>
              {validations.special ? '●' : '○'} Carácter especial (@, #, !)
            </Text>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity 
              style={[styles.mainButton, !isPasswordValid && { backgroundColor: '#ccc' }]} 
              onPress={handleSignUp}
              disabled={!isPasswordValid}
            >
              <Text style={styles.buttonText}>REGISTRARSE</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <Text style={styles.infoText}>Ingresa el código enviado a:{"\n"}{email}</Text>
          <TextInput 
            placeholder="000000" 
            style={styles.inputCode} 
            onChangeText={setCode} 
            keyboardType="number-pad"
            maxLength={6}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#28a745" />
          ) : (
            <TouchableOpacity style={[styles.mainButton, { backgroundColor: '#28a745' }]} onPress={handleConfirm}>
              <Text style={styles.buttonText}>CONFIRMAR CUENTA</Text>
            </TouchableOpacity>
          )}
          <Pressable onPress={() => setIsPendingConfirmation(false)} style={{ marginTop: 20 }}>
            <Text style={{ color: '#666', textAlign: 'center' }}>Corregir correo electrónico</Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={() => router.push('/(auth)/login')} style={styles.link}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#1C1C1E' },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, padding: 12, fontSize: 16 },
  inputCode: { borderBottomWidth: 2, borderColor: '#28a745', marginBottom: 30, padding: 10, fontSize: 24, textAlign: 'center', letterSpacing: 10 },
  infoText: { marginBottom: 25, textAlign: 'center', color: '#666', lineHeight: 20 },
  link: { marginTop: 30, alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  validationBox: { backgroundColor: '#F2F2F7', padding: 15, borderRadius: 12, marginBottom: 25 },
  validationTitle: { fontWeight: 'bold', marginBottom: 8, fontSize: 14 },
  valid: { color: '#34C759', fontSize: 13, marginBottom: 2 },
  invalid: { color: '#FF3B30', fontSize: 13, marginBottom: 2 },
  mainButton: { backgroundColor: '#007AFF', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});