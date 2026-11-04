// Teste de integração: AuthGate decide entre tela de login e a aplicação de
// verdade (AppRoutes) olhando só para o estado do Auth0. Como não há backend
// real disponível aqui, mockamos o hook useAuth0 (não o AuthGate) e deixamos
// o resto da árvore (AppRoutes -> Home, etc.) renderizar normalmente.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from './AuthGate';
import { getAccessToken, setAccessTokenGetter } from './tokenProvider';

const getAccessTokenSilentlyMock = vi.fn().mockResolvedValue('token-de-teste');

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(),
}));

import { useAuth0 } from '@auth0/auth0-react';

function renderAuthGate(rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthGate />
    </MemoryRouter>,
  );
}

describe('AuthGate', () => {
  beforeEach(() => {
    setAccessTokenGetter(null);
  });

  afterEach(() => {
    setAccessTokenGetter(null);
    vi.clearAllMocks();
  });

  it('mostra a tela de carregando enquanto o Auth0 ainda está carregando', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: undefined,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);

    renderAuthGate();

    expect(screen.getByLabelText('Carregando')).toBeInTheDocument();
  });

  it('mostra a tela de login quando o usuário não está autenticado', async () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: undefined,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);

    renderAuthGate();

    // Marcador exclusivo da tela de login (Home também tem "Como você quer entrar?").
    expect(screen.getByText('Login seguro com Auth0')).toBeInTheDocument();
    // Fora do mock, http.ts não deve ter um getter de token (ninguém logado).
    await expect(getAccessToken()).resolves.toBeNull();
  });

  it('mostra o conteúdo protegido (AppRoutes) quando o usuário está autenticado', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: undefined,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);

    renderAuthGate();

    // "/" com usuário autenticado cai na Home de verdade (dentro de AppRoutes),
    // não na tela de login (que também tem "Como você quer entrar?", então o
    // marcador exclusivo do login é a melhor forma de garantir que não é ela).
    expect(screen.getByText(/Do carrinho à sua porta/)).toBeInTheDocument();
    expect(screen.queryByText('Login seguro com Auth0')).not.toBeInTheDocument();
  });

  it('registra o getter de token quando autenticado, e limpa quando desautentica', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <AuthGate />
      </MemoryRouter>,
    );

    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: undefined,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <AuthGate />
      </MemoryRouter>,
    );

    await expect(getAccessToken()).resolves.toBe('token-de-teste');

    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: undefined,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <AuthGate />
      </MemoryRouter>,
    );

    await expect(getAccessToken()).resolves.toBeNull();
  });

  it('mostra a mensagem de erro e o botão de login de novo quando o Auth0 retorna erro', () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: { message: 'Falha ao autenticar', name: 'Error' },
      getAccessTokenSilently: getAccessTokenSilentlyMock,
    } as unknown as ReturnType<typeof useAuth0>);

    renderAuthGate();

    expect(screen.getByText('Não foi possível entrar')).toBeInTheDocument();
    expect(screen.getByText('Falha ao autenticar')).toBeInTheDocument();
  });
});
