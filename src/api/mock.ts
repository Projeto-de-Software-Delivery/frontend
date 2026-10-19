// "Banco de dados" de mentira, usado enquanto o front não está ligado no backend.
// Fica salvo no localStorage do navegador, então os dados sobrevivem ao F5.

import type { Cliente, Endereco, Entregador, Loja, Pedido, Produto } from '../types';
import { ApiError } from './http';

interface ItemCarrinhoMock {
  id: number;
  clienteId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface Banco {
  proximoId: number;
  clientes: Cliente[];
  enderecos: Endereco[];
  lojas: Loja[];
  produtos: Produto[];
  carrinho: ItemCarrinhoMock[];
  pedidos: Pedido[];
  entregadores: Entregador[];
}

const agora = new Date().toISOString();
const minutosAtras = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const insper = { lat: -23.5987, lng: -46.6765 };

const DADOS_INICIAIS: Banco = {
  proximoId: 100,

  clientes: [
    { id: 1, nome: 'Ana Souza', email: 'ana@email.com', telefone: '11999990000' },
    { id: 2, nome: 'Bruno Lima', email: 'bruno@email.com', telefone: '11988880000' },
    { id: 3, nome: 'Carla Mendes', email: 'carla@email.com', telefone: '11977770000' },
  ],

  enderecos: [],

  lojas: [
    { id: 1, nome: 'Burger da Vila', cnpj: '12345678000190', endereco: 'R. Quatá, 300 - Vila Olímpia' },
    { id: 2, nome: 'Sushi Itaim', cnpj: '98765432000110', endereco: 'R. Joaquim Floriano, 820 - Itaim Bibi' },
    { id: 3, nome: 'Padaria Faria Lima', cnpj: '11222333000144', endereco: 'Av. Faria Lima, 4000 - Itaim Bibi' },
    { id: 4, nome: 'Pizzaria Bella Napoli', cnpj: '55666777000188', endereco: 'R. Funchal, 120 - Vila Olímpia' },
    { id: 5, nome: 'Açaí da Praia', cnpj: '44555666000122', endereco: 'R. Gomes de Carvalho, 950 - Vila Olímpia' },
  ],

  produtos: [
    // Burger da Vila
    { id: 1, lojaId: 1, nome: 'Smash Burger', categoria: 'Lanches', preco: 32.9, estoque: 20, foto: '🍔' },
    { id: 2, lojaId: 1, nome: 'Cheddar Bacon', categoria: 'Lanches', preco: 38.5, estoque: 15, foto: '🍔' },
    { id: 3, lojaId: 1, nome: 'Batata Rústica', categoria: 'Acompanhamentos', preco: 18, estoque: 30, foto: '🍟' },
    { id: 4, lojaId: 1, nome: 'Onion Rings', categoria: 'Acompanhamentos', preco: 16, estoque: 0, foto: '🧅' },
    { id: 5, lojaId: 1, nome: 'Milkshake de Ovomaltine', categoria: 'Bebidas', preco: 22, estoque: 3, foto: '🥤' },
    // Sushi Itaim
    { id: 6, lojaId: 2, nome: 'Combo 20 peças', categoria: 'Combinados', preco: 79.9, estoque: 10, foto: '🍣' },
    { id: 7, lojaId: 2, nome: 'Temaki Salmão', categoria: 'Temakis', preco: 34, estoque: 12, foto: '🍙' },
    { id: 8, lojaId: 2, nome: 'Missoshiru', categoria: 'Entradas', preco: 12, estoque: 20, foto: '🍜' },
    // Padaria Faria Lima
    { id: 9, lojaId: 3, nome: 'Pão na chapa', categoria: 'Padaria', preco: 9.5, estoque: 40, foto: '🥖' },
    { id: 10, lojaId: 3, nome: 'Croissant', categoria: 'Padaria', preco: 11, estoque: 2, foto: '🥐' },
    { id: 11, lojaId: 3, nome: 'Café com leite', categoria: 'Bebidas', preco: 8, estoque: 50, foto: '☕' },
    { id: 12, lojaId: 3, nome: 'Bolo de cenoura', categoria: 'Doces', preco: 14, estoque: 8, foto: '🍰' },
    // Pizzaria Bella Napoli
    { id: 13, lojaId: 4, nome: 'Margherita', categoria: 'Pizzas', preco: 59, estoque: 15, foto: '🍕' },
    { id: 14, lojaId: 4, nome: 'Calabresa', categoria: 'Pizzas', preco: 62, estoque: 15, foto: '🍕' },
    { id: 15, lojaId: 4, nome: 'Refrigerante lata', categoria: 'Bebidas', preco: 7, estoque: 48, foto: '🥫' },
    // Açaí da Praia
    { id: 16, lojaId: 5, nome: 'Açaí 500ml', categoria: 'Açaí', preco: 24, estoque: 25, foto: '🍇' },
    { id: 17, lojaId: 5, nome: 'Salada de frutas', categoria: 'Frutas', preco: 15, estoque: 10, foto: '🍓' },
  ],

  carrinho: [],

  // Alguns pedidos de exemplo, para as telas não começarem vazias
  pedidos: [
    {
      id: 50, clienteId: 1, lojaId: 3, status: 'ENTREGUE', pin: '4821', entregadorId: 'a1b2c3d4-0000-4000-8000-000000000001',
      itens: [
        { produtoId: 9, quantidade: 2, precoUnitario: 9.5, subtotal: 19 },
        { produtoId: 11, quantidade: 2, precoUnitario: 8, subtotal: 16 },
      ],
      total: 35, enderecoEntrega: { rua: 'R. Quatá, 200 - Vila Olímpia', ...insper }, dataCriacao: minutosAtras(60 * 26),
    },
    {
      id: 51, clienteId: 1, lojaId: 1, status: 'AGUARDANDO_VALIDACAO', pin: '1307', entregadorId: null,
      itens: [
        { produtoId: 1, quantidade: 1, precoUnitario: 32.9, subtotal: 32.9 },
        { produtoId: 3, quantidade: 1, precoUnitario: 18, subtotal: 18 },
      ],
      total: 50.9, enderecoEntrega: { rua: 'R. Quatá, 200 - Vila Olímpia', ...insper }, dataCriacao: minutosAtras(4),
    },
    {
      id: 52, clienteId: 2, lojaId: 1, status: 'AGUARDANDO_VALIDACAO', pin: '9954', entregadorId: null,
      itens: [{ produtoId: 2, quantidade: 2, precoUnitario: 38.5, subtotal: 77 }],
      total: 77, enderecoEntrega: { rua: 'Av. Santo Amaro, 1500 - Itaim Bibi', ...insper }, dataCriacao: minutosAtras(1),
    },
  ],

  entregadores: [
    { id: 'a1b2c3d4-0000-4000-8000-000000000001', nome: 'Carlos Lima', veiculo: 'MOTO', status: 'DISPONIVEL', created_at: agora, updated_at: agora },
    { id: 'a1b2c3d4-0000-4000-8000-000000000002', nome: 'Bia Santos', veiculo: 'BICICLETA', status: 'INDISPONIVEL', created_at: agora, updated_at: agora },
    { id: 'a1b2c3d4-0000-4000-8000-000000000003', nome: 'Diego Rocha', veiculo: 'CARRO', status: 'DISPONIVEL', created_at: agora, updated_at: agora },
  ],
};

// Mudou os dados iniciais? Troque a versão da chave para o navegador carregar os novos.
const CHAVE = 'delivery-mock-v2';

function lerBanco(): Banco {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    // sem localStorage: começa do zero
  }
  return structuredClone(DADOS_INICIAIS);
}

function salvarBanco(banco: Banco) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco));
  } catch {
    // sem localStorage: os dados se perdem no F5
  }
}

/** Apaga tudo e volta para os dados iniciais. */
export function resetarMock() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada a fazer
  }
}

/**
 * Simula uma chamada ao backend: espera um pouquinho (como a rede),
 * roda a função no banco e salva. Se a função lançar erro, nada é salvo.
 */
export async function simular<T>(fn: (banco: Banco) => T): Promise<T> {
  await new Promise((r) => setTimeout(r, 200));
  const banco = lerBanco();
  const resultado = fn(banco);
  salvarBanco(banco);
  return structuredClone(resultado);
}

export function novoId(banco: Banco) {
  banco.proximoId += 1;
  return banco.proximoId;
}

/** Igual ao ResponseStatusException do Spring. */
export function erro(status: number, mensagem: string): never {
  throw new ApiError(status, mensagem);
}

export function acharOu404<T extends { id: number | string }>(lista: T[], id: number | string, nome: string): T {
  return lista.find((item) => item.id === id) ?? erro(404, `${nome} não encontrado`);
}
