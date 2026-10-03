// Executa experimentos: varia um parâmetro (ou o algoritmo), repete várias rodadas
// e resume as métricas de cada cenário. Usa apenas `executarAlgoritmo`.

import {
  ALGORITMOS,
  PARAMETROS_PADRAO_GENETICO,
  PARAMETROS_PADRAO_GULOSA,
  TIPOS_EXPERIMENTO,
} from '../dados/configuracao'
import { formatarPercentual } from '../funcoes/formatacao'
import { resumirRodadas } from '../funcoes/metricas'
import { validarExperimento } from '../funcoes/validacao'
import { executarAlgoritmo, STATUS_EXECUCAO } from './executorAlgoritmos'

// Dá chance ao navegador de atualizar a tela entre as rodadas.
const cederControle = () => new Promise((resolve) => setTimeout(resolve, 0))

function rotularValor(valor, formato, unidade) {
  if (formato === 'percentual') return formatarPercentual(valor, 2)
  return `${valor} ${unidade}`
}

// Um cenário = um algoritmo + uma configuração + um rótulo.
function montarCenarios(tipoExperimento, valores) {
  const tipo = TIPOS_EXPERIMENTO[tipoExperimento]
  if (!tipo.parametro) {
    return [
      { rotulo: ALGORITMOS.genetico.nome, algoritmo: 'genetico', configuracao: PARAMETROS_PADRAO_GENETICO },
      { rotulo: ALGORITMOS.gulosa.nome, algoritmo: 'gulosa', configuracao: PARAMETROS_PADRAO_GULOSA },
    ]
  }
  return valores.map((valor) => ({
    rotulo: rotularValor(valor, tipo.formato, tipo.unidadeValores),
    algoritmo: 'genetico',
    configuracao: { ...PARAMETROS_PADRAO_GENETICO, [tipo.parametro]: valor },
  }))
}

// Devolve { status, experimento?, mensagem?, erros? }.
// `experimento.linhas` tem uma linha por cenário, com as métricas resumidas e as rodadas brutas.
export async function executarExperimento({ tipoExperimento, valores, rodadas, plantas, zonas }) {
  const erros = validarExperimento({ tipoExperimento, valores, rodadas })
  if (erros.length > 0) {
    return { status: STATUS_EXECUCAO.CONFIGURACAO_INVALIDA, mensagem: 'Corrija a configuração do experimento.', erros }
  }

  const linhas = []
  for (const cenario of montarCenarios(tipoExperimento, valores)) {
    const resultados = []
    for (let rodada = 0; rodada < rodadas; rodada += 1) {
      const retorno = await executarAlgoritmo({ tipo: cenario.algoritmo, plantas, zonas, configuracao: cenario.configuracao })
      if (retorno.status !== STATUS_EXECUCAO.CONCLUIDO) return retorno
      resultados.push(retorno.resultado)
      await cederControle()
    }
    linhas.push({
      ...cenario,
      ...resumirRodadas(resultados),
      execucoes: resultados.map(({ melhorFitness, tempoExecucao, geracoes, estadosAvaliados }) => ({
        melhorFitness,
        tempoExecucao,
        geracoes,
        estadosAvaliados,
      })),
    })
  }

  return { status: STATUS_EXECUCAO.CONCLUIDO, experimento: { tipoExperimento, rodadas, linhas } }
}
