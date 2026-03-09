import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  userId: string; // <--- AQUÍ VINCULAMOS AL USUARIO
  title: string;
  completed: boolean;
  createdAt: number;
}

const TASKS_STORAGE_KEY = '@tasks_storage';

export const taskService = {
  // GET /tasks: Solo requiere estar autenticado
  getTasks: async (userId: string): Promise<Task[]> => {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const allTasks: Task[] = jsonValue != null ? JSON.parse(jsonValue) : [];
    return allTasks.filter(task => task.userId === userId);
  },

  // POST /tasks: AQUÍ SIMULAMOS LA SEGURIDAD DEL SCOPE
  saveTask: async (userId: string, title: string, accessToken: string): Promise<Task> => {
    
    // SIMULACIÓN DE API GATEWAY / AUTHORIZER
    // En la vida real, el backend decodifica el JWT y revisa el campo 'scope'
    const hasWriteScope = accessToken.includes('tasks:write') || accessToken === 'mock-admin-token';

    if (!hasWriteScope) {
      throw new Error("403 Forbidden: No tienes el scope tasks:write");
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