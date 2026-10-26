//A UNICA FUNÇÃO DESSE ARQUIVO É PROCESSAR ESTATÍSTICAS DE DESEMPENHO E CRONOMETRAR OS ALGORITMOS
//LÉSSAS FUNÇÕES SÃO USADAS NO main.js

// Estas funções resumem listas de resultados; sem valores, as métricas devolvem null.



//SOMA TODOS OS Nº DE UMA LISTA E DIVIDE PELA QUANTIDADE PARA ACHAR A MÉDIA
// Soma todos os valores e divide pelo número deles para calcular a média.
export function calcularMedia(valores) {
  // Não divide por zero: sem itens, não existe média.
  if (valores.length === 0) return null
  // O zero é o início da soma; cada valor é acrescentado ao acumulador.
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}




//PROCURA NA LISTA E ENCONTRA O MAIOR Nº DE TODOS (FITNESS MAIS ALTO)
// Para fitness, a maior nota é a melhor; a menor é a pior.
// Math.max e Math.min recebem todos os itens espalhados como argumentos.
export const calcularMelhor = (valores) => (valores.length === 0 ? null : Math.max(...valores))

//PROCURA NA LISTA E ENCONTRA O MENOR Nº (O PIOR FITNESS)
export const calcularPior = (valores) => (valores.length === 0 ? null : Math.min(...valores))


// A amplitude mostra a distância entre o maior e o menor resultado.
export function calcularAmplitude(valores) {
  if (valores.length === 0) return null
  // Reaproveita as funções acima e subtrai o menor valor do maior.
  return calcularMelhor(valores) - calcularPior(valores)
}




// Mede a variação em torno da média usando o desvio padrão amostral.
export function calcularDesvioPadrao(valores) {
  if (valores.length === 0) return null
  // Um único número não varia em relação a si mesmo.
  if (valores.length === 1) return 0
  const media = calcularMedia(valores)
  // Mede a distância de cada número à média, eleva ao quadrado e soma.
  const somaQuadrados = valores.reduce((soma, valor) => soma + (valor - media) ** 2, 0)
  // Divide por n - 1 e tira a raiz para obter o desvio na unidade original dos valores.
  return Math.sqrt(somaQuadrados / (valores.length - 1))
}




// Mede em milissegundos quanto uma função síncrona ou assíncrona leva para terminar.
export async function cronometrar(funcao) {
  // performance.now() marca o início com precisão adequada para medir duração.
  const inicio = performance.now()
  // await aguarda a função e também o resultado se ela devolver uma promessa.
  const resultado = await funcao()
  // Devolve o resultado original e a diferença entre o horário final e o inicial.
  return { resultado, tempoExecucao: performance.now() - inicio }
}



// Recebe os resultados de várias rodadas do mesmo cenário e calcula seus resumos.
export function resumirRodadas(resultados) {
  // Extrai de cada resultado a nota e o tempo para resumir cada conjunto separadamente.
  const fitness = resultados.map((resultado) => resultado.melhorFitness)
  const tempos = resultados.map((resultado) => resultado.tempoExecucao)
  return {
    // Informa quantas execuções foram reunidas neste resumo.
    rodadas: resultados.length,
    // Resume a qualidade das soluções: média, maior e menor nota e variação entre as notas.
    fitnessMedio: calcularMedia(fitness),
    melhorFitness: calcularMelhor(fitness),
    piorFitness: calcularPior(fitness),
    desvioPadraoFitness: calcularDesvioPadrao(fitness),
    amplitudeFitness: calcularAmplitude(fitness),
    // Resume a duração das execuções, também mostrando a variação dos tempos.
    tempoMedio: calcularMedia(tempos),
    desvioPadraoTempo: calcularDesvioPadrao(tempos),
  }
}
