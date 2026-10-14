import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// Reglas recomendadas de ESLint + React + hooks + jsx-a11y.
// Criterio de adopción: lo que hoy pasa limpio va en "error" (no se puede retroceder); lo que
// hoy falla va en "warn" dentro del bloque "deuda" de abajo, con la cantidad medida al
// introducir el lint, para ir saldándolo sin un refactor masivo.
const recommended = {
  ...js.configs.recommended.rules,
  ...react.configs.flat.recommended.rules,
  ...react.configs.flat['jsx-runtime'].rules,
  ...jsxA11y.flatConfigs.recommended.rules,
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',
};

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
    rules: {
      ...recommended,
      // Este proyecto no usa PropTypes (JS sin tipos): la regla pediría declararlos en todos
      // los componentes sin aportar nada.
      'react/prop-types': 'off',
    },
  },
  {
    // DEUDA: reglas que fallaban al introducir el lint (cantidades medidas ese día). Están en
    // "warn" para no frenar el CI ni forzar un refactor masivo; al corregir cada caso, subir la
    // regla a "error" para que no vuelva. Ver docs/LINT.md.
    files: ['**/*.{js,jsx}'],
    rules: {
      'jsx-a11y/click-events-have-key-events': 'warn', // 15 en 11 archivos
      'jsx-a11y/no-static-element-interactions': 'warn', // 12 en 10 archivos
      'react/no-unescaped-entities': 'warn', // 10 en 4 archivos
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // 5 en 5 archivos
      'jsx-a11y/no-noninteractive-element-interactions': 'warn', // 3 en 2 archivos
      'jsx-a11y/no-autofocus': 'warn', // 2 en 2 archivos
      'react-hooks/exhaustive-deps': 'warn', // 2 en 2 archivos
      'react/no-unknown-property': 'warn', // 1 en 1 archivo
    },
  },
  {
    // Archivos de configuración y herramientas: corren en Node, no en el navegador.
    files: ['*.config.js', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Tests: Vitest con globals: true y jsdom.
    files: ['**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
];
