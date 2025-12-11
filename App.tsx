import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Target, 
  Wand2,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Palette,
  Moon,
  Sun,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Search,
  Pencil,
  Calendar,
  Clock,
  ChevronDown,
  Menu,
  FolderOpen,
  Settings,
  Globe,
  Monitor,
  BarChart2
} from 'lucide-react';
import Heatmap, { HeatmapLegend } from './components/Heatmap';
import AICoach from './components/AICoach';
import { StorageService } from './services/storageService';
import { generateSmartTodos } from './services/geminiService';
import { Todo, Habit, Category, ThemeMode, Language } from './types';

// Translation Dictionary
const TRANSLATIONS = {
  en: {
    myFocus: "My Focus",
    newHeatmap: "New Heatmap",
    categories: "Categories",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    custom: "Custom",
    english: "English",
    chinese: "Chinese",
    whatNeedsToBeDone: "What needs to be done?",
    linkToHeatmap: "Link to Heatmap (Optional)",
    categoryOptional: "Category (Optional)",
    create: "Create",
    add: "Add",
    noTasks: "No tasks for today. Add one above!",
    manualCheckIn: "Manual Check-in",
    taskDriven: "Task Driven",
    activeDays: "Active Days",
    editHeatmap: "Edit Heatmap",
    createNewHeatmap: "Create New Heatmap",
    name: "Name",
    category: "Category",
    selectOrCreateCategory: "Select or Create Category",
    linkedToTodos: "Linked to Todos",
    linkedToTodosDesc: "Updates automatically when you complete tasks.",
    manualCheckInDesc: "Click the grid squares directly to log activity.",
    startDate: "Start Date",
    duration: "Duration",
    days: "Days",
    weeks: "Weeks",
    months: "Months",
    years: "Years",
    colorTheme: "Color Theme",
    saveChanges: "Save Changes",
    createHeatmap: "Create Heatmap",
    rename: "Rename",
    deleteCategory: "Delete Category",
    deletePermanently: "Delete Permanently",
    edit: "Edit",
    confirmDelete: "Are you sure you want to delete this heatmap permanently? This cannot be undone.",
    pleaseCreateCategory: "Please create a category first!",
    aiGenerationFailed: "AI Generation failed.",
    enterCategoryName: "Enter new category name:",
    aiCoach: "AI Productivity Coach",
    generateTasksTitle: "Generate tasks for selected habit",
    noItems: "No items",
    hideFromDashboard: "Hide from Dashboard",
    showOnDashboard: "Show on Dashboard",
    addHeatmap: "Add Heatmap",
    targetValue: "Daily Target (Max 5)",
    confirmDeleteCategory: "Are you sure you want to delete this category and all its heatmaps?",
    manualLinkError: "Cannot link a task to a 'Manual Check-in' heatmap. Please select a 'Task Driven' heatmap or create a new one.",
  },
  zh: {
    myFocus: "我的专注",
    newHeatmap: "新建热力图",
    categories: "分类",
    settings: "设置",
    theme: "主题",
    language: "语言",
    light: "日间模式",
    dark: "夜间模式",
    custom: "自定义",
    english: "English",
    chinese: "中文",
    whatNeedsToBeDone: "今天要做什么？",
    linkToHeatmap: "关联热力图（可选）",
    categoryOptional: "分类 (可选)",
    create: "创建",
    add: "添加",
    noTasks: "今天没有任务。在上面添加一个吧！",
    manualCheckIn: "手动打卡",
    taskDriven: "任务驱动",
    activeDays: "活跃天数",
    editHeatmap: "编辑热力图",
    createNewHeatmap: "新建热力图",
    name: "名称",
    category: "分类",
    selectOrCreateCategory: "选择或创建分类",
    linkedToTodos: "关联待办事项",
    linkedToTodosDesc: "完成任务时自动更新。",
    manualCheckInDesc: "直接点击方格记录活动。",
    startDate: "开始日期",
    duration: "持续时间",
    days: "天",
    weeks: "周",
    months: "月",
    years: "年",
    colorTheme: "颜色主题",
    saveChanges: "保存更改",
    createHeatmap: "创建热力图",
    rename: "重命名",
    deleteCategory: "删除分类",
    deletePermanently: "永久删除",
    edit: "编辑",
    confirmDelete: "确定要永久删除此热力图吗？此操作无法撤销。",
    pleaseCreateCategory: "请先创建一个分类！",
    aiGenerationFailed: "AI生成失败。",
    enterCategoryName: "输入新分类名称：",
    aiCoach: "AI 效率教练",
    generateTasksTitle: "为选定的习惯生成任务",
    noItems: "无项目",
    hideFromDashboard: "从仪表盘隐藏",
    showOnDashboard: "在仪表盘显示",
    addHeatmap: "添加热力图",
    targetValue: "每日目标 (最大 5)",
    confirmDeleteCategory: "确定要删除此分类及其下的所有热力图吗？",
    manualLinkError: "无法将任务关联到“手动打卡”热力图。请选择“任务驱动”热力图或新建一个。",
  }
};

// Utility for DnD
const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const App: React.FC = () => {
  // --- Data State (Lazy Initialization for Persistence Safety) ---
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [habits, setHabits] = useState<Habit[]>(() => StorageService.getHabits());
  const [todos, setTodos] = useState<Todo[]>(() => StorageService.getTodos());
  
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  
  // Theme initialization (Lazy)
  const [theme, setTheme] = useState<ThemeMode>(() => StorageService.getTheme().mode);
  const [customColor, setCustomColor] = useState(() => StorageService.getTheme().customColor);
  
  const [language, setLanguage] = useState<Language>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  
  // --- Interactions ---
  const [newTodoText, setNewTodoText] = useState('');
  const [todoHabitInput, setTodoHabitInput] = useState('');
  const [todoCategoryInput, setTodoCategoryInput] = useState(''); 
  const [isHabitDropdownOpen, setIsHabitDropdownOpen] = useState(false);
  const [isTodoCategoryDropdownOpen, setIsTodoCategoryDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Modals & Menus ---
  const [contextMenu, setContextMenu] = useState<{
      x: number, 
      y: number, 
      type: 'category' | 'habit', 
      id: string 
  } | null>(null);
  
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  
  // Modal Category State
  const [habitCategoryInput, setHabitCategoryInput] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // --- Refs ---
  const colorInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const todoCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const habitColorInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // --- Habit Creation/Edit Form State ---
  const [habitForm, setHabitForm] = useState({
    name: '',
    type: 'todo' as 'todo' | 'manual',
    color: 'bg-blue-500',
    startDate: new Date().toISOString().split('T')[0],
    durationValue: 1,
    durationUnit: 'year' as 'day' | 'week' | 'month' | 'year',
    description: '',
    targetValue: 1
  });

  // --- Responsive Check ---
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // --- Persistence Effects ---
  useEffect(() => StorageService.saveCategories(categories), [categories]);
  useEffect(() => StorageService.saveHabits(habits), [habits]);
  useEffect(() => StorageService.saveTodos(todos), [todos]);
  useEffect(() => StorageService.saveTheme(theme, customColor), [theme, customColor]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHabitDropdownOpen(false);
      }
      if (todoCategoryDropdownRef.current && !todoCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsTodoCategoryDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
          setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-fill category when an existing habit is selected
  useEffect(() => {
      const existingHabit = habits.find(h => h.name.toLowerCase() === todoHabitInput.trim().toLowerCase());
      if (existingHabit) {
          const cat = categories.find(c => c.id === existingHabit.categoryId);
          if (cat) setTodoCategoryInput(cat.name);
      }
  }, [todoHabitInput, habits, categories]);

  // Derived State
  const today = new Date().toISOString().split('T')[0];
  const t = TRANSLATIONS[language];

  // --- Theme Styles ---
  const getThemeStyles = () => {
    if (theme === 'light') return { bg: 'bg-slate-50', text: 'text-slate-900', surface: 'bg-white', border: 'border-slate-200', input: 'bg-slate-100' };
    if (theme === 'dark') return { bg: 'bg-slate-950', text: 'text-slate-200', surface: 'bg-slate-900', border: 'border-slate-800', input: 'bg-black/20' };
    return { bg: 'bg-[var(--custom-bg)]', text: 'text-white', surface: 'bg-black/20', border: 'border-white/10', input: 'bg-black/20' };
  };
  const themeStyles = getThemeStyles();

  // --- Logic Helpers ---
  const updateHabitLogs = useCallback((currentTodos: Todo[]) => {
    setHabits(prev => prev.map(habit => {
      if (habit.isManual) return habit;
      const newLogs: Record<string, number> = {};
      currentTodos.forEach(todo => {
        if (todo.categoryId === habit.id && todo.completed) {
          newLogs[todo.date] = (newLogs[todo.date] || 0) + 1;
        }
      });
      return { ...habit, logs: newLogs };
    }));
  }, []);

  // --- Handlers: Todo ---
  const handleAddTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTodoText.trim()) return;

    let targetHabitId: string | null = null;
    const trimmedHabitInput = todoHabitInput.trim();
    const trimmedCategoryInput = todoCategoryInput.trim();

    if (trimmedHabitInput) {
        // 1. Try to find existing habit
        const existingHabit = habits.find(h => h.name.toLowerCase() === trimmedHabitInput.toLowerCase());
        
        if (existingHabit) {
            // Check if manual
            if (existingHabit.isManual) {
                alert(t.manualLinkError);
                return;
            }
            targetHabitId = existingHabit.id;
        } else {
            // 2. Create NEW Habit
            let categoryId = '';
            
            // 2a. Determine Category (User Input -> Existing -> Default)
            if (trimmedCategoryInput) {
                const existingCat = categories.find(c => c.name.toLowerCase() === trimmedCategoryInput.toLowerCase());
                if (existingCat) {
                    categoryId = existingCat.id;
                } else {
                    // Create New Category on the fly
                    const newCatId = crypto.randomUUID();
                    const newCategory: Category = { id: newCatId, name: trimmedCategoryInput, order: categories.length };
                    setCategories(prev => [...prev, newCategory]);
                    categoryId = newCatId;
                }
            } else {
                // Fallback to "Default" logic
                const defaultCat = categories.find(c => c.name === 'Default');
                if (defaultCat) {
                    categoryId = defaultCat.id;
                } else {
                    const newCatId = crypto.randomUUID();
                    const newCategory: Category = { id: newCatId, name: 'Default', order: categories.length };
                    setCategories(prev => [...prev, newCategory]);
                    categoryId = newCatId;
                }
            }

            const newHabitId = crypto.randomUUID();
            const newHabit: Habit = {
                id: newHabitId,
                name: trimmedHabitInput,
                categoryId: categoryId,
                color: 'bg-blue-500', 
                isManual: false, 
                logs: {},
                startDate: today,
                durationDays: 365,
                isVisibleOnDashboard: true,
                targetValue: 1
            };
            setHabits(prev => [...prev, newHabit]);
            targetHabitId = newHabitId;
        }
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTodoText,
      completed: false,
      categoryId: targetHabitId,
      date: today,
      createdAt: Date.now()
    };

    const nextTodos = [...todos, newTodo];
    setTodos(nextTodos);
    setNewTodoText('');
    setTodoHabitInput('');
    setTodoCategoryInput('');
    if (targetHabitId) updateHabitLogs(nextTodos);
  };

  const handleToggleTodo = (id: string) => {
    const nextTodos = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(nextTodos);
    updateHabitLogs(nextTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const nextTodos = todos.filter(t => t.id !== id);
    setTodos(nextTodos);
    updateHabitLogs(nextTodos);
  };

  // --- Handlers: Habits ---
  const calculateDurationDays = () => {
    const { durationValue, durationUnit } = habitForm;
    const multipliers = { day: 1, week: 7, month: 30, year: 365 };
    return durationValue * multipliers[durationUnit];
  };

  const openHabitModal = (habitId?: string) => {
      if (habitId) {
          const habit = habits.find(h => h.id === habitId);
          if (habit) {
              setEditingHabitId(habitId);
              const existingCat = categories.find(c => c.id === habit.categoryId);
              setHabitCategoryInput(existingCat ? existingCat.name : '');
              
              setHabitForm({
                  name: habit.name,
                  type: habit.isManual ? 'manual' : 'todo',
                  color: habit.color,
                  startDate: habit.startDate,
                  durationValue: Math.round(habit.durationDays / 30) || 1,
                  durationUnit: 'month',
                  description: habit.description || '',
                  targetValue: habit.targetValue || 1
              });
          }
      } else {
          setEditingHabitId(null);
          setHabitCategoryInput('');
          setHabitForm({
              name: '',
              type: 'todo',
              color: 'bg-blue-500',
              startDate: new Date().toISOString().split('T')[0],
              durationValue: 1,
              durationUnit: 'year',
              description: '',
              targetValue: 1
          });
      }
      setShowHabitModal(true);
  };

  const handleSaveHabit = () => {
    if (!habitForm.name) return; 

    let finalCategoryId = '';
    const trimmedCatName = habitCategoryInput.trim();

    if (trimmedCatName) {
        const existingCat = categories.find(c => c.name.toLowerCase() === trimmedCatName.toLowerCase());
        if (existingCat) {
            finalCategoryId = existingCat.id;
        } else {
            const newCatId = crypto.randomUUID();
            const newCat: Category = { id: newCatId, name: trimmedCatName, order: categories.length };
            setCategories(prev => [...prev, newCat]);
            finalCategoryId = newCatId;
        }
    } else {
        // Fallback to "Default" logic if input is empty
        const defaultCat = categories.find(c => c.name === 'Default');
        if (defaultCat) {
            finalCategoryId = defaultCat.id;
        } else {
            const newCatId = crypto.randomUUID();
            const newCat: Category = { id: newCatId, name: 'Default', order: categories.length };
            setCategories(prev => [...prev, newCat]);
            finalCategoryId = newCatId;
        }
    }

    const durationDays = calculateDurationDays();

    if (editingHabitId) {
        setHabits(prev => prev.map(h => h.id === editingHabitId ? {
            ...h,
            name: habitForm.name,
            categoryId: finalCategoryId,
            color: habitForm.color,
            isManual: habitForm.type === 'manual',
            startDate: habitForm.startDate,
            durationDays: durationDays,
            description: habitForm.description,
            targetValue: habitForm.targetValue || 1
        } : h));
    } else {
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            name: habitForm.name,
            categoryId: finalCategoryId,
            color: habitForm.color,
            isManual: habitForm.type === 'manual',
            logs: {},
            startDate: habitForm.startDate,
            durationDays: durationDays,
            isVisibleOnDashboard: true,
            description: habitForm.description,
            targetValue: habitForm.targetValue || 1
        };
        setHabits(prev => [...prev, newHabit]);
    }
    setShowHabitModal(false);
  };

  const handleManualCheckIn = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      
      const target = h.targetValue || 1;
      const currentCount = h.logs[dateStr] || 0;
      const newCount = currentCount >= target ? 0 : currentCount + 1;
      
      return { ...h, logs: { ...h.logs, [dateStr]: newCount } };
    }));
  };

  const toggleHabitVisibility = (habitId: string) => {
      setHabits(prev => prev.map(h => 
          h.id === habitId ? { ...h, isVisibleOnDashboard: !h.isVisibleOnDashboard } : h
      ));
  };

  const handleDeleteHabitPermanently = (habitId: string) => {
      // Synchronous confirm, event propagation stopped at call site
      if (window.confirm(t.confirmDelete)) {
          setHabits(prev => prev.filter(h => h.id !== habitId));
          setTodos(prev => prev.map(t => t.categoryId === habitId ? { ...t, categoryId: null } : t));
      }
      setContextMenu(null);
  };

  const handleDescriptionUpdate = (habitId: string, newDesc: string) => {
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, description: newDesc } : h));
      setEditingDescriptionId(null);
  };

  // --- Handlers: Categories ---
  const handleRenameCategory = (id: string, newName: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
      const categoryHabits = habits.filter(h => h.categoryId === categoryId);
      
      if (categoryHabits.length > 0) {
          // Synchronous confirm for safety
          if (window.confirm(t.confirmDeleteCategory)) {
              setCategories(prev => prev.filter(c => c.id !== categoryId));
              setHabits(prev => prev.filter(h => h.categoryId !== categoryId));
              
              // Unlink todos
              const habitIds = categoryHabits.map(h => h.id);
              setTodos(prev => prev.map(todo => 
                  (todo.categoryId && habitIds.includes(todo.categoryId)) 
                      ? { ...todo, categoryId: null } 
                      : todo
              ));
          }
      } else {
          setCategories(prev => prev.filter(c => c.id !== categoryId));
      }
      setContextMenu(null);
  };

  const toggleCategoryCollapse = (id: string) => {
    setCollapsedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;
    const reordered = reorder(categories, dragIndex, dropIndex);
    const updated = reordered.map((c: Category, i) => ({ id: c.id, name: c.name, order: i }));
    setCategories(updated);
  };

  const handleRightClick = (e: React.MouseEvent, type: 'category' | 'habit', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id });
  };

  // --- AI ---
  const handleSmartGenerate = async () => {
    const habit = habits.find(h => h.name.toLowerCase() === todoHabitInput.toLowerCase());
    if (!todoHabitInput || !habit) {
        alert("Please select or type an existing heatmap name to generate tasks for.");
        return;
    }
    setIsGenerating(true);
    try {
      const suggestions = await generateSmartTodos(habit.name);
      const newSmartTodos: Todo[] = suggestions.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false,
        categoryId: habit.id,
        date: today,
        createdAt: Date.now()
      }));
      setTodos([...todos, ...newSmartTodos]);
    } catch {
      alert(t.aiGenerationFailed);
    } finally {
      setIsGenerating(false);
    }
  };

  const getHabitName = (id: string | null) => {
      if (!id) return null;
      return habits.find(h => h.id === id)?.name;
  };

  return (
    <div 
        className={`flex h-full font-sans transition-colors duration-300 ${themeStyles.bg} ${themeStyles.text}`}
        style={theme === 'custom' ? { '--custom-bg': customColor } as React.CSSProperties : {}}
        onClick={() => setContextMenu(null)}
    >
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar --- */}
      <aside 
        className={`
            fixed inset-y-0 left-0 z-50 h-full border-r overflow-hidden
            flex flex-col transition-all duration-300
            w-64
            ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            md:relative md:translate-x-0 md:shadow-none
            ${isSidebarOpen ? 'md:w-64' : 'md:w-0 md:border-r-0'}
            ${themeStyles.surface} ${themeStyles.border}
        `}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className={`absolute right-3 top-6 bg-primary text-white p-1 rounded-full shadow-md z-40 transition-all hover:bg-blue-600`}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Brand */}
        <div className={`p-6 flex items-center gap-3 font-bold text-xl text-primary overflow-hidden whitespace-nowrap`}>
           <Activity className="w-8 h-8 shrink-0" />
           <span className="opacity-100 transition-opacity">HabitFlow</span>
        </div>

        {/* Categories / Folders */}
        <div className="flex-1 overflow-y-auto px-3">
            {isSidebarOpen && (
                <div className="flex items-center justify-between text-xs uppercase tracking-wider opacity-50 mb-4 px-2 mt-4">
                    <span>{t.categories}</span>
                </div>
            )}
            
            <div className="flex flex-col gap-4">
                {categories.map((cat, index) => (
                    <div 
                        key={cat.id}
                        className="group relative"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {/* Category Header */}
                        <div 
                            onContextMenu={(e) => handleRightClick(e, 'category', cat.id)}
                            className={`flex items-center gap-2 mb-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer select-none`}
                            onClick={() => toggleCategoryCollapse(cat.id)}
                        >
                             <GripVertical size={12} className={`opacity-0 group-hover:opacity-50 cursor-grab`} />
                             {editingCategory === cat.id ? (
                                <input 
                                    autoFocus
                                    className="bg-transparent border-b border-primary outline-none w-full"
                                    defaultValue={cat.name}
                                    onClick={(e) => e.stopPropagation()}
                                    onBlur={(e) => handleRenameCategory(cat.id, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory(cat.id, e.currentTarget.value)}
                                />
                             ) : (
                                <span className="text-sm font-semibold opacity-80 truncate flex-1 flex items-center gap-2">
                                    {cat.name}
                                    <ChevronDown size={12} className={`transition-transform ${collapsedCategories.includes(cat.id) ? '-rotate-90' : ''}`} />
                                </span>
                             )}
                        </div>

                        {/* Habits in Category */}
                        {!collapsedCategories.includes(cat.id) && (
                            <div className="pl-6 flex flex-col gap-1 border-l border-white/10 ml-3">
                                {habits.filter(h => h.categoryId === cat.id).map(h => (
                                    <div 
                                        key={h.id} 
                                        onContextMenu={(e) => handleRightClick(e, 'habit', h.id)}
                                        className="group/item flex items-center justify-between text-sm pr-2 hover:bg-white/5 rounded py-0.5"
                                    >
                                        <div 
                                            className="opacity-60 hover:opacity-100 cursor-pointer flex items-center gap-2 truncate flex-1"
                                            onClick={() => openHabitModal(h.id)}
                                        >
                                            <span 
                                                className={`w-2 h-2 rounded-full shrink-0 ${h.color.startsWith('#') ? '' : h.color}`}
                                                style={h.color.startsWith('#') ? {backgroundColor: h.color} : {}}
                                            ></span>
                                            <span className="truncate">{h.name}</span>
                                        </div>
                                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleHabitVisibility(h.id); }}
                                                className={`${h.isVisibleOnDashboard ? 'text-slate-400' : 'text-slate-600'} hover:text-white p-1`}
                                                title={h.isVisibleOnDashboard ? t.hideFromDashboard : t.showOnDashboard}
                                            >
                                                {h.isVisibleOnDashboard ? <Eye size={12}/> : <EyeOff size={12}/>}
                                            </button>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleDeleteHabitPermanently(h.id); 
                                                }}
                                                className={`text-slate-600 hover:text-red-400 p-1`}
                                                title={t.deletePermanently}
                                                // IMPORTANT: prevent right click on delete button to avoid context menu confusion
                                                onContextMenu={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {habits.filter(h => h.categoryId === cat.id).length === 0 && (
                                    <span className="text-xs opacity-30 italic px-2">{t.noItems}</span>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Settings Footer */}
        <div className={`p-4 mt-auto border-t ${themeStyles.border} relative`} ref={settingsRef}>
             <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors ${themeStyles.text}`}
             >
                 <Settings size={20} className="opacity-70" />
                 <span className="font-medium text-sm">{t.settings}</span>
                 <ChevronDown size={14} className={`ml-auto opacity-50 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
             </button>

             {isSettingsOpen && (
                 <div className={`absolute bottom-full left-4 right-4 mb-2 p-3 rounded-xl shadow-xl border ${themeStyles.surface} ${themeStyles.border} z-50 flex flex-col gap-4 animate-fade-in`}>
                     <div>
                         <label className="text-[10px] uppercase tracking-wider opacity-50 font-bold mb-2 block">{t.theme}</label>
                         <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
                            <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-md flex items-center justify-center transition-all ${theme === 'light' ? 'bg-white text-black shadow' : 'text-slate-500 hover:bg-white/10'}`} title={t.light}><Sun size={16}/></button>
                            <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-md flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-white/10'}`} title={t.dark}><Moon size={16}/></button>
                            <button 
                                onClick={() => {
                                    setTheme('custom');
                                    colorInputRef.current?.click();
                                }} 
                                className={`flex-1 p-2 rounded-md flex items-center justify-center transition-all ${theme === 'custom' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-white/10'}`}
                                title={t.custom}
                            >
                                <Palette size={16}/>
                            </button>
                        </div>
                     </div>
                     <div>
                         <label className="text-[10px] uppercase tracking-wider opacity-50 font-bold mb-2 block">{t.language}</label>
                         <div className="flex flex-col gap-1">
                             <button 
                                onClick={() => setLanguage('en')} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${language === 'en' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/5 opacity-70'}`}
                             >
                                 <span className="text-xs border border-current rounded px-1">EN</span> {t.english}
                             </button>
                             <button 
                                onClick={() => setLanguage('zh')} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${language === 'zh' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-white/5 opacity-70'}`}
                             >
                                 <span className="text-xs border border-current rounded px-1">中</span> {t.chinese}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
            <input 
                ref={colorInputRef}
                type="color" 
                value={customColor} 
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-0 h-0 opacity-0 absolute pointer-events-none" 
            />
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto h-full relative">
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
                {(!isSidebarOpen) && (
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${themeStyles.text} opacity-70 hover:opacity-100`}
                        title="Open Sidebar"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        {t.myFocus}
                    </h1>
                    <p className="opacity-60">
                        {new Date().toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => openHabitModal()} 
                className="bg-primary hover:brightness-110 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 flex items-center gap-2 self-start md:self-auto"
            >
                <Plus size={18} /> {t.newHeatmap}
            </button>
          </header>

          <AICoach habits={habits} todos={todos} language={language} />

          {/* COMBINED TODO SECTION */}
          <div className={`rounded-xl shadow-lg border ${themeStyles.surface} ${themeStyles.border} overflow-hidden`}>
            {/* Input Header */}
            <div className={`p-4 border-b ${themeStyles.border} bg-opacity-50`}>
                <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
                    
                    {/* Row 1: Todo Input */}
                    <div className="w-full relative">
                        <input 
                        type="text" 
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder={t.whatNeedsToBeDone}
                        className={`w-full bg-transparent border border-slate-500/30 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-opacity-50 ${themeStyles.input}`}
                        />
                    </div>
                    
                    {/* Row 2: Options */}
                    <div className="flex flex-col md:flex-row gap-2">
                        
                        {/* Heatmap Combobox */}
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={todoHabitInput}
                                    onChange={(e) => {
                                        setTodoHabitInput(e.target.value);
                                        setIsHabitDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsHabitDropdownOpen(true)}
                                    placeholder={t.linkToHeatmap}
                                    className={`w-full bg-transparent border border-slate-500/30 rounded-lg py-3 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-opacity-50 ${themeStyles.input} ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}
                                />
                                <Search className="absolute right-3 top-3.5 w-4 h-4 opacity-50 pointer-events-none" />
                            </div>
                            {isHabitDropdownOpen && (
                                <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg shadow-xl border z-50 ${themeStyles.surface} ${themeStyles.border}`}>
                                    {habits.filter(h => h.name.toLowerCase().includes(todoHabitInput.toLowerCase())).map(h => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            onClick={() => {
                                                setTodoHabitInput(h.name);
                                                setIsHabitDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                                        >
                                            <span 
                                                className={`w-2 h-2 rounded-full ${h.color.startsWith('#') ? '' : h.color}`}
                                                style={h.color.startsWith('#') ? {backgroundColor: h.color} : {}}
                                            ></span>
                                            {h.name}
                                        </button>
                                    ))}
                                    {todoHabitInput && !habits.some(h => h.name.toLowerCase() === todoHabitInput.toLowerCase()) && (
                                        <div className="px-4 py-2 text-sm opacity-70 italic border-t border-white/5">
                                            <Plus className="inline w-3 h-3 mr-1" />
                                            {t.create} "{todoHabitInput}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Category Combobox (New) */}
                        <div className="flex-1 relative" ref={todoCategoryDropdownRef}>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={todoCategoryInput}
                                    onChange={(e) => {
                                        setTodoCategoryInput(e.target.value);
                                        setIsTodoCategoryDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsTodoCategoryDropdownOpen(true)}
                                    placeholder={t.categoryOptional}
                                    className={`w-full bg-transparent border border-slate-500/30 rounded-lg py-3 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-opacity-50 ${themeStyles.input} ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}
                                />
                                <FolderOpen className="absolute right-3 top-3.5 w-4 h-4 opacity-50 pointer-events-none" />
                            </div>
                            {isTodoCategoryDropdownOpen && (
                                <div className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg shadow-xl border z-50 ${themeStyles.surface} ${themeStyles.border}`}>
                                    {categories.filter(c => c.name.toLowerCase().includes(todoCategoryInput.toLowerCase())).map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setTodoCategoryInput(c.name);
                                                setIsTodoCategoryDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                    {todoCategoryInput && !categories.some(c => c.name.toLowerCase() === todoCategoryInput.toLowerCase()) && (
                                        <div className="px-4 py-2 text-sm opacity-70 italic border-t border-white/5">
                                            <Plus className="inline w-3 h-3 mr-1" />
                                            {t.create} "{todoCategoryInput}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button 
                            type="submit"
                            disabled={!newTodoText}
                            className="bg-primary hover:brightness-110 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">{t.add}</span>
                            </button>
                            <button 
                            type="button"
                            onClick={handleSmartGenerate}
                            disabled={!todoHabitInput || isGenerating}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            title={t.generateTasksTitle}
                            >
                            <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Todo List Content */}
            <div className="p-2 md:p-4 bg-black/5 min-h-[100px]">
                 {todos.filter(t => t.date === today).length === 0 ? (
                    <div className="text-center py-6 opacity-40 text-sm">
                      {t.noTasks}
                    </div>
                 ) : (
                    <div className="space-y-2">
                        {todos.filter(t => t.date === today).map(todo => {
                            const habitName = getHabitName(todo.categoryId);
                            const habitColor = habits.find(h => h.id === todo.categoryId)?.color || 'bg-slate-500';
                            const isHex = habitColor.startsWith('#');

                            return (
                                <div key={todo.id} className={`group flex items-center gap-3 p-3 rounded-lg border ${themeStyles.surface} ${themeStyles.border} hover:border-primary/30 transition-all`}>
                                    <button 
                                        onClick={() => handleToggleTodo(todo.id)}
                                        className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
                                        ${todo.completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-primary'}
                                        `}
                                    >
                                        {todo.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${todo.completed ? 'opacity-50 line-through' : ''}`}>
                                        {todo.text}
                                        </p>
                                        {habitName && (
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span 
                                                className={`w-1.5 h-1.5 rounded-full ${isHex ? '' : habitColor}`} 
                                                style={isHex ? {backgroundColor: habitColor} : {}}
                                            ></span>
                                            <span className={`text-[10px] opacity-60 truncate`}>
                                            {habitName}
                                            </span>
                                        </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                 )}
            </div>
          </div>

            {/* Heatmaps Section */}
            <div className="grid gap-8 pt-4">
                {categories.map(cat => {
                    const catHabits = habits.filter(h => h.categoryId === cat.id && h.isVisibleOnDashboard);
                    if (catHabits.length === 0) return null;
                    
                    return (
                        <div key={cat.id} className="space-y-4">
                            <h2 className="text-lg font-bold opacity-70 border-b border-white/5 pb-2 flex items-center gap-2">
                                {cat.name}
                            </h2>
                            {catHabits.map(habit => {
                                const isHex = habit.color.startsWith('#');
                                return (
                                <div key={habit.id} className={`rounded-2xl p-6 border shadow-sm relative group ${themeStyles.surface} ${themeStyles.border}`}>
                                    
                                    {/* Heatmap Toolbar */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button 
                                            onClick={() => openHabitModal(habit.id)}
                                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-primary transition-colors"
                                            title={t.editHeatmap}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            onClick={() => toggleHabitVisibility(habit.id)}
                                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                                            title={t.hideFromDashboard}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mb-6 pr-16">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className={`w-3 h-8 rounded-full ${isHex ? '' : habit.color}`}
                                                style={isHex ? {backgroundColor: habit.color} : {}}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-bold">{habit.name}</h3>
                                                {editingDescriptionId === habit.id ? (
                                                    <input 
                                                        autoFocus
                                                        className="text-sm opacity-100 bg-transparent border-b border-primary outline-none w-full min-w-[200px]"
                                                        defaultValue={habit.description || (habit.isManual ? t.manualCheckIn : t.linkedToTodos)}
                                                        onBlur={(e) => handleDescriptionUpdate(habit.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleDescriptionUpdate(habit.id, e.currentTarget.value);
                                                            if (e.key === 'Escape') setEditingDescriptionId(null);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <p 
                                                        className="text-sm opacity-50 hover:opacity-100 cursor-pointer flex items-center gap-2 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingDescriptionId(habit.id);
                                                        }}
                                                        title="Click to edit description"
                                                    >
                                                        {habit.description || (habit.isManual ? t.manualCheckIn : t.linkedToTodos)}
                                                        <Pencil size={12} className="opacity-0 group-hover:opacity-50" />
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-mono font-bold">
                                                {(Object.values(habit.logs) as number[]).filter(v => v > 0).length}
                                            </div>
                                            <div className="text-xs opacity-50">{t.activeDays}</div>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-4 border border-white/5 w-full ${theme === 'light' ? 'bg-white' : 'bg-black/20'}`}>
                                        <Heatmap 
                                            data={habit.logs} 
                                            color={habit.color} 
                                            startDate={habit.startDate}
                                            durationDays={habit.durationDays}
                                            interactive={habit.isManual}
                                            onClickDay={(date) => habit.isManual && handleManualCheckIn(habit.id, date)}
                                            targetValue={habit.targetValue}
                                        />
                                    </div>
                                    
                                    <HeatmapLegend color={habit.color} targetValue={habit.targetValue} />
                                </div>
                            )})}
                        </div>
                    )
                })}
            </div>

        </div>
      </main>

      {/* --- Context Menu --- */}
      {contextMenu && (
        <div 
            className="fixed bg-slate-800 border border-slate-700 shadow-xl rounded-lg py-1 w-48 z-50 text-sm text-slate-200"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
        >
            {contextMenu.type === 'category' ? (
                <>
                    <button 
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                        onClick={() => { setEditingCategory(contextMenu.id); setContextMenu(null); }}
                    >
                        <Pencil size={14} className="opacity-70" /> {t.rename}
                    </button>
                    <button 
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                        onClick={() => {
                            setHabitForm(prev => ({ ...prev, categoryId: contextMenu.id }));
                            openHabitModal();
                            setContextMenu(null);
                        }}
                    >
                        <Plus size={14} className="opacity-70" /> {t.addHeatmap}
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button 
                        className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                        onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteCategory(contextMenu.id);
                        }}
                    >
                        <Trash2 size={14} /> {t.deleteCategory}
                    </button>
                </>
            ) : (
                <>
                     <button 
                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2"
                        onClick={() => { openHabitModal(contextMenu.id); setContextMenu(null); }}
                    >
                        <Pencil size={14} className="opacity-70" /> {t.edit}
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button 
                        className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleDeleteHabitPermanently(contextMenu.id);
                            setContextMenu(null);
                        }}
                    >
                        <Trash2 size={14} /> {t.deletePermanently}
                    </button>
                </>
            )}
        </div>
      )}

      {/* --- Habit Modal (Create & Edit) --- */}
      {showHabitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${themeStyles.surface} ${themeStyles.text} border ${themeStyles.border} max-h-[90vh] overflow-y-auto`}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">{editingHabitId ? t.editHeatmap : t.createNewHeatmap}</h2>
                      <button onClick={() => setShowHabitModal(false)} className="opacity-50 hover:opacity-100"><X /></button>
                  </div>

                  <div className="space-y-5">
                      {/* Name */}
                      <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{t.name}</label>
                          <input 
                            type="text" 
                            value={habitForm.name}
                            onChange={e => setHabitForm({...habitForm, name: e.target.value})}
                            className={`w-full p-2.5 rounded-lg border focus:border-primary outline-none transition-colors ${themeStyles.input} ${themeStyles.border}`}
                            placeholder="e.g. Morning Jog"
                          />
                      </div>

                      {/* Category Combobox */}
                      <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{t.category}</label>
                          <div className="relative" ref={categoryDropdownRef}>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={habitCategoryInput}
                                        onChange={(e) => {
                                            setHabitCategoryInput(e.target.value);
                                            setIsCategoryDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsCategoryDropdownOpen(true)}
                                        placeholder={t.selectOrCreateCategory}
                                        className={`w-full p-2.5 rounded-lg border focus:border-primary outline-none transition-colors ${themeStyles.input} ${themeStyles.border}`}
                                    />
                                    <FolderOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                                </div>
                                {isCategoryDropdownOpen && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg shadow-xl border z-50 ${themeStyles.surface} ${themeStyles.border}`}>
                                        {categories.filter(c => c.name.toLowerCase().includes(habitCategoryInput.toLowerCase())).map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setHabitCategoryInput(c.name);
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-white/10"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                        {habitCategoryInput && !categories.some(c => c.name.toLowerCase() === habitCategoryInput.toLowerCase()) && (
                                            <div className="px-4 py-2 text-sm opacity-70 italic border-t border-white/5">
                                                <Plus className="inline w-3 h-3 mr-1" />
                                                {t.create} "{habitCategoryInput}"
                                            </div>
                                        )}
                                    </div>
                                )}
                          </div>
                      </div>

                      {/* Type Selection */}
                      <div className="grid grid-cols-2 gap-4">
                          <div 
                             onClick={() => setHabitForm({...habitForm, type: 'todo'})}
                             className={`p-4 border rounded-xl cursor-pointer transition-all ${habitForm.type === 'todo' ? 'border-primary bg-primary/10' : 'border-white/10 opacity-50'}`}
                          >
                              <CheckCircle2 className="mb-2 text-primary" />
                              <div className="font-bold text-sm">{t.linkedToTodos}</div>
                              <div className="text-[10px] opacity-70 mt-1 leading-tight">{t.linkedToTodosDesc}</div>
                          </div>
                          <div 
                             onClick={() => setHabitForm({...habitForm, type: 'manual'})}
                             className={`p-4 border rounded-xl cursor-pointer transition-all ${habitForm.type === 'manual' ? 'border-green-500 bg-green-500/10' : 'border-white/10 opacity-50'}`}
                          >
                              <Target className="mb-2 text-green-500" />
                              <div className="font-bold text-sm">{t.manualCheckIn}</div>
                              <div className="text-[10px] opacity-70 mt-1 leading-tight">{t.manualCheckInDesc}</div>
                          </div>
                      </div>

                      {/* Time Configuration (Split View) */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                                <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">
                                    <Calendar size={12}/> {t.startDate}
                                </label>
                                <input 
                                    type="date"
                                    value={habitForm.startDate}
                                    onChange={e => setHabitForm({...habitForm, startDate: e.target.value})}
                                    className={`w-full p-2.5 rounded-lg border outline-none ${themeStyles.input} ${themeStyles.border}`}
                                />
                          </div>
                          
                          <div>
                                <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">
                                    <Clock size={12}/> {t.duration}
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        min="1"
                                        value={habitForm.durationValue}
                                        onChange={e => setHabitForm({...habitForm, durationValue: parseInt(e.target.value) || 1})}
                                        className={`w-20 p-2.5 rounded-lg border outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${themeStyles.input} ${themeStyles.border}`}
                                    />
                                    <div className="relative flex-1 group">
                                        <select 
                                            value={habitForm.durationUnit}
                                            onChange={e => setHabitForm({...habitForm, durationUnit: e.target.value as any})}
                                            className={`w-full p-2.5 pr-8 rounded-lg border outline-none appearance-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/50 group-hover:border-primary/50 ${themeStyles.input} ${themeStyles.border} ${themeStyles.text}`}
                                        >
                                            <option value="day" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>{t.days}</option>
                                            <option value="week" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>{t.weeks}</option>
                                            <option value="month" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>{t.months}</option>
                                            <option value="year" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-200'}>{t.years}</option>
                                        </select>
                                        <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
                                    </div>
                                </div>
                          </div>
                      </div>

                      {/* Target Daily Value */}
                      <div>
                          <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">
                                <BarChart2 size={12}/> {t.targetValue}
                          </label>
                          <input 
                              type="number"
                              min="1"
                              max="5"
                              value={habitForm.targetValue}
                              onChange={e => setHabitForm({...habitForm, targetValue: Math.min(5, Math.max(1, parseInt(e.target.value) || 1))})}
                              className={`w-full p-2.5 rounded-lg border outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${themeStyles.input} ${themeStyles.border}`}
                          />
                      </div>

                      {/* Color */}
                      <div>
                          <label className="block text-xs uppercase tracking-wider font-semibold opacity-50 mb-2">{t.colorTheme}</label>
                          <div className="flex flex-wrap gap-3 items-center">
                              {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-red-500', 'bg-teal-500', 'bg-yellow-500'].map(c => (
                                  <button 
                                    key={c}
                                    type="button"
                                    onClick={() => setHabitForm({...habitForm, color: c})}
                                    className={`w-8 h-8 rounded-full ${c} ${habitForm.color === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'} transition-all`}
                                  />
                              ))}
                              
                              <div className="relative">
                                  <button
                                     type="button"
                                     onClick={() => habitColorInputRef.current?.click()}
                                     className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center ${habitForm.color.startsWith('#') ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-40 hover:opacity-100 bg-gradient-to-br from-white to-black'}`}
                                     style={habitForm.color.startsWith('#') ? {backgroundColor: habitForm.color} : {}}
                                     title={t.custom}
                                  >
                                    <Palette size={14} className="text-black mix-blend-difference"/>
                                  </button>
                                  <input 
                                     ref={habitColorInputRef}
                                     type="color"
                                     value={habitForm.color.startsWith('#') ? habitForm.color : '#3b82f6'}
                                     onChange={(e) => setHabitForm({...habitForm, color: e.target.value})}
                                     className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  />
                              </div>
                          </div>
                      </div>

                      <button 
                        onClick={handleSaveHabit}
                        disabled={!habitForm.name}
                        className="w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl mt-4 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                      >
                          {editingHabitId ? t.saveChanges : t.createHeatmap}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;