import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarCliente } from '../../api/clientes';
import { listarLojas } from '../../api/lojas';
import { listarProdutos } from '../../api/produtos';
import { Foto } from '../../components/Foto';
import { useCarregar } from '../../util';

export function Lojas() {
  const clienteId = Number(useParams().clienteId);
  const cliente = useCarregar(() => buscarCliente(clienteId), [clienteId]);
  const lojas = useCarregar(() => listarLojas(), []);
  const produtos = useCarregar(() => listarProdutos(), []);
  const [busca, setBusca] = useState('');

  const primeiroNome = cliente.dados?.nome.split(' ')[0];
  const lojasFiltradas = (lojas.dados ?? []).filter((loja) =>
    loja.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <section className="boas-vindas">
        <h1>Olá{primeiroNome && `, ${primeiroNome}`}</h1>
        <p>O que vai pedir hoje?</p>
        <div className="busca">
          <Search size={18} />
          <input placeholder="Buscar loja…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </section>

      {lojas.carregando && <p className="nota">Carregando…</p>}
      {lojas.erro && <p className="erro">{lojas.erro}</p>}

      <div className="grade">
        {lojasFiltradas.map((loja) => {
          const produtosDaLoja = produtos.dados?.filter((p) => p.lojaId === loja.id) ?? [];
          const categorias = [...new Set(produtosDaLoja.map((p) => p.categoria))];
          return (
            <Link key={loja.id} to={`lojas/${loja.id}`} className="card card-loja">
              {/* a "capa" da loja é a foto do primeiro produto dela */}
              <Foto foto={produtosDaLoja[0]?.foto ?? '🏪'} id={loja.id} grande />
              <h2>{loja.nome}</h2>
              <p className="nota">{categorias.join(' · ') || 'Sem produtos ainda'}</p>
            </Link>
          );
        })}
      </div>
      {lojas.dados && lojasFiltradas.length === 0 && <p className="nota">Nenhuma loja encontrada.</p>}
    </>
  );
}
