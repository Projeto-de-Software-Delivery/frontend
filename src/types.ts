// Tipos iguais aos DTOs do backend (pedidos-lojas e entregador).
// Se o backend mudar um campo, é só mudar aqui.

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}
export type ClienteRequest = Omit<Cliente, 'id'>;

export interface Endereco {
  id: number;
  clienteId: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}
export type EnderecoRequest = Omit<Endereco, 'id' | 'clienteId'>;

export interface Loja {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
}
export type LojaRequest = Omit<Loja, 'id'>;

export interface Produto {
  id: number;
  lojaId: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  foto: string;
}
export type ProdutoRequest = Omit<Produto, 'id'>;

export interface ItemCarrinho {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Carrinho {
  clienteId: number;
  itens: ItemCarrinho[];
  total: number;
}

export type PedidoStatus =
  | 'AGUARDANDO_VALIDACAO'
  | 'VALIDADO'
  | 'ENTREGA_ACEITA'
  | 'EM_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface EnderecoEntrega {
  rua: string;
  lat: number;
  lng: number;
}

export interface ItemPedido {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  lojaId: number;
  itens: ItemPedido[];
  total: number;
  enderecoEntrega: EnderecoEntrega;
  status: PedidoStatus;
  dataCriacao: string;
  pin: string;
  entregadorId: string | null;
  /** A loja mostra, o entregador digita na retirada. */
  codigoRetirada: string;
  /** A entrega só termina com as duas confirmações: entregador (PIN) e cliente ("Recebi"). */
  entregaConfirmadaPeloEntregador: boolean;
  recebimentoConfirmadoPeloCliente: boolean;
}

export interface CriarPedidoRequest {
  lojaId: number;
  itens: { produtoId: number; quantidade: number }[];
  enderecoEntrega: EnderecoEntrega;
}

export interface AceitarPedidoRequest {
  enderecoRetirada: EnderecoEntrega;
  valorFrete: number;
  tempoPreparoMin: number;
}

// Serviço entregador (FastAPI) — o id é UUID
export type Veiculo = 'MOTO' | 'CARRO' | 'BICICLETA';
export type StatusEntregador = 'DISPONIVEL' | 'INDISPONIVEL' | 'EM_ENTREGA';

export interface Entregador {
  id: string;
  nome: string;
  veiculo: Veiculo;
  status: StatusEntregador;
  created_at: string;
  updated_at: string;
}
export type EntregadorRequest = Pick<Entregador, 'nome' | 'veiculo'>;
