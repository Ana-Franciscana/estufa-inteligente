// Representação de uma solução.
//
// Uma solução (cromossomo) é um vetor de ids de zona:  [1, 3, 2, 1, 4, ...]
//   - cada POSIÇÃO do vetor (gene) corresponde a uma planta individual;
//   - o VALOR do gene é o id da zona em que essa planta foi alocada.
//
// As posições seguem a lista produzida por `expandirPlantas`: o catálogo de plantas
// (com `quantidade`) é expandido em uma lista de plantas individuais.

// Catálogo -> lista de plantas individuais (uma entrada por planta física).
export function expandirPlantas(plantas) {
  return plantas
    .flatMap((planta) => Array.from({ length: planta.quantidade }, () => ({ ...planta })))
    .map((planta, indice) => ({ ...planta, indice }))
}

// solucao -> [{ zona, plantas, consumoAgua, ocupacao }] (um item por zona, na ordem das zonas).
// Genes que apontam para zonas inexistentes são ignorados (use `validarSolucao` antes).
export function agruparPlantasPorZona(solucao, plantasIndividuais, zonas) {
  const grupos = zonas.map((zona) => ({ zona, plantas: [], consumoAgua: 0, ocupacao: 0 }))
  const gruposPorId = new Map(grupos.map((grupo) => [grupo.zona.id, grupo]))

  solucao.forEach((idZona, indice) => {
    const grupo = gruposPorId.get(idZona)
    const planta = plantasIndividuais[indice]
    if (!grupo || !planta) return
    grupo.plantas.push(planta)
    grupo.consumoAgua += planta.consumoAgua
    grupo.ocupacao += 1
  })

  return grupos
}

// Resume as plantas de uma zona por tipo: [{ nome: 'Tomate', quantidade: 3 }, ...]
export function resumirPlantasPorTipo(plantasDaZona) {
  const contagem = new Map()
  plantasDaZona.forEach((planta) => contagem.set(planta.nome, (contagem.get(planta.nome) ?? 0) + 1))
  return [...contagem].map(([nome, quantidade]) => ({ nome, quantidade }))
}
