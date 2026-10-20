// A configuração fornece os pesos usados na parte ambiental da estimativa.
import { PARAMETROS_FITNESS } from '../dados/configuracao'
// O fitness avalia distribuições; as outras funções pontuam critérios e validam dados.
import {
  calcularFitness,
  avaliarLuminosidade,
  avaliarTemperatura,
  avaliarUmidade,
} from '../funcoes/fitness'
import { validarPlanta, validarZona, validarProblema, validarSolucao } from '../funcoes/validacao'

export const DISPONIVEL = true

// Recebe as listas de plantas e zonas e interrompe a busca se algum dado não puder ser usado.
function validarEntrada(plantas, zonas) {
  // Evita percorrer valores que não sejam listas.
  if (!Array.isArray(plantas) || !Array.isArray(zonas)) {
    throw new Error('Plantas e zonas devem ser listas.')
  }

  // Junta os erros gerais aos problemas encontrados em cada planta e zona.
  const erros = validarProblema(plantas, zonas)
  // Confere cada registro e inclui o número da posição na mensagem de erro.
  plantas.forEach((planta, indice) => {
    if (planta === null || typeof planta !== 'object') {
      erros.push(`Planta ${indice + 1}: o registro da planta é inválido.`)
      // Não tenta validar propriedades de um registro que não é objeto.
      return
    }
    // Acrescenta à lista todos os problemas encontrados nos campos desta planta.
    validarPlanta(planta).forEach((erro) => erros.push(`Planta ${indice + 1}: ${erro}`))
  })
  // Faz as mesmas verificações para cada zona e exige também um identificador.
  zonas.forEach((zona, indice) => {
    if (zona === null || typeof zona !== 'object') {
      erros.push(`Zona ${indice + 1}: o registro da zona é inválido.`)
      // Sem um objeto de zona, não há campos para conferir.
      return
    }
    validarZona(zona).forEach((erro) => erros.push(`Zona ${indice + 1}: ${erro}`))
    if (zona.id === undefined || zona.id === null) erros.push(`Zona ${indice + 1}: informe um identificador.`)
  })

  // Compara a quantidade de ids diferentes com a quantidade de zonas para detectar repetidos.
  if (new Set(zonas.filter((zona) => zona && typeof zona === 'object').map((zona) => zona.id)).size !== zonas.length) {
    erros.push('Cada zona deve possuir um identificador único.')
  }
  // Junta as mensagens em um erro só; sem mensagens, a função termina normalmente.
  if (erros.length > 0) throw new Error(erros.join(' '))
}

// Guarda a distribuição candidata e a nota usada para compará-la às demais zonas.
function criarEstado(solucao, heuristica) {
  return { solucao, heuristica }
}

// Soma o fitness parcial e uma estimativa ambiental das plantas ainda não alocadas.
// Água e capacidade futuras não são estimadas até cada planta entrar na distribuição.
function calcularHeuristica(solucao, profundidade, plantas, zonas) {
  // O fitness parcial avalia o que já está na solução, inclusive seus efeitos atuais de água e capacidade.
  const fitnessAtual = calcularFitness(solucao, plantas, zonas)
  // A estimativa das plantas restantes usa apenas os pesos ambientais.
  const { temperatura, umidade, luminosidade } = PARAMETROS_FITNESS.pesos
  let potencialRestante = 0

  // A profundidade é a posição da próxima planta; as anteriores já receberam uma zona.
  for (let indice = profundidade; indice < plantas.length; indice += 1) {
    const planta = plantas[indice]
    // Calcula quanto esta planta pontuaria em cada zona nos critérios ambientais.
    const melhorContribuicao = Math.max(...zonas.map((zona) => (
      temperatura * avaliarTemperatura(planta, zona)
      + umidade * avaliarUmidade(planta, zona)
      + luminosidade * avaliarLuminosidade(planta, zona)
    )))
    // Math.max escolhe a zona com a maior pontuação ambiental para esta planta.
    // Soma apenas a melhor opção individual para estimar o potencial que ainda falta.
    potencialRestante += melhorContribuicao
  }

  // A soma orienta a escolha do próximo estado; não é o fitness oficial de uma solução completa.
  return fitnessAtual + potencialRestante
}

export function executarBuscaGulosa({ plantas, zonas }) {
  // plantas tem uma entrada por planta física; zonas contém os destinos possíveis.
  // Se houver dados inválidos, a validação interrompe a execução com uma mensagem.
  validarEntrada(plantas, zonas)

  // Começa com todas as plantas ainda sem destino.
  let solucao = Array(plantas.length).fill(null)
  let estadosAvaliados = 0
  let estadosGerados = 0
  const passos = []

  // Em cada passo, cria uma possibilidade por zona e mantém a de maior heurística.
  // Assim avalia quatro alternativas por planta nesta estufa e não guarda uma fronteira exponencial.
  for (let indicePlanta = 0; indicePlanta < plantas.length; indicePlanta += 1) {
    let melhorEstado = null

    zonas.forEach((zona) => {
      const proximaSolucao = [...solucao]
      proximaSolucao[indicePlanta] = zona.id
      const estado = criarEstado(
        proximaSolucao,
        calcularHeuristica(proximaSolucao, indicePlanta + 1, plantas, zonas),
      )
      estadosAvaliados += 1
      estadosGerados += 1

      // Em empate, conserva a primeira zona na ordem fixa da lista.
      if (melhorEstado === null || estado.heuristica > melhorEstado.heuristica) melhorEstado = estado
    })

    solucao = melhorEstado.solucao
    passos.push({
      passo: indicePlanta + 1,
      planta: plantas[indicePlanta].nome,
      zonaEscolhida: zonas.find((zona) => zona.id === solucao[indicePlanta]).nome,
      fitnessParcial: calcularFitness(solucao, plantas, zonas),
      heuristica: melhorEstado.heuristica,
      alternativasAvaliadas: zonas.length,
    })
  }

  // Confere que cada planta recebeu uma zona válida antes de devolver o resultado.
  const errosSolucao = validarSolucao(solucao, plantas, zonas)
  if (errosSolucao.length > 0) throw new Error(errosSolucao.join(' '))

  return {
    algoritmo: 'gulosa',
    melhorSolucao: solucao,
    melhorFitness: calcularFitness(solucao, plantas, zonas),
    // Estados avaliados é uma métrica observada, não um parâmetro de configuração.
    estadosAvaliados,
    metricas: {
      passos,
      profundidadeSolucao: plantas.length,
      estadosGerados,
      estadosExpandidos: plantas.length,
      estadosDescartadosPorDuplicidade: 0,
    },
  }
}
