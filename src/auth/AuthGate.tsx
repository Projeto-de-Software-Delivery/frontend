import { useAuth0 } from '@auth0/auth0-react';
import { useLayoutEffect } from 'react';
import { AppRoutes } from '../AppRoutes';
import { LoginButton } from './LoginButton';
import { setAccessTokenGetter } from './tokenProvider';

/** Só é renderizado quando VITE_USE_MOCK=false (ver App.tsx), dentro do Auth0Provider. */
export function AuthGate() {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } = useAuth0();

  // useLayoutEffect roda antes dos useEffect das páginas, que já buscam dados ao montar.
  // Com useEffect, as primeiras requisições saíam sem token.
  useLayoutEffect(() => {
    setAccessTokenGetter(isAuthenticated ? () => getAccessTokenSilently() : null);
    return () => setAccessTokenGetter(null);
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div className="pagina">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="pagina">
        <h1>Erro ao autenticar</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pagina">
        <div className="card bloco" style={{ maxWidth: 360, margin: '4rem auto', textAlign: 'center' }}>
          <h1>Delivery</h1>
          <p>Entre com sua conta para continuar.</p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}
