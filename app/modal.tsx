import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { taskService } from '../src/services/task.service';

export default function CreateTaskModal() {
  const [title, setTitle] = useState('');
  const { user, signOut } = useAuth();
  const router = useRouter();

const handleSave = async () => {
  if (!title.trim() || !user) return;

  user.getSession(async (err: any, session: any) => {
    if (err || !session || !session.isValid()) {
      console.error("❌ Sesión inválida detectada:", err);
      
      Alert.alert(
        "Sesión Expirada", 
        "Tu sesión ya no es válida. Por seguridad, inicia sesión nuevamente.",
        [{ 
          text: "OK", 
          onPress: async () => {
            // 1. Llamamos al logout del contexto para limpiar SecureStore y el estado
            await signOut(); 
            // 2. Redirigimos al Login (usando replace para limpiar el historial de rutas)
            router.replace('/login'); 
          } 
        }]
      );
      return;
    }

    // Si la sesión es válida, procedemos normalmente
    try {
      const token = session.getAccessToken().getJwtToken();
      await taskService.saveTask(user.getUsername(), title, token);
      
      Alert.alert("Éxito", "Tarea guardada");
      router.back();
    } catch (error: any) {
      Alert.alert("Error de Permisos", error.message);
    }
  });
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
            value={title}
            onChangeText={setTitle}
            autoFocus
            multiline={false} // Evita que crezca hacia abajo infinitamente
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Guardar Tarea</Text>
          </TouchableOpacity>

          <TouchableOpacity 
           style={styles.cancelButton} 
           onPress={() => router.back()}
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
  label: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});