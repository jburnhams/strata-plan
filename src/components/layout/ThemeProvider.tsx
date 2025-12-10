import React, { createContext, useEffect, useState } from 'react';
import { Theme, useUIStore } from '../../stores/uiStore';

type ResolvedTheme = 'light' | 'dark';

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useUIStore();
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (e?: MediaQueryListEvent) => {
      // Use event matches if available, otherwise fall back to query property
      const matches = e ? e.matches : mediaQuery.matches;
      const systemTheme = matches ? 'dark' : 'light';
      const effectiveTheme = theme === 'system' ? systemTheme : theme;

      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      setResolvedTheme(effectiveTheme);
    };

    updateTheme();

    // Modern browsers use addEventListener
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateTheme);
    } else {
        // Fallback for older browsers / some test environments
        mediaQuery.addListener(updateTheme);
    }

    return () => {
        if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', updateTheme);
        } else {
            mediaQuery.removeListener(updateTheme);
        }
    };
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'system') {
        setTheme('light');
    } else if (theme === 'light') {
        setTheme('dark');
    } else {
        setTheme('system');
    }
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
