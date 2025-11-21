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
      testTimeout: 20000,
      hookTimeout: 20000,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

  setupFiles: './src/lib/util/setupTests.ts',

      reporters: ['default'],
      coverage: {
        reporter: ['lcov', 'text'],
        include: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: [
          '**/*.stories.{js,ts,tsx}',
          ...coverageConfigDefaults.exclude,
        ],
        reportsDirectory: '../../coverage/libs/pxweb2-ui',
        provider: 'istanbul',
      },
    },
  }),
);
