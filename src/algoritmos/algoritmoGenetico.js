import { calcularFitness } from '../funcoes/fitness'
import { calcularMedia } from '../funcoes/metricas'

// O algoritmo genético tenta encontrar a melhor distribuição de plantas
// entre as zonas usando evolução por várias gerações.
//
// Em cada geração:
// 1. avaliamos as soluções pelo fitness;
// 2. escolhemos boas soluções como pais;
// 3. cruzamos os pais para gerar filhos;
// 4. aplicamos pequenas mudanças aleatórias (mutação);
// 5. mantemos algumas das melhores soluções (elitismo).

// Representação de uma solução:
// cromossomo = vetor de zonas
// cada posição representa uma planta;
// o valor armazenado representa a zona escolhida para ela.
//
// Exemplo:
// [1, 2, 2, 3]
// planta 1 → zona 1
// planta 2 → zona 2
// planta 3 → zona 2
// planta 4 → zona 3

export const DISPONIVEL = true

// Quantos indivíduos participam de cada torneio de seleção
// Quanto maior o torneio, maior a preferência por soluções melhores
const TAMANHO_TORNEIO = 3

// Retorna um número inteiro aleatório entre 0 e limite - 1.
function sortearInteiro(limite) {
  return Math.floor(Math.random() * limite) // NOSONAR
}

// Escolhe aleatoriamente uma zona válida
function sortearZona(zonas) {
  return zonas[sortearInteiro(zonas.length)].id
}

// Cria uma solução inicial atribuindo uma zona aleatória para cada planta.
function criarSolucaoAleatoria(quantidadePlantas, zonas) {
  return Array.from({ length: quantidadePlantas }, () => sortearZona(zonas))
}

// Seleção por torneio:
// sorteamos alguns indivíduos e escolhemos o que tiver maior fitness.
// Assim, as melhores soluções têm mais chance de virar pais,
// mas soluções piores ainda podem ser escolhidas.
function selecionarPorTorneio(populacao) {
  let vencedor = populacao[sortearInteiro(populacao.length)]

  for (let i = 1; i < TAMANHO_TORNEIO; i += 1) {
    const concorrente = populacao[sortearInteiro(populacao.length)]

    if (concorrente.fitness > vencedor.fitness) vencedor = concorrente
  }

  return vencedor.solucao
}

// Crossover de 1 ponto:
// os pais são divididos em um ponto e trocam suas partes.

// Exemplo:
// paiA:   [1, 1, 1 | 2, 2, 2]
// paiB:   [3, 3, 3 | 3, 3, 3]
// filho1: [1, 1, 1 | 3, 3, 3]
// filho2: [3, 3, 3 | 2, 2, 2]
//
// O crossover só acontece quando o sorteio fica dentro da taxa definida.
function cruzar(paiA, paiB, taxaCrossover) {
  const naoCruza = paiA.length < 2 || Math.random() >= taxaCrossover // NOSONAR

  if (naoCruza) return [[...paiA], [...paiB]]

  const corte = 1 + sortearInteiro(paiA.length - 1)

  return [
    [...paiA.slice(0, corte), ...paiB.slice(corte)],
    [...paiB.slice(0, corte), ...paiA.slice(corte)],
  ]
}

// Muta cada gene de acordo com a taxa de mutação.
//
// Quando ocorre mutação, a planta recebe uma nova zona aleatória.
// Isso ajuda o algoritmo a explorar novas soluções.
function mutar(solucao, taxaMutacao, zonas) {
  return solucao.map((gene) => ( // NOSONAR
    Math.random() < taxaMutacao ? sortearZona(zonas) : gene
  ))
}

// Ordena a população do maior fitness para o menor
function ordenarPorFitness(populacao) {
  return populacao.sort((a, b) => b.fitness - a.fitness)
}

// Algoritmo principal
//
// Entrada:
// plantas, zonas e configurações do algoritmo
//
// Saída:
// melhor solução encontrada, fitness, histórico e métricas
export function executarAlgoritmoGenetico({ plantas, zonas, configuracao }) {
  const {
    tamanhoPopulacao,
    numeroGeracoes,
    taxaCrossover,
    taxaMutacao,
    elitismo,
  } = configuracao

  // Conta quantas soluções tiveram o fitness calculado
  let avaliacoes = 0

  // Calcula o fitness de uma solução e guarda os dois valores juntos
  const avaliar = (solucao) => {
    avaliacoes += 1

    return {
      solucao,
      fitness: calcularFitness(solucao, plantas, zonas),
    }
  }

  // Cria a primeira população com soluções aleatórias
  let populacao = Array.from(
    { length: tamanhoPopulacao },
    () => avaliar(criarSolucaoAleatoria(plantas.length, zonas)),
  )

  // Guarda a melhor solução encontrada durante todo o algoritmo
  let melhor = {
    solucao: [],
    fitness: -Infinity,
  }

  let geracaoDoMelhor = 1
  const historicoFitness = []

  for (let geracao = 1; geracao <= numeroGeracoes; geracao += 1) {

    // A primeira geração já é a população inicial.
    // Nas demais, criamos uma nova população a partir da anterior.
    if (geracao > 1) {
      const novaPopulacao = []

      // Elitismo:
      // mantém os melhores indivíduos sem alterar suas soluções
      ordenarPorFitness(populacao)
        .slice(0, elitismo)
        .forEach((individuo) => novaPopulacao.push(individuo))

      // Repetimos seleção, crossover e mutação
      // até preencher a nova população.
      while (novaPopulacao.length < tamanhoPopulacao) {

        const paiA = selecionarPorTorneio(populacao)
        const paiB = selecionarPorTorneio(populacao)

        const filhos = cruzar(paiA, paiB, taxaCrossover)

        filhos.forEach((filho) => {

          // Evita ultrapassar o tamanho definido para a população
          if (novaPopulacao.length < tamanhoPopulacao) {
            novaPopulacao.push(
              avaliar(mutar(filho, taxaMutacao, zonas))
            )
          }
        })
      }

      populacao = novaPopulacao
    }

    // Ordena a geração e identifica seu melhor indivíduo
    ordenarPorFitness(populacao)

    const melhorDaGeracao = populacao[0]

    // Atualiza a melhor solução geral, caso esta geração tenha melhorado
    if (melhorDaGeracao.fitness > melhor.fitness) {
      melhor = {
        solucao: [...melhorDaGeracao.solucao],
        fitness: melhorDaGeracao.fitness,
      }

      geracaoDoMelhor = geracao
    }

    // Guarda os dados usados para acompanhar a evolução do algoritmo
    historicoFitness.push({
      geracao,
      melhorFitness: melhorDaGeracao.fitness,
      fitnessMedio: calcularMedia(
        populacao.map((individuo) => individuo.fitness)
      ),
    })
  }

  // Retorna os resultados no formato esperado pelo executor.
  return {
    algoritmo: 'genetico',
    melhorSolucao: melhor.solucao,
    melhorFitness: melhor.fitness,
    fitnessMedio: historicoFitness[historicoFitness.length - 1].fitnessMedio,
    geracoes: numeroGeracoes,
    historicoFitness,

    metricas: {
      estadosAvaliados: avaliacoes,
      geracaoDoMelhor,
    },
  }
}