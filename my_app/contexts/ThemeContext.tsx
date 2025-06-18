"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // Border colors
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
    // Accent colors
    accent: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      danger: string;
    };
    // Node colors (for funnel steps)
    node: {
      background: string;
      border: string;
      selected: string;
      hover: string;
    };
    // Canvas colors
    canvas: {
      background: string;
      grid: string;
      edge: string;
      edgeSelected: string;
    };
  };
}

// Enhanced dark theme based on UX Color Guide with softer accent colors
const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: '#1A202C',     // Background Principal
      secondary: '#141924',   // Background Sidebar (mais escuro)
      tertiary: '#2D3748',    // Background Canvas
      elevated: '#232A3A',    // Background Cards/Modals
    },
    text: {
      primary: '#F5F7FA',     // Texto Principal (Branco Suave)
      secondary: '#A0AEC0',   // Texto Secundário (Cinza Claro)
      tertiary: '#718096',    // Texto Terciário (Cinza Médio)
      inverse: '#1A202C',     // Texto escuro para fundos claros
    },
    border: {
      primary: '#2D3748',     // Bordas sutis
      secondary: '#4A5568',   // Bordas mais evidentes
      focus: '#FE5F55',       // Coral suave para focus
    },
    accent: {
      primary: '#FE5F55',     // Coral Principal (mais suave)
      secondary: '#E94A40',   // Coral Hover (mais escuro)
      success: '#6EEB83',     // Verde Suave (da paleta)
      warning: '#FFAE03',     // Laranja (da paleta)
      danger: '#D73120',      // Vermelho original só para perigo
    },
    node: {
      background: '#232A3A',  // Cards/Modals background
      border: '#2D3748',      // Bordas sutis
      selected: '#FE5F55',    // Coral suave
      hover: '#E94A40',       // Coral hover
    },
    canvas: {
      background: '#2D3748',  // Background Canvas
      grid: '#4A5568',        // Grid mais sutil
      edge: '#6EEB83',        // Verde suave para conexões normais
      edgeSelected: '#D73120', // Vermelho original só para delete
    },
  },
};

// Clean light theme with softer accent colors
const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      elevated: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      inverse: '#ffffff',
    },
    border: {
      primary: '#e2e8f0',
      secondary: '#cbd5e1',
      focus: '#FE5F55',       // Coral suave para focus
    },
    accent: {
      primary: '#FE5F55',     // Coral Principal (mais suave)
      secondary: '#E94A40',   // Coral Hover
      success: '#6EEB83',     // Verde Suave (da paleta)
      warning: '#FFAE03',     // Laranja (da paleta)
      danger: '#D73120',      // Vermelho original só para perigo
    },
    node: {
      background: '#ffffff',
      border: '#e2e8f0',
      selected: '#FE5F55',    // Coral suave
      hover: '#E94A40',       // Coral hover
    },
    canvas: {
      background: '#ffffff',
      grid: '#f1f5f9',
      edge: '#4ade80',        // Verde mais suave para modo claro
      edgeSelected: '#D73120', // Vermelho original só para delete
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Start with light theme to match server-side rendering
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme from localStorage only after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
      
      try {
        // Only access localStorage and window after component mounts (client-side)
        const savedTheme = localStorage.getItem('flowx-theme') as 'light' | 'dark' | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setCurrentTheme(savedTheme);
        } else {
          // Check system preference only on client
          if (typeof window !== 'undefined' && window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setCurrentTheme(prefersDark ? 'dark' : 'light');
          }
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
        // Fallback to light theme
        setCurrentTheme('light');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Save theme to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      localStorage.setItem('flowx-theme', currentTheme);
      
      // Update document class for global theming
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(currentTheme);
      }
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [currentTheme, isHydrated]);

  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (themeName: 'light' | 'dark') => {
    setCurrentTheme(themeName);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    isHydrated,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { darkTheme, lightTheme }; 