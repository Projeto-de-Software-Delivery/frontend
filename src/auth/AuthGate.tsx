import { useAuth0 } from '@auth0/auth0-react';
import { useLayoutEffect } from 'react';
import { AppRoutes } from '../AppRoutes';
import { LoginButton } from './LoginButton';
import { TelaAviso, TelaLogin } from './TelaLogin';
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
    return (
      <TelaAviso>
        <span className="carregando" aria-label="Carregando" />
      </TelaAviso>
    );
  }

  if (error) {
    return (
      <TelaAviso titulo="Não foi possível entrar">
        <p className="erro">{error.message}</p>
        <LoginButton />
      </TelaAviso>
    );
  }

  if (!isAuthenticated) {
    return <TelaLogin />;
  }

  return <AppRoutes />;
}
