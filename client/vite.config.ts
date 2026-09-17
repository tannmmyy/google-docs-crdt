import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network addresses (LAN / separate computers)
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4444',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:4444',
        ws: true,
        changeOrigin: true
      }
    }
  }
});
