// Rotas de pedido (serviço pedidos-lojas)
//   /clientes/{clienteId}/pedidos
//   /pedidos/{id}
//   /lojas/{lojaId}/pedidos/...

import type { AceitarPedidoRequest, CriarPedidoRequest, Pedido, PedidoStatus } from '../types';
import { http, USE_MOCK } from './http';
import { acharOu404, erro, novoId, simular } from './mock';

// POST /clientes/{clienteId}/pedidos
export function criarPedido(clienteId: number, dados: CriarPedidoRequest): Promise<Pedido> {
  if (USE_MOCK) {
    return simular((banco) => {
      acharOu404(banco.clientes, clienteId, 'Cliente');
      acharOu404(banco.lojas, dados.lojaId, 'Loja');

      const itens = dados.itens.map(({ produtoId, quantidade }) => {
        const produto = acharOu404(banco.produtos, produtoId, 'Produto');
        if (produto.lojaId !== dados.lojaId) erro(400, `Produto ${produto.id} não pertence à loja informada`);
        if (produto.estoque < quantidade) erro(422, `Estoque insuficiente para ${produto.nome}`);
        return { produtoId, quantidade, precoUnitario: produto.preco, subtotal: produto.preco * quantidade };
      });

      const pedido: Pedido = {
        id: novoId(banco),
        clienteId,
        lojaId: dados.lojaId,
        itens,
        total: itens.reduce((soma, item) => soma + item.subtotal, 0),
        enderecoEntrega: dados.enderecoEntrega,
        status: 'AGUARDANDO_VALIDACAO',
        dataCriacao: new Date().toISOString(),
        pin: String(Math.floor(1000 + Math.random() * 9000)),
        entregadorId: null,
      };
      banco.pedidos.push(pedido);
      return pedido;
    });
  }
  return http('POST', `/clientes/${clienteId}/pedidos`, dados);
}

// GET /pedidos/{id}
export function buscarPedido(id: number): Promise<Pedido> {
  if (USE_MOCK) return simular((banco) => acharOu404(banco.pedidos, id, 'Pedido'));
  return http('GET', `/pedidos/${id}`);
}

// GET /pedidos/{id}/status
export function buscarStatusPedido(id: number): Promise<{ id: number; status: PedidoStatus }> {
  if (USE_MOCK) {
    return simular((banco) => ({ id, status: acharOu404(banco.pedidos, id, 'Pedido').status }));
  }
  return http('GET', `/pedidos/${id}/status`);
}

// GET /clientes/{clienteId}/pedidos
export function listarPedidosDoCliente(clienteId: number): Promise<Pedido[]> {
  if (USE_MOCK) return simular((banco) => banco.pedidos.filter((p) => p.clienteId === clienteId));
  return http('GET', `/clientes/${clienteId}/pedidos`);
}

// GET /lojas/{lojaId}/pedidos/pendentes
export function listarPedidosPendentes(lojaId: number): Promise<Pedido[]> {
  if (USE_MOCK) {
    return simular((banco) =>
      banco.pedidos.filter((p) => p.lojaId === lojaId && p.status === 'AGUARDANDO_VALIDACAO'),
    );
  }
  return http('GET', `/lojas/${lojaId}/pedidos/pendentes`);
}

// POST /lojas/{lojaId}/pedidos/{pedidoId}/aceitar
// Igual ao backend: baixa o estoque, vai pra VALIDADO e, se tiver
// entregador disponível, já atribui (ENTREGA_ACEITA).
export function aceitarPedido(lojaId: number, pedidoId: number, dados: AceitarPedidoRequest): Promise<Pedido> {
  if (USE_MOCK) {
    return simular((banco) => {
      const pedido = acharOu404(banco.pedidos, pedidoId, 'Pedido');
      if (pedido.lojaId !== lojaId) erro(404, 'Pedido não encontrado para esta loja');
      if (pedido.status !== 'AGUARDANDO_VALIDACAO') erro(409, `Pedido está em ${pedido.status}`);

      for (const item of pedido.itens) {
        const produto = acharOu404(banco.produtos, item.produtoId, 'Produto');
        if (produto.estoque < item.quantidade) erro(409, `Estoque insuficiente para ${produto.nome}`);
      }
      for (const item of pedido.itens) {
        acharOu404(banco.produtos, item.produtoId, 'Produto').estoque -= item.quantidade;
      }
      pedido.status = 'VALIDADO';

      const entregador = banco.entregadores.find((e) => e.status === 'DISPONIVEL');
      if (entregador) {
        entregador.status = 'EM_ENTREGA';
        pedido.entregadorId = entregador.id;
        pedido.status = 'ENTREGA_ACEITA';
      }
      // (no backend, enderecoRetirada/valorFrete/tempoPreparoMin vão no evento pedido.validado)
      return pedido;
    });
  }
  return http('POST', `/lojas/${lojaId}/pedidos/${pedidoId}/aceitar`, dados);
}

// POST /lojas/{lojaId}/pedidos/{pedidoId}/recusar
export function recusarPedido(lojaId: number, pedidoId: number): Promise<Pedido> {
  if (USE_MOCK) {
    return simular((banco) => {
      const pedido = acharOu404(banco.pedidos, pedidoId, 'Pedido');
      if (pedido.lojaId !== lojaId) erro(404, 'Pedido não encontrado para esta loja');
      if (pedido.status !== 'AGUARDANDO_VALIDACAO') erro(409, `Pedido está em ${pedido.status}`);
      pedido.status = 'CANCELADO';
      return pedido;
    });
  }
  return http('POST', `/lojas/${lojaId}/pedidos/${pedidoId}/recusar`);
}

// ===== App do entregador =====

// GET /pedidos?entregadorId={id}
export function listarPedidosDoEntregador(entregadorId: string): Promise<Pedido[]> {
  if (USE_MOCK) return simular((banco) => banco.pedidos.filter((p) => p.entregadorId === entregadorId));
  return http('GET', `/pedidos?entregadorId=${encodeURIComponent(entregadorId)}`);
}

// POST /pedidos/{id}/retirar → EM_ENTREGA, publica pedido.retirado
export function confirmarRetirada(pedidoId: number, entregadorId: string): Promise<Pedido> {
  if (USE_MOCK) {
    return simular((banco) => {
      const pedido = acharOu404(banco.pedidos, pedidoId, 'Pedido');
      if (pedido.entregadorId !== entregadorId) erro(403, 'Este pedido não é seu');
      if (pedido.status !== 'ENTREGA_ACEITA') erro(409, `Pedido está em ${pedido.status}`);
      pedido.status = 'EM_ENTREGA';
      return pedido;
    });
  }
  return http('POST', `/pedidos/${pedidoId}/retirar`, { entregadorId });
}

// POST /pedidos/{id}/entregar → ENTREGUE se o PIN bater (senão 422), publica pedido.entregue
export function confirmarEntrega(pedidoId: number, entregadorId: string, pin: string): Promise<Pedido> {
  if (USE_MOCK) {
    return simular((banco) => {
      const pedido = acharOu404(banco.pedidos, pedidoId, 'Pedido');
      if (pedido.entregadorId !== entregadorId) erro(403, 'Este pedido não é seu');
      if (pedido.status !== 'EM_ENTREGA') erro(409, `Pedido está em ${pedido.status}`);
      if (pedido.pin !== pin) erro(422, 'Código de entrega incorreto');
      pedido.status = 'ENTREGUE';
      // o entregador fica livre para a próxima corrida
      acharOu404(banco.entregadores, entregadorId, 'Entregador').status = 'DISPONIVEL';
      return pedido;
    });
  }
  return http('POST', `/pedidos/${pedidoId}/entregar`, { entregadorId, pin });
}
