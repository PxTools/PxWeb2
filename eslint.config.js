import { defineConfig } from 'eslint/config';
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/build/**',
      '**/packages/pxweb2-api-client/**',
      '**/storybook-static/**',
      '**/.cache/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',

      // React rules
      'react/function-component-definition': [
        'error',
        {
          namedComponents: ['function-declaration', 'arrow-function'],
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules
      curly: ['error', 'all'], // Enforce curly braces for all control statements
      'no-extra-semi': 'off', // Turned off in favor of @typescript-eslint/no-extra-semi
      'unused-imports/no-unused-imports': 'error',
    },
  },
  ...storybook.configs['flat/recommended'],
  //reactHooksPlugin.configs.flat.recommended,
]);
