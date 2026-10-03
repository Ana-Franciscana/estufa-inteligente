import { METODOS_SELECAO } from '../dados/configuracao'
import {
  converterTextoEmNumero,
  fracaoParaPercentual,
  percentualParaFracao,
} from '../funcoes/formatacao'
import Campo from './Campo'

const CAMPOS_GENETICO = [
  { chave: 'tamanhoPopulacao', rotulo: 'Tamanho da população', tipo: 'inteiro' },
  { chave: 'numeroGeracoes', rotulo: 'Número de gerações', tipo: 'inteiro' },
  { chave: 'taxaCrossover', rotulo: 'Taxa de crossover (%)', tipo: 'percentual' },
  { chave: 'taxaMutacao', rotulo: 'Taxa de mutação (%)', tipo: 'percentual' },
  { chave: 'elitismo', rotulo: 'Elitismo (indivíduos preservados)', tipo: 'inteiro' },
]

function ParametrosGenetico({ configuracao, aoMudar }) {
  const alterar = (chave, valor) => aoMudar({ ...configuracao, [chave]: valor })

  return (
    <>
      <div className="row g-3">
        {CAMPOS_GENETICO.map(({ chave, rotulo, tipo }) => {
          const percentual = tipo === 'percentual'
          const valor = percentual ? fracaoParaPercentual(configuracao[chave]) : configuracao[chave]
          return (
            <div className="col-sm-6" key={chave}>
              <Campo id={`param-${chave}`} rotulo={rotulo}>
                <input
                  id={`param-${chave}`}
                  type="number"
                  className="form-control"
                  min="0"
                  step={percentual ? '0.5' : '1'}
                  value={valor}
                  onChange={(evento) => {
                    const texto = evento.target.value
                    alterar(chave, percentual ? percentualParaFracao(texto) : converterTextoEmNumero(texto))
                  }}
                />
              </Campo>
            </div>
          )
        })}
        <div className="col-sm-6">
          <Campo id="param-tipoSelecao" rotulo="Método de seleção">
            <select
              id="param-tipoSelecao"
              className="form-select"
              value={configuracao.tipoSelecao}
              onChange={(evento) => alterar('tipoSelecao', evento.target.value)}
            >
              {METODOS_SELECAO.map((metodo) => <option key={metodo.id} value={metodo.id}>{metodo.rotulo}</option>)}
            </select>
          </Campo>
        </div>
      </div>
      <p className="small texto-suave mb-0">Crossover de 1 ponto · critério de parada: número de gerações.</p>
    </>
  )
}

function ParametrosGulosa() {
  return (
    <p className="texto-suave mb-0">
      Os parâmetros da Busca Gulosa serão definidos junto com a sua implementação. Ela recebe as mesmas
      plantas e zonas do Algoritmo Genético, para que os resultados possam ser comparados.
    </p>
  )
}

export default function PainelParametros({ tipo, configuracao, aoMudar, aoRestaurar }) {
  return (
    <section className="cartao" aria-labelledby="titulo-parametros">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 id="titulo-parametros" className="h5 mb-0">Parâmetros</h2>
        {tipo === 'genetico' && (
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={aoRestaurar}>
            Valores iniciais
          </button>
        )}
      </div>
      {tipo === 'genetico' ? <ParametrosGenetico configuracao={configuracao} aoMudar={aoMudar} /> : <ParametrosGulosa />}
    </section>
  )
}
