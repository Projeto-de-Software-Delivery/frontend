import { Bike } from 'lucide-react';
import { USE_MOCK } from '../api/http';
import { resetarMock } from '../api/mock';
import { Progresso } from '../components/Progresso';
import { CardPerfil } from './Entrar';

/** Tela inicial: apresenta o app e escolhe se vai entrar como cliente, loja ou entregador. */
export function Home() {
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
          <CardPerfil tipo="cliente" />
          <CardPerfil tipo="loja" />
          <CardPerfil tipo="entregador" />
        </div>
      </section>

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
