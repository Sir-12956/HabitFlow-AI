
import { Habit, Todo, Category, ThemeMode, User, Language } from '../types';

// This service simulates an API talking to a MySQL database.
// In a real production app, these would be fetch() calls to your backend.
const KEYS = {
  USERS: 'habitflow_db_users',
  HABITS: 'habitflow_db_habits',
  TODOS: 'habitflow_db_todos',
  CATEGORIES: 'habitflow_db_categories',
  SESSION: 'habitflow_session_user',
  THEME: 'habitflow_theme',
  CUSTOM_COLOR: 'habitflow_custom_color',
  LANGUAGE: 'habitflow_language'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const ApiService = {
  // --- AUTHENTICATION ---
  
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (username: string, password: string): Promise<User> => {
    await delay(800);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) throw new Error("Invalid username or password");
    
    const sessionUser = { id: user.id, username: user.username };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  register: async (username: string, password: string): Promise<User> => {
    await delay(1000);
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    if (users.some(u => u.username === username)) {
      throw new Error("Username already exists");
    }

    const newUser: User = { id: crypto.randomUUID(), username, password };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    const sessionUser = { id: newUser.id, username: newUser.username };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout: () => {
    localStorage.removeItem(KEYS.SESSION);
  },

  // --- DATA FETCHING (User Scoped) ---

  fetchUserData: async (userId: string) => {
    await delay(500);
    
    const allCategories: Category[] = JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]');
    const allHabits: Habit[] = JSON.parse(localStorage.getItem(KEYS.HABITS) || '[]');
    const allTodos: Todo[] = JSON.parse(localStorage.getItem(KEYS.TODOS) || '[]');

    return {
      categories: allCategories.filter(c => c.userId === userId),
      habits: allHabits.filter(h => h.userId === userId),
      todos: allTodos.filter(t => t.userId === userId)
    };
  },

  // --- PERSISTENCE ---

  saveCategories: async (userId: string, categories: Category[]) => {
    const all: Category[] = JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]');
    const others = all.filter(c => c.userId !== userId);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify([...others, ...categories]));
  },

  saveHabits: async (userId: string, habits: Habit[]) => {
    const all: Habit[] = JSON.parse(localStorage.getItem(KEYS.HABITS) || '[]');
    const others = all.filter(h => h.userId !== userId);
    localStorage.setItem(KEYS.HABITS, JSON.stringify([...others, ...habits]));
  },

  saveTodos: async (userId: string, todos: Todo[]) => {
    const all: Todo[] = JSON.parse(localStorage.getItem(KEYS.TODOS) || '[]');
    const others = all.filter(t => t.userId !== userId);
    localStorage.setItem(KEYS.TODOS, JSON.stringify([...others, ...todos]));
  },

  getTheme: (): { mode: ThemeMode, customColor: string } => {
    return {
      mode: (localStorage.getItem(KEYS.THEME) as ThemeMode) || 'dark',
      customColor: localStorage.getItem(KEYS.CUSTOM_COLOR) || '#0f172a'
    };
  },

  saveTheme: (mode: ThemeMode, customColor: string) => {
    localStorage.setItem(KEYS.THEME, mode);
    localStorage.setItem(KEYS.CUSTOM_COLOR, customColor);
  },

  getLanguage: (): Language => {
    return (localStorage.getItem(KEYS.LANGUAGE) as Language) || 'en';
  },

  saveLanguage: (lang: Language) => {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  }
};
