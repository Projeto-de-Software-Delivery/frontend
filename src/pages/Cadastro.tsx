import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { criarCliente } from '../api/clientes';
import { criarLoja } from '../api/lojas';
import { useAcao } from '../util';

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
      // o backend só aceita os 14 números, sem pontos e barras
      const loja = await criarLoja({ ...form, cnpj: form.cnpj.replace(/\D/g, '') });
      navigate(`/loja/${loja.id}`);
    });
  }

  return (
    <main className="cadastro">
      <Link to="/" className="voltar">← Voltar</Link>
      <form className="card formulario" onSubmit={enviar}>
        <h1>Nova loja</h1>
        <label>Nome<input required {...campo('nome')} /></label>
        <label>CNPJ<input required placeholder="00.000.000/0000-00" {...campo('cnpj')} /></label>
        <label>Endereço<input required {...campo('endereco')} /></label>
        {erro && <p className="erro">{erro}</p>}
        <button className="botao">Cadastrar</button>
      </form>
    </main>
  );
}
