import { ArrowRight, Bike, ShoppingBag, Store } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarClientes } from '../api/clientes';
import { USE_MOCK } from '../api/http';
import { listarLojas } from '../api/lojas';
import { resetarMock } from '../api/mock';
import { Progresso } from '../components/Progresso';
import { useCarregar } from '../util';

/** Tela inicial: apresenta o app e escolhe se vai entrar como cliente, loja ou entregador. */
export function Home() {
  const navigate = useNavigate();
  const clientes = useCarregar(() => listarClientes(), []);
  const lojas = useCarregar(() => listarLojas(), []);
  const [clienteId, setClienteId] = useState('');
  const [lojaId, setLojaId] = useState('');

  return (
    <div className="home">
      <header className="home-topo">
        <span className="marca">
          <span className="logo"><Bike size={18} /></span>
          Delivery
        </span>
        {USE_MOCK && <span className="tag-mock">Modo demo</span>}
      </header>

      {/* Destaque: texto à esquerda, pedido de exemplo à direita */}
      <section className="destaque">
        <div>
          <span className="selo">Cliente · Loja · Entregador</span>
          <h1>Do carrinho à sua porta, <span className="realce">sem complicação.</span></h1>
          <p className="subtitulo">
            Peça das suas lojas favoritas, acompanhe cada etapa do pedido e receba com o código de entrega.
          </p>
        </div>

        <div className="card pedido-exemplo" aria-hidden>
          <div className="linha">
            <div>
              <strong>Burger da Vila</strong>
              <p className="nota">Pedido #51 · há 4 min</p>
            </div>
            <span className="status status-VALIDADO">Em preparo</span>
          </div>
          <Progresso status="VALIDADO" />
          <div className="item-lista"><span className="foto">🍔</span><span className="cresce">1× Smash Burger</span><span>R$ 32,90</span></div>
          <div className="item-lista"><span className="foto">🍟</span><span className="cresce">1× Batata Rústica</span><span>R$ 18,00</span></div>
          <div className="linha total">
            <strong>R$ 50,90</strong>
            <span className="pin">Código <strong>1307</strong></span>
          </div>
        </div>
      </section>

      {/* Escolher como entrar */}
      <section>
        <h2 className="titulo-entrar">Como você quer entrar?</h2>
        <div className="cards-home">
          <div className="card card-home">
            <span className="icone"><ShoppingBag size={22} /></span>
            <h3>Sou cliente</h3>
            <p>Ver lojas, montar o carrinho e acompanhar pedidos.</p>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Escolha um cliente…</option>
              {clientes.dados?.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <button className="botao" disabled={!clienteId} onClick={() => navigate(`/cliente/${clienteId}`)}>
              Entrar <ArrowRight size={16} />
            </button>
            <Link to="/cadastro/cliente" className="link-pequeno">Criar conta de cliente</Link>
          </div>

          <div className="card card-home">
            <span className="icone"><Store size={22} /></span>
            <h3>Sou loja</h3>
            <p>Aceitar pedidos e cuidar do cardápio.</p>
            <select value={lojaId} onChange={(e) => setLojaId(e.target.value)}>
              <option value="">Escolha uma loja…</option>
              {lojas.dados?.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
            <button className="botao" disabled={!lojaId} onClick={() => navigate(`/loja/${lojaId}`)}>
              Entrar <ArrowRight size={16} />
            </button>
            <Link to="/cadastro/loja" className="link-pequeno">Cadastrar minha loja</Link>
          </div>

          <div className="card card-home">
            <span className="icone"><Bike size={22} /></span>
            <h3>Entregadores</h3>
            <p>Cadastro e disponibilidade de quem faz as entregas.</p>
            <button className="botao" onClick={() => navigate('/entregadores')}>
              Entrar <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {(clientes.erro || lojas.erro) && <p className="erro">{clientes.erro || lojas.erro}</p>}

      {USE_MOCK && (
        <p className="nota rodape">
          Modo demo: os dados são de mentira e ficam salvos no navegador.{' '}
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
    </div>
  );
}
