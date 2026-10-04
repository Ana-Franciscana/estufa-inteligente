import { PARAMETROS_FITNESS } from '../dados/configuracao'
import {
  calcularFitness,
  avaliarLuminosidade,
  avaliarTemperatura,
  avaliarUmidade,
} from '../funcoes/fitness'
import { validarPlanta, validarZona, validarProblema, validarSolucao } from '../funcoes/validacao'

export const DISPONIVEL = true

function validarEntrada(plantas, zonas) {
  if (!Array.isArray(plantas) || !Array.isArray(zonas)) {
    throw new Error('Plantas e zonas devem ser listas.')
  }

  const erros = validarProblema(plantas, zonas)
  plantas.forEach((planta, indice) => {
    if (planta === null || typeof planta !== 'object') {
      erros.push(`Planta ${indice + 1}: o registro da planta é inválido.`)
      return
    }
    validarPlanta(planta).forEach((erro) => erros.push(`Planta ${indice + 1}: ${erro}`))
  })
  zonas.forEach((zona, indice) => {
    if (zona === null || typeof zona !== 'object') {
      erros.push(`Zona ${indice + 1}: o registro da zona é inválido.`)
      return
    }
    validarZona(zona).forEach((erro) => erros.push(`Zona ${indice + 1}: ${erro}`))
    if (zona.id === undefined || zona.id === null) erros.push(`Zona ${indice + 1}: informe um identificador.`)
  })

  if (new Set(zonas.filter((zona) => zona && typeof zona === 'object').map((zona) => zona.id)).size !== zonas.length) {
    erros.push('Cada zona deve possuir um identificador único.')
  }
  if (erros.length > 0) throw new Error(erros.join(' '))
}

// O estado guarda a distribuição parcial, seu custo e a heurística usada na fronteira.
function criarEstado(solucao, profundidade, custo, heuristica, ordem) {
  return { solucao, profundidade, custo, heuristica, ordem }
}

function chaveEstado(solucao) {
  return JSON.stringify(solucao)
}

// Soma ao fitness parcial a melhor contribuição ambiental ainda possível para cada planta.
// Este valor só ordena a fronteira; a solução completa usa calcularFitness como avaliação oficial.
function calcularHeuristica(solucao, profundidade, plantas, zonas) {
  const fitnessAtual = calcularFitness(solucao, plantas, zonas)
  const { temperatura, umidade, luminosidade } = PARAMETROS_FITNESS.pesos
  let potencialRestante = 0

  for (let indice = profundidade; indice < plantas.length; indice += 1) {
    const planta = plantas[indice]
    const melhorContribuicao = Math.max(...zonas.map((zona) => (
      temperatura * avaliarTemperatura(planta, zona)
      + umidade * avaliarUmidade(planta, zona)
      + luminosidade * avaliarLuminosidade(planta, zona)
    )))
    potencialRestante += melhorContribuicao
  }

  return fitnessAtual + potencialRestante
}

// Maior heurística primeiro; empate favorece maior profundidade e depois ordem de geração.
function indiceMaisPromissor(fronteira) {
  let melhorIndice = 0
  for (let indice = 1; indice < fronteira.length; indice += 1) {
    const candidato = fronteira[indice]
    const melhor = fronteira[melhorIndice]
    if (
      candidato.heuristica > melhor.heuristica
      || (candidato.heuristica === melhor.heuristica && candidato.profundidade > melhor.profundidade)
      || (candidato.heuristica === melhor.heuristica
        && candidato.profundidade === melhor.profundidade
        && candidato.ordem < melhor.ordem)
    ) {
      melhorIndice = indice
    }
  }
  return melhorIndice
}

export function executarBuscaGulosa({ plantas, zonas }) {
  validarEntrada(plantas, zonas)

  let proximaOrdem = 0
  const solucaoInicial = Array(plantas.length).fill(null)
  // A fronteira contém os estados aguardando expansão. A Busca Gulosa retira o maior valor heurístico.
  const fronteira = [criarEstado(
    solucaoInicial,
    0,
    0,
    calcularHeuristica(solucaoInicial, 0, plantas, zonas),
    proximaOrdem++,
  )]
  const gerados = new Set([chaveEstado(solucaoInicial)])
  let estadosAvaliados = 1
  let estadosGerados = 1
  let estadosExpandidos = 0
  let estadosDescartadosPorDuplicidade = 0
  const passos = []

  while (fronteira.length > 0) {
    const [estado] = fronteira.splice(indiceMaisPromissor(fronteira), 1)

    if (estado.profundidade > 0) {
      const indiceAlocado = estado.profundidade - 1
      const zonaEscolhida = zonas.find((zona) => zona.id === estado.solucao[indiceAlocado])
      passos.push({
        passo: passos.length + 1,
        planta: plantas[indiceAlocado].nome,
        zonaEscolhida: zonaEscolhida.nome,
        fitnessParcial: calcularFitness(estado.solucao, plantas, zonas),
        heuristica: estado.heuristica,
        estadosNaFronteira: fronteira.length,
      })
    }

    if (estado.profundidade === plantas.length) {
      // A primeira solução completa retirada da fronteira encerra a busca gulosa.
      // Ela é a primeira solução da estratégia, não uma garantia de ótimo global.
      const errosSolucao = validarSolucao(estado.solucao, plantas, zonas)
      if (errosSolucao.length > 0) throw new Error(errosSolucao.join(' '))

      return {
        algoritmo: 'gulosa',
        melhorSolucao: estado.solucao,
        melhorFitness: calcularFitness(estado.solucao, plantas, zonas),
        estadosAvaliados,
        metricas: {
          passos,
          profundidadeSolucao: estado.profundidade,
          estadosGerados,
          estadosExpandidos,
          estadosDescartadosPorDuplicidade,
        },
      }
    }

    // Como as plantas mantêm a ordem original, a profundidade indica a próxima posição livre.
    const indicePlanta = estado.profundidade
    estadosExpandidos += 1

    // Cada ação custa 1. O custo registra profundidade, mas não participa da prioridade gulosa.
    // Cada zona possível gera um sucessor com a próxima planta alocada nela.
    zonas.forEach((zona) => {
      const sucessorSolucao = [...estado.solucao]
      sucessorSolucao[indicePlanta] = zona.id
      const chave = chaveEstado(sucessorSolucao)
      if (gerados.has(chave)) {
        estadosDescartadosPorDuplicidade += 1
        return
      }

      gerados.add(chave)
      estadosGerados += 1
      const profundidade = estado.profundidade + 1
      const heuristica = calcularHeuristica(sucessorSolucao, profundidade, plantas, zonas)
      estadosAvaliados += 1
      fronteira.push(criarEstado(sucessorSolucao, profundidade, estado.custo + 1, heuristica, proximaOrdem++))
    })

  }

  throw new Error('A busca terminou sem encontrar uma distribuição completa válida.')
}
