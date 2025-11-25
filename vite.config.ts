import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Use hardcoded API key for build
    const apiKey = env.VITE_POLZA_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        electron([
          {
            entry: 'electron/main.ts',
            onstart(options) {
              options.startup()
            },
            vite: {
              build: {
                outDir: 'dist-electron'
              }
            }
          },
          {
            entry: 'electron/preload.ts',
            onstart(options) {
              options.reload()
            },
            vite: {
              build: {
                outDir: 'dist-electron'
              }
            }
          }
        ]),
        renderer()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.POLZA_API_KEY': JSON.stringify(apiKey),
        'process.env.VITE_POLZA_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      publicDir: 'public',
      base: './',
      build: {
        outDir: 'dist'
      }
    };
});
