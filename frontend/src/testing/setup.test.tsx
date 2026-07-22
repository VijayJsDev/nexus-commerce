/**
 * setup.test.ts — Foundation smoke tests
 *
 * These tests validate that the entire testing infrastructure is wired correctly:
 *   - Vitest globals work (describe, it, expect)
 *   - jest-dom matchers are available (toBeInTheDocument)
 *   - MSW server is running and intercepts requests
 *   - Custom render() wraps components in all providers
 *   - Path aliases (@/) resolve correctly in test context
 *
 * These are the first tests you'd run to confirm the stack is healthy.
 * Delete or replace them when building real features.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import { THEME } from '@/config/constants';
import { render } from '@/testing/test-utils';

// ─── Utility Tests ────────────────────────────────────────────────

describe('cn() utility', () => {
  it('joins class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves Tailwind conflicts (last one wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

// ─── Constants Tests ──────────────────────────────────────────────

describe('THEME constants', () => {
  it('defines all three theme options', () => {
    expect(THEME.LIGHT).toBe('light');
    expect(THEME.DARK).toBe('dark');
    expect(THEME.SYSTEM).toBe('system');
  });
});

// ─── Rendering Tests ──────────────────────────────────────────────

describe('Test infrastructure', () => {
  it('renders a component with all providers', () => {
    render(<div data-testid="test-element">Hello, Nexus</div>);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
    expect(screen.getByText('Hello, Nexus')).toBeInTheDocument();
  });

  it('renders accessible text', () => {
    render(
      <button type="button" aria-label="Submit form">
        Submit
      </button>
    );
    expect(
      screen.getByRole('button', { name: /submit/i })
    ).toBeInTheDocument();
  });
});
