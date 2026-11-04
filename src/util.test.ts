import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { dataHora, dinheiro, nomePorId, useAcao, useCarregar } from './util';

describe('dinheiro', () => {
  it('formata número como moeda brasileira', () => {
    expect(dinheiro(32.9)).toBe('R$ 32,90');
  });

  it('formata zero', () => {
    expect(dinheiro(0)).toBe('R$ 0,00');
  });
});

describe('dataHora', () => {
  it('formata uma data ISO no padrão dd/mm hh:mm', () => {
    const resultado = dataHora('2024-05-10T14:30:00.000Z');
    // Não fixamos o fuso (depende da máquina que roda o teste), só o formato.
    expect(resultado).toMatch(/^\d{2}\/\d{2}, \d{2}:\d{2}$/);
  });
});

describe('nomePorId', () => {
  const lista = [
    { id: 1, nome: 'Burger da Vila' },
    { id: 2, nome: 'Sushi Itaim' },
  ];

  it('acha o nome pelo id', () => {
    expect(nomePorId(lista, 1, 'Loja')).toBe('Burger da Vila');
  });

  it('usa o rótulo com o id quando não acha', () => {
    expect(nomePorId(lista, 99, 'Loja')).toBe('Loja 99');
  });

  it('usa o rótulo com o id quando a lista é null', () => {
    expect(nomePorId(null, 5, 'Entregador')).toBe('Entregador 5');
  });
});

describe('useCarregar', () => {
  it('busca os dados ao montar e devolve carregando=false no final', async () => {
    const buscar = vi.fn().mockResolvedValue(['a', 'b']);
    const { result } = renderHook(() => useCarregar(buscar, []));

    expect(result.current.carregando).toBe(true);

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.dados).toEqual(['a', 'b']);
    expect(result.current.erro).toBe('');
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('guarda a mensagem de erro quando a busca falha', async () => {
    const buscar = vi.fn().mockRejectedValue(new Error('Falha ao buscar'));
    const { result } = renderHook(() => useCarregar(buscar, []));

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.dados).toBeNull();
    expect(result.current.erro).toBe('Falha ao buscar');
  });

  it('usa mensagem genérica quando o erro não é um Error', async () => {
    const buscar = vi.fn().mockRejectedValue('string qualquer');
    const { result } = renderHook(() => useCarregar(buscar, []));

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(result.current.erro).toBe('Algo deu errado');
  });

  it('recarregar() busca de novo e pode atualizar os dados', async () => {
    const buscar = vi.fn().mockResolvedValueOnce(['primeiro']).mockResolvedValueOnce(['segundo']);
    const { result } = renderHook(() => useCarregar(buscar, []));

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual(['primeiro']);

    await act(async () => {
      await result.current.recarregar();
    });

    expect(result.current.dados).toEqual(['segundo']);
    expect(buscar).toHaveBeenCalledTimes(2);
  });
});

describe('useAcao', () => {
  it('devolve true e não guarda erro quando a ação dá certo', async () => {
    const { result } = renderHook(() => useAcao());

    let sucesso = false;
    await act(async () => {
      sucesso = await result.current.executar(() => Promise.resolve('ok'));
    });

    expect(sucesso).toBe(true);
    expect(result.current.erro).toBe('');
  });

  it('devolve false e guarda a mensagem quando a ação falha', async () => {
    const { result } = renderHook(() => useAcao());

    let sucesso = true;
    await act(async () => {
      sucesso = await result.current.executar(() => Promise.reject(new Error('não deu')));
    });

    expect(sucesso).toBe(false);
    expect(result.current.erro).toBe('não deu');
  });

  it('limpa o erro anterior numa nova execução que dá certo', async () => {
    const { result } = renderHook(() => useAcao());

    await act(async () => {
      await result.current.executar(() => Promise.reject(new Error('primeiro erro')));
    });
    expect(result.current.erro).toBe('primeiro erro');

    await act(async () => {
      await result.current.executar(() => Promise.resolve());
    });
    expect(result.current.erro).toBe('');
  });
});
