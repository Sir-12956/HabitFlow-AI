
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
  BarChart2,
  Sparkles,
  Bell,
  ToggleLeft,
  ToggleRight,
  LogOut,
  User as UserIcon,
  Lock,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Languages
} from 'lucide-react';
import Heatmap, { HeatmapLegend } from './components/Heatmap';
import AICoach from './components/AICoach';
import { ApiService } from './services/storageService';
import { generateSmartTodos, calculateVelocityReplanning } from './services/geminiService';
import { Todo, Habit, Category, ThemeMode, Language, User } from './types';

// Translation Dictionary
const TRANSLATIONS = {
  en: {
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    welcomeBack: "Welcome Back",
    getStarted: "Start Your Journey",
    authError: "Authentication Failed",
    passwordMismatch: "Passwords do not match",
    passwordRequirement: "Password must include uppercase, lowercase, and numbers.",
    strengthWeak: "Weak",
    strengthMedium: "Medium",
    strengthStrong: "Strong",
    strengthExcellent: "Excellent",
    myFocus: "My Focus",
    newHeatmap: "New Heatmap",
    categories: "Categories",
    settings: "Settings",
    logout: "Logout",
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
    aiGenerationFailed: "AI Generation failed.",
    aiCoach: "AI Productivity Coach",
    generateTasksTitle: "Generate tasks for selected habit",
    noItems: "No items",
    hideFromDashboard: "Hide from Dashboard",
    showOnDashboard: "Show on Dashboard",
    addHeatmap: "Add Heatmap",
    targetValue: "Daily Target (Max 5)",
    confirmDeleteCategory: "Are you sure you want to delete this category and all its heatmaps?",
    manualLinkError: "Cannot link a task to a 'Manual Check-in' heatmap. Please select a 'Task Driven' heatmap or create a new one.",
    smartReplan: "Smart Replan",
    replanLoading: "Calculated!",
    replanSuccess: "AI Suggestion applied!",
    replanError: "Replan failed.",
    replanConfirmTitle: "AI Velocity Suggestion",
    dailyReminder: "Daily Check-in Reminder",
    dailyReminderDesc: "Show a popup when I first open the app if I haven't checked in.",
    smartReplanLabel: "AI Velocity Replan",
    smartReplanDesc: "Recalculate duration based on progress. Only takes effect once after saving.",
    goodMorning: "Daily Reminder",
    reminderIntro: "Here are the habits you asked to be reminded about today:",
    done: "Done",
    markDone: "Check In",
    dismiss: "Dismiss",
    saving: "Saving...",
    loading: "Loading your data..."
  },
  zh: {
    login: "登录",
    register: "注册",
    username: "用户名",
    password: "密码",
    confirmPassword: "确认密码",
    noAccount: "没有账号？",
    haveAccount: "已有账号？",
    welcomeBack: "欢迎回来",
    getStarted: "开始您的旅程",
    authError: "认证失败",
    passwordMismatch: "两次输入的密码不一致",
    passwordRequirement: "密码必须包含大小写字母和数字。",
    strengthWeak: "弱",
    strengthMedium: "中",
    strengthStrong: "强",
    strengthExcellent: "优秀",
    myFocus: "我的专注",
    newHeatmap: "新建热力图",
    categories: "分类",
    settings: "设置",
    logout: "登出",
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
    aiGenerationFailed: "AI生成失败。",
    aiCoach: "AI 效率教练",
    generateTasksTitle: "为选定的习惯生成任务",
    noItems: "无项目",
    hideFromDashboard: "从仪表盘隐藏",
    showOnDashboard: "在仪表盘显示",
    addHeatmap: "添加热力图",
    targetValue: "每日目标 (最大 5)",
    confirmDeleteCategory: "确定要删除此分类及其下的所有热力图吗？",
    manualLinkError: "无法将任务关联到“手动打卡”热力图。请选择“任务驱动”热力图或新建一个。",
    smartReplan: "智能重排",
    replanLoading: "计算完成!",
    replanSuccess: "AI建议已应用！",
    replanError: "重排失败。",
    replanConfirmTitle: "AI 速度建议",
    dailyReminder: "每日打卡提醒",
    dailyReminderDesc: "如果当天未打卡，首次打开应用时弹出提醒。",
    smartReplanLabel: "AI 智能重排",
    smartReplanDesc: "根据进度重新计算时长。仅在保存后生效一次。",
    goodMorning: "每日提醒",
    reminderIntro: "这是您今天需要提醒的习惯：",
    done: "完成",
    markDone: "打卡",
    dismiss: "关闭",
    saving: "保存中...",
    loading: "加载中..."
  }
};

const AuthPage: React.FC<{ onLogin: (user: User) => void, language: Language }> = ({ onLogin, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const t = TRANSLATIONS[language];

  // Heuristic for password strength
  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (s: number) => {
    if (s <= 1) return t.strengthWeak;
    if (s === 2) return t.strengthMedium;
    if (s === 3) return t.strengthStrong;
    return t.strengthExcellent;
  };

  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-red-500';
    if (s === 2) return 'bg-yellow-500';
    if (s === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const validatePassword = (p: string) => {
    // Requires at least one lower, one upper, and one number
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    return hasLower && hasUpper && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setError('');
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
      if (!validatePassword(password)) {
        setError(t.passwordRequirement);
        return;
      }
    }

    setLoading(true);
    try {
      const user = isLogin 
        ? await ApiService.login(username, password)
        : await ApiService.register(username, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">HabitFlow AI</h1>
          <p className="text-slate-400 mt-1 text-sm">{isLogin ? t.welcomeBack : t.getStarted}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">{t.username}</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="alex_productivity"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {!isLogin && password && (
              <div className="mt-2 px-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] opacity-60 font-semibold">{t.strengthWeak} / {getStrengthLabel(strength)}</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`h-full flex-1 transition-all duration-500 ${step <= strength ? getStrengthColor(strength) : 'bg-transparent'}`}
                    />
                  ))}
                </div>
                <p className="text-[9px] opacity-40 mt-1 leading-tight">{t.passwordRequirement}</p>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold ml-1">{t.confirmPassword}</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20 flex items-start gap-2 animate-shake">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLogin ? t.login : t.register}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-400 text-xs">
          {isLogin ? t.noAccount : t.haveAccount}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); setConfirmPassword(''); setShowPassword(false); setShowConfirmPassword(false); }}
            className="ml-2 text-blue-400 font-bold hover:underline"
          >
            {isLogin ? t.register : t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => ApiService.getCurrentUser());
  const [loading, setLoading] = useState(!!currentUser);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [theme, setTheme] = useState<ThemeMode>(() => ApiService.getTheme().mode);
  const [customColor, setCustomColor] = useState(() => ApiService.getTheme().customColor);
  const [language, setLanguage] = useState<Language>(() => ApiService.getLanguage());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [newTodoText, setNewTodoText] = useState('');
  const [todoHabitInput, setTodoHabitInput] = useState('');
  const [todoCategoryInput, setTodoCategoryInput] = useState(''); 
  
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showDailyReminderModal, setShowDailyReminderModal] = useState(false);
  const [pendingReminderHabits, setPendingReminderHabits] = useState<Habit[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitCategoryInput, setHabitCategoryInput] = useState('');
  
  const settingsRef = useRef<HTMLDivElement>(null);

  const [habitForm, setHabitForm] = useState({
    name: '',
    type: 'todo' as 'todo' | 'manual',
    color: 'bg-blue-500',
    startDate: new Date().toISOString().split('T')[0],
    durationValue: 1,
    durationUnit: 'year' as 'day' | 'week' | 'month' | 'year',
    description: '',
    targetValue: 1,
    dailyReminder: false,
    smartReplanEnabled: false,
    isSaving: false
  });

  // --- Initial Fetch ---
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      ApiService.fetchUserData(currentUser.id).then(data => {
        setCategories(data.categories);
        setHabits(data.habits);
        setTodos(data.todos);
        setLoading(false);
      });
    }
  }, [currentUser]);

  // --- Persistence Handlers (Debounced/Buffered would be better for real API) ---
  useEffect(() => { if (currentUser) ApiService.saveCategories(currentUser.id, categories); }, [categories, currentUser]);
  useEffect(() => { if (currentUser) ApiService.saveHabits(currentUser.id, habits); }, [habits, currentUser]);
  useEffect(() => { if (currentUser) ApiService.saveTodos(currentUser.id, todos); }, [todos, currentUser]);
  useEffect(() => ApiService.saveTheme(theme, customColor), [theme, customColor]);
  useEffect(() => ApiService.saveLanguage(language), [language]);

  // --- Daily Reminder Logic ---
  useEffect(() => {
    if (!currentUser || loading) return;
    const checkDailyReminders = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastSeen = localStorage.getItem(`habitflow_last_reminder_${currentUser.id}`);
        if (lastSeen === todayStr) return;
        const habitsToRemind = habits.filter(h => h.dailyReminder && (h.logs[todayStr] || 0) < h.targetValue);
        if (habitsToRemind.length > 0) {
            setPendingReminderHabits(habitsToRemind);
            setShowDailyReminderModal(true);
            localStorage.setItem(`habitflow_last_reminder_${currentUser.id}`, todayStr);
        }
    };
    const timer = setTimeout(checkDailyReminders, 1000);
    return () => clearTimeout(timer);
  }, [currentUser, habits, loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setIsSettingsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const t = TRANSLATIONS[language];

  const themeStyles = currentUser ? {
    bg: theme === 'light' ? 'bg-slate-50' : theme === 'dark' ? 'bg-slate-950' : 'bg-[var(--custom-bg)]',
    text: theme === 'light' ? 'text-slate-900' : 'text-slate-200',
    surface: theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-900' : 'bg-black/20',
    border: theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-800' : 'border-white/10',
    input: 'bg-black/20'
  } : { bg: '', text: '', surface: '', border: '', input: '' };

  const handleLogout = () => {
    ApiService.logout();
    setCurrentUser(null);
    setCategories([]);
    setHabits([]);
    setTodos([]);
  };

  /**
   * Helper to toggle category expansion in the sidebar
   */
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  /**
   * Helper to open the habit modal for either creating a new one or editing an existing one
   */
  const openHabitModal = (habitId?: string) => {
    if (habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setEditingHabitId(habitId);
        const cat = categories.find(c => c.id === habit.categoryId);
        setHabitCategoryInput(cat ? cat.name : '');
        setHabitForm({
          name: habit.name,
          type: habit.isManual ? 'manual' : 'todo',
          color: habit.color,
          startDate: habit.startDate,
          durationValue: habit.durationDays,
          durationUnit: 'day',
          description: habit.description || '',
          targetValue: habit.targetValue,
          dailyReminder: habit.dailyReminder || false,
          smartReplanEnabled: false,
          isSaving: false
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
        targetValue: 1,
        dailyReminder: false,
        smartReplanEnabled: false,
        isSaving: false
      });
    }
    setShowHabitModal(true);
  };

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

  const handleAddTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTodoText.trim() || !currentUser) return;

    let targetHabitId: string | null = null;
    const trimmedHabitInput = todoHabitInput.trim();
    const trimmedCategoryInput = todoCategoryInput.trim();

    if (trimmedHabitInput) {
        const existingHabit = habits.find(h => h.name.toLowerCase() === trimmedHabitInput.toLowerCase());
        if (existingHabit) {
            if (existingHabit.isManual) { alert(t.manualLinkError); return; }
            targetHabitId = existingHabit.id;
        } else {
            let categoryId = '';
            if (trimmedCategoryInput) {
                const existingCat = categories.find(c => c.name.toLowerCase() === trimmedCategoryInput.toLowerCase());
                if (existingCat) categoryId = existingCat.id;
                else {
                    const newCatId = crypto.randomUUID();
                    const newCategory: Category = { id: newCatId, userId: currentUser.id, name: trimmedCategoryInput, order: categories.length };
                    setCategories(prev => [...prev, newCategory]);
                    categoryId = newCatId;
                }
            } else {
                const defaultCat = categories.find(c => c.name === 'Default');
                if (defaultCat) categoryId = defaultCat.id;
                else {
                    const newCatId = crypto.randomUUID();
                    const newCategory: Category = { id: newCatId, userId: currentUser.id, name: 'Default', order: categories.length };
                    setCategories(prev => [...prev, newCategory]);
                    categoryId = newCatId;
                }
            }
            const newHabitId = crypto.randomUUID();
            const newHabit: Habit = { id: newHabitId, userId: currentUser.id, name: trimmedHabitInput, categoryId, color: 'bg-blue-500', isManual: false, logs: {}, startDate: today, durationDays: 365, isVisibleOnDashboard: true, targetValue: 1, dailyReminder: false };
            setHabits(prev => [...prev, newHabit]);
            targetHabitId = newHabitId;
        }
    }

    const newTodo: Todo = { id: crypto.randomUUID(), userId: currentUser.id, text: newTodoText, completed: false, categoryId: targetHabitId, date: today, createdAt: Date.now() };
    const nextTodos = [...todos, newTodo];
    setTodos(nextTodos);
    setNewTodoText(''); setTodoHabitInput(''); setTodoCategoryInput('');
    if (targetHabitId) updateHabitLogs(nextTodos);
  };

  const handleSaveHabit = async () => {
    if (!habitForm.name || !currentUser) return; 
    setHabitForm(prev => ({ ...prev, isSaving: true }));
    try {
        let finalCategoryId = '';
        const trimmedCatName = habitCategoryInput.trim();
        if (trimmedCatName) {
            const existingCat = categories.find(c => c.name.toLowerCase() === trimmedCatName.toLowerCase());
            if (existingCat) finalCategoryId = existingCat.id;
            else {
                const newCatId = crypto.randomUUID();
                const newCat: Category = { id: newCatId, userId: currentUser.id, name: trimmedCatName, order: categories.length };
                setCategories(prev => [...prev, newCat]);
                finalCategoryId = newCatId;
            }
        } else {
            const defaultCat = categories.find(c => c.name === 'Default');
            if (defaultCat) finalCategoryId = defaultCat.id;
            else {
                const newCatId = crypto.randomUUID();
                const newCat: Category = { id: newCatId, userId: currentUser.id, name: 'Default', order: categories.length };
                setCategories(prev => [...prev, newCat]);
                finalCategoryId = newCatId;
            }
        }

        const multipliers = { day: 1, week: 7, month: 30, year: 365 };
        let durationDays = habitForm.durationValue * multipliers[habitForm.durationUnit];
        const habitToEdit = editingHabitId ? habits.find(h => h.id === editingHabitId) : null;

        if (habitForm.smartReplanEnabled && editingHabitId && habitToEdit) {
             try {
                const result = await calculateVelocityReplanning(habitForm.name, habitForm.startDate, durationDays, habitToEdit.logs);
                if (result && result.newDurationDays) durationDays = result.newDurationDays;
             } catch (e) { console.error("Replan failed", e); }
        }

        if (editingHabitId) {
            setHabits(prev => prev.map(h => h.id === editingHabitId ? { ...h, name: habitForm.name, categoryId: finalCategoryId, color: habitForm.color, isManual: habitForm.type === 'manual', startDate: habitForm.startDate, durationDays, description: habitForm.description, targetValue: habitForm.targetValue || 1, dailyReminder: habitForm.dailyReminder } : h));
        } else {
            const newHabit: Habit = { id: crypto.randomUUID(), userId: currentUser.id, name: habitForm.name, categoryId: finalCategoryId, color: habitForm.color, isManual: habitForm.type === 'manual', logs: {}, startDate: habitForm.startDate, durationDays, isVisibleOnDashboard: true, description: habitForm.description, targetValue: habitForm.targetValue || 1, dailyReminder: habitForm.dailyReminder };
            setHabits(prev => [...prev, newHabit]);
        }
        setShowHabitModal(false);
    } finally { setHabitForm(prev => ({ ...prev, isSaving: false })); }
  };

  const handleManualCheckIn = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const target = h.targetValue || 1;
      const currentCount = h.logs[dateStr] || 0;
      const newCount = currentCount >= target ? 0 : currentCount + 1;
      return { ...h, logs: { ...h.logs, [dateStr]: newCount } };
    }));
    if (dateStr === today) {
         setPendingReminderHabits(prev => prev.filter(h => h.id !== habitId));
         if (pendingReminderHabits.length <= 1 && pendingReminderHabits.find(h => h.id === habitId)) setShowDailyReminderModal(false);
    }
  };

  if (!currentUser) {
    return <AuthPage onLogin={setCurrentUser} language={language} />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">{t.loading}</p>
      </div>
    );
  }

  return (
    <div 
        className={`flex h-full font-sans transition-colors duration-300 ${themeStyles.bg} ${themeStyles.text}`}
        style={theme === 'custom' ? { '--custom-bg': customColor } as React.CSSProperties : {}}
    >
      {/* Sidebar */}
      <aside 
        className={`
            fixed inset-y-0 left-0 z-50 h-full border-r overflow-hidden flex flex-col transition-all duration-300
            ${isSidebarOpen ? 'w-64 translate-x-0 shadow-2xl' : 'w-0 -translate-x-full'}
            md:relative md:translate-x-0 md:shadow-none ${themeStyles.surface} ${themeStyles.border}
        `}
      >
        <button onClick={() => setIsSidebarOpen(false)} className="absolute right-3 top-6 bg-primary text-white p-1 rounded-full shadow-md z-40 md:hidden"><ChevronLeft size={14}/></button>
        <div className="p-6 flex items-center gap-3 font-bold text-xl text-primary"><Activity className="w-8 h-8 shrink-0" />HabitFlow</div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <div className="px-2">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">{t.categories}</div>
                {categories.map(cat => (
                    <div key={cat.id} className="mb-4">
                        <div onClick={() => toggleCategoryCollapse(cat.id)} className="flex items-center justify-between group cursor-pointer py-1">
                            <span className="text-sm font-semibold opacity-70 flex items-center gap-2">
                                <ChevronDown size={14} className={`transition-transform ${collapsedCategories.includes(cat.id) ? '-rotate-90' : ''}`} />
                                {cat.name}
                            </span>
                        </div>
                        {!collapsedCategories.includes(cat.id) && (
                            <div className="pl-6 mt-1 space-y-1 border-l border-white/5 ml-1">
                                {habits.filter(h => h.categoryId === cat.id).map(h => (
                                    <div key={h.id} className="text-sm opacity-50 hover:opacity-100 py-1 flex items-center gap-2 cursor-pointer" onClick={() => openHabitModal(h.id)}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${h.color.startsWith('#') ? '' : h.color}`} style={h.color.startsWith('#') ? {backgroundColor: h.color} : {}} />
                                        {h.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className={`p-4 mt-auto border-t ${themeStyles.border} space-y-2 relative`} ref={settingsRef}>
             <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors">
                 <Settings size={20} className="opacity-70" /><span className="text-sm font-medium">{t.settings}</span><ChevronDown size={14} className="ml-auto opacity-50 transition-transform" style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
             </button>
             {isSettingsOpen && (
                 <div className="absolute bottom-full mb-2 left-4 right-4 bg-slate-800 p-4 rounded-xl border border-white/10 shadow-2xl space-y-4 animate-fade-in z-50">
                     <div className="space-y-4">
                        {/* Theme Section */}
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                                <Palette size={10} /> {t.theme}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTheme('light')} 
                                    className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-black/20 text-slate-400 hover:bg-black/40'}`}
                                    title={t.light}
                                >
                                    <Sun size={14}/>
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')} 
                                    className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-black/20 text-slate-400 hover:bg-black/40'}`}
                                    title={t.dark}
                                >
                                    <Moon size={14}/>
                                </button>
                            </div>
                        </div>

                        {/* Language Section */}
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                                <Languages size={10} /> {t.language}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setLanguage('en')} 
                                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-black/20 text-slate-400 hover:bg-black/40'}`}
                                >
                                    EN
                                </button>
                                <button 
                                    onClick={() => setLanguage('zh')} 
                                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${language === 'zh' ? 'bg-blue-600 text-white' : 'bg-black/20 text-slate-400 hover:bg-black/40'}`}
                                >
                                    中文
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-2"></div>

                        <button onClick={handleLogout} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                            <LogOut size={14} />{t.logout}
                        </button>
                     </div>
                 </div>
             )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <header className="flex justify-between items-center">
              <div>
                  <h1 className="text-3xl font-bold">{t.myFocus}</h1>
                  <p className="opacity-50 text-sm">{currentUser.username}'s Daily Dashboard</p>
              </div>
              <button onClick={() => openHabitModal()} className="bg-primary hover:brightness-110 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95"><Plus size={18} /> {t.newHeatmap}</button>
          </header>

          <AICoach habits={habits} todos={todos} language={language} />

          {/* Todo Section */}
          <div className={`${themeStyles.surface} border ${themeStyles.border} rounded-3xl overflow-hidden shadow-xl`}>
              <div className="p-4 bg-black/5">
                <form onSubmit={handleAddTodo} className="space-y-4">
                    <input 
                      type="text" 
                      value={newTodoText} 
                      onChange={e => setNewTodoText(e.target.value)} 
                      placeholder={t.whatNeedsToBeDone} 
                      className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-shadow" 
                    />
                    <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={todoHabitInput} 
                          onChange={e => setTodoHabitInput(e.target.value)} 
                          placeholder={t.linkToHeatmap} 
                          className="flex-1 bg-black/20 border border-white/5 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-shadow" 
                        />
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">{t.add}</button>
                    </div>
                </form>
              </div>
              <div className="p-4 space-y-2">
                  {todos.filter(todo => todo.date === today).map(todo => (
                      <div key={todo.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl group animate-fade-in">
                          <button 
                            onClick={() => { const next = todos.map(t => t.id === todo.id ? {...t, completed: !t.completed} : t); setTodos(next); updateHabitLogs(next); }} 
                            className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${todo.completed ? 'bg-green-500 border-green-500' : 'border-slate-500 hover:border-slate-400'}`}
                          >
                            {todo.completed && <CheckCircle2 size={12} className="text-white"/>}
                          </button>
                          <span className={`text-sm transition-all ${todo.completed ? 'opacity-30 line-through' : ''}`}>{todo.text}</span>
                      </div>
                  ))}
                  {todos.filter(todo => todo.date === today).length === 0 && (
                    <div className="text-center py-6 opacity-30 text-xs italic">{t.noTasks}</div>
                  )}
              </div>
          </div>

          <div className="grid gap-8">
              {habits.filter(h => h.isVisibleOnDashboard).map(habit => (
                  <div key={habit.id} className={`${themeStyles.surface} border ${themeStyles.border} rounded-3xl p-6 shadow-xl relative group transition-transform hover:scale-[1.005]`}>
                       <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                               <div className={`w-3 h-8 rounded-full ${habit.color.startsWith('#') ? '' : habit.color}`} style={habit.color.startsWith('#') ? {backgroundColor: habit.color} : {}} />
                               <div>
                                   <h3 className="font-bold">{habit.name}</h3>
                                   <p className="text-xs opacity-50">{habit.isManual ? t.manualCheckIn : t.linkedToTodos}</p>
                               </div>
                           </div>
                           <button onClick={() => openHabitModal(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-lg">
                               <Pencil size={14}/>
                           </button>
                       </div>
                       <Heatmap 
                         data={habit.logs} 
                         color={habit.color} 
                         startDate={habit.startDate} 
                         durationDays={habit.durationDays} 
                         interactive={habit.isManual} 
                         onClickDay={d => handleManualCheckIn(habit.id, d)} 
                         targetValue={habit.targetValue} 
                       />
                       <HeatmapLegend color={habit.color} targetValue={habit.targetValue} />
                  </div>
              ))}
          </div>
      </main>

      {/* Habit Modal */}
      {showHabitModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{editingHabitId ? t.editHeatmap : t.createNewHeatmap}</h2>
                    <button onClick={() => setShowHabitModal(false)} className="p-1 hover:bg-white/5 rounded-lg transition-colors"><X/></button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">{t.name}</label>
                      <input type="text" value={habitForm.name} onChange={e => setHabitForm({...habitForm, name: e.target.value})} placeholder={t.name} className="w-full bg-black/30 border border-white/5 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">{t.category}</label>
                      <input type="text" value={habitCategoryInput} onChange={e => setHabitCategoryInput(e.target.value)} placeholder={t.category} className="w-full bg-black/30 border border-white/5 rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setHabitForm({...habitForm, type: 'todo'})} className={`p-4 border rounded-xl text-left transition-all ${habitForm.type === 'todo' ? 'border-primary bg-primary/10' : 'border-white/5 opacity-50 hover:opacity-100'}`}>
                          <div className="text-sm font-bold mb-1">{t.taskDriven}</div>
                          <div className="text-[10px] opacity-60 leading-tight">{t.linkedToTodosDesc}</div>
                        </button>
                        <button onClick={() => setHabitForm({...habitForm, type: 'manual'})} className={`p-4 border rounded-xl text-left transition-all ${habitForm.type === 'manual' ? 'border-success bg-success/10' : 'border-white/5 opacity-50 hover:opacity-100'}`}>
                          <div className="text-sm font-bold mb-1">{t.manualCheckIn}</div>
                          <div className="text-[10px] opacity-60 leading-tight">{t.manualCheckInDesc}</div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl cursor-pointer hover:bg-black/40 transition-colors" onClick={() => setHabitForm({...habitForm, dailyReminder: !habitForm.dailyReminder})}>
                        <div className="flex gap-2 items-center text-sm"><Bell size={16} className={habitForm.dailyReminder ? 'text-yellow-400' : ''}/>{t.dailyReminder}</div>
                        {habitForm.dailyReminder ? <ToggleRight className="text-primary"/> : <ToggleLeft className="text-slate-600"/>}
                    </div>
                    <button onClick={handleSaveHabit} disabled={habitForm.isSaving} className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                      {habitForm.isSaving && <Loader2 size={16} className="animate-spin"/>}
                      {editingHabitId ? t.saveChanges : t.createHeatmap}
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* Daily Reminder Modal */}
      {showDailyReminderModal && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl animate-fade-in">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <Bell className="mx-auto w-12 h-12 text-yellow-500 animate-bounce"/>
                      <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <h2 className="text-2xl font-bold">{t.goodMorning}</h2>
                    <p className="opacity-50 text-sm mt-1">{t.reminderIntro}</p>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {pendingReminderHabits.map(h => (
                          <div key={h.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                              <span className="font-bold text-sm">{h.name}</span>
                              {h.isManual ? (
                                <button onClick={() => handleManualCheckIn(h.id, today)} className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                  {t.markDone}
                                </button>
                              ) : (
                                <span className="text-[10px] opacity-40 italic">{t.linkedToTodos}</span>
                              )}
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setShowDailyReminderModal(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">
                    {t.dismiss}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
