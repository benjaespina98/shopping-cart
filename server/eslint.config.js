import js from '@eslint/js';
import globals from 'globals';

// Reglas recomendadas de ESLint para el backend (Node, ESM).
// Criterio de adopción: lo que hoy pasa limpio va en "error"; lo que falla hoy va en "warn"
// dentro del bloque "deuda", con la cantidad medida al introducir el lint.
export default [
  { ignores: ['node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
  },
  {
    // DEUDA: falla hoy 1 caso (medido al introducir el lint). En "warn" hasta corregirlo; luego
    // subir a "error". Ver docs/LINT.md.
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // 1 en 1 archivo
    },
  },
  {
    // Tests: Vitest importa sus funciones explícitamente en este proyecto.
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
