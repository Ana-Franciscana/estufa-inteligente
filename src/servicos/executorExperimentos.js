// Recebe os dados da tela, monta cenários, repete execuções e resume os resultados.

// A configuração define os parâmetros padrão, algoritmos e tipos de experimento.
import {
  ALGORITMOS,
  PARAMETROS_PADRAO_GENETICO,
  PARAMETROS_PADRAO_GULOSA,
  TIPOS_EXPERIMENTO,
} from '../dados/configuracao'
// O formatador cria rótulos e as métricas resumem as execuções de cada cenário.
import { formatarPercentual } from '../funcoes/formatacao'
import { resumirRodadas } from '../funcoes/metricas'
import { validarExperimento } from '../funcoes/validacao'
import { executarAlgoritmo, STATUS_EXECUCAO } from './executorAlgoritmos'

// Pausa por um instante para o navegador poder atualizar a tela entre execuções.
const cederControle = () => new Promise((resolve) => setTimeout(resolve, 0))

// Monta o texto que identifica um valor no resultado do experimento.
function rotularValor(valor, formato, unidade) {
  // Taxas são apresentadas como percentuais; outros valores recebem a unidade indicada.
  if (formato === 'percentual') return formatarPercentual(valor, 2)
  return `${valor} ${unidade}`
}

// Cria um cenário por valor testado, ou um cenário para cada algoritmo na comparação.
function montarCenarios(tipoExperimento, valores) {
  // Procura a definição para saber se o teste varia um parâmetro ou compara algoritmos.
  const tipo = TIPOS_EXPERIMENTO[tipoExperimento]
  if (!tipo.parametro) {
    // Na comparação, prepara um cenário para cada algoritmo com sua configuração padrão.
    return [
      { rotulo: ALGORITMOS.genetico.nome, algoritmo: 'genetico', configuracao: PARAMETROS_PADRAO_GENETICO },
      { rotulo: ALGORITMOS.gulosa.nome, algoritmo: 'gulosa', configuracao: PARAMETROS_PADRAO_GULOSA },
    ]
  }
  // Cria um cenário por valor e copia os padrões para manter os outros parâmetros constantes.
  return valores.map((valor) => ({
    rotulo: rotularValor(valor, tipo.formato, tipo.unidadeValores),
    algoritmo: 'genetico',
    configuracao: { ...PARAMETROS_PADRAO_GENETICO, [tipo.parametro]: valor },
  }))
}

// Recebe o tipo de experimento, valores, repetições e dados da estufa.
// Devolve o status e, se concluir, uma linha de métricas para cada cenário.
export async function executarExperimento({ tipoExperimento, valores, rodadas, plantas, zonas }) {
  // Confere o tipo de experimento, os valores que serão testados e o número de repetições.
  const erros = validarExperimento({ tipoExperimento, valores, rodadas })
  if (erros.length > 0) {
    // Se houver erro, devolve as mensagens sem iniciar nenhuma rodada.
    return { status: STATUS_EXECUCAO.CONFIGURACAO_INVALIDA, mensagem: 'Corrija a configuração do experimento.', erros }
  }

  const linhas = []
  // Cada cenário representa uma configuração de teste a executar e resumir.
  for (const cenario of montarCenarios(tipoExperimento, valores)) {
    const resultados = []
    // Executa a mesma configuração rodadas vezes para observar a variação dos resultados.
    for (let rodada = 0; rodada < rodadas; rodada += 1) {
      // Reaproveita o serviço de algoritmo para validar, cronometrar e fazer a execução.
      const retorno = await executarAlgoritmo({ tipo: cenario.algoritmo, plantas, zonas, configuracao: cenario.configuracao })
      // Se uma rodada falhar, devolve a falha em vez de resumir resultados incompletos.
      if (retorno.status !== STATUS_EXECUCAO.CONCLUIDO) return retorno
      // Guarda a resposta para calcular médias e detalhes ao final do cenário.
      resultados.push(retorno.resultado)
      // Dá tempo para a interface atualizar entre uma rodada e a próxima.
      await cederControle()
    }
    // Acrescenta as métricas do cenário e preserva dados importantes de cada rodada.
    linhas.push({
      ...cenario,
      ...resumirRodadas(resultados),
      // Os detalhes individuais podem ser usados por tabelas e gráficos.
      execucoes: resultados.map(({ melhorFitness, tempoExecucao, geracoes, estadosAvaliados }) => ({
        melhorFitness,
        tempoExecucao,
        geracoes,
        estadosAvaliados,
      })),
    })
  }

  // Devolve uma linha por cenário junto ao tipo de experimento e ao total de repetições.
  return { status: STATUS_EXECUCAO.CONCLUIDO, experimento: { tipoExperimento, rodadas, linhas } }
}
