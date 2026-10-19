import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

// Adiciona ao Node a resolução de imports sem extensão que o projeto usa no Vite.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      // Tenta primeiro a resolução comum do Node.
      return nextResolve(specifier, context)
    } catch (erro) {
      // Para imports relativos sem extensão, tenta o mesmo caminho com .js.
      const relativoSemExtensao = specifier.startsWith('.') && !/\.[\w]+$/.test(specifier)
      if (relativoSemExtensao) return nextResolve(`${specifier}.js`, context)
      // Não esconde outros problemas de importação.
      throw erro
    }
  },
})

// Carrega algoritmo, parâmetros, instância-base e funções de conferência em paralelo.
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

// Expande o catálogo para que cada posição da solução corresponda a uma planta física.
const plantasIndividuais = expandirPlantas(PLANTAS_INICIAIS)
// Executa o algoritmo com as plantas, zonas e parâmetros padrão do projeto.
const resultado = executarAlgoritmoGenetico({
  plantas: plantasIndividuais,
  zonas: ZONAS_INICIAIS,
  configuracao: PARAMETROS_PADRAO_GENETICO,
})

// Confirma o identificador do algoritmo e que há um gene para cada uma das 12 plantas.
assert.equal(resultado.algoritmo, 'genetico')
assert.equal(resultado.melhorSolucao.length, 12)
// Cada gene precisa apontar para um id que exista na lista de zonas.
assert.ok(resultado.melhorSolucao.every((gene) => ZONAS_INICIAIS.some((zona) => zona.id === gene)))
// Recalcula o fitness para conferir a nota retornada pelo algoritmo.
assert.equal(
  resultado.melhorFitness,
  calcularFitness(resultado.melhorSolucao, plantasIndividuais, ZONAS_INICIAIS),
)
// O teste espera 200 gerações e um registro de fitness para cada uma.
assert.equal(resultado.geracoes, 200)
assert.equal(resultado.historicoFitness.length, 200)
// Esta asserção espera o contador com o nome avaliacoesFitness.
// Hoje o algoritmo devolve o contador em metricas.estadosAvaliados, então o teste falha aqui.
assert.equal(resultado.metricas.avaliacoesFitness, 20000)

console.log('Teste do Algoritmo Genético com a instância-base: passou.')
