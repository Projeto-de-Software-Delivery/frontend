import { useCallback, useEffect, useState } from 'react';
import type { PedidoStatus, StatusEntregador } from './types';
 
export const dinheiro = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const NOME_STATUS_PEDIDO: Record<PedidoStatus, string> = {
  AGUARDANDO_VALIDACAO: 'Aguardando a loja',
  VALIDADO: 'Em preparo',
  ENTREGA_ACEITA: 'Entregador a caminho da loja',
  EM_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const NOME_STATUS_ENTREGADOR: Record<StatusEntregador, string> = {
  DISPONIVEL: 'Disponível',
  INDISPONIVEL: 'Indisponível',
  EM_ENTREGA: 'Em entrega',
};

// TODO: quando tiver busca de endereço/mapa, trocar por lat/lng reais
export const LAT_LNG_PADRAO = { lat: -23.5987, lng: -46.6765 };

/** Acha o nome pelo id numa lista já carregada. Ex.: nomePorId(lojas.dados, 3, 'Loja') */
export function nomePorId(lista: { id: number; nome: string }[] | null, id: number, rotulo: string) {
  return lista?.find((item) => item.id === id)?.nome ?? `${rotulo} ${id}`;
}

const mensagemDeErro = (e: unknown) => (e instanceof Error ? e.message : 'Algo deu errado');

/**
 * Busca dados da API ao abrir a tela.
 * Ex.: const { dados, erro, carregando, recarregar } = useCarregar(() => listarLojas(), []);
 * O segundo argumento funciona igual ao do useEffect: quando muda, busca de novo.
 */
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[]) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      setDados(await buscar());
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, dependencias);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, setDados, erro, carregando, recarregar };
}

/**
 * Chama `atualizar` a cada `ms` enquanto `ativo` for true. Pula quando a aba está em segundo plano.
 * Ex.: useAtualizarACada(pedidos.recarregar, 10_000, temPedidoEmAndamento);
 */
export function useAtualizarACada(atualizar: () => void, ms: number, ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => {
      if (!document.hidden) atualizar();
    }, ms);
    return () => clearInterval(id);
  }, [atualizar, ms, ativo]);
}

/**
 * Roda uma ação (salvar, excluir…) e guarda a mensagem se der erro.
 * Ex.: const { erro, executar } = useAcao();  executar(() => deletarProduto(id));
 * Devolve true se deu certo.
 */
export function useAcao() {
  const [erro, setErro] = useState('');

  async function executar(acao: () => Promise<unknown>) {
    setErro('');
    try {
      await acao();
      return true;
    } catch (e) {
      setErro(mensagemDeErro(e));
      return false;
    }
  }

  return { erro, executar };
}
