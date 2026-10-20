import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

// Permite executar no Node os imports locais que o Vite resolve sem extensão.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (erro) {
      if (specifier.startsWith('.') && !/\.[\w]+$/.test(specifier)) return nextResolve(`${specifier}.js`, context)
      throw erro
    }
  },
})

const [
  { executarBuscaGulosa }, { executarAlgoritmoGenetico }, { PARAMETROS_PADRAO_GENETICO },
  { PLANTAS_INICIAIS }, { ZONAS_INICIAIS }, { CENARIOS }, { calcularFitness, avaliarAgua, detalharFitness },
  { expandirPlantas },
] = await Promise.all([
  import('../src/algoritmos/buscaGulosa.js'), import('../src/algoritmos/algoritmoGenetico.js'),
  import('../src/dados/configuracao.js'), import('../src/dados/plantas.js'),
  import('../src/dados/zonas.js'), import('../src/cenarios.js'),
  import('../src/funcoes/fitness.js'), import('../src/funcoes/solucao.js'),
])

const plantas = expandirPlantas(PLANTAS_INICIAIS)

// Água suficiente vale a nota máxima, mais água não reduz a nota e falta de água reduz a nota.
assert.equal(avaliarAgua(10, 10), 1)
assert.equal(avaliarAgua(10, 20), 1)
assert.equal(avaliarAgua(10, 5), 0.5)
assert.equal(avaliarAgua(10, 0), 0)
assert.equal(avaliarAgua(0, 20), 0)

// Confere que falta de água e excesso de capacidade aparecem nas parcelas próprias do fitness.
const plantaTeste = [{ ...PLANTAS_INICIAIS[0], quantidade: 1, consumoAgua: 2 }]
const zonaTeste = [{ id: 99, nome: 'Zona de teste', temperatura: 24, umidade: 80, luminosidade: 'alta', aguaDisponivel: 1, capacidade: 0 }]
const detalhesTeste = detalharFitness([99], plantaTeste, zonaTeste)
assert.equal(detalhesTeste.agua, 0.5)
assert.equal(detalhesTeste.penalidadeAgua, 0.5)
assert.equal(detalhesTeste.penalidadeCapacidade, 2)
assert.equal(detalhesTeste.total, -1)

// Para a mesma distribuição, mais água não pode diminuir o fitness total.
const distribuicaoFixa = plantas.map((_, indice) => ZONAS_INICIAIS[indice % ZONAS_INICIAIS.length].id)
const notasPorCenario = Object.values(CENARIOS).map((cenario) => calcularFitness(distribuicaoFixa, plantas, cenario.zonas))
assert.ok(notasPorCenario[1] >= notasPorCenario[0])
assert.ok(notasPorCenario[2] <= notasPorCenario[0])

const valoresAguaEsperados = {
  normal: [80, 60, 90, 50],
  maisAgua: [96, 72, 108, 60],
  menosAgua: [64, 48, 72, 40],
}

for (const cenario of Object.values(CENARIOS)) {
  // Confere os litros esperados e garante que apenas a disponibilidade de água foi alterada.
  const agua = cenario.zonas.map((zona) => zona.aguaDisponivel)
  assert.deepEqual(agua, valoresAguaEsperados[cenario.id])
  cenario.zonas.forEach((zona, indice) => {
    const original = ZONAS_INICIAIS[indice]
    assert.equal(zona.temperatura, original.temperatura)
    assert.equal(zona.umidade, original.umidade)
    assert.equal(zona.luminosidade, original.luminosidade)
    assert.equal(zona.capacidade, original.capacidade)
  })

  // Ambos recebem as mesmas referências de plantas e zonas nesta comparação.
  const zonas = cenario.zonas.map((zona) => ({ ...zona }))
  const gulosa = executarBuscaGulosa({ plantas, zonas })
  const genetico = executarAlgoritmoGenetico({ plantas, zonas, configuracao: PARAMETROS_PADRAO_GENETICO })
  assert.equal(gulosa.melhorSolucao.length, plantas.length)
  assert.equal(genetico.melhorSolucao.length, plantas.length)
  assert.equal(gulosa.melhorFitness, calcularFitness(gulosa.melhorSolucao, plantas, zonas))
  assert.equal(genetico.melhorFitness, calcularFitness(genetico.melhorSolucao, plantas, zonas))
  assert.equal(genetico.historicoFitness.length, PARAMETROS_PADRAO_GENETICO.numeroGeracoes)
  assert.deepEqual(genetico.historicoFitness.map((item) => item.geracao), Array.from({ length: 200 }, (_, indice) => indice + 1))
  assert.ok(genetico.historicoFitness.every((item) => Number.isFinite(item.melhorFitness) && Number.isFinite(item.fitnessMedio)))
  assert.ok(gulosa.metricas.estadosGerados >= gulosa.metricas.estadosExpandidos)
  console.log(`${cenario.nome}: dados, Busca Gulosa, Algoritmo Genético e histórico passaram.`)
}
