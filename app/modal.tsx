import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

// Importamos tu contexto y el servicio de tareas
import { useAuth } from '../src/context/AuthContext';
import { taskService } from '../src/services/task.service';

export default function CreateTaskModal() {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { userAttributes, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSave = async () => {
    // 1. Validaciones de UI
    if (!title.trim()) {
      Alert.alert("Campo requerido", "Por favor, escribe una descripción para la tarea.");
      return;
    }

    if (!isAuthenticated || !userAttributes?.sub) {
      Alert.alert("Error de sesión", "No se detectó una sesión activa. Por favor, re-ingresa.");
      return;
    }

    setIsSaving(true);

    try {
      // 2. Extracción de Token para cumplimiento de "Autorización por Scopes"
      //  debemos demostrar que enviamos el Access Token
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error("No se pudo recuperar el Access Token de la sesión.");
      }

      console.log("🛡️ [AuthZ] Iniciando guardado. Token detectado (últimos 10 carácteres):", accessToken.slice(-10));

      // 3. Llamada al servicio (Pasamos sub del usuario, título y el token)
      await taskService.saveTask(userAttributes.sub, title, accessToken);
      
      Alert.alert("Éxito", "Tarea guardada correctamente.");
      
      // Regresamos a la pantalla principal
      router.back();
      
    } catch (error: any) {
      console.error("❌ Error en persistencia/autorización:", error);

      // Manejo de error 403 (Forbidden) o sesión expirada solicitado en la prueba
      if (error.message.includes('403') || error.name === 'NotAuthorizedException') {
        Alert.alert(
          "Acceso Denegado", 
          "No tienes los permisos necesarios (scopes) o tu sesión expiró.",
          [{ 
            text: "Cerrar Sesión", 
            onPress: async () => {
              await signOut(); 
              router.replace('/(auth)/login'); 
            } 
          }]
        );
      } else {
        Alert.alert("Error", "Hubo un problema al guardar. Intenta de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.label}>Nueva Tarea</Text>
            <Text style={styles.subtitle}>Define tu siguiente objetivo</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Ej: Finalizar configuración de Cognito"
            placeholderTextColor="#A9A9AC"
            value={title}
            onChangeText={setTitle}
            autoFocus
            maxLength={100}
            editable={!isSaving}
          />
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, isSaving && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Crear Tarea</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fff',
    justifyContent: 'center' 
  },
  header: {
    marginBottom: 30,
  },
  label: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1C1C1E',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E5EA', 
    borderRadius: 14, 
    padding: 20, 
    fontSize: 17,
    backgroundColor: '#F2F2F7',
    color: '#1C1C1E',
    marginBottom: 10
  },
  footer: {
    marginTop: 20
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 14, 
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  buttonDisabled: {
    backgroundColor: '#A2CFFE',
    shadowOpacity: 0
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  cancelButton: { 
    marginTop: 15, 
    padding: 10, 
    alignItems: 'center' 
  },
  cancelButtonText: { 
    color: '#FF3B30', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});