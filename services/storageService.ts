import { Habit, Todo, Category, ThemeMode } from '../types';

const KEYS = {
  HABITS: 'habitflow_habits',
  TODOS: 'habitflow_todos',
  CATEGORIES: 'habitflow_categories',
  THEME: 'habitflow_theme',
  CUSTOM_COLOR: 'habitflow_custom_color'
};

const DEFAULT_CATEGORIES: Category[] = [];

const DEFAULT_HABITS: Habit[] = [];

export const StorageService = {
  getCategories: (): Category[] => {
    try {
      const stored = localStorage.getItem(KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getHabits: (): Habit[] => {
    try {
      const stored = localStorage.getItem(KEYS.HABITS);
      if (!stored) return DEFAULT_HABITS;
      
      const habits = JSON.parse(stored);
      // Migration: Ensure new properties exist
      return habits.map((h: any) => ({
        ...h,
        isVisibleOnDashboard: h.isVisibleOnDashboard ?? true,
        targetValue: h.targetValue ?? 1,
        dailyReminder: h.dailyReminder ?? false
      }));
    } catch (e) {
      return DEFAULT_HABITS;
    }
  },

  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
  },

  getTodos: (): Todo[] => {
    try {
      const stored = localStorage.getItem(KEYS.TODOS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveTodos: (todos: Todo[]) => {
    localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
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
  }
};