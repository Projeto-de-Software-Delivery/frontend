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

const ativa = (pedido: Pedido) => pedido.status === 'ENTREGA_ACEITA' || pedido.status === 'EM_ENTREGA';

/** App do entregador: disponibilidade, corridas ativas (retirada → entrega) e corridas finalizadas. */
export function MinhaEntrega() {
  const entregadorId = useParams().entregadorId ?? '';
  const entregador = useCarregar(() => buscarEntregador(entregadorId), [entregadorId]);
  const pedidos = useCarregar(() => listarPedidosDoEntregador(entregadorId), [entregadorId]);
  const lojas = useCarregar(() => listarLojas(), []);
  const produtos = useCarregar(() => listarProdutos(), []);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');
  const [aba, setAba] = useState<'ativas' | 'finalizadas'>('ativas');

  const maisRecentesPrimeiro = [...(pedidos.dados ?? [])].sort((a, b) => b.id - a.id);
  const ativas = maisRecentesPrimeiro.filter(ativa);
  const finalizadas = maisRecentesPrimeiro.filter((p) => !ativa(p));

  const recarregarTudo = useCallback(() => {
    entregador.recarregar();
    pedidos.recarregar();
  }, [entregador.recarregar, pedidos.recarregar]);

  // disponível ou em corrida: busca de novo a cada 10s pra corrida nova (ou confirmação do cliente) aparecer sozinha
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

  function retirar(pedido: Pedido, codigo: string) {
    setAviso('');
    return executar(async () => {
      await confirmarRetirada(pedido.id, entregadorId, codigo);
      setAviso(`Pedido #${pedido.id} retirado. Bom trajeto!`);
      recarregarTudo();
    });
  }

  function entregar(pedido: Pedido, pin: string) {
    setAviso('');
    return executar(async () => {
      const atualizado = await confirmarEntrega(pedido.id, entregadorId, pin);
      setAviso(atualizado.status === 'ENTREGUE'
        ? `Pedido #${pedido.id} entregue! 🎉`
        : `Código certo! Agora o cliente precisa tocar em "Recebi" no app dele para finalizar o pedido #${pedido.id}.`);
      recarregarTudo();
    });
  }

  const lojaDoPedido = (id: number) => lojas.dados?.find((l) => l.id === id);
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

      <div className="abas" role="tablist">
        <button role="tab" aria-selected={aba === 'ativas'} className={aba === 'ativas' ? 'ativa' : ''} onClick={() => setAba('ativas')}>
          Ativas <span className="contagem-aba">{ativas.length}</span>
        </button>
        <button role="tab" aria-selected={aba === 'finalizadas'} className={aba === 'finalizadas' ? 'ativa' : ''} onClick={() => setAba('finalizadas')}>
          Finalizadas <span className="contagem-aba">{finalizadas.length}</span>
        </button>
      </div>

      {aba === 'ativas' && (
        <>
          {!pedidos.carregando && ativas.length === 0 && (
            <p className="vazio">🛵<br />Nenhuma corrida no momento.<br />Fique disponível para receber pedidos.</p>
          )}
          {ativas.map((pedido) => (
            <CardCorrida
              key={pedido.id}
              pedido={pedido}
              loja={lojaDoPedido(pedido.lojaId)}
              nomeDoProduto={nomeDoProduto}
              onRetirar={retirar}
              onEntregar={entregar}
            />
          ))}
        </>
      )}

      {aba === 'finalizadas' && (
        finalizadas.length === 0 ? (
          <p className="vazio">📦<br />Você ainda não finalizou nenhuma corrida.</p>
        ) : (
          <div className="card">
            {finalizadas.map((pedido) => (
              <div key={pedido.id} className="item-lista">
                <div className="cresce">
                  <strong>Pedido #{pedido.id}</strong>
                  <div className="nota">
                    {lojaDoPedido(pedido.lojaId)?.nome ?? `Loja ${pedido.lojaId}`} → {pedido.enderecoEntrega.rua}
                  </div>
                </div>
                <span className="nota">{dataHora(pedido.dataCriacao)}</span>
                <span className={`status status-${pedido.status}`}>{NOME_STATUS_PEDIDO[pedido.status]}</span>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}

function CampoCodigo({ valor, onMudar }: { valor: string; onMudar: (valor: string) => void }) {
  return (
    <label className="campo-pequeno">
      Código
      <input
        required
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        placeholder="0000"
        value={valor}
        onChange={(e) => onMudar(e.target.value.replace(/\D/g, ''))}
      />
    </label>
  );
}

function CardCorrida({
  pedido, loja, nomeDoProduto, onRetirar, onEntregar,
}: {
  pedido: Pedido;
  loja?: { nome: string; endereco: string };
  nomeDoProduto: (id: number) => string;
  onRetirar: (pedido: Pedido, codigo: string) => Promise<boolean>;
  onEntregar: (pedido: Pedido, pin: string) => Promise<boolean>;
}) {
  const [codigo, setCodigo] = useState('');
  const [pin, setPin] = useState('');

  async function enviarCodigo(e: FormEvent) {
    e.preventDefault();
    if (await onRetirar(pedido, codigo)) setCodigo('');
  }

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
        <form className="linha acoes" onSubmit={enviarCodigo}>
          <span className="nota cresce">Chegou na loja? Peça o código de retirada a ela.</span>
          <CampoCodigo valor={codigo} onMudar={setCodigo} />
          <button className="botao">Confirmar retirada</button>
        </form>
      )}

      {pedido.status === 'EM_ENTREGA' && !pedido.entregaConfirmadaPeloEntregador && (
        <form className="linha acoes" onSubmit={enviarPin}>
          <span className="nota cresce">
            Peça ao cliente o código de entrega.
            {pedido.recebimentoConfirmadoPeloCliente && ' O cliente já confirmou que recebeu.'}
          </span>
          <CampoCodigo valor={pin} onMudar={setPin} />
          <button className="botao">Confirmar entrega</button>
        </form>
      )}

      {pedido.status === 'EM_ENTREGA' && pedido.entregaConfirmadaPeloEntregador && (
        <p className="nota acoes">✅ Você confirmou. Falta o cliente tocar em "Recebi" no app dele.</p>
      )}
    </div>
  );
}
