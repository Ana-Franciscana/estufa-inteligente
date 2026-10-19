import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { performance } from 'node:perf_hooks'

// Adiciona ao Node a resolução de imports sem extensão que o projeto usa no Vite.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      // Primeiro deixa o Node resolver o caminho normalmente.
      return nextResolve(specifier, context)
    } catch (erro) {
      // Se for um import relativo sem extensão, tenta novamente acrescentando .js.
      const relativoSemExtensao = specifier.startsWith('.') && !/\.[\w]+$/.test(specifier)
      if (relativoSemExtensao) return nextResolve(`${specifier}.js`, context)
      // Outros erros de importação continuam sendo informados.
      throw erro
    }
  },
})

// Carrega em paralelo o algoritmo, os dados e as funções usadas para conferir a resposta.
const [{ executarBuscaGulosa }, { PLANTAS_INICIAIS }, { ZONAS_INICIAIS }, { calcularFitness }, { expandirPlantas }] = await Promise.all([
  import('../src/algoritmos/buscaGulosa.js'),
  import('../src/dados/plantas.js'),
  import('../src/dados/zonas.js'),
  import('../src/funcoes/fitness.js'),
  import('../src/funcoes/solucao.js'),
])

// Confere o formato da resposta, a validade da distribuição, o fitness e as métricas principais.
function verificarResultado(resultado, plantas, zonas) {
  // Confirma que a resposta identifica a Busca Gulosa.
  assert.equal(resultado.algoritmo, 'gulosa')
  // A solução tem que guardar uma zona para cada planta.
  assert.equal(resultado.melhorSolucao.length, plantas.length)
  // Todos os genes precisam corresponder a ids de zonas existentes.
  assert.ok(resultado.melhorSolucao.every((gene) => zonas.some((zona) => zona.id === gene)))
  // Recalcula a nota para conferir que o fitness devolvido está correto.
  assert.equal(resultado.melhorFitness, calcularFitness(resultado.melhorSolucao, plantas, zonas))
  // A profundidade final deve corresponder ao total de plantas alocadas.
  assert.equal(resultado.metricas.profundidadeSolucao, plantas.length)
  // Não pode haver mais estados expandidos do que gerados, e deve existir ao menos um passo.
  assert.ok(resultado.metricas.estadosGerados >= resultado.metricas.estadosExpandidos)
  assert.ok(resultado.metricas.passos.length > 0)
}

// Confere que entradas sem plantas, sem zonas ou com uma zona inválida causam erro.
function testarCasosDeErro(plantas, zonas) {
  // Confirma que entradas sem plantas ou sem zonas são recusadas.
  assert.throws(() => executarBuscaGulosa({ plantas: [], zonas }), /planta/i)
  assert.throws(() => executarBuscaGulosa({ plantas, zonas: [] }), /zona/i)

  // Copia as zonas e substitui a temperatura da primeira por NaN.
  const zonasInvalidas = zonas.map((zona, indice) => (
    indice === 0 ? { ...zona, temperatura: Number.NaN } : zona
  ))
  // A validação precisa apontar o campo inválido antes de iniciar a busca.
  assert.throws(() => executarBuscaGulosa({ plantas, zonas: zonasInvalidas }), /temperatura/i)
}

// Expande o catálogo para obter uma entrada para cada planta física.
const plantasBase = expandirPlantas(PLANTAS_INICIAIS)
// Mede a execução da instância usada pela aplicação.
const inicio = performance.now()
const resultadoBase = executarBuscaGulosa({ plantas: plantasBase, zonas: ZONAS_INICIAIS })
// A diferença entre os horários mede a duração do algoritmo em milissegundos.
const tempoBaseMs = performance.now() - inicio
verificarResultado(resultadoBase, plantasBase, ZONAS_INICIAIS)
assert.equal(plantasBase.length, 12)
assert.equal(ZONAS_INICIAIS.length, 4)

// Monta um caso curto e isolado para verificar a busca com duas plantas e duas zonas.
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
// Executa o mesmo algoritmo no caso pequeno e reaproveita as verificações da resposta.
const resultadoPequeno = executarBuscaGulosa({ plantas: plantasIndividuaisPequenas, zonas: zonasPequenas })
verificarResultado(resultadoPequeno, plantasIndividuaisPequenas, zonasPequenas)
// Confere que os dados-base têm 12 plantas, 4 zonas e que as entradas inválidas são recusadas.
testarCasosDeErro(plantasBase, ZONAS_INICIAIS)

console.log('Teste-base (12 plantas / 4 zonas)')
// Imprime a distribuição e os contadores para permitir inspecionar a execução-base.
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
