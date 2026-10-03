// Camada de integração entre a interface e os algoritmos.
// Os componentes React só conhecem `executarAlgoritmo` e `obterStatusAlgoritmos`.

import { ALGORITMOS } from '../dados/configuracao'
import {
  DISPONIVEL as GENETICO_DISPONIVEL,
  executarAlgoritmoGenetico,
} from '../algoritmos/algoritmoGenetico'
import { DISPONIVEL as GULOSA_DISPONIVEL, executarBuscaGulosa } from '../algoritmos/buscaGulosa'
import { detalharFitness } from '../funcoes/fitness'
import { cronometrar } from '../funcoes/metricas'
import { agruparPlantasPorZona } from '../funcoes/solucao'
import {
  validarConfiguracao,
  validarProblema,
  validarSolucao,
  verificarCapacidade,
} from '../funcoes/validacao'

export const STATUS_EXECUCAO = {
  CONCLUIDO: 'concluido',
  AGUARDANDO_ALGORITMO: 'aguardando_algoritmo',
  CONFIGURACAO_INVALIDA: 'configuracao_invalida',
  ERRO: 'erro',
}

const REGISTRO = {
  genetico: { disponivel: GENETICO_DISPONIVEL, executar: executarAlgoritmoGenetico },
  gulosa: { disponivel: GULOSA_DISPONIVEL, executar: executarBuscaGulosa },
}

// Lista os algoritmos com o status atual, para exibição na interface.
export function obterStatusAlgoritmos() {
  return Object.values(ALGORITMOS).map((algoritmo) => {
    const { disponivel } = REGISTRO[algoritmo.id]
    return { ...algoritmo, disponivel, status: disponivel ? 'Disponível' : algoritmo.statusPendente }
  })
}

// Acrescenta ao resultado do algoritmo os dados que a interface precisa para exibi-lo.
function completarResultado(resultado, tipo, tempoExecucao, { plantas, zonas, configuracao }) {
  return {
    ...resultado,
    algoritmo: tipo,
    tempoExecucao,
    configuracao,
    avaliacao: detalharFitness(resultado.melhorSolucao, plantas, zonas),
    distribuicao: agruparPlantasPorZona(resultado.melhorSolucao, plantas, zonas),
    zonasExcedidas: verificarCapacidade(resultado.melhorSolucao, plantas, zonas),
  }
}

// Executa um algoritmo e devolve sempre um objeto { status, mensagem?, erros?, resultado? }.
//   tipo:          'genetico' | 'gulosa'
//   plantas:       lista de plantas individuais (expandirPlantas)
//   configuracao:  parâmetros do algoritmo
export async function executarAlgoritmo({ tipo, plantas, zonas, configuracao }) {
  const algoritmo = REGISTRO[tipo]
  if (!algoritmo) {
    return { status: STATUS_EXECUCAO.ERRO, mensagem: `Algoritmo desconhecido: ${tipo}.` }
  }

  const erros = [...validarProblema(plantas, zonas), ...validarConfiguracao(tipo, configuracao)]
  if (erros.length > 0) {
    return { status: STATUS_EXECUCAO.CONFIGURACAO_INVALIDA, mensagem: 'Corrija a configuração antes de executar.', erros }
  }

  if (!algoritmo.disponivel) {
    return {
      status: STATUS_EXECUCAO.AGUARDANDO_ALGORITMO,
      mensagem: `${ALGORITMOS[tipo].nome}: aguardando implementação do algoritmo. Nenhum resultado foi gerado.`,
    }
  }

  try {
    const { resultado, tempoExecucao } = await cronometrar(() => algoritmo.executar({ plantas, zonas, configuracao }))
    const errosSolucao = validarSolucao(resultado.melhorSolucao, plantas, zonas)
    if (errosSolucao.length > 0) {
      return { status: STATUS_EXECUCAO.ERRO, mensagem: 'O algoritmo devolveu uma solução inválida.', erros: errosSolucao }
    }
    return {
      status: STATUS_EXECUCAO.CONCLUIDO,
      resultado: completarResultado(resultado, tipo, tempoExecucao, { plantas, zonas, configuracao }),
    }
  } catch (erro) {
    return { status: STATUS_EXECUCAO.ERRO, mensagem: erro.message }
  }
}
