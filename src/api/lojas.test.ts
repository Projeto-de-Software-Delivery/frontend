import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './http';
import { resetarMock } from './mock';
import { atualizarLoja, buscarLoja, criarLoja, deletarLoja, listarLojas } from './lojas';

// Estes testes rodam no modo mock (padrão quando VITE_USE_MOCK não está definido),
// então exercitam a "lógica de banco de dados de mentira" de verdade (src/api/mock.ts).
describe('lojas (modo mock)', () => {
  beforeEach(() => {
    resetarMock();
  });

  afterEach(() => {
    resetarMock();
  });

  it('lista as lojas iniciais', async () => {
    const lojas = await listarLojas();
    expect(lojas.length).toBeGreaterThan(0);
    expect(lojas.some((l) => l.nome === 'Burger da Vila')).toBe(true);
  });

  it('busca uma loja existente pelo id', async () => {
    const loja = await buscarLoja(1);
    expect(loja).toMatchObject({ id: 1, nome: 'Burger da Vila' });
  });

  it('lança ApiError 404 ao buscar uma loja inexistente', async () => {
    await expect(buscarLoja(999)).rejects.toMatchObject(new ApiError(404, 'Loja não encontrado'));
  });

  it('rejeita criar loja com CNPJ fora do padrão (14 dígitos)', async () => {
    await expect(
      criarLoja({ nome: 'Loja X', cnpj: '123', endereco: 'Rua X' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('cria uma loja com CNPJ válido e ela passa a aparecer na listagem', async () => {
    const criada = await criarLoja({ nome: 'Loja Nova', cnpj: '12345678000199', endereco: 'Rua Nova, 1' });
    expect(criada.id).toBeGreaterThan(0);

    const lojas = await listarLojas();
    expect(lojas.some((l) => l.id === criada.id && l.nome === 'Loja Nova')).toBe(true);
  });

  it('atualiza os dados de uma loja existente', async () => {
    const atualizada = await atualizarLoja(1, { nome: 'Burger da Vila 2', cnpj: '12345678000190', endereco: 'Novo endereço' });
    expect(atualizada.nome).toBe('Burger da Vila 2');

    const buscada = await buscarLoja(1);
    expect(buscada.nome).toBe('Burger da Vila 2');
  });

  it('remove uma loja e ela some da listagem', async () => {
    await deletarLoja(1);
    await expect(buscarLoja(1)).rejects.toMatchObject({ status: 404 });
  });
});

// Agora testamos que, fora do modo mock, cada função chama http() com o
// método/caminho/corpo certos — sem depender de localStorage nem de um backend real.
describe('lojas (fora do modo mock: chama http() corretamente)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_USE_MOCK', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('./http');
  });

  it('listarLojas() -> GET /lojas', async () => {
    const httpMock = vi.fn().mockResolvedValue([]);
    vi.doMock('./http', () => ({ http: httpMock, USE_MOCK: false }));

    const { listarLojas: listarLojasReal } = await import('./lojas');
    await listarLojasReal();

    expect(httpMock).toHaveBeenCalledWith('GET', '/lojas');
  });

  it('buscarLoja(id) -> GET /lojas/{id}', async () => {
    const httpMock = vi.fn().mockResolvedValue({});
    vi.doMock('./http', () => ({ http: httpMock, USE_MOCK: false }));

    const { buscarLoja: buscarLojaReal } = await import('./lojas');
    await buscarLojaReal(7);

    expect(httpMock).toHaveBeenCalledWith('GET', '/lojas/7');
  });

  it('criarLoja(dados) -> POST /lojas com o corpo certo', async () => {
    const httpMock = vi.fn().mockResolvedValue({});
    vi.doMock('./http', () => ({ http: httpMock, USE_MOCK: false }));

    const dados = { nome: 'Loja X', cnpj: '12345678000199', endereco: 'Rua X' };
    const { criarLoja: criarLojaReal } = await import('./lojas');
    await criarLojaReal(dados);

    expect(httpMock).toHaveBeenCalledWith('POST', '/lojas', dados);
  });

  it('deletarLoja(id) -> DELETE /lojas/{id}', async () => {
    const httpMock = vi.fn().mockResolvedValue(undefined);
    vi.doMock('./http', () => ({ http: httpMock, USE_MOCK: false }));

    const { deletarLoja: deletarLojaReal } = await import('./lojas');
    await deletarLojaReal(3);

    expect(httpMock).toHaveBeenCalledWith('DELETE', '/lojas/3');
  });
});
