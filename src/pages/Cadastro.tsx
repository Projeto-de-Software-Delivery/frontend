import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarCliente } from '../api/clientes';
import { criarEntregador } from '../api/entregadores';
import { USE_MOCK } from '../api/http';
import { criarLoja } from '../api/lojas';
import type { Veiculo } from '../types';
import { useAcao } from '../util';

function PreencherAuth0({ onDados }: { onDados: (dados: { nome?: string; email?: string }) => void }) {
  const { user } = useAuth0();
  useEffect(() => {
    if (user) {
      onDados({ nome: user.name, email: user.email });
    }
  }, [user, onDados]);
  return null;
}

// POST /clientes
export function CadastroCliente() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const { erro, executar } = useAcao();

  const campo = (nome: keyof typeof form) => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [nome]: e.target.value }),
  });

  function enviar(e: FormEvent) {
    e.preventDefault();
    executar(async () => {
      const cliente = await criarCliente(form);
      navigate(`/cliente/${cliente.id}`);
    });
  }

  return (
    <main className="cadastro">
      {!USE_MOCK && (
        <PreencherAuth0
          onDados={({ nome, email }) => {
            setForm((prev) => ({
              ...prev,
              nome: prev.nome || nome || '',
              email: prev.email || email || '',
            }));
          }}
        />
      )}
      <Link to="/" className="voltar">← Voltar</Link>
      <form className="card formulario" onSubmit={enviar}>
        <h1>Novo cliente</h1>
        <label>Nome<input required {...campo('nome')} /></label>
        <label>E-mail<input required type="email" {...campo('email')} /></label>
        <label>Telefone<input required {...campo('telefone')} /></label>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao">Cadastrar</button>
      </form>
    </main>
  );
}

// POST /lojas
export function CadastroLoja() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', cnpj: '', endereco: '' });
  const { erro, executar } = useAcao();

  const campo = (nome: keyof typeof form) => ({
    value: form[nome],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [nome]: e.target.value }),
  });

  function enviar(e: FormEvent) {
    e.preventDefault();
    executar(async () => {
      // o backend só aceita os 14 números, sem pontos e barras, e responde 400 sem mensagem
      const cnpj = form.cnpj.replace(/\D/g, '');
      if (cnpj.length !== 14) throw new Error(`O CNPJ precisa ter 14 números (você digitou ${cnpj.length})`);
      const loja = await criarLoja({ nome: form.nome.trim(), cnpj, endereco: form.endereco.trim() });
      navigate(`/loja/${loja.id}`);
    });
  }

  return (
    <main className="cadastro">
      <Link to="/" className="voltar">← Voltar</Link>
      <form className="card formulario" onSubmit={enviar}>
        <h1>Nova loja</h1>
        <label>Nome<input required pattern=".*\S.*" {...campo('nome')} /></label>
        <label>CNPJ<input required inputMode="numeric" placeholder="00.000.000/0000-00" {...campo('cnpj')} /></label>
        <label>Endereço<input required pattern=".*\S.*" {...campo('endereco')} /></label>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao">Cadastrar</button>
      </form>
    </main>
  );
}

// POST /entregadores  (começa DISPONIVEL)
export function CadastroEntregador() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [veiculo, setVeiculo] = useState<Veiculo>('MOTO');
  const { erro, executar } = useAcao();

  function enviar(e: FormEvent) {
    e.preventDefault();
    executar(async () => {
      const entregador = await criarEntregador({ nome, veiculo });
      navigate(`/entregador/${entregador.id}`);
    });
  }

  return (
    <main className="cadastro">
      {!USE_MOCK && (
        <PreencherAuth0
          onDados={({ nome: nomeAuth }) => {
            if (nomeAuth) setNome((prev) => prev || nomeAuth);
          }}
        />
      )}
      <Link to="/" className="voltar">← Voltar</Link>
      <form className="card formulario" onSubmit={enviar}>
        <h1>Novo entregador</h1>
        <label>Nome<input required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label>
          Veículo
          <select value={veiculo} onChange={(e) => setVeiculo(e.target.value as Veiculo)}>
            <option value="MOTO">Moto</option>
            <option value="CARRO">Carro</option>
            <option value="BICICLETA">Bicicleta</option>
          </select>
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao">Cadastrar</button>
      </form>
    </main>
  );
}
