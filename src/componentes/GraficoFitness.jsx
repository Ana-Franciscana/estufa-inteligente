import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CORES_GRAFICO } from '../dados/configuracao'
import EstadoVazio from './EstadoVazio'

// `historico`: lista de { geracao, melhorFitness, fitnessMedio } produzida pelo Algoritmo Genético.
export default function GraficoFitness({ historico = [] }) {
  return (
    <section className="cartao" aria-labelledby="titulo-grafico-fitness">
      <h2 id="titulo-grafico-fitness" className="h5 mb-3">Evolução do fitness por geração</h2>
      {historico.length === 0 ? (
        <EstadoVazio mensagem="A evolução do fitness aparecerá aqui após a execução do Algoritmo Genético." />
      ) : (
        <div className="grafico">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historico} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
              <CartesianGrid stroke={CORES_GRAFICO.grade} strokeDasharray="3 3" />
              <XAxis dataKey="geracao" label={{ value: 'Geração', position: 'insideBottom', offset: -12 }} />
              <YAxis label={{ value: 'Fitness', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line type="monotone" dataKey="melhorFitness" name="Melhor fitness" stroke={CORES_GRAFICO.principal} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fitnessMedio" name="Fitness médio" stroke={CORES_GRAFICO.secundaria} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
