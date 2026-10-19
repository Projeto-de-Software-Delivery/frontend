import { AppRoutes } from './AppRoutes';
import { USE_MOCK } from './api/http';
import { AuthGate } from './auth/AuthGate';

/**
 * Em modo mock não há backend nem Auth0 configurado: pula direto para as rotas.
 * Fora do mock, exige login (ver main.tsx, que só monta o Auth0Provider aqui).
 */
export function App() {
  if (USE_MOCK) return <AppRoutes />;
  return <AuthGate />;
}
