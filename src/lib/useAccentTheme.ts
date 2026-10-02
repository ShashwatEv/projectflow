import { useState, useEffect } from 'react';

export type AccentColor = 'indigo' | 'rose' | 'orange' | 'emerald' | 'blue' | 'purple';

export interface AccentThemeClasses {
  accent: AccentColor;
  setAccent: (color: AccentColor) => void;
  // Button styles
  btnPrimary: string;
  // Text styles
  textAccent: string;
  textHover: string;
  // Backgrounds & borders
  bgSubtle: string;
  borderAccent: string;
  ringAccent: string;
  // Toggle switch active background
  toggleActive: string;
  // Progress bar background
  progressBar: string;
}

const ACCENT_CLASS_MAP: Record<AccentColor, Omit<AccentThemeClasses, 'accent' | 'setAccent'>> = {
  indigo: {
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    textAccent: 'text-indigo-500 dark:text-indigo-400',
    textHover: 'hover:text-indigo-600 dark:hover:text-indigo-400',
    bgSubtle: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderAccent: 'border-indigo-500',
    ringAccent: 'focus:ring-indigo-500 focus:border-indigo-500',
    toggleActive: 'bg-indigo-600',
    progressBar: 'bg-indigo-500',
  },
  rose: {
    btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white',
    textAccent: 'text-rose-500 dark:text-rose-400',
    textHover: 'hover:text-rose-600 dark:hover:text-rose-400',
    bgSubtle: 'bg-rose-50 dark:bg-rose-950/30',
    borderAccent: 'border-rose-500',
    ringAccent: 'focus:ring-rose-500 focus:border-rose-500',
    toggleActive: 'bg-rose-600',
    progressBar: 'bg-rose-500',
  },
  orange: {
    btnPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
    textAccent: 'text-orange-500 dark:text-orange-400',
    textHover: 'hover:text-orange-600 dark:hover:text-orange-400',
    bgSubtle: 'bg-orange-50 dark:bg-orange-950/30',
    borderAccent: 'border-orange-500',
    ringAccent: 'focus:ring-orange-500 focus:border-orange-500',
    toggleActive: 'bg-orange-600',
    progressBar: 'bg-orange-500',
  },
  emerald: {
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    textAccent: 'text-emerald-500 dark:text-emerald-400',
    textHover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    bgSubtle: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderAccent: 'border-emerald-500',
    ringAccent: 'focus:ring-emerald-500 focus:border-emerald-500',
    toggleActive: 'bg-emerald-600',
    progressBar: 'bg-emerald-500',
  },
  blue: {
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    textAccent: 'text-blue-500 dark:text-blue-400',
    textHover: 'hover:text-blue-600 dark:hover:text-blue-400',
    bgSubtle: 'bg-blue-50 dark:bg-blue-950/30',
    borderAccent: 'border-blue-500',
    ringAccent: 'focus:ring-blue-500 focus:border-blue-500',
    toggleActive: 'bg-blue-600',
    progressBar: 'bg-blue-500',
  },
  purple: {
    btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
    textAccent: 'text-purple-500 dark:text-purple-400',
    textHover: 'hover:text-purple-600 dark:hover:text-purple-400',
    bgSubtle: 'bg-purple-50 dark:bg-purple-950/30',
    borderAccent: 'border-purple-500',
    ringAccent: 'focus:ring-purple-500 focus:border-purple-500',
    toggleActive: 'bg-purple-600',
    progressBar: 'bg-purple-500',
  },
};

export function useAccentTheme(): AccentThemeClasses {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('pf_accent_theme') as AccentColor) || 'indigo';
  });

  useEffect(() => {
    const handleStorage = () => {
      const current = (localStorage.getItem('pf_accent_theme') as AccentColor) || 'indigo';
      setAccentState(current);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setAccent = (color: AccentColor) => {
    localStorage.setItem('pf_accent_theme', color);
    setAccentState(color);
    window.dispatchEvent(new Event('storage'));
  };

  return {
    accent,
    setAccent,
    ...ACCENT_CLASS_MAP[accent] || ACCENT_CLASS_MAP.indigo,
  };
}