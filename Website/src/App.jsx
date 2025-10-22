import React, { useState, useEffect, createContext, useContext } from 'react';
import { Moon, Sun, PlusCircle, BookOpen, Home, LogOut, Edit, Trash2, Save, X, TrendingUp, Calendar, Sparkles, Trophy, Flame, Target, Zap, Clock, Award, Star, Globe, Brain, GamepadIcon, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Context for Auth and Theme
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// API Service
const API_URL = '/api';

const api = {
  register: async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  login: async (data) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getJournals: async (token) => {
    const res = await fetch(`${API_URL}/journals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  createJournal: async (token, data) => {
    const res = await fetch(`${API_URL}/journals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateJournal: async (token, id, data) => {
    const res = await fetch(`${API_URL}/journals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteJournal: async (token, id) => {
    const res = await fetch(`${API_URL}/journals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// Fun Facts & Trivia Data
const DAILY_QUESTIONS = [
  { q: "What historical event happened on this day?", type: "history" },
  { q: "What's a fun fact about today's date?", type: "fun" },
  { q: "What famous person was born today?", type: "birthday" },
  { q: "What invention was created on this day?", type: "invention" },
  { q: "What's today's interesting fact?", type: "trivia" }
];

const FUN_FACTS = [
  "📚 Writing for just 15 minutes a day can reduce stress by 28%",
  "🧠 Journaling improves memory and comprehension by 25%",
  "💡 People who journal regularly are 50% more likely to achieve their goals",
  "🌟 Gratitude journaling can increase happiness levels by 10%",
  "✨ Writing about emotions helps process them 3x faster",
  "🎯 Daily journaling improves problem-solving skills significantly",
  "🌈 Expressive writing boosts immune system function",
  "💪 Journaling for 20 minutes daily can improve mental health",
  "🎨 Creative writing activates both sides of your brain",
  "⚡ Morning journaling can boost productivity by 40%"
];

const MOOD_COLORS = {
  happy: '#22c55e',
  sad: '#3b82f6',
  neutral: '#6b7280',
  excited: '#f59e0b',
  anxious: '#8b5cf6',
  calm: '#06b6d4',
  angry: '#ef4444',
  grateful: '#ec4899'
};

// App Provider
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [funFact, setFunFact] = useState('');
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      loadJournals();
      loadDailyContent();
    }
  }, [token]);

  useEffect(() => {
    if (journals.length > 0) {
      calculateStreak();
      calculateAchievements();
    }
  }, [journals]);

  const loadDailyContent = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('dailyQuestionDate');
    
    if (savedDate !== today) {
      const randomQ = DAILY_QUESTIONS[Math.floor(Math.random() * DAILY_QUESTIONS.length)];
      setDailyQuestion(randomQ);
      localStorage.setItem('dailyQuestionDate', today);
      localStorage.setItem('dailyQuestion', JSON.stringify(randomQ));
    } else {
      const saved = localStorage.getItem('dailyQuestion');
      if (saved) setDailyQuestion(JSON.parse(saved));
    }
    
    const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    setFunFact(randomFact);
  };

  const calculateStreak = () => {
    if (journals.length === 0) {
      setStreak(0);
      return;
    }

    const sortedJournals = [...journals].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    let currentStreak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntry = new Date(sortedJournals[0].createdAt);
    lastEntry.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastEntry) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      setStreak(0);
      return;
    }

    for (let i = 0; i < sortedJournals.length - 1; i++) {
      const current = new Date(sortedJournals[i].createdAt);
      current.setHours(0, 0, 0, 0);
      
      const next = new Date(sortedJournals[i + 1].createdAt);
      next.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const calculateAchievements = () => {
    const newAchievements = [];
    
    if (journals.length >= 1) newAchievements.push({ name: "First Entry", icon: "🎯", color: "blue" });
    if (journals.length >= 5) newAchievements.push({ name: "Getting Started", icon: "🌱", color: "green" });
    if (journals.length >= 10) newAchievements.push({ name: "Dedicated Writer", icon: "✍️", color: "purple" });
    if (journals.length >= 30) newAchievements.push({ name: "Journal Master", icon: "👑", color: "yellow" });
    if (streak >= 3) newAchievements.push({ name: "3 Day Streak", icon: "🔥", color: "orange" });
    if (streak >= 7) newAchievements.push({ name: "Week Warrior", icon: "⚡", color: "red" });
    if (streak >= 30) newAchievements.push({ name: "Monthly Legend", icon: "🏆", color: "gold" });
    
    const hasAllMoods = ['happy', 'sad', 'excited', 'calm'].every(mood => 
      journals.some(j => j.mood === mood)
    );
    if (hasAllMoods) newAchievements.push({ name: "Emotion Explorer", icon: "🎭", color: "pink" });
    
    setAchievements(newAchievements);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        setToken(data.token);
        setUser(data);
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await api.register({ username, email, password });
      if (data.token) {
        setToken(data.token);
        setUser(data);
        localStorage.setItem('token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setJournals([]);
    setStreak(0);
    setAchievements([]);
    localStorage.removeItem('token');
  };

  const loadJournals = async () => {
    try {
      const data = await api.getJournals(token);
      if (Array.isArray(data)) {
        setJournals(data);
      }
    } catch (error) {
      console.error('Failed to load journals');
    }
  };

  const createJournal = async (journalData) => {
    setLoading(true);
    try {
      const data = await api.createJournal(token, journalData);
      if (data._id) {
        setJournals([data, ...journals]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateJournal = async (id, journalData) => {
    setLoading(true);
    try {
      const data = await api.updateJournal(token, id, journalData);
      if (data._id) {
        setJournals(journals.map(j => j._id === id ? data : j));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteJournal = async (id) => {
    try {
      await api.deleteJournal(token, id);
      setJournals(journals.filter(j => j._id !== id));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const refreshFunFact = () => {
    const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    setFunFact(randomFact);
  };

  return (
    <AppContext.Provider value={{
      user, token, theme, journals, loading, streak, dailyQuestion, funFact, achievements,
      login, register, logout, toggleTheme, refreshFunFact,
      createJournal, updateJournal, deleteJournal, loadJournals
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Auth Page with improved mobile responsiveness
const AuthPage = () => {
  const { login, register, loading } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData.username, formData.email, formData.password);
    
    if (!result.success) {
      setError(result.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 dark:from-purple-900 dark:via-pink-900 dark:to-red-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Journal
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            {isLogin ? 'Welcome back!' : 'Start your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                className="input-field text-sm sm:text-base"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input-field text-sm sm:text-base"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input-field text-sm sm:text-base"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 sm:py-3 text-base sm:text-lg"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-sm sm:text-base text-purple-600 dark:text-purple-400 hover:underline"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};

// Mobile Navigation Component
const MobileNav = ({ view, setView, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <div className="space-y-1.5">
          <span className="block w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
          <span className="block w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
          <span className="block w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></span>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 space-y-2 z-50">
          <button
            onClick={() => { setView('home'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${view === 'home' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => { setView('journals'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${view === 'journals' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <BookOpen className="w-5 h-5" />
            Journals
          </button>
          <button
            onClick={() => { setView('new'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${view === 'new' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <PlusCircle className="w-5 h-5" />
            New Entry
          </button>
          <button
            onClick={() => { setView('game'); setIsOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${view === 'game' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <GamepadIcon className="w-5 h-5" />
            Daily Challenge
          </button>
          <button
            onClick={() => { onLogout(); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// Fun Facts Widget
const FunFactWidget = () => {
  const { funFact, refreshFunFact } = useApp();
  
  return (
    <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Did You Know?
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{funFact}</p>
        </div>
        <button
          onClick={refreshFunFact}
          className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-lg transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
        </button>
      </div>
    </div>
  );
};

// Daily Challenge Component
const DailyChallenge = () => {
  const { dailyQuestion } = useApp();
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dailyChallengeAnswer');
    const savedDate = localStorage.getItem('dailyChallengeDate');
    const today = new Date().toDateString();
    
    if (saved && savedDate === today) {
      setAnswer(saved);
      setSubmitted(true);
    } else {
      setAnswer('');
      setSubmitted(false);
    }
  }, [dailyQuestion]);

  const handleSubmit = () => {
    const today = new Date().toDateString();
    localStorage.setItem('dailyChallengeAnswer', answer);
    localStorage.setItem('dailyChallengeDate', today);
    setSubmitted(true);
  };

  if (!dailyQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <GamepadIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Daily Challenge</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Answer today's question!</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <p className="text-base sm:text-lg font-medium">{dailyQuestion.q}</p>
          </div>
          
          {!submitted ? (
            <div className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="input-field min-h-32 text-sm sm:text-base"
                placeholder="Share your thoughts..."
              />
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="btn-primary w-full sm:w-auto"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Challenge Completed! 🎉
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{answer}</p>
              <p className="text-xs text-gray-500 mt-2">Come back tomorrow for a new challenge!</p>
            </div>
          )}
        </div>
      </div>

      <FunFactWidget />
    </div>
  );
};

// Achievements Widget
const AchievementsWidget = () => {
  const { achievements } = useApp();
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-600" />
        Achievements
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg text-center hover:scale-105 transition-transform"
          >
            <div className="text-3xl mb-2">{achievement.icon}</div>
            <p className="text-xs font-medium">{achievement.name}</p>
          </div>
        ))}
        {achievements.length === 0 && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-8 text-gray-500">
            Start writing to unlock achievements! 🎯
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard with mobile responsiveness
const Dashboard = () => {
  const { journals, theme, toggleTheme, logout, streak, user } = useApp();
  const [view, setView] = useState('home');
  const [selectedJournal, setSelectedJournal] = useState(null);

  const stats = {
    total: journals.length,
    thisWeek: journals.filter(j => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(j.createdAt) >= weekAgo;
    }).length,
    moodCount: journals.reduce((acc, j) => {
      acc[j.mood] = (acc[j.mood] || 0) + 1;
      return acc;
    }, {})
  };

  const weeklyData = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const count = journals.filter(j => {
      const jDate = new Date(j.createdAt);
      return jDate.toDateString() === date.toDateString();
    }).length;
    return { name: dateStr, entries: count };
  });

  const moodData = Object.entries(stats.moodCount).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
    color: MOOD_COLORS[mood]
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Journal
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Welcome back, {user?.username}!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button onClick={logout} className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <MobileNav view={view} setView={setView} onLogout={logout} />
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:block max-w-7xl mx-auto px-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'home' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setView('journals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'journals' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Journals
            </button>
            <button
              onClick={() => setView('new')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'new' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              New Entry
            </button>
            <button
              onClick={() => setView('game')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                view === 'game' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <GamepadIcon className="w-4 h-4" />
              Daily Challenge
            </button>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around px-2 py-2">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                view === 'home' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setView('journals')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                view === 'journals' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Journals</span>
            </button>
            <button
              onClick={() => setView('new')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                view === 'new' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-xs">New</span>
            </button>
            <button
              onClick={() => setView('game')}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                view === 'game' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <GamepadIcon className="w-5 h-5" />
              <span className="text-xs">Challenge</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">
        {view === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Streak Banner */}
            {streak > 0 && (
              <div className="card bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Current Streak</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1 flex items-center gap-2">
                      <Flame className="w-8 h-8 sm:w-10 sm:h-10" />
                      {streak} {streak === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                  <Target className="w-16 h-16 sm:w-20 sm:h-20 text-orange-200 opacity-50" />
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Total Entries</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-2">{stats.total}</p>
                  </div>
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-purple-200" />
                </div>
              </div>
              
              <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-xs sm:text-sm">This Week</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-2">{stats.thisWeek}</p>
                  </div>
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-pink-200" />
                </div>
              </div>
              
              <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Keep it up!</p>
                    <p className="text-2xl sm:text-4xl font-bold mt-2">
                      {stats.thisWeek >= 5 ? '🔥 Amazing!' : stats.thisWeek >= 3 ? '⚡ Great!' : '💪 Start writing!'}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Fun Fact */}
            <FunFactWidget />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  Weekly Activity
                </h3>
                <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="entries" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                  Mood Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ mood, percent }) => `${mood} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Achievements */}
            <AchievementsWidget />

            {/* Recent Entries */}
            <div className="card">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {journals.slice(0, 5).map(journal => (
                  <div
                    key={journal._id}
                    onClick={() => {
                      setSelectedJournal(journal);
                      setView('view');
                    }}
                    className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{journal.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {journal.aiSummary || journal.content.substring(0, 100)}...
                        </p>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs flex-shrink-0">
                        {journal.mood}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
                {journals.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-500">No entries yet. Start writing!</p>
                    <button
                      onClick={() => setView('new')}
                      className="btn-primary mt-4 text-sm"
                    >
                      Create First Entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'journals' && (
          <JournalList onSelect={(journal) => { setSelectedJournal(journal); setView('view'); }} />
        )}

        {view === 'new' && (
          <JournalForm onCancel={() => setView('home')} onSuccess={() => setView('journals')} />
        )}

        {view === 'view' && selectedJournal && (
          <JournalView journal={selectedJournal} onBack={() => setView('journals')} onEdit={() => setView('edit')} />
        )}

        {view === 'edit' && selectedJournal && (
          <JournalForm
            journal={selectedJournal}
            onCancel={() => setView('view')}
            onSuccess={() => setView('journals')}
          />
        )}

        {view === 'game' && <DailyChallenge />}
      </main>
    </div>
  );
};

// Journal List Component
const JournalList = ({ onSelect }) => {
  const { journals, deleteJournal } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJournals = journals.filter(j => {
    const matchesFilter = filter === 'all' || j.mood === filter;
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         j.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const moods = ['all', 'happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'angry', 'grateful'];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">All Journals</h2>
          <input
            type="text"
            placeholder="Search journals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field text-sm sm:text-base sm:max-w-xs"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {moods.map(mood => (
            <button
              key={mood}
              onClick={() => setFilter(mood)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                filter === mood
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredJournals.map(journal => (
          <div key={journal._id} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate">{journal.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm">
                    {journal.mood}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onSelect(journal)}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this journal entry?')) {
                      await deleteJournal(journal._id);
                    }
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            {journal.aiSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-lg mb-3">
                <p className="text-xs sm:text-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{journal.aiSummary}</span>
                </p>
              </div>
            )}
            
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3">{journal.content}</p>
            
            <button
              onClick={() => onSelect(journal)}
              className="mt-4 text-purple-600 dark:text-purple-400 hover:underline text-xs sm:text-sm font-medium"
            >
              Read more →
            </button>
          </div>
        ))}
        
        {filteredJournals.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm ? 'No journals match your search' : 'No journal entries found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Journal Form Component
const JournalForm = ({ journal, onCancel, onSuccess }) => {
  const { createJournal, updateJournal, loading } = useApp();
  const [formData, setFormData] = useState({
    title: journal?.title || '',
    content: journal?.content || '',
    tags: journal?.tags?.join(', ') || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    const result = journal
      ? await updateJournal(journal._id, data)
      : await createJournal(data);

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          {journal ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              className="input-field text-sm sm:text-base"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Give your entry a title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              className="input-field min-h-48 sm:min-h-64 resize-y text-sm sm:text-base"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your thoughts here... The AI will analyze your mood and create a summary."
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Be honest and expressive. The more you write, the better AI can analyze your mood!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              className="input-field text-sm sm:text-base"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="work, personal, thoughts..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : journal ? 'Update Entry' : 'Create Entry'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Journal View Component
const JournalView = ({ journal, onBack, onEdit }) => {
  const { deleteJournal } = useApp();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const result = await deleteJournal(journal._id);
      if (result.success) {
        onBack();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-4 text-purple-600 dark:text-purple-400 hover:underline text-sm sm:text-base flex items-center gap-2">
        <ChevronLeft className="w-4 h-4" />
        Back to journals
      </button>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">{journal.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span>{new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                {journal.mood}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onEdit} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {journal.aiSummary && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              AI Summary
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{journal.aiSummary}</p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="whitespace-pre-wrap text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {journal.content}
          </p>
        </div>

        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {journal.tags.map((tag, index) => (
              <span key={index} className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  return (
    <AppProvider>
      <AppContext.Consumer>
        {({ token }) => (
          token ? <Dashboard /> : <AuthPage />
        )}
      </AppContext.Consumer>
    </AppProvider>
  );
}