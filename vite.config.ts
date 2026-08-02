import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  root: 'resources',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/app'),
    },
  },
  build: {
    outDir: 'js',
    emptyOutDir: false,
    assetsDir: '',
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'resources/js/main.tsx'),
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'main.css',
      },
    },
  },
});