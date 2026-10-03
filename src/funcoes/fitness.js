// PONTO CENTRAL da avaliação de soluções.
//
// Toda a fórmula de fitness fica neste arquivo (e seus pesos em dados/configuracao.js).
// Maior fitness = melhor solução.
//
// ATENÇÃO: esta é a versão INICIAL da fórmula, escrita para que a aplicação possa avaliar
// qualquer distribuição. Ela será refinada na etapa de implementação dos algoritmos.
//
//   fitness = Σ plantas (peso_T·temperatura + peso_U·umidade + peso_L·luminosidade)
//           + peso_água · Σ zonas (aproveitamento da água disponível)
//           − penalidade_capacidade · plantas além da capacidade
//           − penalidade_água · litros/dia acima do disponível
//
// Cada adequação individual vale de 0 (inadequada) a 1 (ideal).

import { NIVEIS_LUMINOSIDADE, PARAMETROS_FITNESS } from '../dados/configuracao'
import { agruparPlantasPorZona } from './solucao'

const valoresLuminosidade = Object.values(NIVEIS_LUMINOSIDADE).map((nivel) => nivel.valor)
const MAIOR_DISTANCIA_LUMINOSIDADE = Math.max(...valoresLuminosidade) - Math.min(...valoresLuminosidade)

function distanciaAoIntervalo(valor, minimo, maximo) {
  if (valor < minimo) return minimo - valor
  if (valor > maximo) return valor - maximo
  return 0
}

// 1 dentro do intervalo ideal; cai linearmente até 0 ao atingir a tolerância.
function pontuarPorTolerancia(distancia, tolerancia) {
  return Math.max(0, 1 - distancia / tolerancia)
}

export function avaliarTemperatura(planta, zona) {
  const distancia = distanciaAoIntervalo(zona.temperatura, planta.temperaturaMinima, planta.temperaturaMaxima)
  return pontuarPorTolerancia(distancia, PARAMETROS_FITNESS.toleranciaTemperatura)
}

export function avaliarUmidade(planta, zona) {
  const distancia = distanciaAoIntervalo(zona.umidade, planta.umidadeMinima, planta.umidadeMaxima)
  return pontuarPorTolerancia(distancia, PARAMETROS_FITNESS.toleranciaUmidade)
}

export function avaliarLuminosidade(planta, zona) {
  const distancia = Math.abs(NIVEIS_LUMINOSIDADE[planta.luminosidade].valor - NIVEIS_LUMINOSIDADE[zona.luminosidade].valor)
  return 1 - distancia / MAIOR_DISTANCIA_LUMINOSIDADE
}

// Aproveitamento da água da zona (0 a 1). O excesso é tratado em `calcularPenalidadeAgua`.
export function avaliarAgua(consumoTotal, aguaDisponivel) {
  if (aguaDisponivel <= 0) return 0
  return Math.min(consumoTotal, aguaDisponivel) / aguaDisponivel
}

export function calcularPenalidadeCapacidade(ocupacao, capacidade) {
  return Math.max(0, ocupacao - capacidade) * PARAMETROS_FITNESS.penalidadeCapacidade
}

export function calcularPenalidadeAgua(consumoTotal, aguaDisponivel) {
  return Math.max(0, consumoTotal - aguaDisponivel) * PARAMETROS_FITNESS.penalidadeAgua
}

// Fitness com o detalhamento de cada componente (útil para a interface e para o relatório).
// Os componentes já estão ponderados: temperatura + umidade + luminosidade + agua - penalidades = total.
export function detalharFitness(solucao, plantas, zonas) {
  const { pesos, pesoAgua } = PARAMETROS_FITNESS
  const detalhe = { temperatura: 0, umidade: 0, luminosidade: 0, agua: 0, penalidadeCapacidade: 0, penalidadeAgua: 0 }

  agruparPlantasPorZona(solucao, plantas, zonas).forEach(({ zona, plantas: plantasDaZona, consumoAgua, ocupacao }) => {
    plantasDaZona.forEach((planta) => {
      detalhe.temperatura += pesos.temperatura * avaliarTemperatura(planta, zona)
      detalhe.umidade += pesos.umidade * avaliarUmidade(planta, zona)
      detalhe.luminosidade += pesos.luminosidade * avaliarLuminosidade(planta, zona)
    })
    detalhe.agua += pesoAgua * avaliarAgua(consumoAgua, zona.aguaDisponivel)
    detalhe.penalidadeCapacidade += calcularPenalidadeCapacidade(ocupacao, zona.capacidade)
    detalhe.penalidadeAgua += calcularPenalidadeAgua(consumoAgua, zona.aguaDisponivel)
  })

  const total = detalhe.temperatura + detalhe.umidade + detalhe.luminosidade + detalhe.agua
    - detalhe.penalidadeCapacidade - detalhe.penalidadeAgua
  return { ...detalhe, total }
}

// Função usada pelos algoritmos: recebe uma solução e devolve seu fitness (número).
export function calcularFitness(solucao, plantas, zonas) {
  return detalharFitness(solucao, plantas, zonas).total
}
