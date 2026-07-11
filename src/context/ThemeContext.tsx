import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 1. Define Types
type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange';
type FontSize = 'compact' | 'default' | 'large';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduce: boolean) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  accentColor: 'indigo',
  setAccentColor: () => null,
  fontSize: 'default',
  setFontSize: () => null,
  reducedMotion: false,
  setReducedMotion: () => null,
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  
  // Initialize States from localStorage
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('vite-ui-theme') as Theme) || 'system'
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (localStorage.getItem('vite-ui-accent') as AccentColor) || 'indigo'
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem('vite-ui-font') as FontSize) || 'default'
  );
  const [reducedMotion, setReducedMotionState] = useState<boolean>(
    () => localStorage.getItem('vite-ui-motion') === 'true'
  );

  // 1. Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // 2. Apply Accent Color
  useEffect(() => {
    window.document.documentElement.style.setProperty('--theme-primary', colorMap[accentColor]);
  }, [accentColor]);

  // 3. Apply Font Size (Scales Tailwind's 'rem' globally)
  useEffect(() => {
    const root = window.document.documentElement;
    if (fontSize === 'compact') root.style.fontSize = '14px';
    else if (fontSize === 'large') root.style.fontSize = '18px';
    else root.style.fontSize = '16px'; // Default
  }, [fontSize]);

  // 4. Apply Reduced Motion
  useEffect(() => {
    const root = window.document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  // Value provider with localStorage saving
  const value = {
    theme,
    setTheme: (val: Theme) => { localStorage.setItem('vite-ui-theme', val); setThemeState(val); },
    accentColor,
    setAccentColor: (val: AccentColor) => { localStorage.setItem('vite-ui-accent', val); setAccentColorState(val); },
    fontSize,
    setFontSize: (val: FontSize) => { localStorage.setItem('vite-ui-font', val); setFontSizeState(val); },
    reducedMotion,
    setReducedMotion: (val: boolean) => { localStorage.setItem('vite-ui-motion', String(val)); setReducedMotionState(val); },
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};