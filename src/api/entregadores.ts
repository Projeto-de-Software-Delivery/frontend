// Rotas de entregador (serviço entregador, FastAPI)
//   /entregadores

import type { Entregador, EntregadorRequest, StatusEntregador } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, erro, simular } from './mock';

// GET /entregadores
export function listarEntregadores(): Promise<Entregador[]> {
  if (USE_MOCK) return simular((banco) => banco.entregadores);
  return http('GET', '/entregadores');
}

// GET /entregadores/me
export function buscarMeuEntregador(): Promise<Entregador> {
  if (USE_MOCK) return simular((banco) => banco.entregadores[0] ?? erro(404, 'Entregador não encontrado'));
  return http('GET', '/entregadores/me');
}

// GET /entregadores/{id}
export function buscarEntregador(id: string): Promise<Entregador> {
  if (USE_MOCK) return simular((banco) => acharOu404(banco.entregadores, id, 'Entregador'));
  return http('GET', `/entregadores/${id}`);
}

// POST /entregadores  (começa DISPONIVEL)
export function criarEntregador(dados: EntregadorRequest): Promise<Entregador> {
  if (USE_MOCK) {
    return simular((banco) => {
      const agora = new Date().toISOString();
      const entregador: Entregador = {
        id: crypto.randomUUID(),
        ...dados,
        status: 'DISPONIVEL',
        created_at: agora,
        updated_at: agora,
      };
      banco.entregadores.push(entregador);
      return entregador;
    });
  }
  return http('POST', '/entregadores', dados);
}

// PUT /entregadores/{id}
export function atualizarEntregador(id: string, dados: EntregadorRequest): Promise<Entregador> {
  if (USE_MOCK) {
    return simular((banco) =>
      Object.assign(acharOu404(banco.entregadores, id, 'Entregador'), dados, { updated_at: new Date().toISOString() }),
    );
  }
  return http('PUT', `/entregadores/${id}`, dados);
}

// DELETE /entregadores/{id}
export function deletarEntregador(id: string): Promise<void> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.entregadores, id, 'Entregador');
      banco.entregadores = banco.entregadores.filter((e) => e.id !== id);
    });
  }
  return http('DELETE', `/entregadores/${id}`);
}

// PATCH /entregadores/{id}/status
export function mudarStatusEntregador(id: string, status: StatusEntregador): Promise<Entregador> {
  if (USE_MOCK) {
    return simular((banco) =>
      Object.assign(acharOu404(banco.entregadores, id, 'Entregador'), { status, updated_at: new Date().toISOString() }),
    );
  }
  return http('PATCH', `/entregadores/${id}/status`, { status });
}
