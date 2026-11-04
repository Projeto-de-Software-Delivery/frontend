import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken, setAccessTokenGetter } from './tokenProvider';

describe('tokenProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setAccessTokenGetter(null);
    vi.restoreAllMocks();
  });

  it('devolve null quando nenhum getter foi registrado', async () => {
    expect(await getAccessToken()).toBeNull();
  });

  it('devolve o token do getter registrado', async () => {
    setAccessTokenGetter(() => Promise.resolve('meu-token'));
    expect(await getAccessToken()).toBe('meu-token');
  });

  it('devolve null quando o getter resolve undefined', async () => {
    setAccessTokenGetter(() => Promise.resolve(undefined));
    expect(await getAccessToken()).toBeNull();
  });

  it('devolve null e loga o erro quando o getter rejeita', async () => {
    setAccessTokenGetter(() => Promise.reject(new Error('sessão expirada')));
    expect(await getAccessToken()).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Erro ao obter token de acesso do Auth0:', expect.any(Error));
  });

  it('volta a devolver null depois de setAccessTokenGetter(null)', async () => {
    setAccessTokenGetter(() => Promise.resolve('token'));
    setAccessTokenGetter(null);
    expect(await getAccessToken()).toBeNull();
  });
});
