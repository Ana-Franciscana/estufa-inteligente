import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CORES_GRAFICO } from '../dados/configuracao'
import EstadoVazio from './EstadoVazio'

// Gráfico de barras genérico para comparar cenários ou algoritmos.
//   dados:  lista de objetos (ex.: linhas de um experimento)
//   chaveX: propriedade usada no eixo X (ex.: 'rotulo')
//   series: [{ chave, nome, cor }] — uma barra por série
export default function GraficoComparacao({ titulo, dados = [], chaveX, series, rotuloX, rotuloY }) {
  const idTitulo = `grafico-${titulo.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <section className="cartao h-100" aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className="h5 mb-3">{titulo}</h2>
      {dados.length === 0 ? (
        <EstadoVazio mensagem="Os resultados dos experimentos aparecerão aqui após a execução." />
      ) : (
        <div className="grafico">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 8, right: 16, bottom: 28, left: 8 }}>
              <CartesianGrid stroke={CORES_GRAFICO.grade} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={chaveX} label={{ value: rotuloX, position: 'insideBottom', offset: -14 }} />
              <YAxis label={{ value: rotuloY, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              {series.length > 1 && <Legend verticalAlign="top" />}
              {series.map((serie) => (
                <Bar key={serie.chave} dataKey={serie.chave} name={serie.nome} fill={serie.cor} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
