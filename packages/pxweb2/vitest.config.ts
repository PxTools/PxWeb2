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
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: './test/setupTests',

      reporters: ['default'],
      testTimeout: 20000,
      hookTimeout: 20000,
      coverage: {
        reporter: ['lcov', 'text'],
        include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: [
          '**/pxweb2-api-client/**',
          '**/pxweb2-ui/**',
          '**/*.stories.{js,ts,tsx}',
          ...coverageConfigDefaults.exclude,
        ],
        reportsDirectory: '../../coverage/apps/pxweb2',
        provider: 'istanbul',
      },
    },
    cacheDir: '../../node_modules/.vitest',
  }),
);
