import {
  coverageConfigDefaults,
  defineConfig,
  mergeConfig,
} from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      cache: {
        dir: '../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: './test/setupTests',

      reporters: ['default'],
      coverage: {
        reporter: ['lcov', 'text'],
        include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: [
          '**/*.stories.{js,ts,tsx}',
          ...coverageConfigDefaults.exclude,
        ],
        reportsDirectory: '../../coverage/apps/pxweb2',
        provider: 'istanbul',
      },
    },
  }),
);
