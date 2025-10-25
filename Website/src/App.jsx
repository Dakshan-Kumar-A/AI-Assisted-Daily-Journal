import React, { useState, useEffect, createContext, useContext } from 'react';
import { Moon, Sun, PlusCircle, BookOpen, Home, LogOut, Edit, Trash2, Save, X, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
  // Auth
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
  // Journals
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
  },
  getStats: async (token) => {
    const res = await fetch(`${API_URL}/journals/stats/weekly`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// App Provider
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      loadJournals();
    }
  }, [token]);

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

  return (
    <AppContext.Provider value={{
      user, token, theme, journals, loading,
      login, register, logout, toggleTheme,
      createJournal, updateJournal, deleteJournal, loadJournals
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Auth Page
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isLogin ? 'Welcome back!' : 'Start your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                className="input-field"
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
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="input-field"
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
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-purple-600 dark:text-purple-400 hover:underline"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};

// Dashboard
const Dashboard = () => {
  const { journals, theme, toggleTheme, logout } = useApp();
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
    count
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Journal
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 pb-3 flex gap-2">
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
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Entries</p>
                    <p className="text-4xl font-bold mt-2">{stats.total}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-purple-200" />
                </div>
              </div>
              
              <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm">This Week</p>
                    <p className="text-4xl font-bold mt-2">{stats.thisWeek}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-pink-200" />
                </div>
              </div>
              
              <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Streak</p>
                    <p className="text-4xl font-bold mt-2">{stats.thisWeek > 0 ? '🔥' : '😴'}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Weekly Activity
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="entries" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  Mood Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mood" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-3">
                {journals.slice(0, 5).map(journal => (
                  <div
                    key={journal._id}
                    onClick={() => {
                      setSelectedJournal(journal);
                      setView('view');
                    }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{journal.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {journal.aiSummary || journal.content.substring(0, 100)}...
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs ml-3">
                        {journal.mood}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
                {journals.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No entries yet. Start writing!</p>
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
      </main>
    </div>
  );
};

// Journal List Component
const JournalList = ({ onSelect }) => {
  const { journals, deleteJournal } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredJournals = filter === 'all' 
    ? journals 
    : journals.filter(j => j.mood === filter);

  const moods = ['all', 'happy', 'sad', 'neutral', 'excited', 'anxious', 'calm', 'angry', 'grateful'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Journals</h2>
        <div className="flex gap-2 flex-wrap">
          {moods.map(mood => (
            <button
              key={mood}
              onClick={() => setFilter(mood)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
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

      <div className="grid gap-6">
        {filteredJournals.map(journal => (
          <div key={journal._id} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{journal.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                    {journal.mood}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelect(journal)}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Delete this journal entry?')) {
                      await deleteJournal(journal._id);
                    }
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {journal.aiSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg mb-3">
                <p className="text-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{journal.aiSummary}</span>
                </p>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{journal.content}</p>
            
            <button
              onClick={() => onSelect(journal)}
              className="mt-4 text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
            >
              Read more →
            </button>
          </div>
        ))}
        
        {filteredJournals.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No journal entries found</p>
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
        <h2 className="text-2xl font-bold mb-6">
          {journal ? 'Edit Journal Entry' : 'New Journal Entry'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Give your entry a title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              className="input-field min-h-64 resize-y"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your thoughts here... The AI will analyze your mood and create a summary."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              className="input-field"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="work, personal, thoughts..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : journal ? 'Update Entry' : 'Create Entry'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex items-center gap-2"
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
      <button onClick={onBack} className="mb-4 text-purple-600 dark:text-purple-400 hover:underline">
        ← Back to journals
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{journal.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                {journal.mood}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {journal.aiSummary && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              AI Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{journal.aiSummary}</p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {journal.content}
          </p>
        </div>

        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {journal.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
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
  const [token, setToken] = useState(localStorage.getItem('token'));

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
