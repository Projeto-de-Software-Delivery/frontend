import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { atualizarProduto, criarProduto, deletarProduto, listarProdutos } from '../../api/produtos';
import { Foto } from '../../components/Foto';
import type { Produto } from '../../types';
import { dinheiro, useAcao, useCarregar } from '../../util';

const FORM_VAZIO = { nome: '', categoria: '', preco: '', estoque: '', foto: '' };

/** Cardápio da loja: cadastrar, mudar estoque e excluir produtos. */
export function Produtos() {
  const lojaId = Number(useParams().lojaId);
  const produtos = useCarregar(() => listarProdutos(lojaId), [lojaId]);
  const { erro, executar } = useAcao();
  const [form, setForm] = useState(FORM_VAZIO);

  function cadastrar(e: FormEvent) {
    e.preventDefault();
    executar(async () => {
      await criarProduto({
        lojaId,
        nome: form.nome,
        categoria: form.categoria,
        preco: Number(form.preco),
        estoque: Number(form.estoque),
        foto: form.foto || '🍽️',
      });
      setForm(FORM_VAZIO);
      produtos.recarregar();
    });
  }

  function mudarEstoque(produto: Produto, diferenca: number) {
    const { id, ...dados } = produto;
    executar(async () => {
      await atualizarProduto(id, { ...dados, estoque: Math.max(0, produto.estoque + diferenca) });
      produtos.recarregar();
    });
  }

  function excluir(produto: Produto) {
    if (!confirm(`Excluir ${produto.nome}?`)) return;
    executar(async () => {
      await deletarProduto(produto.id);
      produtos.recarregar();
    });
  }

  const campo = (nome: keyof typeof FORM_VAZIO) => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [nome]: e.target.value }),
  });

  return (
    <>
      <h1>Cardápio</h1>

      <form className="card form-linha" onSubmit={cadastrar}>
        <label>Nome<input required {...campo('nome')} /></label>
        <label>Categoria<input required {...campo('categoria')} /></label>
        <label>Preço<input required type="number" min="0.01" step="0.01" {...campo('preco')} /></label>
        <label>Estoque<input required type="number" min="0" {...campo('estoque')} /></label>
        <label>Foto (URL ou emoji)<input {...campo('foto')} placeholder="🍕" /></label>
        <button className="botao">Adicionar</button>
      </form>
      {(erro || produtos.erro) && <p className="erro">{erro || produtos.erro}</p>}

      <div className="card bloco">
        {produtos.dados?.length === 0 && <p className="nota">Nenhum produto cadastrado.</p>}
        {produtos.dados?.map((produto) => (
          <div key={produto.id} className="item-lista">
            <Foto foto={produto.foto} />
            <div className="cresce">
              <strong>{produto.nome}</strong>
              <div className="nota">{produto.categoria} · {dinheiro(produto.preco)}</div>
            </div>
            <div className="contador">
              <button onClick={() => mudarEstoque(produto, -1)}>−</button>
              <span className={produto.estoque === 0 ? 'esgotado' : ''}>{produto.estoque}</span>
              <button onClick={() => mudarEstoque(produto, 1)}>+</button>
            </div>
            <button className="botao-x" onClick={() => excluir(produto)} title="Excluir">✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
