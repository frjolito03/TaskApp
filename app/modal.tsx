import { fetchAuthSession } from 'aws-amplify/auth'; // <--- Importación clave para el token
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { taskService } from '../src/services/task.service';

export default function CreateTaskModal() {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { userAttributes, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    // 1. Validaciones iniciales
    if (!title.trim()) {
      Alert.alert("Campo vacío", "Por favor escribe qué hay que hacer.");
      return;
    }

    if (!isAuthenticated || !userAttributes) {
      Alert.alert("Error de sesión", "No estás autenticado.");
      return;
    }

    setIsSaving(true);

    try {
      // 2. Obtenemos la sesión actual de forma asíncrona (Forma Amplify v6)
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error("No se pudo obtener el token de acceso.");
      }

      // 3. Guardamos la tarea usando el 'sub' como userId
      // Pasamos: (userId, title, token)
      await taskService.saveTask(userAttributes.sub, title, accessToken);
      
      Alert.alert("¡Éxito!", "Tarea guardada correctamente.");
      router.back();
    } catch (error: any) {
      console.error("❌ Error al guardar tarea:", error);

      // Manejo de sesión expirada
      if (error.name === 'NotAuthorizedException' || error.message.includes('403')) {
        Alert.alert(
          "Sesión Inválida", 
          "Tu sesión ha expirado o no tienes permisos.",
          [{ 
            text: "Re-identificarse", 
            onPress: async () => {
              await signOut(); 
              router.replace('/(auth)/login'); 
            } 
          }]
        );
      } else {
        Alert.alert("Error", "No se pudo guardar la tarea. Inténtalo de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.label}>Nueva Tarea</Text>
          
          <TextInput
            style={styles.input}
            placeholder="¿Qué hay que hacer?"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline={false}
          />
          
          <TouchableOpacity 
            style={[styles.button, isSaving && { backgroundColor: '#A2CFFE' }]} 
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Guardar Tarea</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
           style={styles.cancelButton} 
           onPress={() => router.back()}
           disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Ahora no, volver</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  label: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1C1C1E' },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E5EA', 
    borderRadius: 12, 
    padding: 18, 
    marginBottom: 25, 
    fontSize: 16,
    backgroundColor: '#F2F2F7' 
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 20, padding: 10, alignItems: 'center' },
  cancelButtonText: { color: '#8E8E93', fontSize: 15, fontWeight: '500' },
});