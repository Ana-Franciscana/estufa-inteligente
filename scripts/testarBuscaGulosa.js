import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { performance } from 'node:perf_hooks'

// Resolve os imports relativos sem extensão usados pelo projeto Vite ao executar no Node.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (erro) {
      const relativoSemExtensao = specifier.startsWith('.') && !/\.[\w]+$/.test(specifier)
      if (relativoSemExtensao) return nextResolve(`${specifier}.js`, context)
      throw erro
    }
  },
})

const [{ executarBuscaGulosa }, { PLANTAS_INICIAIS }, { ZONAS_INICIAIS }, { calcularFitness }, { expandirPlantas }] = await Promise.all([
  import('../src/algoritmos/buscaGulosa.js'),
  import('../src/dados/plantas.js'),
  import('../src/dados/zonas.js'),
  import('../src/funcoes/fitness.js'),
  import('../src/funcoes/solucao.js'),
])

function verificarResultado(resultado, plantas, zonas) {
  assert.equal(resultado.algoritmo, 'gulosa')
  assert.equal(resultado.melhorSolucao.length, plantas.length)
  assert.ok(resultado.melhorSolucao.every((gene) => zonas.some((zona) => zona.id === gene)))
  assert.equal(resultado.melhorFitness, calcularFitness(resultado.melhorSolucao, plantas, zonas))
  assert.equal(resultado.metricas.profundidadeSolucao, plantas.length)
  assert.ok(resultado.metricas.estadosGerados >= resultado.metricas.estadosExpandidos)
  assert.ok(resultado.metricas.passos.length > 0)
}

function testarCasosDeErro(plantas, zonas) {
  assert.throws(() => executarBuscaGulosa({ plantas: [], zonas }), /planta/i)
  assert.throws(() => executarBuscaGulosa({ plantas, zonas: [] }), /zona/i)

  const zonasInvalidas = zonas.map((zona, indice) => (
    indice === 0 ? { ...zona, temperatura: Number.NaN } : zona
  ))
  assert.throws(() => executarBuscaGulosa({ plantas, zonas: zonasInvalidas }), /temperatura/i)
}

const plantasBase = expandirPlantas(PLANTAS_INICIAIS)
const inicio = performance.now()
const resultadoBase = executarBuscaGulosa({ plantas: plantasBase, zonas: ZONAS_INICIAIS })
const tempoBaseMs = performance.now() - inicio
verificarResultado(resultadoBase, plantasBase, ZONAS_INICIAIS)
assert.equal(plantasBase.length, 12)
assert.equal(ZONAS_INICIAIS.length, 4)

// Instância pequena local ao teste: não altera os dados-base da aplicação.
const plantasPequenas = [
  {
    id: 101,
    nome: 'Planta A',
    temperaturaMinima: 20,
    temperaturaMaxima: 25,
    umidadeMinima: 50,
    umidadeMaxima: 80,
    luminosidade: 'media',
    consumoAgua: 2,
    quantidade: 1,
  },
  {
    id: 102,
    nome: 'Planta B',
    temperaturaMinima: 22,
    temperaturaMaxima: 28,
    umidadeMinima: 60,
    umidadeMaxima: 90,
    luminosidade: 'alta',
    consumoAgua: 3,
    quantidade: 1,
  },
]
const zonasPequenas = [
  { id: 201, nome: 'Zona A', temperatura: 23, umidade: 70, luminosidade: 'alta', aguaDisponivel: 10, capacidade: 2 },
  { id: 202, nome: 'Zona B', temperatura: 20, umidade: 60, luminosidade: 'media', aguaDisponivel: 8, capacidade: 2 },
]
const plantasIndividuaisPequenas = expandirPlantas(plantasPequenas)
const resultadoPequeno = executarBuscaGulosa({ plantas: plantasIndividuaisPequenas, zonas: zonasPequenas })
verificarResultado(resultadoPequeno, plantasIndividuaisPequenas, zonasPequenas)
testarCasosDeErro(plantasBase, ZONAS_INICIAIS)

console.log('Teste-base (12 plantas / 4 zonas)')
console.log(JSON.stringify({
  solucao: resultadoBase.melhorSolucao,
  fitness: resultadoBase.melhorFitness,
  estadosAvaliados: resultadoBase.estadosAvaliados,
  estadosGerados: resultadoBase.metricas.estadosGerados,
  estadosExpandidos: resultadoBase.metricas.estadosExpandidos,
  estadosDescartadosPorDuplicidade: resultadoBase.metricas.estadosDescartadosPorDuplicidade,
  profundidade: resultadoBase.metricas.profundidadeSolucao,
  passos: resultadoBase.metricas.passos,
  tempoExecucaoMs: tempoBaseMs,
}, null, 2))
console.log('Teste pequeno: passou.')
console.log('Casos de erro (sem plantas, sem zonas e zona inválida): passaram.')
