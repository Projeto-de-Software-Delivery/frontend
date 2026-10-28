import { Clock } from 'lucide-react';
import type { Pedido } from '../types';
import { hora, minutosAte } from '../util';

const emEntrega = (pedido: Pedido) =>
  pedido.status === 'VALIDADO' || pedido.status === 'ENTREGA_ACEITA' || pedido.status === 'EM_ENTREGA';

/**
 * Prazo do pedido conforme a etapa: aguardando a loja → até quando ela pode aceitar;
 * depois de aceito → até quando deve chegar (ou "Atrasado"). Nas outras etapas não mostra nada.
 */
export function Prazo({ pedido }: { pedido: Pedido }) {
  if (pedido.status === 'AGUARDANDO_VALIDACAO' && pedido.prazoAceite) {
    const faltam = minutosAte(pedido.prazoAceite);
    return (
      <span className={`nota com-icone${faltam <= 2 ? ' prazo-curto' : ''}`}>
        <Clock size={14} /> Aceite até {hora(pedido.prazoAceite)} ({faltam > 0 ? `faltam ${faltam} min` : 'acabando'})
      </span>
    );
  }
  if (emEntrega(pedido) && pedido.prazoEntrega) {
    if (minutosAte(pedido.prazoEntrega) < 0) {
      return <span className="etiqueta-atraso">Atrasado · era até {hora(pedido.prazoEntrega)}</span>;
    }
    return <span className="nota com-icone"><Clock size={14} /> Chega até {hora(pedido.prazoEntrega)}</span>;
  }
  return null;
}
