/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Plugin } from 'vite';

// Custom plugin to handle theme CSS injection
const themeInjectorPlugin = (): Plugin => ({
  name: 'theme-injector',
  transformIndexHtml(html) {
    // Remove the theme CSS link from the original HTML
    html = html.replace('<link rel="stylesheet" href="/theme/variables.css" />', '');
    
    // Inject it at the end of head to ensure it loads last
    return html.replace('</head>', '<link rel="stylesheet" href="/theme/variables.css" /></head>');
  },
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/pxweb2',
  base: '/',
  server: {
    port: 4200,
    host: 'localhost',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    themeInjectorPlugin(),
  ],

  build: {
    outDir: './dist/',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  resolve: {
    alias: {
      $ui: path.resolve('../pxweb2-ui/'),
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/pxweb2',
      provider: 'v8',
    },
  },
});
