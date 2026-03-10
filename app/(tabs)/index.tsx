import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Servicios y Contexto
import { Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Task, taskService } from '../../src/services/task.service';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { userAttributes, isAuthenticated } = useAuth(); 

const loadTasks = async () => {
    // Si no hay sub, no podemos filtrar. Salimos pero apagamos el loading.
    if (!userAttributes?.sub) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await taskService.getTasks(userAttributes.sub);
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
      Alert.alert("Error", "No se pudieron cargar las tareas");
    } finally {
     
      setLoading(false); 
    }
  };
const handleDelete = (taskId: string) => {
  Alert.alert(
    "Eliminar Tarea",
    "¿Estás seguro de que quieres borrar esta tarea?",
    [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Eliminar", 
        style: "destructive", 
        onPress: async () => {
          try {
            await taskService.deleteTask(taskId);
            // Refrescamos la lista localmente para que desaparezca de inmediato
            setTasks(prev => prev.filter(t => t.id !== taskId));
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la tarea.");
          }
        } 
      }
    ]
  );
};
useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [userAttributes?.sub])
  )

const renderTask = ({ item }: { item: Task }) => (
  <View style={styles.taskItem}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.taskText, item.completed && styles.completedText]}>
        {item.title}
      </Text>
      <Text style={styles.userIdTag}>ID: {item.id.slice(0, 5)}...</Text>
    </View>
    
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {item.completed && (
        <Ionicons name="checkmark-circle" size={22} color="#4CAF50" style={{ marginRight: 10 }} />
      )}
      
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          ListEmptyComponent={<Text style={styles.emptyText}>No tienes tareas aún.</Text>}
          contentContainerStyle={styles.listContent}
          // Agregamos un refresco manual por si acaso
          onRefresh={loadTasks}
          refreshing={loading}
        />
      )}

      {/* El botón flotante ahora siempre visible si estás logueado, 
          o puedes usar una lógica de roles si la tienes */}
      {isAuthenticated && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push('/modal')} 
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 100 },
  taskItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 10, 
    borderLeftWidth: 4, 
    borderLeftColor: '#007AFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  taskText: { fontSize: 17, color: '#1C1C1E', fontWeight: '500' },
  completedText: { textDecorationLine: 'line-through', color: '#8E8E93' },
  userIdTag: { fontSize: 10, color: '#999', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 50, fontStyle: 'italic' },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});