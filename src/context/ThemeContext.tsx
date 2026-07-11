import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 1. Define Types
type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultAccent?: AccentColor;
  storageKeyTheme?: string;
  storageKeyAccent?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  accentColor: 'indigo',
  setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Hex values for our accent colors
const colorMap: Record<AccentColor, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  blue: '#3b82f6',
  purple: '#9333ea',
  rose: '#f43f5e',
  orange: '#f97316',
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultAccent = 'indigo',
  storageKeyTheme = 'vite-ui-theme',
  storageKeyAccent = 'vite-ui-accent-color',
  ...props
}: ThemeProviderProps) {
  
  // Initialize Theme from localStorage
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKeyTheme) as Theme) || defaultTheme
  );

  // Initialize Accent Color from localStorage
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (localStorage.getItem(storageKeyAccent) as AccentColor) || defaultAccent
  );

  // Handle Theme Application
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Handle Accent Color Injection
  useEffect(() => {
    const root = window.document.documentElement;
    // Inject the selected color into the CSS variable we defined in Step 1
    root.style.setProperty('--theme-primary', colorMap[accentColor]);
  }, [accentColor]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKeyTheme, newTheme);
      setThemeState(newTheme);
    },
    accentColor,
    setAccentColor: (newColor: AccentColor) => {
      localStorage.setItem(storageKeyAccent, newColor);
      setAccentColorState(newColor);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};