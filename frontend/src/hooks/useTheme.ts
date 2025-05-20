import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
const THEME_STORAGE_KEY = 'vite-ui-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        return storedTheme;
      }
    }
    return 'system';
  });

  const applyTheme = useCallback((selectedTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveFinalTheme: 'light' | 'dark';

    if (selectedTheme === 'system') {
      effectiveFinalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, 'system');
    } else {
      effectiveFinalTheme = selectedTheme;
      localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    }
    root.classList.add(effectiveFinalTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  return { theme, setTheme, effectiveTheme: getEffectiveTheme() };
}
