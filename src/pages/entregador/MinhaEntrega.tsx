import { RotateCw } from 'lucide-react';
import { useCallback, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { buscarEntregador, mudarStatusEntregador } from '../../api/entregadores';
import { listarLojas } from '../../api/lojas';
import { confirmarEntrega, confirmarRetirada, listarPedidosDoEntregador } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import { Progresso } from '../../components/Progresso';
import type { Pedido } from '../../types';
import {
  dataHora, dinheiro, NOME_STATUS_ENTREGADOR, NOME_STATUS_PEDIDO, useAcao, useAtualizarACada, useCarregar,
} from '../../util';

/** App do entregador: disponibilidade, corrida atual (retirada → entrega com PIN) e histórico. */
export function MinhaEntrega() {
  const entregadorId = useParams().entregadorId ?? '';
  const entregador = useCarregar(() => buscarEntregador(entregadorId), [entregadorId]);
  const pedidos = useCarregar(() => listarPedidosDoEntregador(entregadorId), [entregadorId]);
  const lojas = useCarregar(() => listarLojas(), []);
  const produtos = useCarregar(() => listarProdutos(), []);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');

  const atual = pedidos.dados?.find((p) => p.status === 'ENTREGA_ACEITA' || p.status === 'EM_ENTREGA');
  const finalizadas = (pedidos.dados ?? []).filter((p) => p.status === 'ENTREGUE').sort((a, b) => b.id - a.id);

  const recarregarTudo = useCallback(() => {
    entregador.recarregar();
    pedidos.recarregar();
  }, [entregador.recarregar, pedidos.recarregar]);

  // disponível ou em corrida: busca de novo a cada 10s pra corrida nova (ou mudança de status) aparecer sozinha
  useAtualizarACada(recarregarTudo, 10_000, entregador.dados?.status !== 'INDISPONIVEL');

  // PATCH /entregadores/{id}/status — só alterna entre disponível e indisponível;
  // EM_ENTREGA quem coloca é o sistema ao atribuir uma corrida.
  function alternarDisponibilidade() {
    if (!entregador.dados) return;
    const novo = entregador.dados.status === 'DISPONIVEL' ? 'INDISPONIVEL' : 'DISPONIVEL';
    setAviso('');
    executar(async () => {
      entregador.setDados(await mudarStatusEntregador(entregadorId, novo));
    });
  }

  function retirar(pedido: Pedido) {
    setAviso('');
    executar(async () => {
      await confirmarRetirada(pedido.id, entregadorId);
      setAviso(`Pedido #${pedido.id} retirado. Bom trajeto!`);
      recarregarTudo();
    });
  }

  function entregar(pedido: Pedido, pin: string) {
    setAviso('');
    return executar(async () => {
      await confirmarEntrega(pedido.id, entregadorId, pin);
      setAviso(`Pedido #${pedido.id} entregue! 🎉`);
      recarregarTudo();
    });
  }

  const nomeDaLoja = (id: number) => lojas.dados?.find((l) => l.id === id);
  const nomeDoProduto = (id: number) => produtos.dados?.find((p) => p.id === id)?.nome ?? `Produto ${id}`;

  return (
    <>
      <div className="linha">
        <div>
          <h1>Olá, {entregador.dados?.nome.split(' ')[0] ?? '…'}</h1>
          {entregador.dados && <p className="nota">Veículo: {entregador.dados.veiculo.toLowerCase()}</p>}
        </div>
        <button className="botao-claro" onClick={recarregarTudo}><RotateCw size={15} /> Atualizar</button>
      </div>

      {aviso && <p className="aviso">{aviso}</p>}
      {(erro || entregador.erro || pedidos.erro) && <p className="erro">{erro || entregador.erro || pedidos.erro}</p>}

      {entregador.dados && (
        <div className="card linha bloco">
          <div>
            <h2>Sua disponibilidade</h2>
            <p className="nota">
              {entregador.dados.status === 'EM_ENTREGA'
                ? 'Você está em uma corrida. Ao finalizar, volta a ficar disponível.'
                : entregador.dados.status === 'DISPONIVEL'
                  ? 'Você pode receber novas corridas.'
                  : 'Você não vai receber corridas até ficar disponível.'}
            </p>
          </div>
          <div className="linha">
            <span className={`status status-${entregador.dados.status}`}>
              {NOME_STATUS_ENTREGADOR[entregador.dados.status]}
            </span>
            {entregador.dados.status !== 'EM_ENTREGA' && (
              <button className="botao-claro" onClick={alternarDisponibilidade}>
                {entregador.dados.status === 'DISPONIVEL' ? 'Ficar indisponível' : 'Ficar disponível'}
              </button>
            )}
          </div>
        </div>
      )}

      <h2 className="titulo-secao">Corrida atual</h2>
      {!pedidos.carregando && !atual && (
        <p className="vazio">🛵<br />Nenhuma corrida no momento.<br />Fique disponível para receber pedidos.</p>
      )}
      {atual && (
        <CardCorrida
          pedido={atual}
          loja={nomeDaLoja(atual.lojaId)}
          nomeDoProduto={nomeDoProduto}
          onRetirar={retirar}
          onEntregar={entregar}
        />
      )}

      {finalizadas.length > 0 && (
        <>
          <h2 className="titulo-secao">Entregas feitas</h2>
          <div className="card">
            {finalizadas.map((pedido) => (
              <div key={pedido.id} className="item-lista">
                <div className="cresce">
                  <strong>Pedido #{pedido.id}</strong>
                  <div className="nota">
                    {nomeDaLoja(pedido.lojaId)?.nome ?? `Loja ${pedido.lojaId}`} → {pedido.enderecoEntrega.rua}
                  </div>
                </div>
                <span className="nota">{dataHora(pedido.dataCriacao)}</span>
                <span className={`status status-${pedido.status}`}>{NOME_STATUS_PEDIDO[pedido.status]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function CardCorrida({
  pedido, loja, nomeDoProduto, onRetirar, onEntregar,
}: {
  pedido: Pedido;
  loja?: { nome: string; endereco: string };
  nomeDoProduto: (id: number) => string;
  onRetirar: (pedido: Pedido) => void;
  onEntregar: (pedido: Pedido, pin: string) => Promise<boolean>;
}) {
  const [pin, setPin] = useState('');

  async function enviarPin(e: FormEvent) {
    e.preventDefault();
    if (await onEntregar(pedido, pin)) setPin('');
  }

  return (
    <div className="card bloco">
      <div className="linha">
        <div>
          <h2>Pedido #{pedido.id}</h2>
          <p className="nota">{dataHora(pedido.dataCriacao)} · {dinheiro(pedido.total)}</p>
        </div>
        <span className={`status status-${pedido.status}`}>{NOME_STATUS_PEDIDO[pedido.status]}</span>
      </div>

      <Progresso status={pedido.status} />

      <div className="rota">
        <div className={pedido.status === 'ENTREGA_ACEITA' ? 'parada atual' : 'parada'}>
          <span className="nota">Retirar em</span>
          <strong>{loja?.nome ?? `Loja ${pedido.lojaId}`}</strong>
          <span>{loja?.endereco}</span>
        </div>
        <div className={pedido.status === 'EM_ENTREGA' ? 'parada atual' : 'parada'}>
          <span className="nota">Entregar em</span>
          <strong>{pedido.enderecoEntrega.rua}</strong>
        </div>
      </div>

      <ul className="lista-itens">
        {pedido.itens.map((item) => (
          <li key={item.produtoId}>{item.quantidade}× {nomeDoProduto(item.produtoId)}</li>
        ))}
      </ul>

      {pedido.status === 'ENTREGA_ACEITA' && (
        <div className="linha acoes">
          <span className="nota">Chegou na loja e pegou o pedido?</span>
          <button className="botao" onClick={() => onRetirar(pedido)}>Confirmar retirada</button>
        </div>
      )}

      {pedido.status === 'EM_ENTREGA' && (
        <form className="linha acoes" onSubmit={enviarPin}>
          <span className="nota cresce">Peça ao cliente o código de entrega.</span>
          <label className="campo-pequeno">
            Código
            <input
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="0000"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <button className="botao">Finalizar entrega</button>
        </form>
      )}
    </div>
  );
}
