import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adicionarAoCarrinho } from '../../api/carrinho';
import { buscarLoja } from '../../api/lojas';
import { listarProdutos } from '../../api/produtos';
import { Foto } from '../../components/Foto';
import type { Produto } from '../../types';
import { dinheiro, useAcao, useCarregar } from '../../util';

/** Cardápio de uma loja, separado por categoria. */
export function Loja() {
  const clienteId = Number(useParams().clienteId);
  const lojaId = Number(useParams().lojaId);
  const loja = useCarregar(() => buscarLoja(lojaId), [lojaId]);
  const produtos = useCarregar(() => listarProdutos(lojaId), [lojaId]);
  const { erro, executar } = useAcao();
  const [aviso, setAviso] = useState('');

  async function adicionar(produto: Produto) {
    setAviso('');
    if (await executar(() => adicionarAoCarrinho(clienteId, produto.id, 1))) {
      setAviso(`${produto.foto} ${produto.nome} foi para o carrinho`);
    }
  }

  const categorias = [...new Set(produtos.dados?.map((p) => p.categoria))];

  return (
    <>
      <Link to={`/cliente/${clienteId}`} className="voltar">← Lojas</Link>

      <section className="cabecalho-loja">
        <Foto foto={produtos.dados?.[0]?.foto ?? '🏪'} id={lojaId} grande />
        <div>
          <h1>{loja.dados?.nome}</h1>
          <p className="nota">📍 {loja.dados?.endereco}</p>
        </div>
      </section>

      {(erro || loja.erro || produtos.erro) && <p className="erro">{erro || loja.erro || produtos.erro}</p>}
      {aviso && (
        <p className="aviso">
          {aviso} · <Link to={`/cliente/${clienteId}/carrinho`}>ver carrinho →</Link>
        </p>
      )}

      {categorias.map((categoria) => (
        <section key={categoria}>
          <h2 className="titulo-secao">{categoria}</h2>
          <div className="grade">
            {produtos.dados?.filter((p) => p.categoria === categoria).map((produto) => (
              <div key={produto.id} className={`card card-produto ${produto.estoque === 0 ? 'indisponivel' : ''}`}>
                <Foto foto={produto.foto} id={produto.id} grande />
                <h3>{produto.nome}</h3>
                {produto.estoque > 0 && produto.estoque <= 3 && (
                  <span className="etiqueta">Últimas {produto.estoque} unidades</span>
                )}
                <div className="linha">
                  <strong>{dinheiro(produto.preco)}</strong>
                  {produto.estoque > 0 ? (
                    <button className="botao" onClick={() => adicionar(produto)}>+ Adicionar</button>
                  ) : (
                    <span className="nota">Esgotado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {produtos.dados?.length === 0 && <p className="nota">Essa loja ainda não tem produtos.</p>}
    </>
  );
}
