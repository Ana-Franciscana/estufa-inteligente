//ESSE ARQUIVO GUARDA OS NÚMEROS, TAXAS E PESOS IMPORTANTES DO SISTEMA EM UM ÚNICO LUGAR.





//CONTÉM A CONVERSÃO DOS TEXTOS DE ILUMINAÇÃO PARA NÚMEROS
// Atribui um número a cada nível para comparar as necessidades de luz.
// o arquivo de configuração usa chaves {} logo após o sinal de igual.
//Em JavaScript, isso significa que estamos exportando Objetos Globais de Configuração.
//Eles servem como um "dicionário" centralizado de regras. 
export const NIVEIS_LUMINOSIDADE = {
  baixa: { valor: 1, rotulo: 'baixa' },
  media: { valor: 2, rotulo: 'média' },
  alta: { valor: 3, rotulo: 'alta' },
}





//CONTÉM OS NÚMEROS QUE CONTROLAM O TAMANHO E O TEMPO DO ALGORITMO GENETICO
// Valores fixos do genético: quantas soluções há por geração, quantas gerações executar,
// chance de cruzamento, chance de mutação por planta e quantas soluções preservar.
export const PARAMETROS_PADRAO_GENETICO = {
  tamanhoPopulacao: 100, // soluções candidatas em cada geração
  numeroGeracoes: 200, // etapas de melhoria do conjunto de soluções
  taxaCrossover: 0.8, // chance de combinar cada par de pais
  taxaMutacao: 0.03, // chance de mudar o destino de cada planta
  elitismo: 2, // melhores soluções copiadas sem alteração para a geração seguinte
  tipoSelecao: 'torneio',
  tamanhoTorneio: 3, // participantes comparados para escolher cada pai
}





//CONTÉM A BALANÇA DE DE PONTOS QUE A FUNÇÃO FITNESS VAI USAR
// Estes pesos preservam a função de fitness já usada pelos dois algoritmos.
export const PARAMETROS_FITNESS = {
  toleranciaTemperatura: 5,
  toleranciaUmidade: 20,
  pesos: { temperatura: 0.4, umidade: 0.3, luminosidade: 0.3 },
  pesoAgua: 1,
  penalidadeCapacidade: 2,
  penalidadeAgua: 0.5,
}
