import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.VITE_POLZA_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: true,
      },
      plugins: [react()],
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
        outDir: 'dist',
        emptyOutDir: true,
      },
      clearScreen: false,
      envPrefix: ['VITE_', 'TAURI_'],
    };
});
