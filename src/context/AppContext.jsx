import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

const AppContext = createContext(null);

const STORAGE_KEYS = {
  THEME: 'dw-theme',
  FAVORITES: 'dw-favorites',
  HISTORY: 'dw-history',
  SIDEBAR_COLLAPSED: 'dw-sidebar-collapsed',
};

const MAX_HISTORY = 50;

export function AppProvider({ children }) {
  // Theme
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  });

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch {
      return [];
    }
  });

  // History
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY)) || [];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Command palette open state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const resolvedTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Persist sidebar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  // Persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  const setTheme = useCallback((t) => setThemeState(t), []);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);

  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(prev => !prev), []);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  const toggleFavorite = useCallback((toolId) => {
    setFavorites(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  }, []);

  const isFavorite = useCallback((toolId) => favorites.includes(toolId), [favorites]);

  const addHistory = useCallback((toolId) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.toolId !== toolId);
      const entry = { toolId, timestamp: Date.now() };
      return [entry, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = {
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    favorites,
    toggleFavorite,
    isFavorite,
    history,
    addHistory,
    toasts,
    showToast,
    dismissToast,
    commandPaletteOpen,
    setCommandPaletteOpen,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
