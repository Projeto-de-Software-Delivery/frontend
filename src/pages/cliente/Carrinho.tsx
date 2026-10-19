import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buscarCarrinho, removerDoCarrinho } from '../../api/carrinho';
import { listarLojas } from '../../api/lojas';
import { criarPedido } from '../../api/pedidos';
import { listarProdutos } from '../../api/produtos';
import { Foto } from '../../components/Foto';
import type { ItemCarrinho } from '../../types';
import { dinheiro, LAT_LNG_PADRAO, nomePorId, useAcao, useCarregar } from '../../util';

export function Carrinho() {
  const navigate = useNavigate();
  const clienteId = Number(useParams().clienteId);
  const carrinho = useCarregar(() => buscarCarrinho(clienteId), [clienteId]);
  const produtos = useCarregar(() => listarProdutos(), []);
  const lojas = useCarregar(() => listarLojas(), []);
  const { erro, executar } = useAcao();
  const [rua, setRua] = useState('');

  const produto = (id: number) => produtos.dados?.find((p) => p.id === id);

  // Um pedido é sempre de uma loja só, então separamos os itens por loja.
  const itensPorLoja = new Map<number, ItemCarrinho[]>();
  for (const item of carrinho.dados?.itens ?? []) {
    const lojaId = produto(item.produtoId)?.lojaId;
    if (lojaId === undefined) continue;
    itensPorLoja.set(lojaId, [...(itensPorLoja.get(lojaId) ?? []), item]);
  }

  function remover(itemId: number) {
    executar(async () => carrinho.setDados(await removerDoCarrinho(clienteId, itemId)));
  }

  function fazerPedido(lojaId: number, itens: ItemCarrinho[]) {
    executar(async () => {
      await criarPedido(clienteId, {
        lojaId,
        itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        enderecoEntrega: { rua, ...LAT_LNG_PADRAO },
      });
      // o backend não limpa o carrinho sozinho, então tiramos os itens que viraram pedido
      await Promise.all(itens.map((item) => removerDoCarrinho(clienteId, item.id)));
      navigate(`/cliente/${clienteId}/pedidos`);
    });
  }

  return (
    <>
      <h1>Carrinho</h1>
      {carrinho.erro && <p className="erro">{carrinho.erro}</p>}
      {carrinho.dados?.itens.length === 0 && <p className="nota">Seu carrinho está vazio.</p>}

      {itensPorLoja.size > 0 && (
        <label className="card campo-endereco">
          Endereço de entrega
          <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua, número, bairro" />
        </label>
      )}

      {[...itensPorLoja].map(([lojaId, itens]) => {
        const total = itens.reduce((soma, i) => soma + i.subtotal, 0);
        return (
          <div key={lojaId} className="card bloco">
            <h2>{nomePorId(lojas.dados, lojaId, 'Loja')}</h2>
            {itens.map((item) => (
              <div key={item.id} className="item-lista">
                <Foto foto={produto(item.produtoId)?.foto ?? ''} />
                <span className="cresce">{item.quantidade}× {produto(item.produtoId)?.nome}</span>
                <span>{dinheiro(item.subtotal)}</span>
                <button className="botao-x" onClick={() => remover(item.id)} title="Remover">✕</button>
              </div>
            ))}
            <div className="linha total">
              <strong>Total {dinheiro(total)}</strong>
              <button className="botao" disabled={!rua.trim()} onClick={() => fazerPedido(lojaId, itens)}>
                Fazer pedido
              </button>
            </div>
          </div>
        );
      })}

      {erro && <p className="erro">{erro}</p>}
    </>
  );
}
