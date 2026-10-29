import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  define: {
    'process.env': {},
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://backend-beneficiarios-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://backend-beneficiarios-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'build', // Mantener compatibilidad con CRA
  },
});
