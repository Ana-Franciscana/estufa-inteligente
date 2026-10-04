import { ALGORITMOS, TIPOS_EXPERIMENTO } from '../dados/configuracao'
import { formatarNumero, formatarPercentual, formatarTempo } from '../funcoes/formatacao'
import { calcularMedia } from '../funcoes/metricas'
import EstadoVazio from './EstadoVazio'

function mediaEstadosAvaliados(linha) {
  const valores = linha.execucoes
    ?.map((execucao) => execucao.estadosAvaliados)
    .filter(Number.isFinite) ?? []
  return calcularMedia(valores)
}

function formatarParametro(tipo, linha) {
  const valor = linha.configuracao[tipo.parametro]
  return tipo.formato === 'percentual'
    ? formatarPercentual(valor)
    : `${valor.toLocaleString('pt-BR')} indivíduos`
}

function TabelaComparacao({ linhas }) {
  const genetico = linhas.find((linha) => linha.algoritmo === 'genetico')
  const gulosa = linhas.find((linha) => linha.algoritmo === 'gulosa')
  const metricas = [
    { rotulo: 'Fitness médio', valor: (linha) => formatarNumero(linha?.fitnessMedio) },
    { rotulo: 'Melhor fitness (qualidade da solução)', valor: (linha) => formatarNumero(linha?.melhorFitness) },
    { rotulo: 'Tempo médio', valor: (linha) => formatarTempo(linha?.tempoMedio) },
    { rotulo: 'Estados avaliados (média)', valor: (linha) => formatarNumero(mediaEstadosAvaliados(linha ?? {}), 0) },
  ]

  return (
    <div className="table-responsive">
      <table className="table tabela-suave align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Métrica</th>
            <th scope="col">{ALGORITMOS.genetico.nome}</th>
            <th scope="col">{ALGORITMOS.gulosa.nome}</th>
          </tr>
        </thead>
        <tbody>
          {metricas.map((metrica) => (
            <tr key={metrica.rotulo}>
              <th scope="row">{metrica.rotulo}</th>
              <td>{metrica.valor(genetico)}</td>
              <td>{metrica.valor(gulosa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabelaParametros({ tipo, linhas }) {
  return (
    <div className="table-responsive">
      <table className="table tabela-suave align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Cenário</th>
            <th scope="col">{tipo.rotuloEixo}</th>
            <th scope="col" className="text-end">Repetições</th>
            <th scope="col" className="text-end">Fitness médio</th>
            <th scope="col" className="text-end">Melhor fitness</th>
            <th scope="col" className="text-end">Pior fitness</th>
            <th scope="col" className="text-end">Desvio padrão</th>
            <th scope="col" className="text-end">Tempo médio</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, indice) => (
            <tr key={`${linha.rotulo}-${indice}`}>
              <th scope="row">Cenário {indice + 1}</th>
              <td>{formatarParametro(tipo, linha)}</td>
              <td className="text-end">{linha.rodadas}</td>
              <td className="text-end">{formatarNumero(linha.fitnessMedio)}</td>
              <td className="text-end">{formatarNumero(linha.melhorFitness)}</td>
              <td className="text-end">{formatarNumero(linha.piorFitness)}</td>
              <td className="text-end">{formatarNumero(linha.desvioPadraoFitness)}</td>
              <td className="text-end">{formatarTempo(linha.tempoMedio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TabelaExperimento({ experimento }) {
  const linhas = experimento?.linhas ?? []
  const tipo = experimento ? TIPOS_EXPERIMENTO[experimento.tipoExperimento] : null
  const comparacao = experimento?.tipoExperimento === 'algoritmos'

  return (
    <section className="cartao" aria-labelledby="titulo-tabela-experimento">
      <div className="secao-heading">
        <div>
          <span className="sobretitulo">Resultados reais da execução mais recente</span>
          <h2 id="titulo-tabela-experimento">Resultados por cenário</h2>
        </div>
        {experimento && <p>{tipo.rotulo} · {experimento.rodadas} repetições</p>}
      </div>
      {linhas.length === 0 ? (
        <EstadoVazio mensagem="Os resultados aparecerão aqui depois que um experimento for executado com sucesso." />
      ) : comparacao ? (
        <TabelaComparacao linhas={linhas} />
      ) : (
        <TabelaParametros tipo={tipo} linhas={linhas} />
      )}
    </section>
  )
}
