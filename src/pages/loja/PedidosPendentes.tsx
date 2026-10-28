import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { atualizarLoja, buscarLoja } from '../../api/lojas';
import { aceitarPedido, listarPedidosDaLoja, recusarPedido } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import { Prazo } from '../../components/Prazo';
import type { Loja, Pedido } from '../../types';
import {
  dataHora, dinheiro, LAT_LNG_PADRAO, NOME_STATUS_PEDIDO, nomePorId, useAcao, useAtualizarACada, useCarregar,
} from '../../util';

// aceitos, mas o entregador ainda não pegou: a loja precisa mostrar o código de retirada
const aguardandoRetirada = (pedido: Pedido) => pedido.status === 'VALIDADO' || pedido.status === 'ENTREGA_ACEITA';

/** Painel da loja: pedidos aguardando validação e pedidos esperando o entregador. */
export function PedidosPendentes() {
  const lojaId = Number(useParams().lojaId);
  const loja = useCarregar(() => buscarLoja(lojaId), [lojaId]);
  const pedidos = useCarregar(() => listarPedidosDaLoja(lojaId), [lojaId]);
  const produtos = useCarregar(() => listarProdutos(lojaId), [lojaId]);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');

  // pedido novo e entregador chegando aparecem sozinhos
  useAtualizarACada(pedidos.recarregar, 10_000, true);

  const pendentes = (pedidos.dados ?? []).filter((p) => p.status === 'AGUARDANDO_VALIDACAO');
  const paraRetirar = (pedidos.dados ?? []).filter(aguardandoRetirada);
  const nomeDoProduto = (id: number) => nomePorId(produtos.dados, id, 'Produto');

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
      {loja.dados && <PrazosDaLoja loja={loja.dados} onSalvo={loja.setDados} />}
      {aviso && <p className="aviso">{aviso}</p>}
      {(erro || pedidos.erro) && <p className="erro">{erro || pedidos.erro}</p>}
      {pedidos.dados && pendentes.length === 0 && <p className="nota">Nenhum pedido esperando por você. 🎉</p>}

      {pendentes.map((pedido) => (
        <CardPedido
          key={pedido.id}
          pedido={pedido}
          nomeDoProduto={nomeDoProduto}
          onAceitar={aceitar}
          onRecusar={recusar}
        />
      ))}

      {paraRetirar.length > 0 && (
        <>
          <h2 className="titulo-secao">Aguardando retirada</h2>
          {paraRetirar.map((pedido) => (
            <div key={pedido.id} className="card bloco">
              <div className="linha">
                <h2>Pedido #{pedido.id}</h2>
                <Prazo pedido={pedido} />
                <span className={`status status-${pedido.status}`}>{NOME_STATUS_PEDIDO[pedido.status]}</span>
              </div>
              <ul className="lista-itens">
                {pedido.itens.map((item) => (
                  <li key={item.produtoId}>{item.quantidade}× {nomeDoProduto(item.produtoId)}</li>
                ))}
              </ul>
              <div className="linha acoes">
                <span className="nota cresce">
                  {pedido.status === 'ENTREGA_ACEITA'
                    ? 'Entregador a caminho. Só entregue o pedido depois de passar este código para ele:'
                    : 'Ainda sem entregador. Quando ele chegar, passe este código:'}
                </span>
                <span className="pin">Código de retirada <strong>{pedido.codigoRetirada}</strong></span>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

/** Prazos que a loja define: para aceitar (senão cancela) e para entregar (senão aparece atrasado). */
function PrazosDaLoja({ loja, onSalvo }: { loja: Loja; onSalvo: (loja: Loja) => void }) {
  const [aceite, setAceite] = useState(String(loja.tempoMaxAceiteMin));
  const [entrega, setEntrega] = useState(String(loja.tempoMaxEntregaMin));
  const { erro, executar } = useAcao();
  const [salvo, setSalvo] = useState(false);
  const mudou = Number(aceite) !== loja.tempoMaxAceiteMin || Number(entrega) !== loja.tempoMaxEntregaMin;

  function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvo(false);
    executar(async () => {
      const { id, ...dados } = loja;
      onSalvo(await atualizarLoja(id, { ...dados, tempoMaxAceiteMin: Number(aceite), tempoMaxEntregaMin: Number(entrega) }));
      setSalvo(true);
    });
  }

  return (
    <form className="card form-linha prazos-loja" onSubmit={salvar}>
      <div className="cresce">
        <h2>Seus prazos</h2>
        <p className="nota">Pedido não aceito no prazo é cancelado. Entrega fora do prazo aparece como atrasada.</p>
      </div>
      <label className="campo-pequeno">
        Aceitar (min)
        <input required type="number" min="1" value={aceite} onChange={(e) => { setAceite(e.target.value); setSalvo(false); }} />
      </label>
      <label className="campo-pequeno">
        Entregar (min)
        <input required type="number" min="1" value={entrega} onChange={(e) => { setEntrega(e.target.value); setSalvo(false); }} />
      </label>
      <button className="botao-claro" disabled={!mudou}>{salvo && !mudou ? 'Salvo ✓' : 'Salvar'}</button>
      {erro && <p className="erro">{erro}</p>}
    </form>
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
      <Prazo pedido={pedido} />
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
