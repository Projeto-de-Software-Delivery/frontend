import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { alterarQuantidade, buscarCarrinho, removerDoCarrinho } from '../../api/carrinho';
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

  // o estoque pode ter baixado depois que o item entrou no carrinho
  const passaDoEstoque = (item: ItemCarrinho) => item.quantidade > (produto(item.produtoId)?.estoque ?? Infinity);

  function remover(itemId: number) {
    executar(async () => carrinho.setDados(await removerDoCarrinho(clienteId, itemId)));
  }

  function mudarQuantidade(item: ItemCarrinho, quantidade: number) {
    if (quantidade < 1) return remover(item.id);
    executar(async () => carrinho.setDados(await alterarQuantidade(clienteId, item.id, quantidade)));
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
      {carrinho.dados?.itens.length === 0 && (
        <p className="vazio">
          🛒<br />Seu carrinho está vazio.<br />
          <Link to={`/cliente/${clienteId}`}>Ver lojas</Link>
        </p>
      )}

      {itensPorLoja.size > 0 && (
        <label className="card campo-endereco">
          Endereço de entrega
          <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua, número, bairro" />
        </label>
      )}

      {[...itensPorLoja].map(([lojaId, itens]) => {
        const total = itens.reduce((soma, i) => soma + i.subtotal, 0);
        const algumPassaDoEstoque = itens.some(passaDoEstoque);
        return (
          <div key={lojaId} className="card bloco">
            <div className="linha">
              <h2>{nomePorId(lojas.dados, lojaId, 'Loja')}</h2>
              <Link to={`/cliente/${clienteId}/lojas/${lojaId}`} className="botao-claro">
                <Plus size={15} /> Adicionar mais itens
              </Link>
            </div>
            {itens.map((item) => {
              const estoque = produto(item.produtoId)?.estoque ?? 0;
              return (
                <div key={item.id} className="item-lista">
                  <Foto foto={produto(item.produtoId)?.foto ?? ''} />
                  <div className="cresce">
                    <span>{produto(item.produtoId)?.nome}</span>
                    {passaDoEstoque(item) && (
                      <div className="nota esgotado">Só restam {estoque} em estoque</div>
                    )}
                  </div>
                  <div className="contador">
                    <button onClick={() => mudarQuantidade(item, item.quantidade - 1)} title="Tirar um">−</button>
                    <span>{item.quantidade}</span>
                    <button
                      onClick={() => mudarQuantidade(item, item.quantidade + 1)}
                      disabled={item.quantidade >= estoque}
                      title={item.quantidade >= estoque ? 'Não tem mais em estoque' : 'Mais um'}
                    >
                      +
                    </button>
                  </div>
                  <span className="preco-item">{dinheiro(item.subtotal)}</span>
                  <button className="botao-x" onClick={() => remover(item.id)} title="Remover">✕</button>
                </div>
              );
            })}
            <div className="linha total">
              <strong>Total {dinheiro(total)}</strong>
              <button
                className="botao"
                disabled={!rua.trim() || algumPassaDoEstoque}
                title={algumPassaDoEstoque ? 'Ajuste as quantidades ao estoque' : undefined}
                onClick={() => fazerPedido(lojaId, itens)}
              >
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
