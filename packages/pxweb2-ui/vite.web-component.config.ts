/**
 * Build configuration for the PxWeb line chart web component bundle.
 * Uses Vite in library mode to compile src/web-component.ts into a production
 * ES module output in dist/web-component, with React support and browser-safe
 * process.env.NODE_ENV handling for runtime compatibility.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/pxweb2-ui-web-component',
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: './dist/web-component/',
    emptyOutDir: false,
    reportCompressedSize: true,
    lib: {
      entry: 'src/web-component.ts',
      name: 'PxwebLineChartElement',
      fileName: 'pxweb-line-chart.wc',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: {
        intro:
          'var process = globalThis.process ?? { env: { NODE_ENV: "production" } };',
      },
    },
  },
});
