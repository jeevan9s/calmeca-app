import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            target: 'node16',
            outDir: 'dist-electron',
            rollupOptions: {
              external: [
                'electron',
                'json5',
                'fs',
                'os',
                'crypto',
                'buffer',
                'stream',
                'http',
                'https',
                'child_process',
                'util',
                'events',
                'net',
                'tls',
                'electron-acrylic-window',
                'googleapis',
                'openai',
                'pdf-lib',
                'docx',
                'dotenv',
                'mammoth',
                'win32-displayconfig',
              ],
            },
            commonjsOptions: {
              transformMixedEsModules: true,
            },
          },
          define: {
            // This helps with __dirname in ES modules
            __dirname: 'import.meta.dirname',
          },
        },
      },
      preload: {
        input: path.resolve(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            target: 'node16',
            outDir: 'dist-electron',
            rollupOptions: {
              output: {
                entryFileNames: 'preload.js',  // force output filename
              },
            },
          },
        },
      },  // <-- Close preload here
    }),  // <-- Close electron() plugin call here
  ],  // <-- Close plugins array here
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['electron'],
    },
  },
})