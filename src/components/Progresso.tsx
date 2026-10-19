import type { PedidoStatus } from '../types';

// As etapas do pedido, na ordem (igual à máquina de estados do backend)
const ETAPAS: { status: PedidoStatus; texto: string }[] = [
  { status: 'AGUARDANDO_VALIDACAO', texto: 'Enviado' },
  { status: 'VALIDADO', texto: 'Em preparo' },
  { status: 'ENTREGA_ACEITA', texto: 'Entregador' },
  { status: 'EM_ENTREGA', texto: 'A caminho' },
  { status: 'ENTREGUE', texto: 'Entregue' },
];

/** Barrinha com as 5 etapas do pedido, pintando até a etapa atual. */
export function Progresso({ status }: { status: PedidoStatus }) {
  if (status === 'CANCELADO') return <p className="cancelado">Pedido cancelado pela loja</p>;

  const atual = ETAPAS.findIndex((etapa) => etapa.status === status);
  return (
    <ol className="progresso">
      {ETAPAS.map((etapa, i) => (
        <li key={etapa.status} className={i <= atual ? 'feito' : ''}>
          {etapa.texto}
        </li>
      ))}
    </ol>
  );
}
