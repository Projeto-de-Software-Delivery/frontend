import { Auth0Provider } from '@auth0/auth0-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { USE_MOCK } from './api/http';
import './styles.css';

const conteudo = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Em modo mock não precisa de Auth0 configurado: roda sem o Provider.
const raiz = USE_MOCK ? (
  conteudo
) : (
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: window.location.origin,
    }}
  >
    {conteudo}
  </Auth0Provider>
);

createRoot(document.getElementById('root')!).render(raiz);
