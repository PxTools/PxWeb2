import { dirname } from 'path';
import { fileURLToPath } from 'url';
import baseConfig from '../../eslint.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...baseConfig,
  {
    files: [`${__dirname}/src/**/*.{ts,tsx,js,jsx}`],
    rules: {
      // Add any app specific rules here
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-undef': 'off' // TypeScript handles this
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
      jest: true
    },
    globals: {
      React: 'readonly',
      JSX: 'readonly',
      describe: 'readonly',
      it: 'readonly',
      expect: 'readonly',
      HTMLElement: 'readonly',
      HTMLDivElement: 'readonly'
    }
  },
]; 