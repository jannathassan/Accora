/**
 * ThemeProvider — manages Light / Dark / High-Contrast appearance modes.
 *
 * Applies a `data-theme` attribute to <html> so CSS custom-property overrides
 * kick in.  Persists the user's choice to localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const STORAGE_KEY = 'accora-theme';
const DEFAULT_THEME: ThemeMode = 'light';

const Ctx = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'high-contrast') return stored;
  } catch { /* SSR or blocked storage */ }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  const applyTheme = useCallback((t: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    applyTheme(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  }, [applyTheme]);

  // Apply on mount
  useEffect(() => { applyTheme(theme); }, [theme, applyTheme]);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
