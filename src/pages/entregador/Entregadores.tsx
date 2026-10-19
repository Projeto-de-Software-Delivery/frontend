import { useState, type FormEvent } from 'react';
import { criarEntregador, deletarEntregador, listarEntregadores, mudarStatusEntregador } from '../../api/entregadores';
import { Foto } from '../../components/Foto';
import type { Entregador, StatusEntregador, Veiculo } from '../../types';
import { NOME_STATUS_ENTREGADOR, useAcao, useCarregar } from '../../util';

const ICONE_VEICULO: Record<Veiculo, string> = { MOTO: '🛵', CARRO: '🚗', BICICLETA: '🚲' };

export function Entregadores() {
  const entregadores = useCarregar(() => listarEntregadores(), []);
  const { erro, executar } = useAcao();
  const [nome, setNome] = useState('');
  const [veiculo, setVeiculo] = useState<Veiculo>('MOTO');

  function cadastrar(e: FormEvent) {
    e.preventDefault();
    executar(async () => {
      await criarEntregador({ nome, veiculo });
      setNome('');
      entregadores.recarregar();
    });
  }

  function mudarStatus(entregador: Entregador, status: StatusEntregador) {
    executar(async () => {
      await mudarStatusEntregador(entregador.id, status);
      entregadores.recarregar();
    });
  }

  function excluir(entregador: Entregador) {
    if (!confirm(`Excluir ${entregador.nome}?`)) return;
    executar(async () => {
      await deletarEntregador(entregador.id);
      entregadores.recarregar();
    });
  }

  return (
    <>
      <h1>Entregadores</h1>

      <form className="card form-linha" onSubmit={cadastrar}>
        <label>Nome<input required value={nome} onChange={(e) => setNome(e.target.value)} /></label>
        <label>
          Veículo
          <select value={veiculo} onChange={(e) => setVeiculo(e.target.value as Veiculo)}>
            <option value="MOTO">Moto</option>
            <option value="CARRO">Carro</option>
            <option value="BICICLETA">Bicicleta</option>
          </select>
        </label>
        <button className="botao">Cadastrar</button>
      </form>
      {(erro || entregadores.erro) && <p className="erro">{erro || entregadores.erro}</p>}

      <div className="card bloco">
        {entregadores.dados?.length === 0 && <p className="nota">Nenhum entregador cadastrado.</p>}
        {entregadores.dados?.map((entregador) => (
          <div key={entregador.id} className="item-lista">
            <Foto foto={ICONE_VEICULO[entregador.veiculo]} />
            <div className="cresce">
              <strong>{entregador.nome}</strong>
              <div className="nota">{entregador.veiculo.toLowerCase()}</div>
            </div>
            <select
              className={`status status-${entregador.status}`}
              value={entregador.status}
              onChange={(e) => mudarStatus(entregador, e.target.value as StatusEntregador)}
            >
              {Object.entries(NOME_STATUS_ENTREGADOR).map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
            <button className="botao-x" onClick={() => excluir(entregador)} title="Excluir">✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
