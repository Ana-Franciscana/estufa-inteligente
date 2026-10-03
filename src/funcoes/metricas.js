// Métricas para avaliação de desempenho (fitness, tempo, variação entre execuções).
// Funções puras: recebem listas de números e devolvem `null` quando não há dados.

export function calcularMedia(valores) {
  if (valores.length === 0) return null
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}

// Para fitness, "melhor" é o maior valor e "pior" é o menor.
export const calcularMelhor = (valores) => (valores.length === 0 ? null : Math.max(...valores))
export const calcularPior = (valores) => (valores.length === 0 ? null : Math.min(...valores))

export function calcularAmplitude(valores) {
  if (valores.length === 0) return null
  return calcularMelhor(valores) - calcularPior(valores)
}

// Desvio padrão amostral (divisão por n − 1); com uma única observação é 0.
export function calcularDesvioPadrao(valores) {
  if (valores.length === 0) return null
  if (valores.length === 1) return 0
  const media = calcularMedia(valores)
  const somaQuadrados = valores.reduce((soma, valor) => soma + (valor - media) ** 2, 0)
  return Math.sqrt(somaQuadrados / (valores.length - 1))
}

// Mede o tempo de execução (ms) de uma função síncrona ou assíncrona.
export async function cronometrar(funcao) {
  const inicio = performance.now()
  const resultado = await funcao()
  return { resultado, tempoExecucao: performance.now() - inicio }
}

// Resume várias rodadas (resultados padronizados dos algoritmos) de uma mesma configuração.
export function resumirRodadas(resultados) {
  const fitness = resultados.map((resultado) => resultado.melhorFitness)
  const tempos = resultados.map((resultado) => resultado.tempoExecucao)
  return {
    rodadas: resultados.length,
    fitnessMedio: calcularMedia(fitness),
    melhorFitness: calcularMelhor(fitness),
    piorFitness: calcularPior(fitness),
    desvioPadraoFitness: calcularDesvioPadrao(fitness),
    amplitudeFitness: calcularAmplitude(fitness),
    tempoMedio: calcularMedia(tempos),
    desvioPadraoTempo: calcularDesvioPadrao(tempos),
  }
}
