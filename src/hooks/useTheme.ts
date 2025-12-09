import { useEffect, useState } from 'react';
import { useUIStore, type Theme } from '@/stores/uiStore';

export function useTheme() {
  const { theme, setTheme } = useUIStore();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const check = () => {
      if (theme === 'system') {
        setResolvedTheme(
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        );
      } else {
        setResolvedTheme(theme);
      }
    };

    check();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, [theme]);

  const toggleTheme = () => {
    // Basic toggle logic: if dark -> light, else -> dark
    // This overrides system preference to explicit
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
