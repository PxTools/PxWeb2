import { Plugin, defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';
import { virtualModulePlugin } from './vite-plugin-virtual-module';
import pkg from '../../package.json';

const buildNumber =
  process.env.BUILD_NUMBER ?? process.env.GITHUB_RUN_NUMBER ?? 'local';

// Custom plugin to handle theme CSS injection
const themeInjectorPlugin = (): Plugin => ({
  name: 'theme-injector',
  transformIndexHtml(html) {
    // Remove the theme CSS link from the original HTML
    html = html.replace(
      '<link rel="stylesheet" href="./theme/variables.css?v=__APP_VERSION__" />',
      '',
    );
    // Inject it at the end of head to ensure it loads last
    html = html.replace(
      '</head>',
      '<link rel="stylesheet" href="./theme/variables.css?v=__APP_VERSION__" /></head>',
    );
    // Replace cache busting build date placeholder
    return html.replace(/__APP_VERSION__/g, `${pkg.version}+${buildNumber}`);
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
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    themeInjectorPlugin(),
    virtualModulePlugin(),
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
  define: {
    // Used for cache busting of configuration files.
    __APP_VERSION__: JSON.stringify(`${pkg.version}+${buildNumber}`),
  },
});
