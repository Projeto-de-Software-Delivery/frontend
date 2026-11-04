// Testa separadamente o trecho de http.ts que só roda fora do modo mock
// (anexar o token do Auth0 no header Authorization). USE_MOCK é lido de
// import.meta.env na hora em que o módulo é importado, então precisamos
// mudar a env e reimportar o módulo (vi.resetModules) para cada caso.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function respostaOk() {
  return { ok: true, status: 200, json: () => Promise.resolve({}) } as Response;
}

describe('http() fora do modo mock (VITE_USE_MOCK=false)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK', 'false');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respostaOk()));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.doUnmock('../auth/tokenProvider');
  });

  it('anexa Authorization: Bearer <token> quando há token disponível', async () => {
    vi.doMock('../auth/tokenProvider', () => ({ getAccessToken: () => Promise.resolve('token-123') }));

    const { http } = await import('./http');
    await http('GET', '/clientes/me');

    expect(fetch).toHaveBeenCalledWith(
      '/api/clientes/me',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } }),
    );
  });

  it('não anexa Authorization quando não há token (getAccessToken devolve null)', async () => {
    vi.doMock('../auth/tokenProvider', () => ({ getAccessToken: () => Promise.resolve(null) }));

    const { http } = await import('./http');
    await http('GET', '/clientes/me');

    expect(fetch).toHaveBeenCalledWith('/api/clientes/me', expect.objectContaining({ headers: {} }));
  });
});

describe('USE_MOCK (flag exportada)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('é true por padrão (sem VITE_USE_MOCK definido)', async () => {
    vi.resetModules();
    const { USE_MOCK } = await import('./http');
    expect(USE_MOCK).toBe(true);
  });

  it('é false quando VITE_USE_MOCK=false', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK', 'false');
    const { USE_MOCK } = await import('./http');
    expect(USE_MOCK).toBe(false);
  });
});
