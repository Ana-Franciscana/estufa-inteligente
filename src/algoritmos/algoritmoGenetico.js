// ALGORITMO GENÉTICO — arquivo reservado (NÃO IMPLEMENTADO).
//
// Para ativar: implemente `executarAlgoritmoGenetico` e mude `DISPONIVEL` para true.
// A interface e o serviço (servicos/executorAlgoritmos.js) não precisam ser alterados.
//
// Representação: cromossomo = solução = vetor de ids de zona (ver funcoes/solucao.js);
// gene = zona de uma planta; fitness = calcularFitness() de funcoes/fitness.js.
//
// ENTRADA — objeto { plantas, zonas, configuracao }
//   plantas:       lista de plantas individuais (resultado de expandirPlantas)
//   zonas:         lista de zonas
//   configuracao:  {
//     tamanhoPopulacao,  // ex.: 100
//     numeroGeracoes,    // ex.: 200 (critério de parada)
//     taxaCrossover,     // fração 0–1, ex.: 0.8
//     taxaMutacao,       // fração 0–1, ex.: 0.03
//     elitismo,          // indivíduos preservados por geração, ex.: 2
//     tipoSelecao,       // 'torneio'
//   }
//
// SAÍDA — objeto (o tempo de execução é medido pelo serviço, não aqui)
//   {
//     algoritmo: 'genetico',
//     melhorSolucao: [],       // vetor de ids de zona
//     melhorFitness: 0,
//     fitnessMedio: 0,         // fitness médio da população final
//     geracoes: 0,             // gerações efetivamente executadas
//     historicoFitness: [],    // [{ geracao, melhorFitness, fitnessMedio }]
//     metricas: {},            // métricas adicionais, se houver
//   }

export const DISPONIVEL = false

export function executarAlgoritmoGenetico() {
  throw new Error('O Algoritmo Genético ainda não foi implementado.')
}
