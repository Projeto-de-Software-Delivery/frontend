import { PackageCheck, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { listarLojas } from '../../api/lojas';
import { confirmarRecebimento, listarPedidosDoCliente } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import { Prazo } from '../../components/Prazo';
import { Progresso } from '../../components/Progresso';
import type { Pedido } from '../../types';
import {
  dataHora, dinheiro, NOME_STATUS_PEDIDO, nomePorId, useAcao, useAtualizarACada, useCarregar,
} from '../../util';

const emAndamento = (pedido: Pedido) => pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO';

export function Pedidos() {
  const clienteId = Number(useParams().clienteId);
  const pedidos = useCarregar(() => listarPedidosDoCliente(clienteId), [clienteId]);
  const lojas = useCarregar(() => listarLojas(), []);
  const produtos = useCarregar(() => listarProdutos(), []);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');

  // acompanhamento: enquanto tiver pedido em andamento, busca o status de novo a cada 10s
  useAtualizarACada(pedidos.recarregar, 10_000, (pedidos.dados ?? []).some(emAndamento));

  const maisRecentesPrimeiro = [...(pedidos.dados ?? [])].sort((a, b) => b.id - a.id);

  // a entrega só termina quando o entregador (com o PIN) e o cliente confirmam
  function recebi(pedido: Pedido) {
    setAviso('');
    executar(async () => {
      const atualizado = await confirmarRecebimento(clienteId, pedido.id);
      setAviso(atualizado.status === 'ENTREGUE'
        ? `Pedido #${pedido.id} entregue. Bom apetite! 😋`
        : `Anotado! Assim que o entregador digitar o código, o pedido #${pedido.id} é finalizado.`);
      pedidos.recarregar();
    });
  }

  return (
    <>
      <div className="linha">
        <h1>Meus pedidos</h1>
        <button className="botao-claro" onClick={pedidos.recarregar}><RotateCw size={15} /> Atualizar</button>
      </div>
      {aviso && <p className="aviso">{aviso}</p>}
      {(erro || pedidos.erro) && <p className="erro">{erro || pedidos.erro}</p>}
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
            <Prazo pedido={pedido} />

            <p>
              {pedido.itens
                .map((item) => `${item.quantidade}× ${nomePorId(produtos.dados, item.produtoId, 'Produto')}`)
                .join(', ')}
            </p>

            <div className="linha">
              <strong>{dinheiro(pedido.total)}</strong>
              {emAndamento(pedido) && <span className="pin">Código de entrega <strong>{pedido.pin}</strong></span>}
            </div>

            {pedido.status === 'EM_ENTREGA' && (
              <div className="linha acoes">
                <span className="nota cresce">
                  {pedido.recebimentoConfirmadoPeloCliente
                    ? 'Você confirmou. Falta o entregador digitar o código de entrega.'
                    : pedido.entregaConfirmadaPeloEntregador
                      ? 'O entregador já confirmou. Recebeu tudo certo? Confirme para finalizar.'
                      : 'Quando o pedido chegar, passe o código ao entregador e confirme aqui.'}
                </span>
                {!pedido.recebimentoConfirmadoPeloCliente && (
                  <button className="botao" onClick={() => recebi(pedido)}>
                    <PackageCheck size={16} /> Recebi meu pedido
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
