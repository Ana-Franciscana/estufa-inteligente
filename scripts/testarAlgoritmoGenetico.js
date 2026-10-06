import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

// Resolve imports relativos sem extensao usados pelo projeto Vite ao executar no Node.
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

const [
  { executarAlgoritmoGenetico },
  { PARAMETROS_PADRAO_GENETICO },
  { PLANTAS_INICIAIS },
  { ZONAS_INICIAIS },
  { calcularFitness },
  { expandirPlantas },
] = await Promise.all([
  import('../src/algoritmos/algoritmoGenetico.js'),
  import('../src/dados/configuracao.js'),
  import('../src/dados/plantas.js'),
  import('../src/dados/zonas.js'),
  import('../src/funcoes/fitness.js'),
  import('../src/funcoes/solucao.js'),
])

const plantasIndividuais = expandirPlantas(PLANTAS_INICIAIS)
const resultado = executarAlgoritmoGenetico({
  plantas: plantasIndividuais,
  zonas: ZONAS_INICIAIS,
  configuracao: PARAMETROS_PADRAO_GENETICO,
})

assert.equal(resultado.algoritmo, 'genetico')
assert.equal(resultado.melhorSolucao.length, 12)
assert.ok(resultado.melhorSolucao.every((gene) => ZONAS_INICIAIS.some((zona) => zona.id === gene)))
assert.equal(
  resultado.melhorFitness,
  calcularFitness(resultado.melhorSolucao, plantasIndividuais, ZONAS_INICIAIS),
)
assert.equal(resultado.geracoes, 200)
assert.equal(resultado.historicoFitness.length, 200)
assert.equal(resultado.metricas.avaliacoesFitness, 20000)

console.log('Teste do Algoritmo Genético com a instância-base: passou.')
