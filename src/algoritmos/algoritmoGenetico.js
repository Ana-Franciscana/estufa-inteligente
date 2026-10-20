// O fitness compara a qualidade das distribuições, e a média resume uma geração.
import { calcularFitness } from '../funcoes/fitness'
import { calcularMedia } from '../funcoes/metricas'

// Cada solução é uma lista: a posição indica a planta e o valor indica sua zona.
// Ao longo das gerações, o algoritmo escolhe pais, combina soluções e pode mudar alguns genes.

export const DISPONIVEL = true

// Math.random() gera um valor de 0 até antes de 1.
// Multiplicar por limite cria uma faixa de índices e Math.floor() arredonda para baixo.
function sortearInteiro(limite) {
  return Math.floor(Math.random() * limite) // NOSONAR
}

// O índice sorteado fica dentro da lista porque usamos zonas.length como limite.
// A solução guarda o id da zona, não o objeto inteiro.
function sortearZona(zonas) {
  return zonas[sortearInteiro(zonas.length)].id
}

// Array.from cria uma posição para cada planta da lista.
// Em cada posição, a função sorteia o id da zona que receberá aquela planta.
function criarSolucaoAleatoria(quantidadePlantas, zonas) {
  return Array.from({ length: quantidadePlantas }, () => sortearZona(zonas))
}

// Sorteia participantes e escolhe como pai aquele que tiver o maior fitness.
// Como o sorteio pode incluir qualquer indivíduo, uma solução mais fraca também pode vencer.
function selecionarPorTorneio(populacao, tamanhoTorneio) {
  // O primeiro sorteado vira vencedor provisório e garante que já exista alguém para comparar.
  let vencedor = populacao[sortearInteiro(populacao.length)]

  // Os outros dois participantes são sorteados um de cada vez.
  // Cada sorteio pode repetir um indivíduo que já tenha participado.
  for (let i = 1; i < tamanhoTorneio; i += 1) {
    const concorrente = populacao[sortearInteiro(populacao.length)]

    // Fitness maior significa nota melhor e substitui o vencedor provisório.
    if (concorrente.fitness > vencedor.fitness) vencedor = concorrente
  }

  // Devolve a distribuição do vencedor para ser usada como pai.
  return vencedor.solucao
}

// A taxa é a chance de cruzar o par inteiro; não significa mudar essa porcentagem de genes.
function cruzar(paiA, paiB, taxaCrossover) {
  // Um cromossomo com menos de duas posições não tem onde cortar.
  // Caso contrário, o sorteio decide se este par fica sem cruzamento.
  const naoCruza = paiA.length < 2 || Math.random() >= taxaCrossover // NOSONAR

  // Sem cruzamento, cria cópias para que os filhos não sejam os mesmos vetores dos pais.
  if (naoCruza) return [[...paiA], [...paiB]]

  // O corte fica depois da primeira posição e antes da última.
  // Assim, cada lado do corte contém pelo menos um gene.
  const corte = 1 + sortearInteiro(paiA.length - 1)

  return [
    // slice pega cada pedaço sem alterar os pais; ... junta os pedaços em novos vetores.
    [...paiA.slice(0, corte), ...paiB.slice(corte)],
    [...paiB.slice(0, corte), ...paiA.slice(corte)],
  ]
}

// Aplica a chance de mutação separadamente a cada gene, isto é, à zona de cada planta.
function mutar(solucao, taxaMutacao, zonas) {
  return solucao.map((gene) => ( // NOSONAR
    // Se o sorteio ficar abaixo da taxa, escolhe uma zona aleatória para este gene.
    // Com 0.03, cada posição tem 3% de chance; isso não é uma taxa de erro.
    // A nova zona pode até ser igual à atual; caso contrário, ? : mantém o gene original.
    Math.random() < taxaMutacao ? sortearZona(zonas) : gene
  ))
}

// Compara os fitness em ordem decrescente para deixar a melhor solução na posição zero.
function ordenarPorFitness(populacao) {
  return populacao.sort((a, b) => b.fitness - a.fitness)
}

// Recebe as plantas individuais, as zonas disponíveis e a configuração do Algoritmo Genético.
export function executarAlgoritmoGenetico({ plantas, zonas, configuracao }) {
  // Separa o tamanho da população, o número de gerações, as taxas e quantos indivíduos preservar.
  const {
    // Número de soluções que cada geração deve conter.
    tamanhoPopulacao,
    // Quantas vezes a população será avaliada e evoluída.
    numeroGeracoes,
    // Chance de combinar os dois pais em cada par.
    taxaCrossover,
    // Chance aplicada separadamente a cada gene de um filho.
    taxaMutacao,
    // Quantos dos melhores indivíduos passam à geração seguinte sem alteração.
    elitismo,
    // Quantos indivíduos participam de cada disputa para escolher um pai.
    tamanhoTorneio,
  } = configuracao

  // Conta as avaliações de soluções, incluindo a população inicial e os filhos.
  let avaliacoes = 0

  // Esta função é usada sempre que uma nova solução precisa receber uma nota.
  const avaliar = (solucao) => {
    // Registra que o fitness será calculado para esta solução.
    avaliacoes += 1

    return {
      // Mantém a distribuição junto da nota para a seleção poder usar os dois dados.
      solucao,
      fitness: calcularFitness(solucao, plantas, zonas),
    }
  }

  // Gera exatamente tamanhoPopulacao distribuições aleatórias e avalia cada uma.
  let populacao = Array.from(
    { length: tamanhoPopulacao },
    () => avaliar(criarSolucaoAleatoria(plantas.length, zonas)),
  )

  // -Infinity garante que a primeira solução da primeira geração seja aceita como campeã.
  let melhor = {
    solucao: [],
    fitness: -Infinity,
  }

  // Guarda em qual geração a melhor solução geral foi encontrada.
  let geracaoDoMelhor = 1
  // Cada item guarda o melhor fitness e a média de uma geração para os gráficos.
  const historicoFitness = []

  // Começa na geração 1 porque a população inicial já é a primeira geração.
  // Continua até incluir numeroGeracoes; soma 1 para avançar à próxima geração.
  for (let geracao = 1; geracao <= numeroGeracoes; geracao += 1) {

    // A população inicial já está pronta na geração 1; só as posteriores precisam ser recriadas.
    if (geracao > 1) {
      const novaPopulacao = []

      // Ordena a população anterior e copia os melhores indivíduos sem mutá-los.
      // elitismo é a quantidade preservada, não uma taxa de mudança.
      ordenarPorFitness(populacao)
        .slice(0, elitismo)
        .forEach((individuo) => novaPopulacao.push(individuo))

      // Continua criando filhos enquanto ainda houver posições vazias na nova população.
      while (novaPopulacao.length < tamanhoPopulacao) {

        // Cada torneio escolhe um pai da população anterior.
        const paiA = selecionarPorTorneio(populacao, tamanhoTorneio)
        const paiB = selecionarPorTorneio(populacao, tamanhoTorneio)

        // Com a chance taxaCrossover, mistura os pais; caso contrário, devolve cópias deles.
        const filhos = cruzar(paiA, paiB, taxaCrossover)

        // Avalia cada filho depois de aplicar a mutação gene a gene.
        filhos.forEach((filho) => {

          // A dupla pode ter dois filhos, então verifica o limite antes de adicionar cada um.
          if (novaPopulacao.length < tamanhoPopulacao) {
            novaPopulacao.push(
              avaliar(mutar(filho, taxaMutacao, zonas))
            )
          }
        })
      }

      // Descarta a geração anterior para que a próxima rodada use os novos indivíduos.
      populacao = novaPopulacao
    }

    // Ordena a população atual para que o melhor indivíduo fique na primeira posição.
    ordenarPorFitness(populacao)

    const melhorDaGeracao = populacao[0]

    // Compara o campeão desta geração com o campeão de todas as gerações anteriores.
    if (melhorDaGeracao.fitness > melhor.fitness) {
      melhor = {
        // Copia o vetor para guardar a solução mesmo quando a população mudar depois.
        solucao: [...melhorDaGeracao.solucao],
        fitness: melhorDaGeracao.fitness,
      }

      // Guarda a geração em que esse novo melhor resultado apareceu.
      geracaoDoMelhor = geracao
    }

    // Registra o melhor fitness desta geração e a média de todos os indivíduos dela.
    historicoFitness.push({
      geracao,
      melhorFitness: melhorDaGeracao.fitness,
      fitnessMedio: calcularMedia(
        // Extrai as notas dos indivíduos atuais para calcular a média desta geração.
        populacao.map((individuo) => individuo.fitness)
      ),
    })
  }

  // Devolve os campos padronizados que o serviço usa para validar e apresentar o resultado.
  return {
    // Identifica qual algoritmo produziu o resultado.
    algoritmo: 'genetico',
    // Distribuição campeã e sua nota final.
    melhorSolucao: melhor.solucao,
    melhorFitness: melhor.fitness,
    // Média da última geração, total de gerações e dados para o gráfico de evolução.
    fitnessMedio: historicoFitness[historicoFitness.length - 1].fitnessMedio,
    geracoes: numeroGeracoes,
    historicoFitness,

    metricas: {
      // Quantas soluções receberam uma avaliação de fitness e quando surgiu a campeã.
      estadosAvaliados: avaliacoes,
      geracaoDoMelhor,
    },
  }
}
