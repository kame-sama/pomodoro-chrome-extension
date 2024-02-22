import { resolve } from 'path';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import eslint from 'vite-plugin-eslint';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [crx({ manifest }), eslint()],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        settings: resolve(__dirname, 'pages/settings.html'),
      },
    },
  },
});
