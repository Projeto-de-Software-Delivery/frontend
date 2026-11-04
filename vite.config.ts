import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Quando sair do mock: tudo que começa com /api vai para o API Gateway.
    proxy: {
      '/api': {
        target: 'http://18.204.243.227:8080',
        changeOrigin: true,
        rewrite: (caminho) => caminho.replace(/^\/api/, ''),
      },
    },
  },
});
