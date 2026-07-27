/**
 * ThemeToggle.tsx — Animated dark / light / system theme toggle
 *
 * Design:
 *   - Pill-shaped toggle with Sun / Moon icons from lucide-react
 *   - Clicking cycles through: light → dark → system → light …
 *   - Active indicator slides between icons with a spring easing transition
 *   - All colours use Tailwind semantic tokens so the component
 *     automatically re-themes itself as it switches modes
 *
 * Usage:
 *   import { ThemeToggle } from '@/components/ui/ThemeToggle';
 *   <ThemeToggle />                   // default
 *   <ThemeToggle className="ml-4" />  // with extra classes
 */

import { Monitor, Moon, Sun } from 'lucide-react';
import type { Theme } from '@/config/constants';
import { useTheme } from '@/hooks/useTheme';

// ─── Types ───────────────────────────────────────────────────────

interface ThemeToggleProps {
  /** Extra Tailwind / CSS classes forwarded to the outer wrapper */
  className?: string;
}

// ─── Theme cycle order ───────────────────────────────────────────

const THEME_CYCLE: Theme[] = ['light', 'dark', 'system'] as const;

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

// ─── Component ───────────────────────────────────────────────────

export function ThemeToggle({ className = '' }: ThemeToggleProps): React.JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* ── Pill toggle ────────────────────────────────────────── */}
      <div
        role="group"
        aria-label="Theme selector"
        className="
          relative flex items-center gap-0.5
          rounded-full border border-border
          bg-card p-1 shadow-card
          transition-all duration-200
        "
      >
        {THEME_CYCLE.map((t) => {
          const isActive = theme === t;

          return (
            <button
              key={t}
              id={`theme-toggle-${t}`}
              type="button"
              aria-label={`Switch to ${THEME_LABELS[t]} mode`}
              aria-pressed={isActive}
              onClick={() => setTheme(t)}
              className={`
                relative z-10 flex items-center justify-center
                h-8 w-8 rounded-full
                transition-all duration-300
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-ring focus-visible:ring-offset-1
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
            >
              {t === 'light' && (
                <Sun
                  size={15}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform duration-300 ${isActive ? 'rotate-0 scale-110' : ''}`}
                />
              )}
              {t === 'dark' && (
                <Moon
                  size={14}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform duration-300 ${isActive ? '-rotate-12 scale-110' : ''}`}
                />
              )}
              {t === 'system' && (
                <Monitor
                  size={14}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Current theme label ─────────────────────────────────── */}
      <span
        aria-live="polite"
        className="text-xs font-medium text-muted-foreground tracking-wide select-none"
      >
        {THEME_LABELS[theme]}
      </span>
    </div>
  );
}
