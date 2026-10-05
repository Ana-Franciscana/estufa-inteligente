// ALGORITMO GENÉTICO (AG) — Estufa Inteligente
//
// IDEIA GERAL (como se fosse a evolução da natureza):
//   1. Criamos uma "população" de soluções aleatórias (cada solução é uma forma de
//      distribuir as plantas pelas zonas).
//   2. Damos uma nota para cada solução (o FITNESS: quanto maior, melhor).
//   3. As melhores soluções têm mais chance de virar "pais" (SELEÇÃO).
//   4. Os pais trocam pedaços entre si e geram "filhos" (CROSSOVER).
//   5. Alguns genes dos filhos mudam ao acaso (MUTAÇÃO) — isso traz novidades.
//   6. As melhores soluções passam direto para a próxima geração (ELITISMO).
//   7. Repetimos os passos 2 a 6 por várias GERAÇÕES. No final, ficamos com a melhor solução.
//
// REPRESENTAÇÃO (ver funcoes/solucao.js):
//   cromossomo = solução = vetor de ids de zona, ex.: [1, 3, 2, 1, 4, ...]
//   - cada POSIÇÃO do vetor (gene) é uma planta;
//   - o VALOR do gene é a zona onde essa planta está.
//
// Este arquivo NÃO mexe na interface: ela só chama `executarAlgoritmoGenetico`
// através de servicos/executorAlgoritmos.js (que também mede o tempo de execução).

import { calcularFitness } from '../funcoes/fitness'
import { calcularMedia } from '../funcoes/metricas'

// Diz ao serviço que este algoritmo já está implementado (a interface passa a liberá-lo).
export const DISPONIVEL = true

// Quantos indivíduos "brigam" em cada torneio de seleção.
// 3 é um valor comum: dá vantagem aos melhores sem eliminar totalmente os piores.
const TAMANHO_TORNEIO = 3

// ---------------------------------------------------------------------------
// FUNÇÕES AUXILIARES (cada uma faz uma coisa só)
// ---------------------------------------------------------------------------

// Sorteia um número inteiro de 0 até (limite - 1). Ex.: sortearInteiro(4) → 0, 1, 2 ou 3.
function sortearInteiro(limite) {
  return Math.floor(Math.random() * limite)
}

// Sorteia o id de uma zona qualquer.
function sortearZona(zonas) {
  return zonas[sortearInteiro(zonas.length)].id
}

// Cria UMA solução aleatória: para cada planta, sorteia uma zona.
function criarSolucaoAleatoria(quantidadePlantas, zonas) {
  return Array.from({ length: quantidadePlantas }, () => sortearZona(zonas))
}

// SELEÇÃO POR TORNEIO:
// sorteia alguns indivíduos da população e devolve o MELHOR deles (maior fitness).
// Assim, os bons têm mais chance de serem escolhidos, mas os ruins ainda podem ganhar às vezes.
function selecionarPorTorneio(populacao) {
  let vencedor = populacao[sortearInteiro(populacao.length)]
  for (let i = 1; i < TAMANHO_TORNEIO; i += 1) {
    const concorrente = populacao[sortearInteiro(populacao.length)]
    if (concorrente.fitness > vencedor.fitness) vencedor = concorrente
  }
  return vencedor.solucao
}

// CROSSOVER DE 1 PONTO:
// escolhe um ponto de corte e troca o "resto" dos dois pais. Exemplo (corte depois da 3ª posição):
//   paiA:   [1, 1, 1 | 2, 2, 2]       filho1: [1, 1, 1 | 3, 3, 3]
//   paiB:   [3, 3, 3 | 3, 3, 3]  →    filho2: [3, 3, 3 | 2, 2, 2]
// Só acontece com probabilidade `taxaCrossover`; senão os filhos são cópias dos pais.
function cruzar(paiA, paiB, taxaCrossover) {
  const naoCruza = paiA.length < 2 || Math.random() >= taxaCrossover
  if (naoCruza) return [[...paiA], [...paiB]]

  const corte = 1 + sortearInteiro(paiA.length - 1) // de 1 até (tamanho - 1): sempre divide em dois pedaços
  return [
    [...paiA.slice(0, corte), ...paiB.slice(corte)],
    [...paiB.slice(0, corte), ...paiA.slice(corte)],
  ]
}

// MUTAÇÃO:
// cada gene tem `taxaMutacao` de chance de trocar de zona (sorteia uma zona nova).
// Ex.: taxa de 3% → em média, 3 genes a cada 100 mudam.
function mutar(solucao, taxaMutacao, zonas) {
  return solucao.map((gene) => (Math.random() < taxaMutacao ? sortearZona(zonas) : gene))
}

// Ordena do melhor (maior fitness) para o pior. Modifica a própria lista.
function ordenarPorFitness(populacao) {
  return populacao.sort((a, b) => b.fitness - a.fitness)
}

// ---------------------------------------------------------------------------
// ALGORITMO PRINCIPAL
// ---------------------------------------------------------------------------
// ENTRADA: { plantas, zonas, configuracao }  (ver o contrato no executorAlgoritmos.js)
// SAÍDA:   objeto com a melhor solução, o histórico por geração e métricas.
export function executarAlgoritmoGenetico({ plantas, zonas, configuracao }) {
  const { tamanhoPopulacao, numeroGeracoes, taxaCrossover, taxaMutacao, elitismo } = configuracao

  // Conta quantas vezes calculamos o fitness (usado na comparação com a Busca Gulosa).
  let avaliacoes = 0

  // Transforma uma solução em { solucao, fitness } para não precisar recalcular a nota depois.
  const avaliar = (solucao) => {
    avaliacoes += 1
    return { solucao, fitness: calcularFitness(solucao, plantas, zonas) }
  }

  // PASSO 1 — População inicial: soluções totalmente aleatórias, já com a nota de cada uma.
  let populacao = Array.from({ length: tamanhoPopulacao }, () =>
    avaliar(criarSolucaoAleatoria(plantas.length, zonas)),
  )

  // Guardamos a melhor solução de TODAS as gerações (útil principalmente se o elitismo for 0).
  let melhor = { solucao: [], fitness: -Infinity }
  let geracaoDoMelhor = 1
  const historicoFitness = []

  for (let geracao = 1; geracao <= numeroGeracoes; geracao += 1) {
    // A geração 1 é a população inicial. Nas seguintes, criamos a nova população.
    if (geracao > 1) {
      const novaPopulacao = []

      // PASSO 2 — Elitismo: os N melhores passam direto, sem alteração (e sem recalcular a nota).
      ordenarPorFitness(populacao)
        .slice(0, elitismo)
        .forEach((individuo) => novaPopulacao.push(individuo))

      // PASSOS 3, 4 e 5 — Seleção → Crossover → Mutação, até a população voltar ao tamanho original.
      while (novaPopulacao.length < tamanhoPopulacao) {
        const paiA = selecionarPorTorneio(populacao)
        const paiB = selecionarPorTorneio(populacao)
        const filhos = cruzar(paiA, paiB, taxaCrossover)

        filhos.forEach((filho) => {
          // O último filho pode "passar" do tamanho; por isso a verificação.
          if (novaPopulacao.length < tamanhoPopulacao) {
            novaPopulacao.push(avaliar(mutar(filho, taxaMutacao, zonas)))
          }
        })
      }

      populacao = novaPopulacao
    }

    // PASSO 6 — Registrar como esta geração se saiu (alimenta o gráfico de evolução do fitness).
    ordenarPorFitness(populacao)
    const melhorDaGeracao = populacao[0]
    if (melhorDaGeracao.fitness > melhor.fitness) {
      melhor = { solucao: [...melhorDaGeracao.solucao], fitness: melhorDaGeracao.fitness }
      geracaoDoMelhor = geracao
    }
    historicoFitness.push({
      geracao,
      melhorFitness: melhorDaGeracao.fitness,
      fitnessMedio: calcularMedia(populacao.map((individuo) => individuo.fitness)),
    })
  }

  // PASSO 7 — Retornar o resultado respeitando a estrutura esperada pelo serviço.
  return {
    algoritmo: 'genetico',
    melhorSolucao: melhor.solucao,
    melhorFitness: melhor.fitness,
    fitnessMedio: historicoFitness[historicoFitness.length - 1].fitnessMedio, // média da população final
    geracoes: numeroGeracoes,
    historicoFitness,
    // AJUSTE AQUI: Variáveis adicionais agrupadas dentro de 'metricas' conforme o esqueleto pedia.
    metricas: { 
      estadosAvaliados: avaliacoes, // quantas soluções tiveram o fitness calculado
      geracaoDoMelhor               // geração em que a melhor solução apareceu pela primeira vez
    },
  }
}