import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface Task {
  id: string;
  title: string;
  userId: string;
  completed: boolean;
}

const STORAGE_KEY = '@tasks_cache';

export const taskService = {
  // GET: Obtener tareas con simulación de carga de red
  getTasks: async (userId: string): Promise<Task[]> => {
    // 1. Validamos sesión (Simula el paso por un API Gateway)
    const session = await fetchAuthSession();
    if (!session.tokens?.accessToken) throw new Error("No autorizado");
    console.log("🔍 Buscando para ID:", userId);
    console.log("LOG: Accediendo a tareas con Token:", session.tokens.accessToken.toString().slice(0, 20) + "...");

    // 2. Intentamos cargar de caché local (Persistencia Offline requerida)
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allTasks: Task[] = stored ? JSON.parse(stored) : [];
    
    // Filtramos por el sub del usuario
    return allTasks.filter(t => t.userId === userId);
  },

  // POST: Crear tarea VALIDANDO SCOPES (Punto clave de la prueba)
saveTask: async (userId: string, title: string, accessToken: string): Promise<Task> => {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken;
    console.log("🛡️ Validando con token:", accessToken.slice(-10));
    // Simulación de validación de Scopes
    const scopes = token?.payload['scope']?.toString() || "";
    // El scope por defecto de Cognito suele permitir acciones de usuario
    const hasPermission = scopes.includes('tasks:write') || scopes.includes('aws.cognito.signin.user.admin');

    if (!hasPermission) {
      throw new Error("403: Forbidden - No tienes el scope tasks:write");
    }

    const newTask: Task = {
      id: Math.random().toString(36).substring(7),
      title,
      userId,
      completed: false
    };

    // Guardar en persistencia
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allTasks = stored ? JSON.parse(stored) : [];
    console.log("💾 Guardando para ID:", userId);
    allTasks.push(newTask);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));

    return newTask;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allTasks: Task[] = JSON.parse(stored);
      // Filtramos para quitar la tarea que coincida con el ID
      const updatedTasks = allTasks.filter(t => t.id !== taskId);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      console.log(`🗑️ [AuthZ] Tarea ${taskId} eliminada de la persistencia.`);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      throw error;
    }
  }

  
};