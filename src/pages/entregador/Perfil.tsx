import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { atualizarEntregador, buscarEntregador, deletarEntregador } from '../../api/entregadores';
import type { Veiculo } from '../../types';
import { dataHora, useAcao, useCarregar } from '../../util';

/** Dados do entregador: editar nome/veículo (PUT) e excluir a conta (DELETE). */
export function Perfil() {
  const navigate = useNavigate();
  const entregadorId = useParams().entregadorId ?? '';
  const entregador = useCarregar(() => buscarEntregador(entregadorId), [entregadorId]);
  const { erro, executar } = useAcao();
  const [nome, setNome] = useState('');
  const [veiculo, setVeiculo] = useState<Veiculo>('MOTO');
  const [aviso, setAviso] = useState('');

  // preenche o formulário quando os dados chegam
  useEffect(() => {
    if (!entregador.dados) return;
    setNome(entregador.dados.nome);
    setVeiculo(entregador.dados.veiculo);
  }, [entregador.dados]);

  function salvar(e: FormEvent) {
    e.preventDefault();
    setAviso('');
    executar(async () => {
      entregador.setDados(await atualizarEntregador(entregadorId, { nome, veiculo }));
      setAviso('Dados salvos');
    });
  }

  function excluir() {
    if (!confirm('Excluir sua conta de entregador?')) return;
    executar(async () => {
      await deletarEntregador(entregadorId);
      navigate('/');
    });
  }

  return (
    <>
      <h1>Meu perfil</h1>
      {aviso && <p className="aviso">{aviso}</p>}
      {(erro || entregador.erro) && <p className="erro">{erro || entregador.erro}</p>}

      <form className="card formulario perfil" onSubmit={salvar}>
        <label>Nome<input required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label>
          Veículo
          <select value={veiculo} onChange={(e) => setVeiculo(e.target.value as Veiculo)}>
            <option value="MOTO">Moto</option>
            <option value="CARRO">Carro</option>
            <option value="BICICLETA">Bicicleta</option>
          </select>
        </label>
        {entregador.dados && <p className="nota">Cadastrado em {dataHora(entregador.dados.created_at)}</p>}
        <div className="linha">
          <button type="button" className="link-pequeno" onClick={excluir}>Excluir minha conta</button>
          <button className="botao">Salvar</button>
        </div>
      </form>
    </>
  );
}
