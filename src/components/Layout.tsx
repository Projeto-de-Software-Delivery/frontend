import { Bike } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { USE_MOCK } from '../api/http';
import { LogoutButton } from '../auth/LogoutButton';

interface Props {
  titulo: string;
  links: { para: string; texto: string }[];
}

/** Cabeçalho com o menu de cada área (cliente, loja, entregador). */
export function Layout({ titulo, links }: Props) {
  return (
    <>
      <header className="topo">
        <div className="topo-conteudo">
          <Link to="/" className="marca">
            <span className="logo"><Bike size={18} /></span>
            Delivery
          </Link>
          <span className="area">{titulo}</span>
          <nav>
            {links.map((link) => (
              <NavLink key={link.para} to={link.para} end>
                {link.texto}
              </NavLink>
            ))}
          </nav>
          {USE_MOCK && <span className="tag-mock" title="Dados falsos, salvos no navegador">Modo demo</span>}
          {!USE_MOCK && <LogoutButton />}
        </div>
      </header>
      <main className="pagina">
        <Outlet />
      </main>
    </>
  );
}
