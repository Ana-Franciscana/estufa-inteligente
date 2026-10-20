// Fitness é a nota de uma distribuição completa ou parcial.
// Quanto maior a nota, melhor a solução segundo os critérios usados pelo projeto.
// Os dois algoritmos chamam esta mesma avaliação para comparar suas soluções.
// A nota soma as partes ambientais e a água, depois desconta excessos de capacidade e água.

// A configuração guarda os níveis de luz, os pesos e as tolerâncias usados nos cálculos.
import { NIVEIS_LUMINOSIDADE, PARAMETROS_FITNESS } from '../dados/configuracao'
// O agrupamento reúne as plantas por zona e soma água e ocupação para as penalidades.
import { agruparPlantasPorZona } from './solucao'

// Cada rótulo de luminosidade aponta para um valor numérico definido na configuração.
const valoresLuminosidade = Object.values(NIVEIS_LUMINOSIDADE).map((nivel) => nivel.valor)
// A diferença entre o maior e o menor nível vira a escala máxima para comparar luminosidades.
const MAIOR_DISTANCIA_LUMINOSIDADE = Math.max(...valoresLuminosidade) - Math.min(...valoresLuminosidade)

// Mede o quanto o valor ficou fora do intervalo que a planta aceita.
function distanciaAoIntervalo(valor, minimo, maximo) {
  // Se ficou abaixo, conta a distância até o mínimo permitido.
  if (valor < minimo) return minimo - valor
  // Se passou do máximo, conta a distância acima desse limite.
  if (valor > maximo) return valor - maximo
  // Dentro do intervalo não há distância a penalizar.
  return 0
}

// Converte a distância em uma nota: distância zero vale 1 e a tolerância chega a 0.
function pontuarPorTolerancia(distancia, tolerancia) {
  // Se a conta ficar abaixo de zero, Math.max mantém a nota no mínimo em 0.
  return Math.max(0, 1 - distancia / tolerancia)
}

// Compara a temperatura da zona com a faixa da planta e usa a tolerância de temperatura.
export function avaliarTemperatura(planta, zona) {
  // Primeiro mede a distância até a faixa; depois transforma essa distância em nota.
  const distancia = distanciaAoIntervalo(zona.temperatura, planta.temperaturaMinima, planta.temperaturaMaxima)
  return pontuarPorTolerancia(distancia, PARAMETROS_FITNESS.toleranciaTemperatura)
}

// Aplica o mesmo cálculo à umidade, usando a faixa e a tolerância próprias desse critério.
export function avaliarUmidade(planta, zona) {
  const distancia = distanciaAoIntervalo(zona.umidade, planta.umidadeMinima, planta.umidadeMaxima)
  return pontuarPorTolerancia(distancia, PARAMETROS_FITNESS.toleranciaUmidade)
}

// O texto, como "baixa" ou "alta", é usado para buscar o número associado na configuração.
export function avaliarLuminosidade(planta, zona) {
  // Math.abs transforma a diferença em distância positiva, independentemente da ordem dos níveis.
  const distancia = Math.abs(NIVEIS_LUMINOSIDADE[planta.luminosidade].valor - NIVEIS_LUMINOSIDADE[zona.luminosidade].valor)
  // Divide pela maior distância possível e subtrai de 1: níveis iguais recebem 1.
  return 1 - distancia / MAIOR_DISTANCIA_LUMINOSIDADE
}

// Compara a água disponível com a quantidade necessária. Mais água nunca reduz esta nota;
// quando não há plantas, a zona não recebe pontos de água.
export function avaliarAgua(consumoTotal, aguaDisponivel) {
  if (consumoTotal <= 0 || aguaDisponivel <= 0) return 0
  // A zona recebe a nota máxima quando tem água suficiente; senão, recebe uma fração proporcional.
  return Math.min(1, aguaDisponivel / consumoTotal)
}

// A diferença positiva entre ocupação e capacidade é multiplicada pelo peso da penalidade.
export function calcularPenalidadeCapacidade(ocupacao, capacidade) {
  // Math.max(0, ...) zera a diferença quando a zona ainda tem vagas.
  return Math.max(0, ocupacao - capacidade) * PARAMETROS_FITNESS.penalidadeCapacidade
}

// Calcula o excesso de litros e o multiplica pelo peso definido para a penalidade de água.
export function calcularPenalidadeAgua(consumoTotal, aguaDisponivel) {
  // Quando o consumo cabe na água disponível, o excesso e a penalidade ficam em zero.
  return Math.max(0, consumoTotal - aguaDisponivel) * PARAMETROS_FITNESS.penalidadeAgua
}

// Devolve a nota dividida em partes para a interface poder mostrar de onde veio o total.
export function detalharFitness(solucao, plantas, zonas) {
  // Os pesos controlam a importância dos critérios ambientais e da água.
  const { pesos, pesoAgua } = PARAMETROS_FITNESS
  // Cada componente começa em zero e acumula os valores de todas as zonas.
  const detalhe = { temperatura: 0, umidade: 0, luminosidade: 0, agua: 0, penalidadeCapacidade: 0, penalidadeAgua: 0 }

  // O agrupamento associa cada planta à zona escolhida e fornece consumo e ocupação somados.
  agruparPlantasPorZona(solucao, plantas, zonas).forEach(({ zona, plantas: plantasDaZona, consumoAgua, ocupacao }) => {
    // Avalia cada planta usando as condições da zona em que foi colocada.
    plantasDaZona.forEach((planta) => {
      // Multiplica a nota de cada condição pelo peso desse critério e acumula o resultado.
      detalhe.temperatura += pesos.temperatura * avaliarTemperatura(planta, zona)
      detalhe.umidade += pesos.umidade * avaliarUmidade(planta, zona)
      detalhe.luminosidade += pesos.luminosidade * avaliarLuminosidade(planta, zona)
    })
    // Água suficiente contribui para a nota; a falta e a lotação também são refletidas nas penalidades.
    detalhe.agua += pesoAgua * avaliarAgua(consumoAgua, zona.aguaDisponivel)
    detalhe.penalidadeCapacidade += calcularPenalidadeCapacidade(ocupacao, zona.capacidade)
    detalhe.penalidadeAgua += calcularPenalidadeAgua(consumoAgua, zona.aguaDisponivel)
  })

  // Soma as contribuições ambientais e de água e subtrai as duas penalidades.
  const total = detalhe.temperatura + detalhe.umidade + detalhe.luminosidade + detalhe.agua
    - detalhe.penalidadeCapacidade - detalhe.penalidadeAgua
  // A mesma soma é usada para todos os algoritmos e os detalhes alimentam a interface e os gráficos.
  return { ...detalhe, total }
}

// Os algoritmos usam este atalho quando precisam somente do número da nota.
export function calcularFitness(solucao, plantas, zonas) {
  // Reaproveita o detalhamento para garantir que todos usem a mesma fórmula.
  return detalharFitness(solucao, plantas, zonas).total
}
