import { ArrowLeft, ArrowRight, Bike, ShoppingBag, Store } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { listarClientes } from '../api/clientes';
import { listarEntregadores } from '../api/entregadores';
import { listarLojas } from '../api/lojas';
import { useCarregar } from '../util';

export type TipoUsuario = 'cliente' | 'loja' | 'entregador';

interface Perfil {
  icone: ReactNode;
  titulo: string;
  texto: string;
  escolha: string;
  cadastro: string;
  listar: () => Promise<{ id: number | string; nome: string }[]>;
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
  },
  loja: {
    icone: <Store size={22} />,
    titulo: 'loja',
    texto: 'Aceitar pedidos e cuidar do cardápio.',
    escolha: 'Escolha uma loja…',
    cadastro: 'Cadastrar minha loja',
    listar: listarLojas,
  },
  entregador: {
    icone: <Bike size={22} />,
    titulo: 'entregador',
    texto: 'Ficar disponível, retirar na loja e entregar com o código do cliente.',
    escolha: 'Escolha um entregador…',
    cadastro: 'Quero ser entregador',
    listar: listarEntregadores,
  },
};

export const ehTipoUsuario = (tipo?: string): tipo is TipoUsuario => !!tipo && tipo in PERFIS;

/** Card de um tipo de usuário: escolhe quem é e entra na área dele. */
export function CardPerfil({ tipo }: { tipo: TipoUsuario }) {
  const navigate = useNavigate();
  const perfil = PERFIS[tipo];
  const lista = useCarregar(() => perfil.listar(), [tipo]);
  const [id, setId] = useState('');

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

/** /entrar/:tipo — a entrada de um tipo de usuário só (é para onde o login de cada tipo volta). */
export function Entrar() {
  const { tipo } = useParams();
  if (!ehTipoUsuario(tipo)) return <Navigate to="/" />;

  return (
    <main className="cadastro">
      <Link to="/" className="voltar"><ArrowLeft size={16} /> Início</Link>
      <CardPerfil tipo={tipo} />
    </main>
  );
}
