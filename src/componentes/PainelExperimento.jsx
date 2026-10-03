import { LIMITE_RODADAS, TIPOS_EXPERIMENTO } from '../dados/configuracao'
import Campo from './Campo'

export default function PainelExperimento({
  tipoExperimento,
  aoMudarTipo,
  textoValores,
  aoMudarValores,
  rodadas,
  aoMudarRodadas,
  aoExecutar,
  executando,
}) {
  const tipo = TIPOS_EXPERIMENTO[tipoExperimento]

  return (
    <section className="cartao" aria-labelledby="titulo-experimento">
      <h2 id="titulo-experimento" className="h5 mb-3">Configurar experimento</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <Campo id="exp-tipo" rotulo="O que será comparado">
            <select id="exp-tipo" className="form-select" value={tipoExperimento} onChange={(e) => aoMudarTipo(e.target.value)}>
              {Object.values(TIPOS_EXPERIMENTO).map((opcao) => <option key={opcao.id} value={opcao.id}>{opcao.rotulo}</option>)}
            </select>
          </Campo>
        </div>
        {tipo.parametro && (
          <div className="col-md-4">
            <Campo id="exp-valores" rotulo={`Valores (${tipo.unidadeValores})`} dica="Separe por vírgula. Cada valor é um cenário.">
              <input id="exp-valores" className="form-control" value={textoValores} onChange={(e) => aoMudarValores(e.target.value)} />
            </Campo>
          </div>
        )}
        <div className="col-md-2">
          <Campo id="exp-rodadas" rotulo="Rodadas" dica={`Máximo ${LIMITE_RODADAS}`}>
            <input id="exp-rodadas" type="number" min="1" className="form-control" value={rodadas} onChange={(e) => aoMudarRodadas(e.target.value)} />
          </Campo>
        </div>
      </div>
      <p className="small texto-suave">
        {tipo.parametro
          ? 'Os demais parâmetros do Algoritmo Genético usam os valores iniciais da página Otimização.'
          : 'Cada algoritmo é executado com sua configuração inicial.'}
      </p>
      <button type="button" className="btn btn-primary" onClick={aoExecutar} disabled={executando}>
        {executando ? 'Executando…' : 'Executar experimento'}
      </button>
    </section>
  )
}
