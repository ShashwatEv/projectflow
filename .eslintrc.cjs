/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/only-export-components',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'package-lock.json'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
    project: ['./tsconfig.app.json'],
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  rules: {
    'react/requires-interaction': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-useless-vars': 'off',
    'no-unused-vars': 'off',
  },
  settings: {
    react: { version: '18.3' },
  },
};
