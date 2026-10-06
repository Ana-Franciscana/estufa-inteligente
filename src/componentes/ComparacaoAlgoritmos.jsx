import { ALGORITMOS } from '../dados/configuracao'
import { formatarNumero, formatarTempo } from '../funcoes/formatacao'

const LINHAS = [
  { rotulo: 'Fitness', valor: (r) => formatarNumero(r.melhorFitness) },
  { rotulo: 'Tempo de execução', valor: (r) => formatarTempo(r.tempoExecucao) },
  { rotulo: 'Gerações', valor: (r) => r.geracoes ?? '—' },
  { rotulo: 'Estados avaliados', valor: (r) => r.estadosAvaliados ?? '—' },
]

function contarPlantasPorZona(resultado, plantas) {
  const contagens = new Map()
  const nomesZona = new Map((resultado.distribuicao ?? []).map(({ zona }) => [zona.id, zona.nome]))

  plantas.forEach((planta, indice) => {
    const zonaId = resultado.melhorSolucao[indice]
    if (zonaId === undefined || zonaId === null) return

    if (!contagens.has(planta.nome)) contagens.set(planta.nome, new Map())
    const porZona = contagens.get(planta.nome)
    porZona.set(zonaId, (porZona.get(zonaId) ?? 0) + 1)
  })

  return { contagens, nomesZona }
}

function formatarDistribuicao(contagens, zonas) {
  const partes = zonas
    .filter((zona) => contagens.get(zona.id) > 0)
    .map((zona) => `${zona.nome} × ${contagens.get(zona.id)}`)
  return partes.length > 0 ? partes.join(', ') : '—'
}

function montarComparacaoDistribuicao(resultadoGenetico, resultadoGuloso, plantas) {
  const genetico = contarPlantasPorZona(resultadoGenetico, plantas)
  const gulosa = contarPlantasPorZona(resultadoGuloso, plantas)
  const idsZonas = [...new Set([
    ...(resultadoGenetico.distribuicao ?? []).map(({ zona }) => zona.id),
    ...(resultadoGuloso.distribuicao ?? []).map(({ zona }) => zona.id),
  ])]
  const zonas = idsZonas.map((id) => ({
    id,
    nome: genetico.nomesZona.get(id) ?? gulosa.nomesZona.get(id) ?? `Zona ${id}`,
  }))
  const tiposPlanta = [...new Set(plantas.map((planta) => planta.nome))]

  const linhas = tiposPlanta.map((nome) => {
    const quantidadesGenetico = genetico.contagens.get(nome) ?? new Map()
    const quantidadesGulosa = gulosa.contagens.get(nome) ?? new Map()
    const quantidade = plantas.filter((planta) => planta.nome === nome).length
    const coincidencias = zonas.reduce((total, zona) => (
      total + Math.min(quantidadesGenetico.get(zona.id) ?? 0, quantidadesGulosa.get(zona.id) ?? 0)
    ), 0)

    return {
      nome,
      quantidade,
      coincidencias,
      genetico: formatarDistribuicao(quantidadesGenetico, zonas),
      gulosa: formatarDistribuicao(quantidadesGulosa, zonas),
    }
  })

  return { linhas, coincidenciasTotais: linhas.reduce((soma, linha) => soma + linha.coincidencias, 0) }
}

function ComparacaoDistribuicao({ resultadoGenetico, resultadoGuloso, plantas }) {
  const { linhas, coincidenciasTotais } = montarComparacaoDistribuicao(resultadoGenetico, resultadoGuloso, plantas)

  return (
    <div className="mt-4 pt-4 border-top">
      <h3 className="h6 mb-1">Distribuição das plantas</h3>
      <p className="small texto-suave mb-3">
        {coincidenciasTotais} de {plantas.length} plantas ficaram na mesma zona nos dois algoritmos.
      </p>
      <div className="table-responsive">
        <table className="table tabela-suave align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Planta</th>
              <th scope="col">Algoritmo Genético</th>
              <th scope="col">Busca Gulosa</th>
              <th scope="col">Coincidência</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.nome}>
                <th scope="row">{linha.nome}</th>
                <td>{linha.genetico}</td>
                <td>{linha.gulosa}</td>
                <td>{linha.coincidencias}/{linha.quantidade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ComparacaoAlgoritmos({ resultados, plantas }) {
  const ids = Object.keys(ALGORITMOS)
  const resultadoGenetico = resultados.genetico
  const resultadoGuloso = resultados.gulosa
  const ambosExecutados = resultadoGenetico && resultadoGuloso

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
      {ambosExecutados && (
        <ComparacaoDistribuicao
          resultadoGenetico={resultadoGenetico}
          resultadoGuloso={resultadoGuloso}
          plantas={plantas}
        />
      )}
    </section>
  )
}
