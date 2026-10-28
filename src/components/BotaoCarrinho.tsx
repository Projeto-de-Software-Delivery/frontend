import { ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { buscarCarrinho, EVENTO_CARRINHO_MUDOU } from '../api/carrinho';
import { useCarregar } from '../util';

/** Carrinho no canto superior direito, com quantos itens tem dentro. */
export function BotaoCarrinho({ clienteId }: { clienteId: number }) {
  const carrinho = useCarregar(() => buscarCarrinho(clienteId), [clienteId]);
  const { recarregar } = carrinho;

  useEffect(() => {
    window.addEventListener(EVENTO_CARRINHO_MUDOU, recarregar);
    return () => window.removeEventListener(EVENTO_CARRINHO_MUDOU, recarregar);
  }, [recarregar]);

  const unidades = carrinho.dados?.itens.reduce((soma, item) => soma + item.quantidade, 0) ?? 0;

  return (
    <NavLink to={`/cliente/${clienteId}/carrinho`} className="botao-carrinho" title="Carrinho">
      <ShoppingCart size={18} />
      <span className="rotulo-carrinho">Carrinho</span>
      {unidades > 0 && <span className="contagem">{unidades}</span>}
    </NavLink>
  );
}
