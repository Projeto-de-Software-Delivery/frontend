import { ArrowLeft, ArrowRight, Bike, ShoppingBag, Store } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { buscarMeuCliente, listarClientes } from '../api/clientes';
import { buscarMeuEntregador, listarEntregadores } from '../api/entregadores';
import { ApiError, USE_MOCK } from '../api/http';
import { buscarMinhaLoja, listarLojas } from '../api/lojas';
import { TelaAviso } from '../auth/TelaLogin';
import { useCarregar } from '../util';

export type TipoUsuario = 'cliente' | 'loja' | 'entregador';

interface Perfil {
  icone: ReactNode;
  titulo: string;
  texto: string;
  escolha: string;
  cadastro: string;
  listar: () => Promise<{ id: number | string; nome: string }[]>;
  buscarMeu: () => Promise<{ id: number | string; nome: string }>;
}

/** Os três tipos de usuário. Cada um tem o seu link de entrada: /entrar/cliente, /entrar/loja, /entrar/entregador. */
export const PERFIS: Record<TipoUsuario, Perfil> = {
  cliente: {
    icone: <ShoppingBag size={22} />,
    titulo: 'cliente',
    texto: 'Ver lojas, montar o carrinho e acompanhar pedidos.',
    escolha: 'Escolha um cliente…',
    cadastro: 'Criar conta de cliente',
    listar: listarClientes,
    buscarMeu: buscarMeuCliente,
  },
  loja: {
    icone: <Store size={22} />,
    titulo: 'loja',
    texto: 'Aceitar pedidos e cuidar do cardápio.',
    escolha: 'Escolha uma loja…',
    cadastro: 'Cadastrar minha loja',
    listar: listarLojas,
    buscarMeu: buscarMinhaLoja,
  },
  entregador: {
    icone: <Bike size={22} />,
    titulo: 'entregador',
    texto: 'Ficar disponível, retirar na loja e entregar com o código do cliente.',
    escolha: 'Escolha um entregador…',
    cadastro: 'Quero ser entregador',
    listar: listarEntregadores,
    buscarMeu: buscarMeuEntregador,
  },
};

export const ehTipoUsuario = (tipo?: string): tipo is TipoUsuario => !!tipo && tipo in PERFIS;

/** Card de um tipo de usuário. No modo demo exibe select com dados falsos; fora do mock vai direto ao perfil/cadastro. */
export function CardPerfil({ tipo }: { tipo: TipoUsuario }) {
  const navigate = useNavigate();
  const perfil = PERFIS[tipo];
  const lista = useCarregar(() => (USE_MOCK ? perfil.listar() : Promise.resolve([])), [tipo]);
  const [id, setId] = useState('');

  if (!USE_MOCK) {
    return (
      <div className="card card-home">
        <span className="icone">{perfil.icone}</span>
        <h3>Sou {perfil.titulo}</h3>
        <p>{perfil.texto}</p>
        <button className="botao" onClick={() => navigate(`/entrar/${tipo}`)}>
          Acessar como {perfil.titulo} <ArrowRight size={16} />
        </button>
        <Link to={`/cadastro/${tipo}`} className="link-pequeno">{perfil.cadastro}</Link>
      </div>
    );
  }

  return (
    <div className="card card-home">
      <span className="icone">{perfil.icone}</span>
      <h3>Sou {perfil.titulo}</h3>
      <p>{perfil.texto}</p>
      <select value={id} onChange={(e) => setId(e.target.value)}>
        <option value="">{perfil.escolha}</option>
        {lista.dados?.map((item) => (
          <option key={item.id} value={item.id}>{item.nome}</option>
        ))}
      </select>
      {lista.erro && <p className="erro">{lista.erro}</p>}
      <button className="botao" disabled={!id} onClick={() => navigate(`/${tipo}/${id}`)}>
        Entrar <ArrowRight size={16} />
      </button>
      <Link to={`/cadastro/${tipo}`} className="link-pequeno">{perfil.cadastro}</Link>
    </div>
  );
}

/** Resolve automaticamente o usuário logado via Auth0/Backend sem expor outros usuários da plataforma. */
function ResolucaoUsuario({ tipo }: { tipo: TipoUsuario }) {
  const navigate = useNavigate();
  const perfil = PERFIS[tipo];
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    perfil.buscarMeu()
      .then((meuPerfil) => {
        if (!ativo) return;
        navigate(`/${tipo}/${meuPerfil.id}`, { replace: true });
      })
      .catch((err) => {
        if (!ativo) return;
        // 404 = usuário autenticado no Auth0, mas ainda não completou o cadastro deste tipo
        // 400/422 = backend ainda não possui a rota /me e tratou "me" como id numérico/UUID inválido
        if (err instanceof ApiError && (err.status === 404 || err.status === 400 || err.status === 422)) {
          navigate(`/cadastro/${tipo}`, { replace: true });
          return;
        }
        setErro(err?.message || 'Não foi possível carregar seu perfil.');
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [tipo, perfil, navigate]);

  if (carregando) {
    return (
      <TelaAviso titulo={`Acessando como ${perfil.titulo}`}>
        <span className="carregando" aria-label="Identificando cadastro" />
        <p className="nota">Identificando seu cadastro...</p>
      </TelaAviso>
    );
  }

  return (
    <main className="cadastro">
      <Link to="/" className="voltar"><ArrowLeft size={16} /> Início</Link>
      <div className="card card-home">
        <span className="icone">{perfil.icone}</span>
        <h3>Sou {perfil.titulo}</h3>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
        <Link to={`/cadastro/${tipo}`} className="link-pequeno">{perfil.cadastro}</Link>
      </div>
    </main>
  );
}

/** /entrar/:tipo — entrada do tipo de usuário pós-login. */
export function Entrar() {
  const { tipo } = useParams();
  if (!ehTipoUsuario(tipo)) return <Navigate to="/" />;

  if (USE_MOCK) {
    return (
      <main className="cadastro">
        <Link to="/" className="voltar"><ArrowLeft size={16} /> Início</Link>
        <CardPerfil tipo={tipo} />
      </main>
    );
  }

  return <ResolucaoUsuario tipo={tipo} />;
}
