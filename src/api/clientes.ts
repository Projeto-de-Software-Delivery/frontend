// Rotas de cliente e endereço (serviço pedidos-lojas)
//   /clientes
//   /clientes/{clienteId}/enderecos

import type { Cliente, ClienteRequest, Endereco, EnderecoRequest } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, erro, novoId, simular } from './mock';

// GET /clientes
export function listarClientes(): Promise<Cliente[]> {
  if (USE_MOCK) return simular((banco) => banco.clientes);
  return http('GET', '/clientes');
}

// GET /clientes/me
export function buscarMeuCliente(): Promise<Cliente> {
  if (USE_MOCK) return simular((banco) => banco.clientes[0] ?? erro(404, 'Cliente não encontrado'));
  return http('GET', '/clientes/me');
}

// GET /clientes/{id}
export function buscarCliente(id: number): Promise<Cliente> {
  if (USE_MOCK) return simular((banco) => acharOu404(banco.clientes, id, 'Cliente'));
  return http('GET', `/clientes/${id}`);
}

// POST /clientes
export function criarCliente(dados: ClienteRequest): Promise<Cliente> {
  if (USE_MOCK) {
    return simular((banco) => {
      const cliente = { id: novoId(banco), ...dados };
      banco.clientes.push(cliente);
      return cliente;
    });
  }
  return http('POST', '/clientes', dados);
}

// PUT /clientes/{id}
export function atualizarCliente(id: number, dados: ClienteRequest): Promise<Cliente> {
  if (USE_MOCK) {
    return simular((banco) => Object.assign(acharOu404(banco.clientes, id, 'Cliente'), dados));
  }
  return http('PUT', `/clientes/${id}`, dados);
}

// DELETE /clientes/{id}
export function deletarCliente(id: number): Promise<void> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.clientes, id, 'Cliente');
      banco.clientes = banco.clientes.filter((c) => c.id !== id);
    });
  }
  return http('DELETE', `/clientes/${id}`);
}

// GET /clientes/{clienteId}/enderecos
export function listarEnderecos(clienteId: number): Promise<Endereco[]> {
  if (USE_MOCK) return simular((banco) => banco.enderecos.filter((e) => e.clienteId === clienteId));
  return http('GET', `/clientes/${clienteId}/enderecos`);
}

// POST /clientes/{clienteId}/enderecos
export function criarEndereco(clienteId: number, dados: EnderecoRequest): Promise<Endereco> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.clientes, clienteId, 'Cliente');
      if (!/^\d{8}$/.test(dados.cep)) erro(400, 'CEP deve ter 8 dígitos');
      const endereco = { id: novoId(banco), clienteId, ...dados };
      banco.enderecos.push(endereco);
      return endereco;
    });
  }
  return http('POST', `/clientes/${clienteId}/enderecos`, dados);
}

// DELETE /clientes/{clienteId}/enderecos/{id}
export function deletarEndereco(clienteId: number, id: number): Promise<void> {
  if (USE_MOCK) {
    return simular((banco) => {
      banco.enderecos = banco.enderecos.filter((e) => !(e.id === id && e.clienteId === clienteId));
    });
  }
  return http('DELETE', `/clientes/${clienteId}/enderecos/${id}`);
}
