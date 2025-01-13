import { dirname } from 'path';
import { fileURLToPath } from 'url';
import baseConfig from '../../eslint.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  ...baseConfig,
  {
    files: [`${__dirname}/src/**/*.{ts,tsx,js,jsx}`],
    rules: {
      // Add any UI package specific rules here
    },
  },
]; 