// Carregado antes de cada arquivo de teste (ver vitest.config.ts -> test.setupFiles).
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Evita que um componente renderizado num teste "vaze" para o próximo.
afterEach(() => {
  cleanup();
});
