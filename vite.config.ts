import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import neutralino from 'vite-plugin-neutralino'

export default defineConfig({
  root: 'resources',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
    },
  },
 optimizeDeps: {
  include: ['lucide-react', 'react-icons'],
},
  cacheDir: 'node_modules/.vite',
  plugins: [
    react(),
    neutralino({ rootPath: path.resolve(__dirname) })
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