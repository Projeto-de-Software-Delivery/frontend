import { Bike, ShieldCheck, ShoppingBag, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { Progresso } from '../components/Progresso';
import { LoginButton } from './LoginButton';

const PERFIS = [
  { icone: <ShoppingBag size={22} />, titulo: 'Para clientes', texto: 'Escolha a loja, monte o carrinho e acompanhe cada etapa do pedido.' },
  { icone: <Store size={22} />, titulo: 'Para lojas', texto: 'Receba pedidos, aceite ou recuse e mantenha o cardápio em dia.' },
  { icone: <Bike size={22} />, titulo: 'Para entregadores', texto: 'Fique disponível, retire na loja e finalize com o código do cliente.' },
];

/** Tela de quem ainda não entrou (fora do modo mock): apresenta o app e chama o login do Auth0. */
export function TelaLogin() {
  return (
    <div className="home">
      <header className="home-topo">
        <span className="marca">
          <span className="logo"><Bike size={18} /></span>
          Delivery
        </span>
        <LoginButton claro />
      </header>

      <section className="destaque">
        <div>
          <span className="selo">Cliente · Loja · Entregador</span>
          <h1>Do carrinho à sua porta, <span className="realce">sem complicação.</span></h1>
          <p className="subtitulo">
            Peça das suas lojas favoritas, acompanhe cada etapa do pedido e receba com o código de entrega.
          </p>
          <div className="chamada-login">
            <LoginButton grande />
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

      <section className="cards-home">
        {PERFIS.map((perfil) => (
          <div key={perfil.titulo} className="card card-home">
            <span className="icone">{perfil.icone}</span>
            <h3>{perfil.titulo}</h3>
            <p>{perfil.texto}</p>
          </div>
        ))}
      </section>
    </div>
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
