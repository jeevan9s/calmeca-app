import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          build: {
            target: "node16", // target Node version for Electron
            outDir: "dist-electron",
            rollupOptions: {
              external: [
                "electron",
                "fs",
                "os",
                "crypto",
                "buffer",
                "stream",
                "http",
                "https",
                "child_process",
                "util",
                "events",
                "net",
                "tls",
                "electron-acrylic-window",

                // Large external libs used in main process
                "googleapis",
                "openai",
                "pdf-lib",
                "docx",
                "dotenv",
                "mammoth",
                "win32-displayconfig",
              ],
            },
            commonjsOptions: {
              transformMixedEsModules: true,
            },
          },
          define: {
            __dirname: "undefined", // prevent Vite replacing __dirname so your runtime code works
            __filename: "undefined",
          },
        },
      },
      preload: {
        input: path.resolve(__dirname, "electron/preload.ts"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["electron"], // externalize electron in renderer build
    },
  },
});
