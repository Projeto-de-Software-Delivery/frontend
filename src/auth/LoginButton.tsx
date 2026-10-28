import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRight } from 'lucide-react';
import type { TipoUsuario } from '../pages/Entrar';

/** Com `tipo`, depois do login volta para /entrar/{tipo} (ver onRedirectCallback em main.tsx). */
export function LoginButton({ tipo, grande = false, claro = false }: { tipo?: TipoUsuario; grande?: boolean; claro?: boolean }) {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className={`${claro ? 'botao-claro' : 'botao'}${grande ? ' botao-grande' : ''}`}
      onClick={() => loginWithRedirect(tipo ? { appState: { returnTo: `/entrar/${tipo}` } } : undefined)}
    >
      {tipo ? `Entrar como ${tipo}` : 'Entrar'} {!claro && <ArrowRight size={grande ? 18 : 16} />}
    </button>
  );
}
