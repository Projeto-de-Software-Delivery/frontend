import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRight } from 'lucide-react';

export function LoginButton({ grande = false, claro = false }: { grande?: boolean; claro?: boolean }) {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className={`${claro ? 'botao-claro' : 'botao'}${grande ? ' botao-grande' : ''}`}
      onClick={() => loginWithRedirect()}
    >
      Entrar {!claro && <ArrowRight size={grande ? 18 : 16} />}
    </button>
  );
}
