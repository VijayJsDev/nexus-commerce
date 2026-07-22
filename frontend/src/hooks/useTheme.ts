/**
 * useTheme.ts — Convenience hook for accessing theme state
 *
 * Wraps the raw Zustand store with a clean, stable API.
 * Components import from here instead of directly from the store,
 * which means if the store implementation changes, only this file changes.
 *
 * Usage:
 *   const { theme, resolvedTheme, setTheme, isDark, toggle } = useTheme();
 *
 *   // Show different icon based on current applied theme:
 *   {isDark ? <MoonIcon /> : <SunIcon />}
 *
 *   // Toggle between light and dark:
 *   <button onClick={toggle}>Toggle theme</button>
 *
 *   // Set to a specific value:
 *   <button onClick={() => setTheme('system')}>Use system</button>
 */

import { useThemeStore } from '@/store/theme.store';
import type { Theme } from '@/config/constants';

export interface UseThemeReturn {
  /** User's explicit preference: "light" | "dark" | "system" */
  theme: Theme;

  /** What is actually applied to the DOM ("light" or "dark") */
  resolvedTheme: 'light' | 'dark';

  /** Shorthand — true when dark mode is currently active */
  isDark: boolean;

  /** Update the theme preference */
  setTheme: (theme: Theme) => void;

  /** Toggles between "light" and "dark" (skips "system") */
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const toggle = (): void => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggle,
  };
}
