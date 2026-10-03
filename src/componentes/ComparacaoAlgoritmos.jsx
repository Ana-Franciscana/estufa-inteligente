import { ALGORITMOS } from '../dados/configuracao'
import { formatarNumero, formatarTempo } from '../funcoes/formatacao'

const LINHAS = [
  { rotulo: 'Fitness', valor: (r) => formatarNumero(r.melhorFitness) },
  { rotulo: 'Tempo de execução', valor: (r) => formatarTempo(r.tempoExecucao) },
  { rotulo: 'Gerações', valor: (r) => r.geracoes ?? '—' },
  { rotulo: 'Estados avaliados', valor: (r) => r.estadosAvaliados ?? '—' },
]

// Mostra os resultados lado a lado, sem interpretar qual é melhor.
// `resultados`: { genetico?, gulosa? } (último resultado de cada algoritmo).
export default function ComparacaoAlgoritmos({ resultados }) {
  const ids = Object.keys(ALGORITMOS)

  return (
    <section className="cartao" aria-labelledby="titulo-comparacao">
      <h2 id="titulo-comparacao" className="h5 mb-3">Comparação entre algoritmos</h2>
      <div className="table-responsive">
        <table className="table tabela-suave mb-0">
          <thead>
            <tr>
              <th scope="col">Métrica</th>
              {ids.map((id) => <th scope="col" key={id}>{ALGORITMOS[id].nome}</th>)}
            </tr>
          </thead>
          <tbody>
            {LINHAS.map((linha) => (
              <tr key={linha.rotulo}>
                <th scope="row">{linha.rotulo}</th>
                {ids.map((id) => (
                  <td key={id} className={resultados[id] ? '' : 'texto-suave'}>
                    {resultados[id] ? linha.valor(resultados[id]) : 'Aguardando execução'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
