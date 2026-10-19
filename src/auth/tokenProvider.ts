// Ponte entre o Auth0Provider (React) e http.ts (função comum, fora de componente).
// AuthGate registra o getter assim que o usuário está autenticado; http.ts só lê.

type TokenGetter = () => Promise<string | undefined>;

let getter: TokenGetter | null = null;

export function setAccessTokenGetter(fn: TokenGetter | null) {
  getter = fn;
}

export async function getAccessToken(): Promise<string | null> {
  if (!getter) return null;
  try {
    return (await getter()) ?? null;
  } catch (erro) {
    console.error('Erro ao obter token de acesso do Auth0:', erro);
    return null;
  }
}
