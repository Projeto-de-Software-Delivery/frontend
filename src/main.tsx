import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { App } from './App';
import { USE_MOCK } from './api/http';
import './styles.css';

/** Auth0 dentro do router: depois do login, volta para a página do tipo de usuário (appState.returnTo). */
function Auth0ComRotas({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={(appState?: AppState) => navigate(appState?.returnTo ?? '/', { replace: true })}
    >
      {children}
    </Auth0Provider>
  );
}

// Em modo mock não precisa de Auth0 configurado: roda sem o Provider.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {USE_MOCK ? <App /> : <Auth0ComRotas><App /></Auth0ComRotas>}
    </BrowserRouter>
  </StrictMode>,
);
