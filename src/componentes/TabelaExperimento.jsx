import { formatarNumero, formatarTempo } from '../funcoes/formatacao'
import { ALGORITMOS } from '../dados/configuracao'
import EstadoVazio from './EstadoVazio'

// `linhas`: lista de cenários resumidos (ver servicos/executorExperimentos.js).
export default function TabelaExperimento({ linhas = [] }) {
  return (
    <section className="cartao" aria-labelledby="titulo-tabela-experimento">
      <h2 id="titulo-tabela-experimento" className="h5 mb-3">Resultados por cenário</h2>
      {linhas.length === 0 ? (
        <EstadoVazio mensagem="Os resultados dos experimentos aparecerão aqui após a execução." />
      ) : (
        <div className="table-responsive">
          <table className="table tabela-suave align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Cenário</th>
                <th scope="col">Algoritmo</th>
                <th scope="col" className="text-end">Rodadas</th>
                <th scope="col" className="text-end">Fitness médio</th>
                <th scope="col" className="text-end">Melhor</th>
                <th scope="col" className="text-end">Pior</th>
                <th scope="col" className="text-end">Desvio padrão</th>
                <th scope="col" className="text-end">Tempo médio</th>
                <th scope="col" className="text-end">Desvio (tempo)</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, indice) => (
                <tr key={`${linha.rotulo}-${indice}`}>
                  <th scope="row">{linha.rotulo}</th>
                  <td>{ALGORITMOS[linha.algoritmo].nome}</td>
                  <td className="text-end">{linha.rodadas}</td>
                  <td className="text-end">{formatarNumero(linha.fitnessMedio)}</td>
                  <td className="text-end">{formatarNumero(linha.melhorFitness)}</td>
                  <td className="text-end">{formatarNumero(linha.piorFitness)}</td>
                  <td className="text-end">{formatarNumero(linha.desvioPadraoFitness)}</td>
                  <td className="text-end">{formatarTempo(linha.tempoMedio)}</td>
                  <td className="text-end">{formatarTempo(linha.desvioPadraoTempo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
