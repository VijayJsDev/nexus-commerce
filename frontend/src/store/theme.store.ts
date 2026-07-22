/**
 * theme.store.ts — Zustand theme state store
 *
 * Manages the application theme (light / dark / system) with:
 *   - Persistence to localStorage (preference survives page reload)
 *   - System preference detection via prefers-color-scheme media query
 *   - Reactive updates when the OS theme changes (e.g., macOS auto dark mode)
 *   - DOM application: adds/removes .dark on <html> element
 *
 * Theme resolution logic:
 *   "light"  → always light
 *   "dark"   → always dark
 *   "system" → follows OS prefers-color-scheme (default for new users)
 *
 * Usage:
 *   const { theme, resolvedTheme, setTheme } = useThemeStore();
 *   setTheme('dark')  // user explicitly picks dark
 *   setTheme('system') // follow OS preference
 */

import { create } from 'zustand';
import { THEME_STORAGE_KEY, type Theme } from '@/config/constants';

// ─── Types ──────────────────────────────────────────────────────

interface ThemeStore {
  /** The user's explicit preference: "light" | "dark" | "system" */
  theme: Theme;

  /**
   * The theme that is actually applied to the DOM.
   * When theme is "system", resolvedTheme matches the OS preference.
   * Components that need to know the actual applied theme (e.g., for
   * rendering a sun/moon icon) should use resolvedTheme, not theme.
   */
  resolvedTheme: 'light' | 'dark';

  /** Update the theme preference (persists to localStorage + updates DOM) */
  setTheme: (theme: Theme) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Reads the OS color scheme preference */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'; // SSR guard
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Resolves a theme preference to a concrete "light" | "dark" value */
function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

/** Applies or removes the `.dark` class on <html> */
function applyThemeToDOM(resolvedTheme: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Store the resolved value as a data attribute for CSS/JS consumers
  root.setAttribute('data-theme', resolvedTheme);
}

/** Reads the persisted theme from localStorage (safely) */
function getPersistedTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored !== null && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable in some environments
  }
  return 'system'; // Default: respect OS preference
}

// ─── Store ───────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>((set) => {
  // Read persisted preference synchronously on store initialisation
  const initialTheme = getPersistedTheme();
  const initialResolved = resolveTheme(initialTheme);

  // Apply immediately (before first render) to prevent flash of wrong theme.
  // This runs synchronously during module evaluation, not in a useEffect.
  if (typeof window !== 'undefined') {
    applyThemeToDOM(initialResolved);

    // Listen for OS theme changes (e.g., macOS auto dark mode at sunset)
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // Only react to OS changes when the user has chosen "system"
        const currentTheme = getPersistedTheme();
        if (currentTheme === 'system') {
          const newResolved = e.matches ? 'dark' : 'light';
          applyThemeToDOM(newResolved);
          set({ resolvedTheme: newResolved });
        }
      });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme: Theme) => {
      // 1. Persist the user's preference
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // Silently fail if localStorage is unavailable
      }

      // 2. Resolve to a concrete light/dark value
      const resolved = resolveTheme(theme);

      // 3. Update the DOM
      applyThemeToDOM(resolved);

      // 4. Update Zustand state (triggers re-renders for consumers)
      set({ theme, resolvedTheme: resolved });
    },
  };
});
