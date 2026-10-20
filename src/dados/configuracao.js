// Atribui um número a cada nível para comparar as necessidades de luz.
export const NIVEIS_LUMINOSIDADE = {
  baixa: { valor: 1, rotulo: 'baixa' },
  media: { valor: 2, rotulo: 'média' },
  alta: { valor: 3, rotulo: 'alta' },
}

// Valores fixos do genético: quantas soluções há por geração, quantas gerações executar,
// chance de cruzamento, chance de mutação por planta e quantas soluções preservar.
export const PARAMETROS_PADRAO_GENETICO = {
  tamanhoPopulacao: 100, // soluções candidatas em cada geração
  numeroGeracoes: 200, // etapas de melhoria do conjunto de soluções
  taxaCrossover: 0.8, // chance de combinar cada par de pais
  taxaMutacao: 0.03, // chance de mudar o destino de cada planta
  elitismo: 2, // melhores soluções copiadas sem alteração para a geração seguinte
  tipoSelecao: 'torneio',
}

// Estes pesos preservam a função de fitness já usada pelos dois algoritmos.
export const PARAMETROS_FITNESS = {
  toleranciaTemperatura: 5,
  toleranciaUmidade: 20,
  pesos: { temperatura: 0.4, umidade: 0.3, luminosidade: 0.3 },
  pesoAgua: 1,
  penalidadeCapacidade: 2,
  penalidadeAgua: 0.5,
}
