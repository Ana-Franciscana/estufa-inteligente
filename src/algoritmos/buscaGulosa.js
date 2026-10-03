// BUSCA GULOSA (Greedy Best-First Search) — arquivo reservado (NÃO IMPLEMENTADO).
//
// Para ativar: implemente `executarBuscaGulosa` e mude `DISPONIVEL` para true.
// A modelagem da busca (estados, sucessores e heurística) será definida na implementação,
// de acordo com o problema de alocação — não é um problema de pathfinding.
//
// ENTRADA — objeto { plantas, zonas, configuracao }
//   plantas:       lista de plantas individuais (resultado de expandirPlantas)
//   zonas:         lista de zonas
//   configuracao:  parâmetros da busca (ainda não definidos)
//
// SAÍDA — objeto (o tempo de execução é medido pelo serviço, não aqui)
//   {
//     algoritmo: 'gulosa',
//     melhorSolucao: [],       // vetor de ids de zona, comparável ao do Algoritmo Genético
//     melhorFitness: 0,        // calculado com calcularFitness() de funcoes/fitness.js
//     estadosAvaliados: 0,     // quantidade de estados avaliados
//     metricas: {},            // métricas adicionais, se houver
//   }

export const DISPONIVEL = false

export function executarBuscaGulosa() {
  throw new Error('A Busca Gulosa ainda não foi implementada.')
}
