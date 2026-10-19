// Rotas de produto (serviço pedidos-lojas)
//   /produtos

import type { Produto, ProdutoRequest } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, novoId, simular } from './mock';

// GET /produtos  ou  GET /produtos?lojaId=1
export function listarProdutos(lojaId?: number): Promise<Produto[]> {
  if (USE_MOCK) {
    return simular((banco) => banco.produtos.filter((p) => lojaId === undefined || p.lojaId === lojaId));
  }
  return http('GET', lojaId === undefined ? '/produtos' : `/produtos?lojaId=${lojaId}`);
}

// GET /produtos/{id}
export function buscarProduto(id: number): Promise<Produto> {
  if (USE_MOCK) return simular((banco) => acharOu404(banco.produtos, id, 'Produto'));
  return http('GET', `/produtos/${id}`);
}

// POST /produtos
export function criarProduto(dados: ProdutoRequest): Promise<Produto> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.lojas, dados.lojaId, 'Loja');
      const produto = { id: novoId(banco), ...dados };
      banco.produtos.push(produto);
      return produto;
    });
  }
  return http('POST', '/produtos', dados);
}

// PUT /produtos/{id}
export function atualizarProduto(id: number, dados: ProdutoRequest): Promise<Produto> {
  if (USE_MOCK) {
    return simular((banco) => Object.assign(acharOu404(banco.produtos, id, 'Produto'), dados));
  }
  return http('PUT', `/produtos/${id}`, dados);
}

// DELETE /produtos/{id}
export function deletarProduto(id: number): Promise<void> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.produtos, id, 'Produto');
      banco.produtos = banco.produtos.filter((p) => p.id !== id);
    });
  }
  return http('DELETE', `/produtos/${id}`);
}
