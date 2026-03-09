import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Servicios y Contexto
import { Task, taskService } from '@/src/services/task.service';
import { useAuth } from '../../src/context/AuthContext';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Fuente de verdad del contexto
  const { user, canCreate } = useAuth(); 

const loadData = useCallback(async () => {
  if (!user) return;

  setLoading(true);
  try {
    user.getSession(async (err: any, session: any) => {
      if (err || !session || !session.isValid()) {
        console.log("⚠️ Sesión no lista para cargar datos");
        setLoading(false);
        return; 
      }

      try {
        // EXTRA: Obtenemos el ID real del token para mayor seguridad en la prueba
        const payload = session.getIdToken().decodePayload();
        const userId = payload.sub; // Este es el UUID único de AWS

        console.log("Cargando tareas para el usuario:", userId);
        
        // Usamos el userId (sub) en lugar de getUsername si tu API así lo requiere
        const data = await taskService.getTasks(userId); 
        setTasks(data);
      } catch (error) {
        console.error("Error al obtener tareas:", error);
      } finally {
        setLoading(false);
      }
    });
  } catch (error) {
    setLoading(false);
  }
}, [user]);

  // Ejecución inicial
  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <Text style={styles.userIdTag}>ID: {item.userId.slice(0, 8)}...</Text>
      </View>
      {item.completed && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
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
        />
      )}

      {/* Acción de creación basada en permisos del contexto */}
      {canCreate && (
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