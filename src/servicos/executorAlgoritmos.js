// Este serviço liga a interface aos algoritmos e devolve respostas num formato comum.

// A configuração fornece os nomes e identificadores que a interface apresenta.
import { ALGORITMOS } from '../dados/configuracao'
// Cada módulo fornece um sinal de disponibilidade e a função que faz a busca.
import {
  DISPONIVEL as GENETICO_DISPONIVEL,
  executarAlgoritmoGenetico,
} from '../algoritmos/algoritmoGenetico'
import { DISPONIVEL as GULOSA_DISPONIVEL, executarBuscaGulosa } from '../algoritmos/buscaGulosa'
// As funções auxiliares calculam notas, medem duração, agrupam plantas e validam dados.
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
  // A interface usa estes estados para decidir qual mensagem ou resultado mostrar.
  CONCLUIDO: 'concluido',
  AGUARDANDO_ALGORITMO: 'aguardando_algoritmo',
  CONFIGURACAO_INVALIDA: 'configuracao_invalida',
  ERRO: 'erro',
}

// Relaciona o id escolhido na tela com a função que deve ser chamada.
const REGISTRO = {
  genetico: { disponivel: GENETICO_DISPONIVEL, executar: executarAlgoritmoGenetico },
  gulosa: { disponivel: GULOSA_DISPONIVEL, executar: executarBuscaGulosa },
}

// Devolve os dados de cada algoritmo com seu status atualizado para a tela.
export function obterStatusAlgoritmos() {
  // Percorre as definições e adiciona se o algoritmo pode ser executado neste momento.
  return Object.values(ALGORITMOS).map((algoritmo) => {
    const { disponivel } = REGISTRO[algoritmo.id]
    // Mantém os dados originais e inclui status legível para a interface.
    return { ...algoritmo, disponivel, status: disponivel ? 'Disponível' : algoritmo.statusPendente }
  })
}

// Acrescenta ao resultado as informações usadas para mostrar a execução na interface.
function completarResultado(resultado, tipo, tempoExecucao, { plantas, zonas, configuracao }) {
  // Copia os dados do algoritmo e acrescenta tudo que a tela usa para detalhar a resposta.
  return {
    ...resultado,
    algoritmo: tipo,
    tempoExecucao,
    configuracao,
    // Inclui os componentes do fitness, o agrupamento e as zonas acima da capacidade.
    avaliacao: detalharFitness(resultado.melhorSolucao, plantas, zonas),
    distribuicao: agruparPlantasPorZona(resultado.melhorSolucao, plantas, zonas),
    zonasExcedidas: verificarCapacidade(resultado.melhorSolucao, plantas, zonas),
  }
}

// Recebe o tipo, as plantas, as zonas e os parâmetros; devolve um status e, se concluir, o resultado.
export async function executarAlgoritmo({ tipo, plantas, zonas, configuracao }) {
  // Procura o algoritmo pelo id recebido da interface.
  const algoritmo = REGISTRO[tipo]
  // Rejeita um id que não corresponda a nenhum algoritmo conhecido.
  if (!algoritmo) {
    return { status: STATUS_EXECUCAO.ERRO, mensagem: `Algoritmo desconhecido: ${tipo}.` }
  }

  // Confere os dados da estufa e os parâmetros; espalha as duas listas de erros numa só.
  const erros = [...validarProblema(plantas, zonas), ...validarConfiguracao(tipo, configuracao)]
  if (erros.length > 0) {
    // Não chama o algoritmo enquanto houver erros e devolve as mensagens à interface.
    return { status: STATUS_EXECUCAO.CONFIGURACAO_INVALIDA, mensagem: 'Corrija a configuração antes de executar.', erros }
  }

  // Um algoritmo indisponível termina aqui, sem iniciar uma execução ou criar resultado.
  if (!algoritmo.disponivel) {
    return {
      status: STATUS_EXECUCAO.AGUARDANDO_ALGORITMO,
      mensagem: `${ALGORITMOS[tipo].nome}: aguardando implementação do algoritmo. Nenhum resultado foi gerado.`,
    }
  }

  try {
    // Passa as plantas, zonas e parâmetros ao algoritmo e mede quanto a chamada demora.
    const { resultado, tempoExecucao } = await cronometrar(() => algoritmo.executar({ plantas, zonas, configuracao }))
    // Confere a forma da resposta antes de permitir que ela chegue à interface.
    const errosSolucao = validarSolucao(resultado.melhorSolucao, plantas, zonas)
    if (errosSolucao.length > 0) {
      // Uma resposta malformada vira erro explícito em vez de ser exibida como sucesso.
      return { status: STATUS_EXECUCAO.ERRO, mensagem: 'O algoritmo devolveu uma solução inválida.', erros: errosSolucao }
    }
    // Completa os dados do algoritmo e marca a execução como concluída.
    // Acrescenta avaliação, distribuição, zonas excedidas e tempo à resposta final.
    return {
      status: STATUS_EXECUCAO.CONCLUIDO,
      resultado: completarResultado(resultado, tipo, tempoExecucao, { plantas, zonas, configuracao }),
    }
  } catch (erro) {
    // Converte exceções do algoritmo em uma resposta que a interface pode apresentar.
    return { status: STATUS_EXECUCAO.ERRO, mensagem: erro.message }
  }
}
