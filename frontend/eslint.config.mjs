// ESLint v9 "Flat Config" format — matches the backend's eslint.config.mjs pattern.
//
// Rules are layered in order (later configs override earlier ones):
//   1. @eslint/js recommended          — universal JS best practices
//   2. typescript-eslint strict        — TS-specific anti-patterns
//   3. eslint-plugin-react             — React 19 JSX rules
//   4. eslint-plugin-react-hooks       — enforces Rules of Hooks
//   5. eslint-plugin-react-refresh     — Vite HMR safety
//   6. eslint-config-prettier (last)   — disables all formatting rules Prettier owns

import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ─── Files to ignore ──────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',      // Plain JS config files (non-TS)
    ],
  },

  // ─── Layer 1: JavaScript recommended rules ────────────────────
  js.configs.recommended,

  // ─── Layer 2: TypeScript strict rules ────────────────────────
  // "strict" goes beyond "recommended" — it enables rules like:
  //   - @typescript-eslint/no-explicit-any
  //   - @typescript-eslint/no-unsafe-assignment
  //   - @typescript-eslint/consistent-type-imports (enforces `import type`)
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // ─── Layer 3: React rules ─────────────────────────────────────
  {
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        // "detect" reads the React version from package.json automatically.
        // Avoids hardcoding the version in this config.
        version: 'detect',
      },
    },
    rules: {
      // React 19 uses the new JSX transform — no `import React` needed.
      // This rule would false-positive without this setting.
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // TypeScript handles prop validation

      // Prefer self-closing tags for components with no children
      'react/self-closing-comp': 'warn',

      // Exhaustive deps for useEffect etc — catches stale closure bugs
      'react/jsx-no-target-blank': 'error',
    },
  },

  // ─── Layer 4: React Hooks rules ───────────────────────────────
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // "rules-of-hooks" prevents calling hooks inside conditionals/loops.
      // "exhaustive-deps" warns about missing useEffect/useCallback dependencies.
      // Both are CRITICAL for correct React behaviour — hence "error" not "warn".
      ...reactHooks.configs.recommended.rules,
    },
  },

  // ─── Layer 5: React Refresh (Vite HMR safety) ────────────────
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // Warns if a file exports something that can't be hot-reloaded
      // (e.g., exporting both a component and a plain constant from the same file)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // ─── TypeScript-specific overrides ────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Enforce `import type` for type-only imports — better tree-shaking
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      // Allow unused vars prefixed with _ (common convention for intentional ignores)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Allow empty functions in certain patterns (e.g., noop callbacks)
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },

  // ─── Test file overrides ──────────────────────────────────────
  {
    files: ['src/testing/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      // Test files legitimately use `any` for mock typing
      '@typescript-eslint/no-explicit-any': 'off',
      // Test files use non-null assertions freely (e.g., screen.getByRole(...)!)
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // ─── Layer 6: Prettier (MUST be last) ────────────────────────
  // Disables all ESLint rules that would conflict with Prettier formatting.
  // Prettier owns: spacing, semicolons, quotes, trailing commas, etc.
  // ESLint owns: logical correctness, best practices.
  prettierConfig,
);
