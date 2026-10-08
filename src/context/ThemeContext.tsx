import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange';
export type TypographySize = 'compact' | 'default' | 'large';
export type ChatWallpaper = 'whatsapp' | 'telegram' | 'subtle-grid' | 'dots' | 'gradient' | 'minimal' | 'cyberpunk';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  typographySize: TypographySize;
  setTypographySize: (size: TypographySize) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  chatWallpaper: ChatWallpaper;
  setChatWallpaper: (wallpaper: ChatWallpaper) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Theme Mode (Light / Dark / System)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('pf_theme_mode') as ThemeMode) || 'dark';
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  // 2. Accent Color
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    return (localStorage.getItem('pf_accent_color') as AccentColor) || 'indigo';
  });

  // 3. Typography Size
  const [typographySize, setTypographySizeState] = useState<TypographySize>(() => {
    return (localStorage.getItem('pf_typography_size') as TypographySize) || 'default';
  });

  // 4. Accessibility / Reduce Motion
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    return localStorage.getItem('pf_reduce_motion') === 'true';
  });

  // 5. Chat Wallpaper (WhatsApp, Telegram, Subtle Grid, Dots, Gradient, Minimal, Cyberpunk)
  const [chatWallpaper, setChatWallpaperState] = useState<ChatWallpaper>(() => {
    return (localStorage.getItem('pf_chat_wallpaper') as ChatWallpaper) || 'whatsapp';
  });

  // --- Handlers & Synchronization Effects ---

  // Handle Theme Mode (Light / Dark / System)
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let resolved: 'light' | 'dark' = 'dark';
      if (themeMode === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = themeMode;
      }

      setThemeState(resolved);
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const listener = () => {
      if (themeMode === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeMode]);

  // Handle Accent Color (updates data-accent attribute)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);
    localStorage.setItem('pf_accent_color', accentColor);
  }, [accentColor]);

  // Handle Typography Scale (updates data-size attribute)
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-size', typographySize);
    localStorage.setItem('pf_typography_size', typographySize);
  }, [typographySize]);

  // Handle Accessibility (adds / removes .reduce-motion class)
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('pf_reduce_motion', String(reduceMotion));
  }, [reduceMotion]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('pf_theme_mode', mode);
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeMode(t);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const setTypographySize = (size: TypographySize) => {
    setTypographySizeState(size);
  };

  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce);
  };

  const setChatWallpaper = (wallpaper: ChatWallpaper) => {
    setChatWallpaperState(wallpaper);
    localStorage.setItem('pf_chat_wallpaper', wallpaper);
    window.dispatchEvent(new CustomEvent('chat-wallpaper-changed', { detail: wallpaper }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        setTheme,
        accentColor,
        setAccentColor,
        typographySize,
        setTypographySize,
        reduceMotion,
        setReduceMotion,
        chatWallpaper,
        setChatWallpaper,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}