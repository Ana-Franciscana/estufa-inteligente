
// Transforma o catálogo em uma lista com uma entrada para cada planta física.
export function expandirPlantas(plantas) {
  return plantas
    // flatMap percorre os tipos e cria uma cópia para cada unidade indicada em quantidade.
    // O spread copia os campos do tipo para cada planta individual.
    .flatMap((planta) => Array.from({ length: planta.quantidade }, () => ({ ...planta })))
    // Acrescenta o índice de cada posição, que corresponde à posição da planta na solução.
    .map((planta, indice) => ({ ...planta, indice }))
}

// A solução guarda um id de zona em cada posição, na mesma ordem de plantasIndividuais.
export function agruparPlantasPorZona(solucao, plantasIndividuais, zonas) {
  // Cada grupo começa sem plantas, sem consumo de água e sem ocupação.
  const grupos = zonas.map((zona) => ({ zona, plantas: [], consumoAgua: 0, ocupacao: 0 }))
  // Guarda cada grupo pela chave id para procurar rapidamente o destino de cada planta.
  const gruposPorId = new Map(grupos.map((grupo) => [grupo.zona.id, grupo]))

  // Percorre os genes: idZona é o destino e indice aponta para a planta correspondente.
  solucao.forEach((idZona, indice) => {
    // Procura o grupo que corresponde ao id guardado neste gene.
    const grupo = gruposPorId.get(idZona)
    // Busca a planta na mesma posição da lista individual.
    const planta = plantasIndividuais[indice]
    // Se faltar a zona ou a planta, ignora esta posição e segue para a próxima.
    if (!grupo || !planta) return
    // Com ambos encontrados, registra a planta e atualiza os totais do grupo.
    grupo.plantas.push(planta)
    grupo.consumoAgua += planta.consumoAgua
    grupo.ocupacao += 1
  })

  // Devolve um grupo por zona, com plantas, água consumida e ocupação calculadas.
  return grupos
}

// Resume uma lista de plantas contando quantas têm o mesmo nome.
export function resumirPlantasPorTipo(plantasDaZona) {
  // O Map associa o nome da planta à quantidade encontrada até agora.
  const contagem = new Map()
  // ?? 0 usa zero quando aquele nome ainda não foi contado; cada ocorrência soma mais um.
  plantasDaZona.forEach((planta) => contagem.set(planta.nome, (contagem.get(planta.nome) ?? 0) + 1))
  // Transforma os pares [nome, quantidade] em objetos que a interface pode apresentar.
  return [...contagem].map(([nome, quantidade]) => ({ nome, quantidade }))
}
