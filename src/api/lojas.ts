// Rotas de loja (serviço pedidos-lojas)
//   /lojas

import type { Loja, LojaRequest } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, erro, novoId, simular } from './mock';

// GET /lojas
export function listarLojas(): Promise<Loja[]> {
  if (USE_MOCK) return simular((banco) => banco.lojas);
  return http('GET', '/lojas');
}

// GET /lojas/me
export function buscarMinhaLoja(): Promise<Loja> {
  if (USE_MOCK) return simular((banco) => banco.lojas[0] ?? erro(404, 'Loja não encontrada'));
  return http('GET', '/lojas/me');
}

// GET /lojas/{id}
export function buscarLoja(id: number): Promise<Loja> {
  if (USE_MOCK) return simular((banco) => acharOu404(banco.lojas, id, 'Loja'));
  return http('GET', `/lojas/${id}`);
}

// POST /lojas
export function criarLoja(dados: LojaRequest): Promise<Loja> {
  if (USE_MOCK) {
    return simular((banco) => {
      if (!/^\d{14}$/.test(dados.cnpj)) erro(400, 'CNPJ deve ter 14 dígitos');
      const loja = { id: novoId(banco), ...dados };
      banco.lojas.push(loja);
      return loja;
    });
  }
  return http('POST', '/lojas', dados);
}

// PUT /lojas/{id}
export function atualizarLoja(id: number, dados: LojaRequest): Promise<Loja> {
  if (USE_MOCK) {
    return simular((banco) => Object.assign(acharOu404(banco.lojas, id, 'Loja'), dados));
  }
  return http('PUT', `/lojas/${id}`, dados);
}

// DELETE /lojas/{id}
export function deletarLoja(id: number): Promise<void> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.lojas, id, 'Loja');
      banco.lojas = banco.lojas.filter((l) => l.id !== id);
    });
  }
  return http('DELETE', `/lojas/${id}`);
}
