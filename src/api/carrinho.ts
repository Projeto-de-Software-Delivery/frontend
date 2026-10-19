// Rotas do carrinho (serviço pedidos-lojas)
//   /clientes/{clienteId}/carrinho

import type { Carrinho } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, erro, novoId, simular, type Banco } from './mock';

/** Monta a resposta igual ao CarrinhoResponse do backend. */
function montarCarrinho(banco: Banco, clienteId: number): Carrinho {
  const itens = banco.carrinho
    .filter((item) => item.clienteId === clienteId)
    .map((item) => ({
      id: item.id,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.precoUnitario * item.quantidade,
    }));
  const total = itens.reduce((soma, item) => soma + item.subtotal, 0);
  return { clienteId, itens, total };
}

// GET /clientes/{clienteId}/carrinho
export function buscarCarrinho(clienteId: number): Promise<Carrinho> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.clientes, clienteId, 'Cliente');
      return montarCarrinho(banco, clienteId);
    });
  }
  return http('GET', `/clientes/${clienteId}/carrinho`);
}

// POST /clientes/{clienteId}/carrinho/itens
// Se o produto já está no carrinho, soma a quantidade (igual ao backend).
export function adicionarAoCarrinho(clienteId: number, produtoId: number, quantidade: number): Promise<Carrinho> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.clientes, clienteId, 'Cliente');
      const produto = acharOu404(banco.produtos, produtoId, 'Produto');
      const existente = banco.carrinho.find((i) => i.clienteId === clienteId && i.produtoId === produtoId);
      if (existente) {
        existente.quantidade += quantidade;
        existente.precoUnitario = produto.preco;
      } else {
        banco.carrinho.push({ id: novoId(banco), clienteId, produtoId, quantidade, precoUnitario: produto.preco });
      }
      return montarCarrinho(banco, clienteId);
    });
  }
  return http('POST', `/clientes/${clienteId}/carrinho/itens`, { produtoId, quantidade });
}

// DELETE /clientes/{clienteId}/carrinho/itens/{itemId}
export function removerDoCarrinho(clienteId: number, itemId: number): Promise<Carrinho> {
  if (USE_MOCK) {
    return simular((banco) => {
      const item = banco.carrinho.find((i) => i.id === itemId && i.clienteId === clienteId);
      if (!item) erro(404, 'Item não encontrado');
      banco.carrinho = banco.carrinho.filter((i) => i !== item);
      return montarCarrinho(banco, clienteId);
    });
  }
  return http('DELETE', `/clientes/${clienteId}/carrinho/itens/${itemId}`);
}
