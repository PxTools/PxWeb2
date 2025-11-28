import { Plugin, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { virtualModulePlugin } from './vite-plugin-virtual-module';

// Custom plugin to handle theme CSS injection
const themeInjectorPlugin = (): Plugin => ({
  name: 'theme-injector',
  transformIndexHtml(html) {
    // Remove the theme CSS link from the original HTML
    html = html.replace(
      '<link rel="stylesheet" href="./theme/variables.css?v=__BUILD_DATE__" />',
      '',
    );
    // Inject it at the end of head to ensure it loads last
    html = html.replace(
      '</head>',
      '<link rel="stylesheet" href="./theme/variables.css?v=__BUILD_DATE__" /></head>',
    );
    // Replace cache busting build date placeholder
    return html.replace(/__BUILD_DATE__/g, new Date().toISOString());
  },
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/pxweb2',
  base: './',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), themeInjectorPlugin(), virtualModulePlugin()],
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
  define: {
    // Used for cache busting of configuration files.
    // Since we don't update pkg.version on release yet, we use build date instead.
    //   import pkg from './package.json';
    //   __BUILD_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
