import { ALGORITMOS } from '../dados/configuracao'
import { formatarNumero, formatarTempo } from '../funcoes/formatacao'
import Alerta from './Alerta'
import EstadoVazio from './EstadoVazio'
import GradeEstufa from './GradeEstufa'
import GraficoFitness from './GraficoFitness'

const COMPONENTES_FITNESS = [
  { chave: 'temperatura', rotulo: 'Adequação de temperatura' },
  { chave: 'umidade', rotulo: 'Adequação de umidade' },
  { chave: 'luminosidade', rotulo: 'Adequação de luminosidade' },
]

function montarMetricas(resultado) {
  return [
    { rotulo: 'Fitness', valor: formatarNumero(resultado.melhorFitness) },
    { rotulo: 'Tempo de execução', valor: formatarTempo(resultado.tempoExecucao) },
    resultado.fitnessMedio != null && { rotulo: 'Fitness médio', valor: formatarNumero(resultado.fitnessMedio) },
    resultado.geracoes != null && { rotulo: 'Gerações', valor: resultado.geracoes },
    resultado.estadosAvaliados != null && { rotulo: 'Estados avaliados', valor: resultado.estadosAvaliados },
  ].filter(Boolean)
}

// Recebe o resultado padronizado devolvido por executarAlgoritmo (ver servicos/executorAlgoritmos.js).
export default function ResultadoOtimizacao({ resultado, zonas }) {
  if (!resultado) {
    return <EstadoVazio mensagem="Execute um algoritmo para visualizar os resultados." />
  }

  const { avaliacao, distribuicao, zonasExcedidas, historicoFitness } = resultado

  return (
    <div className="d-flex flex-column gap-4">
      <section className="cartao" aria-labelledby="titulo-resultado">
        <h2 id="titulo-resultado" className="h5 mb-3">Resultado: {ALGORITMOS[resultado.algoritmo].nome}</h2>
        <dl className="row row-cols-2 row-cols-md-3 g-3 mb-0">
          {montarMetricas(resultado).map(({ rotulo, valor }) => (
            <div className="col" key={rotulo}>
              <dt className="metrica-rotulo">{rotulo}</dt>
              <dd className="metrica-valor">{valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cartao" aria-labelledby="titulo-qualidade">
        <h2 id="titulo-qualidade" className="h5 mb-3">Qualidade da solução</h2>
        <table className="table tabela-suave mb-0">
          <thead>
            <tr><th scope="col">Componente do fitness</th><th scope="col" className="text-end">Contribuição</th></tr>
          </thead>
          <tbody>
            {COMPONENTES_FITNESS.map(({ chave, rotulo, penalidade }) => (
              <tr key={chave}>
                <td>{rotulo}</td>
                <td className="text-end">{penalidade ? '−' : ''}{formatarNumero(avaliacao[chave])}</td>
              </tr>
            ))}
            <tr className="fw-semibold">
              <td>Fitness total</td>
              <td className="text-end">{formatarNumero(avaliacao.total)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {zonasExcedidas.length > 0 && (
        <Alerta
          tipo="warning"
          titulo="Capacidade excedida"
          mensagens={zonasExcedidas.map(({ nome, excesso }) => `${nome}: ${excesso} planta(s) além da capacidade.`)}
        />
      )}

      <section aria-labelledby="titulo-distribuicao">
        <h2 id="titulo-distribuicao" className="h5 mb-3">Distribuição das plantas</h2>
        <GradeEstufa zonas={zonas} distribuicao={distribuicao} />
      </section>

      {historicoFitness && <GraficoFitness historico={historicoFitness} />}
    </div>
  )
}
