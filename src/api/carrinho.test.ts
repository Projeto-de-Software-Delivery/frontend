import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EVENTO_CARRINHO_MUDOU,
  adicionarAoCarrinho,
  alterarQuantidade,
  buscarCarrinho,
  removerDoCarrinho,
} from './carrinho';
import { resetarMock } from './mock';

// Produto id 3 (Batata Rústica, loja 1) tem estoque 30 nos dados iniciais do mock.
const CLIENTE_ID = 1;
const PRODUTO_ID = 3;

describe('carrinho (modo mock): monta o total e valida estoque como o backend', () => {
  beforeEach(() => {
    resetarMock();
  });

  afterEach(() => {
    resetarMock();
  });

  it('carrinho vazio tem total 0 e nenhum item', async () => {
    const carrinho = await buscarCarrinho(CLIENTE_ID);
    expect(carrinho).toEqual({ clienteId: CLIENTE_ID, itens: [], total: 0 });
  });

  it('adiciona um item e calcula subtotal/total corretamente', async () => {
    const carrinho = await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 2);

    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0]).toMatchObject({ produtoId: PRODUTO_ID, quantidade: 2, precoUnitario: 18, subtotal: 36 });
    expect(carrinho.total).toBe(36);
  });

  it('adicionar o mesmo produto de novo soma a quantidade (não duplica a linha)', async () => {
    await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 2);
    const carrinho = await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 3);

    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0].quantidade).toBe(5);
    expect(carrinho.total).toBe(90);
  });

  it('rejeita (422) quando a quantidade pedida passa do estoque', async () => {
    await expect(adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 999)).rejects.toMatchObject({ status: 422 });
  });

  it('alterarQuantidade troca o valor (não soma) e revalida o estoque', async () => {
    await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 2);
    const carrinhoAntes = await buscarCarrinho(CLIENTE_ID);
    const itemId = carrinhoAntes.itens[0].id;

    const carrinho = await alterarQuantidade(CLIENTE_ID, itemId, 10);
    expect(carrinho.itens[0].quantidade).toBe(10);
    expect(carrinho.total).toBe(180);
  });

  it('removerDoCarrinho tira o item e recalcula o total', async () => {
    await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 2);
    const carrinhoAntes = await buscarCarrinho(CLIENTE_ID);
    const itemId = carrinhoAntes.itens[0].id;

    const carrinho = await removerDoCarrinho(CLIENTE_ID, itemId);
    expect(carrinho.itens).toHaveLength(0);
    expect(carrinho.total).toBe(0);
  });

  it('dispara o evento de "carrinho mudou" quando o carrinho muda', async () => {
    const escutador = vi.fn();
    window.addEventListener(EVENTO_CARRINHO_MUDOU, escutador);

    await adicionarAoCarrinho(CLIENTE_ID, PRODUTO_ID, 1);

    expect(escutador).toHaveBeenCalledTimes(1);
    window.removeEventListener(EVENTO_CARRINHO_MUDOU, escutador);
  });
});
