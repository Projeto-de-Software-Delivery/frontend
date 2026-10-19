import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { buscarLoja } from '../../api/lojas';
import { aceitarPedido, listarPedidosPendentes, recusarPedido } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import type { Pedido } from '../../types';
import { dataHora, dinheiro, LAT_LNG_PADRAO, NOME_STATUS_PEDIDO, nomePorId, useAcao, useCarregar } from '../../util';

/** Painel da loja: pedidos aguardando validação. */
export function PedidosPendentes() {
  const lojaId = Number(useParams().lojaId);
  const loja = useCarregar(() => buscarLoja(lojaId), [lojaId]);
  const pedidos = useCarregar(() => listarPedidosPendentes(lojaId), [lojaId]);
  const produtos = useCarregar(() => listarProdutos(lojaId), [lojaId]);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');

  function aceitar(pedido: Pedido, valorFrete: number, tempoPreparoMin: number) {
    setAviso('');
    executar(async () => {
      const atualizado = await aceitarPedido(lojaId, pedido.id, {
        enderecoRetirada: { rua: loja.dados?.endereco ?? '', ...LAT_LNG_PADRAO },
        valorFrete,
        tempoPreparoMin,
      });
      setAviso(`Pedido #${pedido.id} aceito → ${NOME_STATUS_PEDIDO[atualizado.status]}`);
      pedidos.recarregar();
    });
  }

  function recusar(pedido: Pedido) {
    setAviso('');
    executar(async () => {
      await recusarPedido(lojaId, pedido.id);
      setAviso(`Pedido #${pedido.id} recusado`);
      pedidos.recarregar();
    });
  }

  return (
    <>
      <div className="linha">
        <h1>Pedidos pendentes</h1>
        <button className="botao-claro" onClick={pedidos.recarregar}>Atualizar</button>
      </div>
      {aviso && <p className="aviso">{aviso}</p>}
      {(erro || pedidos.erro) && <p className="erro">{erro || pedidos.erro}</p>}
      {pedidos.dados?.length === 0 && <p className="nota">Nenhum pedido esperando por você. 🎉</p>}

      {pedidos.dados?.map((pedido) => (
        <CardPedido
          key={pedido.id}
          pedido={pedido}
          nomeDoProduto={(id) => nomePorId(produtos.dados, id, 'Produto')}
          onAceitar={aceitar}
          onRecusar={recusar}
        />
      ))}
    </>
  );
}

function CardPedido({
  pedido, nomeDoProduto, onAceitar, onRecusar,
}: {
  pedido: Pedido;
  nomeDoProduto: (id: number) => string;
  onAceitar: (pedido: Pedido, frete: number, tempo: number) => void;
  onRecusar: (pedido: Pedido) => void;
}) {
  const [frete, setFrete] = useState('5');
  const [tempo, setTempo] = useState('20');

  return (
    <div className="card bloco">
      <div className="linha">
        <h2>Pedido #{pedido.id}</h2>
        <span className="nota">{dataHora(pedido.dataCriacao)}</span>
      </div>
      <ul className="lista-itens">
        {pedido.itens.map((item) => (
          <li key={item.produtoId}>{item.quantidade}× {nomeDoProduto(item.produtoId)}</li>
        ))}
      </ul>
      <p className="nota">Entregar em: {pedido.enderecoEntrega.rua}</p>

      <div className="linha acoes">
        <strong>{dinheiro(pedido.total)}</strong>
        <label className="campo-pequeno">
          Frete (R$)
          <input type="number" min="0" step="0.5" value={frete} onChange={(e) => setFrete(e.target.value)} />
        </label>
        <label className="campo-pequeno">
          Preparo (min)
          <input type="number" min="0" value={tempo} onChange={(e) => setTempo(e.target.value)} />
        </label>
        <button className="botao-claro" onClick={() => onRecusar(pedido)}>Recusar</button>
        <button className="botao" onClick={() => onAceitar(pedido, Number(frete), Number(tempo))}>Aceitar</button>
      </div>
    </div>
  );
}
