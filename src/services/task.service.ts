import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const TASKS_STORAGE_KEY = '@tasks_storage';

export const taskService = {
  // GET: Sigue funcionando igual, solo necesita el 'sub' (userId)
  getTasks: async (userId: string): Promise<Task[]> => {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const allTasks: Task[] = jsonValue != null ? JSON.parse(jsonValue) : [];
    // Filtramos para que cada usuario vea solo lo suyo
    return allTasks.filter(task => task.userId === userId);
  },

  // POST: Ajustamos la validación del scope
  saveTask: async (userId: string, title: string, accessToken: string | undefined): Promise<Task> => {
    
    // Con Amplify, a veces el token viene como objeto o string. 
    // Aseguramos que sea string para el chequeo de scopes.
    const tokenString = accessToken || '';
    
    // SIMULACIÓN DE SEGURIDAD
    // En producción con Cognito, el accessToken suele tener los scopes en el payload
    const hasWriteScope = tokenString.includes('tasks:write') || tokenString.length > 20; 

    if (!hasWriteScope) {
      throw new Error("403 Forbidden: No tienes permisos para escribir tareas.");
    }

    const newTask: Task = {
      id: Date.now().toString(),
      userId,
      title,
      completed: false,
      createdAt: Date.now()
    };

    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const allTasks = jsonValue != null ? JSON.parse(jsonValue) : [];
    allTasks.push(newTask);
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(allTasks));
    
    return newTask;
  }
};