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
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://backend-beneficiarios-production.up.railway.app',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`[Vite Proxy] Reenviando petición ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            proxyRes.headers['x-proxied-to'] = options.target;
            console.log(`[Vite Proxy] Respuesta recibida de Railway para ${req.url}: HTTP ${proxyRes.statusCode}`);
          });
          proxy.on('error', (err, req) => {
            console.error(`[Vite Proxy Error] Error al conectar con Railway:`, err.message);
          });
        },
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
