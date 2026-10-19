import { METODOS_SELECAO } from '../dados/configuracao'
import {
  converterTextoEmNumero,
  fracaoParaPercentual,
  percentualParaFracao,
} from '../funcoes/formatacao'
import Campo from './Campo'

// Tamanho da população é quantas soluções existem; gerações é quantas vezes ela evolui.
// Crossover e mutação são chances; elitismo é quantas soluções passam sem alteração.
const CAMPOS_GENETICO = [
  { chave: 'tamanhoPopulacao', rotulo: 'Tamanho da população', tipo: 'inteiro' },
  { chave: 'numeroGeracoes', rotulo: 'Número de gerações', tipo: 'inteiro' },
  { chave: 'taxaCrossover', rotulo: 'Taxa de crossover (%)', tipo: 'percentual' },
  { chave: 'taxaMutacao', rotulo: 'Taxa de mutação (%)', tipo: 'percentual' },
  { chave: 'elitismo', rotulo: 'Elitismo (indivíduos preservados)', tipo: 'inteiro' },
]

function ParametrosGenetico({ configuracao, aoMudar }) {
  // Guarda o novo valor no parâmetro indicado sem apagar os outros.
  const alterar = (chave, valor) => aoMudar({ ...configuracao, [chave]: valor })

  return (
    <>
      <div className="row g-3">
        {CAMPOS_GENETICO.map(({ chave, rotulo, tipo }) => {
          // Identifica os campos cuja unidade visível é percentual.
          const percentual = tipo === 'percentual'
          // As taxas ficam como frações na configuração, mas são mostradas em porcentagem.
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
                  // O valor apresentado é derivado da configuração atual.
                  value={valor}
                  onChange={(evento) => {
                    const texto = evento.target.value
                    // Converte o texto digitado: crossover 80 vira 0.8 e mutação 3 vira 0.03.
                    alterar(chave, percentual ? percentualParaFracao(texto) : converterTextoEmNumero(texto))
                  }}
                />
              </Campo>
            </div>
          )
        })}
        <div className="col-sm-6">
          <Campo id="param-tipoSelecao" rotulo="Método de seleção">
            {/* A opção é salva, mas o algoritmo atual ainda faz torneios de três indivíduos. */}
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
  // Este algoritmo não possui campos ajustáveis; usa as plantas e zonas recebidas pela página.
  return (
    <p className="texto-suave mb-0">
      Os parâmetros da Busca Gulosa serão definidos junto com a sua implementação. Ela recebe as mesmas
      plantas e zonas do Algoritmo Genético, para que os resultados possam ser comparados.
    </p>
  )
}

export default function PainelParametros({ tipo, configuracao, aoMudar, aoRestaurar }) {
  // Exibe os controles do algoritmo selecionado e permite restaurar seus valores iniciais.
  return (
    <section className="cartao" aria-labelledby="titulo-parametros">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 id="titulo-parametros" className="h5 mb-0">Parâmetros</h2>
        {tipo === 'genetico' && (
          // Só o painel genético tem parâmetros que podem ser restaurados.
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={aoRestaurar}>
            Valores iniciais
          </button>
        )}
      </div>
      {/* Passa configuração e função de atualização ao painel adequado ao algoritmo. */}
      {tipo === 'genetico' ? <ParametrosGenetico configuracao={configuracao} aoMudar={aoMudar} /> : <ParametrosGulosa />}
    </section>
  )
}
