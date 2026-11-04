import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, http } from './http';

function respostaFalsa(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('http()', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('faz GET em /api + caminho e devolve o json da resposta', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({ id: 1, nome: 'Burger da Vila' }));

    const resultado = await http<{ id: number; nome: string }>('GET', '/lojas/1');

    expect(fetch).toHaveBeenCalledWith('/api/lojas/1', expect.objectContaining({ method: 'GET' }));
    expect(resultado).toEqual({ id: 1, nome: 'Burger da Vila' });
  });

  it('manda o corpo como JSON com Content-Type quando há corpo', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({ ok: true }));

    await http('POST', '/lojas', { nome: 'Nova loja' });

    expect(fetch).toHaveBeenCalledWith('/api/lojas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: 'Nova loja' }),
    });
  });

  it('não manda Content-Type quando não há corpo', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa(null));

    await http('DELETE', '/lojas/1');

    expect(fetch).toHaveBeenCalledWith('/api/lojas/1', { method: 'DELETE', headers: {}, body: undefined });
  });

  it('devolve undefined quando o status é 204', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa(null, { status: 204 }));

    const resultado = await http('DELETE', '/lojas/1');

    expect(resultado).toBeUndefined();
  });

  it('lança ApiError com a mensagem do backend (campo message)', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({ message: 'Loja não encontrada' }, { status: 404 }));

    await expect(http('GET', '/lojas/999')).rejects.toMatchObject(
      new ApiError(404, 'Loja não encontrada'),
    );
  });

  it('usa o campo detail (string) quando não há message, como no FastAPI', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({ detail: 'Entregador não encontrado' }, { status: 404 }));

    await expect(http('GET', '/entregadores/x')).rejects.toMatchObject({
      status: 404,
      message: 'Entregador não encontrado',
    });
  });

  it('usa o primeiro item de detail quando é uma lista (erro 422 do FastAPI)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      respostaFalsa({ detail: [{ msg: 'campo obrigatório' }, { msg: 'outro erro' }] }, { status: 422 }),
    );

    await expect(http('POST', '/entregadores', {})).rejects.toMatchObject({
      status: 422,
      message: 'campo obrigatório',
    });
  });

  it('usa mensagem padrão de erro 400 quando o Spring não manda message', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({}, { status: 400 }));

    await expect(http('POST', '/lojas', {})).rejects.toMatchObject({
      status: 400,
      message: 'Dados inválidos, confira os campos (erro 400)',
    });
  });

  it('usa "Erro {status}" como padrão para outros status sem mensagem', async () => {
    vi.mocked(fetch).mockResolvedValue(respostaFalsa({}, { status: 500 }));

    await expect(http('GET', '/lojas')).rejects.toMatchObject({ status: 500, message: 'Erro 500' });
  });

  it('não quebra quando o corpo de erro não é JSON válido', async () => {
    const resposta = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('não é json')),
    } as unknown as Response;
    vi.mocked(fetch).mockResolvedValue(resposta);

    await expect(http('GET', '/lojas')).rejects.toMatchObject({ status: 500, message: 'Erro 500' });
  });
});
