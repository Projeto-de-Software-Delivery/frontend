// Chamada HTTP de verdade para o backend (via API Gateway).

import { getAccessToken } from '../auth/tokenProvider';

/** true = usa os dados falsos de mock.ts. Para usar o backend: VITE_USE_MOCK=false no .env */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Sempre /api: na Vercel o vercel.json repassa para o gateway, no dev quem repassa é o proxy do vite.config.ts.
const API_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function http<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const headers: Record<string, string> = corpo ? { 'Content-Type': 'application/json' } : {};

  if (!USE_MOCK) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(API_URL + caminho, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null);
    // Spring manda { message }, FastAPI manda { detail } (texto, ou lista no erro 422)
    const detalhe = Array.isArray(erro?.detail) ? erro.detail[0]?.msg : erro?.detail;
    throw new ApiError(resposta.status, erro?.message || detalhe || `Erro ${resposta.status}`);
  }

  if (resposta.status === 204) return undefined as T;
  return resposta.json();
}
