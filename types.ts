export interface User {
  id: string;
  username: string;
  password?: string; // Only used during auth simulation
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  order: number;
}

export interface Todo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  categoryId: string | null;
  date: string; 
  createdAt: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  categoryId: string;
  color: string;
  isManual: boolean; 
  logs: Record<string, number>;
  description?: string;
  startDate: string; 
  durationDays: number; 
  isVisibleOnDashboard: boolean;
  targetValue: number; 
  dailyReminder?: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'custom';
export type Language = 'en' | 'zh';