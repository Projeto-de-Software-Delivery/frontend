import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarClientes } from '../api/clientes';
import { USE_MOCK } from '../api/http';
import { listarLojas } from '../api/lojas';
import { resetarMock } from '../api/mock';
import { useCarregar } from '../util';

/** Tela inicial: escolhe se vai usar o app como cliente, loja ou entregador. */
export function Home() {
  const navigate = useNavigate();
  const clientes = useCarregar(() => listarClientes(), []);
  const lojas = useCarregar(() => listarLojas(), []);
  const [clienteId, setClienteId] = useState('');
  const [lojaId, setLojaId] = useState('');

  return (
    <main className="home">
      <h1>🛵 Delivery</h1>
      <p className="subtitulo">Escolha como você quer entrar</p>

      <div className="cards-home">
        <div className="card card-home">
          <span className="icone">🍔</span>
          <h2>Cliente</h2>
          <p>Ver lojas, montar o carrinho e acompanhar pedidos.</p>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Escolha um cliente…</option>
            {clientes.dados?.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button className="botao" disabled={!clienteId} onClick={() => navigate(`/cliente/${clienteId}`)}>
            Entrar
          </button>
          <Link to="/cadastro/cliente" className="link-pequeno">Cadastrar novo cliente</Link>
        </div>

        <div className="card card-home">
          <span className="icone">🏪</span>
          <h2>Loja</h2>
          <p>Aceitar pedidos e cuidar do cardápio.</p>
          <select value={lojaId} onChange={(e) => setLojaId(e.target.value)}>
            <option value="">Escolha uma loja…</option>
            {lojas.dados?.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
          <button className="botao" disabled={!lojaId} onClick={() => navigate(`/loja/${lojaId}`)}>
            Entrar
          </button>
          <Link to="/cadastro/loja" className="link-pequeno">Cadastrar nova loja</Link>
        </div>

        <div className="card card-home">
          <span className="icone">🛵</span>
          <h2>Entregadores</h2>
          <p>Cadastro e disponibilidade dos entregadores.</p>
          <button className="botao" onClick={() => navigate('/entregadores')}>Entrar</button>
        </div>
      </div>

      {(clientes.erro || lojas.erro) && <p className="erro">{clientes.erro || lojas.erro}</p>}

      {USE_MOCK && (
        <p className="nota">
          Usando dados de mentira (mock), salvos no navegador.{' '}
          <button
            className="link-pequeno"
            onClick={() => {
              resetarMock();
              window.location.reload();
            }}
          >
            Restaurar dados iniciais
          </button>
        </p>
      )}
    </main>
  );
}
