import stylistic from '@stylistic/eslint-plugin';
import reactLint from 'eslint-plugin-react';
import tsLint from 'typescript-eslint';
import jsLint from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['**/*.{ts,tsx}'],
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
    quoteProps: 'as-needed',
    arrowParens: 'as-needed',
    braceStyle: '1tbs',
  }),
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  reactLint.configs.flat['jsx-runtime'],
  {
    ignores: ['node_modules/', '.vite/'],
  },
  {
    rules: {
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
];
