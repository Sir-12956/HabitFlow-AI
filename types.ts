export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string | null; // Null means standalone todo
  date: string; // ISO Date String (YYYY-MM-DD)
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  isManual: boolean; 
  logs: Record<string, number>;
  description?: string;
  startDate: string; // ISO Date String
  durationDays: number; // How many days to show in the heatmap
  isVisibleOnDashboard: boolean;
  targetValue: number; // Daily count required to reach max intensity (default 1)
  dailyReminder?: boolean; // If true, shows in daily popup
}

export interface HeatmapDataPoint {
  date: string; 
  count: number;
}

export type ViewMode = 'dashboard' | 'analytics' | 'habits';

export type ThemeMode = 'dark' | 'light' | 'custom';

export type Language = 'en' | 'zh';