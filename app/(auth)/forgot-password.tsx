import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Lógica de validación (Igual a la de Registro)
  const validations = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[*@!#%&()^~{}]+/.test(newPassword),
  };

  const isPasswordValid = Object.values(validations).every(v => v);

  const handleResetPassword = async () => {
    if (!email) return Alert.alert("Error", "Ingresa tu correo electrónico");
    setLoading(true);
    try {
      // 3. RE-CONFIGURACIÓN SILENCIOSA (Vital para la APK)
      await resetPassword({ username: email });
      setStep(2);
      Alert.alert("Código enviado", "Revisa tu bandeja de entrada.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!isPasswordValid) return Alert.alert("Seguridad", "La contraseña no cumple los requisitos.");
    setLoading(true);
    try {
      await confirmResetPassword({ 
        username: email, 
        confirmationCode: code, 
        newPassword 
      });
      Alert.alert("¡Éxito!", "Contraseña actualizada.", [
        { text: "Ir al Login", onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Código inválido o error de sistema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recuperar Cuenta</Text>
      <Text style={styles.subtitle}>
        {step === 1 
          ? "Ingresa tu email para recibir un código de verificación." 
          : "Ingresa el código enviado a tu correo y define tu nueva clave."}
      </Text>

      {step === 1 ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Código</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Código de 6 dígitos"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          {/* BOX DE VALIDACIONES (Reutilizada de Registro) */}
          <View style={styles.validationBox}>
            <Text style={styles.validationTitle}>Requisitos de seguridad:</Text>
            <Text style={validations.length ? styles.valid : styles.invalid}>
              {validations.length ? '●' : '○'} Mínimo 8 caracteres
            </Text>
            <Text style={validations.upper ? styles.valid : styles.invalid}>
              {validations.upper ? '●' : '○'} Una letra mayúscula
            </Text>
            <Text style={validations.number ? styles.valid : styles.invalid}>
              {validations.number ? '●' : '○'} Al menos un número
            </Text>
            <Text style={validations.special ? styles.valid : styles.invalid}>
              {validations.special ? '●' : '○'} Carácter especial (@, #, !)
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, !isPasswordValid && { backgroundColor: '#A2CFFE' }]} 
            onPress={handleConfirmReset} 
            disabled={loading || !isPasswordValid}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cambiar Contraseña</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.link}>
        <Text style={styles.linkText}>Volver al Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#8E8E93', marginBottom: 30 },
  form: { width: '100%' },
  input: { backgroundColor: '#F2F2F7', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  validationBox: { backgroundColor: '#F8F8FA', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E5E5EA' },
  validationTitle: { fontSize: 13, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  valid: { color: '#4CAF50', fontSize: 13, marginBottom: 4 },
  invalid: { color: '#8E8E93', fontSize: 13, marginBottom: 4 },
  link: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#007AFF', fontWeight: '600' }
});