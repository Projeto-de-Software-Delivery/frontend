import { RotateCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { listarLojas } from '../../api/lojas';
import { listarPedidosDoCliente } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import { Progresso } from '../../components/Progresso';
import type { Pedido } from '../../types';
import { dataHora, dinheiro, NOME_STATUS_PEDIDO, nomePorId, useAtualizarACada, useCarregar } from '../../util';

const emAndamento = (pedido: Pedido) => pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO';

export function Pedidos() {
  const clienteId = Number(useParams().clienteId);
  const pedidos = useCarregar(() => listarPedidosDoCliente(clienteId), [clienteId]);
  const lojas = useCarregar(() => listarLojas(), []);
  const produtos = useCarregar(() => listarProdutos(), []);

  // acompanhamento: enquanto tiver pedido em andamento, busca o status de novo a cada 10s
  useAtualizarACada(pedidos.recarregar, 10_000, (pedidos.dados ?? []).some(emAndamento));

  const maisRecentesPrimeiro = [...(pedidos.dados ?? [])].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className="linha">
        <h1>Meus pedidos</h1>
        <button className="botao-claro" onClick={pedidos.recarregar}><RotateCw size={15} /> Atualizar</button>
      </div>
      {pedidos.erro && <p className="erro">{pedidos.erro}</p>}
      {pedidos.dados?.length === 0 && <p className="vazio">🧾<br />Você ainda não fez nenhum pedido.</p>}

      {maisRecentesPrimeiro.map((pedido) => {
        return (
          <div key={pedido.id} className="card bloco">
            <div className="linha">
              <div>
                <h2>{nomePorId(lojas.dados, pedido.lojaId, 'Loja')}</h2>
                <p className="nota">Pedido #{pedido.id} · {dataHora(pedido.dataCriacao)}</p>
              </div>
              <span className={`status status-${pedido.status}`}>{NOME_STATUS_PEDIDO[pedido.status]}</span>
            </div>

            <Progresso status={pedido.status} />

            <p>
              {pedido.itens
                .map((item) => `${item.quantidade}× ${nomePorId(produtos.dados, item.produtoId, 'Produto')}`)
                .join(', ')}
            </p>

            <div className="linha">
              <strong>{dinheiro(pedido.total)}</strong>
              {emAndamento(pedido) && <span className="pin">Código de entrega <strong>{pedido.pin}</strong></span>}
            </div>
          </div>
        );
      })}
    </>
  );
}
