// Config de teste separada do vite.config.ts (que fica só com a config de dev/build).
// Assim não tocamos no arquivo que já funciona para rodar/buildar a aplicação.
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Gate de cobertura só nos arquivos com testes de unidade/integração de verdade
      // (ver README > Testes). O resto do src/ (páginas, componentes de UI, api/mock.ts
      // e os módulos de api/* ainda sem teste dedicado) fica fora do gate por ora —
      // mesma lógica do serviço de notificações (threshold sobre um include/exclude
      // explícito, não sobre 100% da base).
      include: [
        'src/util.ts',
        'src/api/http.ts',
        'src/api/lojas.ts',
        'src/api/carrinho.ts',
        'src/auth/tokenProvider.ts',
        'src/auth/AuthGate.tsx',
      ],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 75,
        functions: 80,
      },
    },
  },
});
