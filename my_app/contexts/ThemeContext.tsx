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

// Monokai/Dracula inspired dark theme
const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: '#282a36',     // Dracula background
      secondary: '#44475a',   // Dracula current line
      tertiary: '#6272a4',    // Dracula comment
      elevated: '#343746',    // Darker elevated surfaces
    },
    text: {
      primary: '#f8f8f2',     // Dracula foreground
      secondary: '#f8f8f2e6', // Slightly transparent
      tertiary: '#6272a4',    // Dracula comment
      inverse: '#282a36',     // Dark text for light backgrounds
    },
    border: {
      primary: '#44475a',     // Dracula current line
      secondary: '#6272a4',   // Dracula comment
      focus: '#8be9fd',       // Dracula cyan
    },
    accent: {
      primary: '#8be9fd',     // Dracula cyan
      secondary: '#bd93f9',   // Dracula purple
      success: '#50fa7b',     // Dracula green
      warning: '#f1fa8c',     // Dracula yellow
      danger: '#ff5555',      // Dracula red
    },
    node: {
      background: '#44475a',
      border: '#6272a4',
      selected: '#8be9fd',
      hover: '#50fa7b',
    },
    canvas: {
      background: '#282a36',
      grid: '#44475a',
      edge: '#8be9fd',
      edgeSelected: '#ff5555',
    },
  },
};

// Clean light theme
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
      focus: '#3b82f6',
    },
    accent: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    node: {
      background: '#ffffff',
      border: '#e2e8f0',
      selected: '#3b82f6',
      hover: '#10b981',
    },
    canvas: {
      background: '#ffffff',
      grid: '#f1f5f9',
      edge: '#3b82f6',
      edgeSelected: '#ef4444',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (themeName: 'light' | 'dark') => void;
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
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('flowx-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('flowx-theme', currentTheme);
    
    // Update document class for global theming
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
  }, [currentTheme]);

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
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { darkTheme, lightTheme }; 