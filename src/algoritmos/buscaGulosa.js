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

// Cria o registro usado pela busca para guardar cada alternativa de distribuição.
function criarEstado(solucao, profundidade, custo, heuristica, ordem) {
  // solucao guarda as zonas; profundidade conta plantas alocadas;
  // custo conta alocações; heuristica ordena alternativas; ordem desempata.
  return { solucao, profundidade, custo, heuristica, ordem }
}

// A mesma lista sempre vira a mesma chave de texto, usada pelo Set de estados já vistos.
function chaveEstado(solucao) {
  return JSON.stringify(solucao)
}

// Começa com a nota da parte já alocada e estima a contribuição ambiental das plantas restantes.
// A estimativa não calcula para as plantas restantes o efeito conjunto de água ou capacidade.
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

// Devolve a posição do estado mais promissor que será retirado da fronteira.
function indiceMaisPromissor(fronteira) {
  let melhorIndice = 0
  // Compara cada candidato com o estado que até agora ficou em primeiro lugar.
  for (let indice = 1; indice < fronteira.length; indice += 1) {
    const candidato = fronteira[indice]
    const melhor = fronteira[melhorIndice]
    // Maior heurística vence; em empate, ganha maior profundidade e depois menor ordem.
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
  // plantas tem uma entrada por planta física; zonas contém os destinos possíveis.
  // Se houver dados inválidos, a validação interrompe a execução com uma mensagem.
  validarEntrada(plantas, zonas)

  // A ordem de criação desempata estados com a mesma heurística e profundidade.
  let proximaOrdem = 0
  // Cria uma posição por planta; null indica que essa posição ainda não tem zona.
  const solucaoInicial = Array(plantas.length).fill(null)
  // A fronteira guarda alternativas pendentes, para a busca poder escolher qual explorar primeiro.
  const fronteira = [criarEstado(
    solucaoInicial,
    0,
    0,
    // Avalia o início sem alocações para estimar seu potencial.
    calcularHeuristica(solucaoInicial, 0, plantas, zonas),
    proximaOrdem++,
  )]
  // Registra o estado inicial desde já para que ele também não seja criado de novo.
  const gerados = new Set([chaveEstado(solucaoInicial)])
  // A heurística do estado inicial já foi calculada, por isso começa com uma avaliação.
  // Na instância-base, o contador final 49 representa 49 estados com heurística calculada.
  let estadosAvaliados = 1
  // O estado inicial também conta como gerado; ainda não foi expandido.
  let estadosGerados = 1
  // Conta estados incompletos retirados da fronteira e expandidos em busca de sucessores.
  let estadosExpandidos = 0
  // Conta candidatos repetidos encontrados antes de calcular sua heurística.
  let estadosDescartadosPorDuplicidade = 0
  // Guarda uma descrição de cada estado selecionado depois do início.
  const passos = []

  while (fronteira.length > 0) {
    // Busca o índice prioritário e splice remove esse único estado da lista.
    // A desestruturação [estado] recebe o item removido, não o índice.
    const [estado] = fronteira.splice(indiceMaisPromissor(fronteira), 1)

    if (estado.profundidade > 0) {
      // A última posição preenchida é profundidade - 1; registra onde essa planta foi colocada.
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

    // Quando a profundidade alcança o número de plantas, todas as posições foram preenchidas.
    if (estado.profundidade === plantas.length) {
      // A primeira solução completa escolhida encerra a busca sem comparar todas as demais.
      // Por isso, mesmo o fitness 12.91 da instância-base não prova que seja o ótimo global.
      const errosSolucao = validarSolucao(estado.solucao, plantas, zonas)
      if (errosSolucao.length > 0) throw new Error(errosSolucao.join(' '))

      return {
        // O serviço usa o identificador do algoritmo e a distribuição encontrada.
        algoritmo: 'gulosa',
        melhorSolucao: estado.solucao,
        // Esta é a nota oficial da solução completa, não a heurística estimada.
        melhorFitness: calcularFitness(estado.solucao, plantas, zonas),
        // Conta estados cuja heurística foi calculada; não conta plantas ou etapas da solução.
        estadosAvaliados,
        metricas: {
          // passos descreve as escolhas; profundidade é o número de plantas alocadas.
          passos,
          profundidadeSolucao: estado.profundidade,
          // Gerados inclui o início; expandidos conta estados que produziram sucessores.
          estadosGerados,
          estadosExpandidos,
          // Inclui alternativas repetidas descartadas antes de serem avaliadas.
          estadosDescartadosPorDuplicidade,
        },
      }
    }

    // As plantas são alocadas na ordem recebida; profundidade aponta para a próxima posição livre.
    const indicePlanta = estado.profundidade
    // Este estado incompleto será expandido ao tentar todas as zonas possíveis.
    estadosExpandidos += 1

    // Testa cada zona e monta a distribuição que resultaria de alocar nela a próxima planta.
    zonas.forEach((zona) => {
      // Copia o estado antes de preencher a posição da planta atual.
      const sucessorSolucao = [...estado.solucao]
      sucessorSolucao[indicePlanta] = zona.id
      // A chave representa a lista inteira; o Set encontra repetidos sem percorrer os demais estados.
      const chave = chaveEstado(sucessorSolucao)
      if (gerados.has(chave)) {
        // Conta e descarta uma distribuição que já apareceu.
        estadosDescartadosPorDuplicidade += 1
        return
      }

      // Marca a alternativa como gerada e atualiza seu contador antes de avaliá-la.
      gerados.add(chave)
      estadosGerados += 1
      // Uma alocação aumenta a profundidade em um.
      const profundidade = estado.profundidade + 1
      // A heurística é calculada uma vez para cada estado novo e contado como avaliação.
      const heuristica = calcularHeuristica(sucessorSolucao, profundidade, plantas, zonas)
      estadosAvaliados += 1
      // Cada alocação soma 1 ao custo, que não define prioridade; a ordem de criação desempata.
      fronteira.push(criarEstado(sucessorSolucao, profundidade, estado.custo + 1, heuristica, proximaOrdem++))
    })

  }

  // Se não restar alternativa antes de completar todas as posições, não há solução para devolver.
  throw new Error('A busca terminou sem encontrar uma distribuição completa válida.')
}
