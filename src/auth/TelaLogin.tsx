import { ArrowLeft, Bike, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Progresso } from '../components/Progresso';
import { ehTipoUsuario, PERFIS, type TipoUsuario } from '../pages/Entrar';
import { LoginButton } from './LoginButton';

const TIPOS: TipoUsuario[] = ['cliente', 'loja', 'entregador'];

/**
 * Tela de quem ainda não entrou (fora do modo mock). Cada tipo de usuário tem o seu link:
 * /entrar/cliente, /entrar/loja e /entrar/entregador. Em "/", mostra os três.
 */
export function TelaLogin() {
  const { tipo } = useParams();
  if (ehTipoUsuario(tipo)) return <TelaLoginDoTipo tipo={tipo} />;

  return (
    <div className="home">
      <header className="home-topo">
        <span className="marca">
          <span className="logo"><Bike size={18} /></span>
          Delivery
        </span>
      </header>

      <section className="destaque">
        <div>
          <span className="selo">Cliente · Loja · Entregador</span>
          <h1>Do carrinho à sua porta, <span className="realce">sem complicação.</span></h1>
          <p className="subtitulo">
            Peça das suas lojas favoritas, acompanhe cada etapa do pedido e receba com o código de entrega.
          </p>
          <div className="chamada-login">
            <LoginButton tipo="cliente" grande />
            <span className="nota com-icone"><ShieldCheck size={15} /> Login seguro com Auth0</span>
          </div>
        </div>

        <div className="card pedido-exemplo" aria-hidden>
          <div className="linha">
            <div>
              <strong>Burger da Vila</strong>
              <p className="nota">Pedido #51 · há 4 min</p>
            </div>
            <span className="status status-EM_ENTREGA">Saiu para entrega</span>
          </div>
          <Progresso status="EM_ENTREGA" />
          <div className="item-lista"><span className="foto">🍔</span><span className="cresce">1× Smash Burger</span><span>R$ 32,90</span></div>
          <div className="item-lista"><span className="foto">🍟</span><span className="cresce">1× Batata Rústica</span><span>R$ 18,00</span></div>
          <div className="linha total">
            <strong>R$ 50,90</strong>
            <span className="pin">Código <strong>1307</strong></span>
          </div>
        </div>
      </section>

      <h2 className="titulo-entrar">Como você quer entrar?</h2>
      <section className="cards-home">
        {TIPOS.map((t) => (
          <div key={t} className="card card-home">
            <span className="icone">{PERFIS[t].icone}</span>
            <h3>Para {t === 'loja' ? 'lojas' : `${t}s`}</h3>
            <p>{PERFIS[t].texto}</p>
            <LoginButton tipo={t} />
            <Link to={`/entrar/${t}`} className="link-pequeno">Link de entrada: /entrar/{t}</Link>
          </div>
        ))}
      </section>
    </div>
  );
}

/** /entrar/{tipo} sem login: só o login daquele tipo. */
function TelaLoginDoTipo({ tipo }: { tipo: TipoUsuario }) {
  const perfil = PERFIS[tipo];
  return (
    <main className="cadastro">
      <Link to="/" className="voltar"><ArrowLeft size={16} /> Início</Link>
      <div className="card card-home">
        <span className="icone">{perfil.icone}</span>
        <h1>Entrar como {perfil.titulo}</h1>
        <p>{perfil.texto}</p>
        <LoginButton tipo={tipo} grande />
        <span className="nota com-icone"><ShieldCheck size={15} /> Login seguro com Auth0</span>
      </div>
    </main>
  );
}

/** Tela cheia centralizada, usada enquanto o Auth0 carrega ou quando dá erro. */
export function TelaAviso({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="tela-aviso">
      <span className="logo logo-grande"><Bike size={26} /></span>
      {titulo && <h1>{titulo}</h1>}
      {children}
    </div>
  );
}
