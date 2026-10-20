import Chart from 'chart.js/auto'
import { executarBuscaGulosa } from './algoritmos/buscaGulosa.js'
import { executarAlgoritmoGenetico } from './algoritmos/algoritmoGenetico.js'
import { CENARIOS } from './cenarios.js'
import { PARAMETROS_PADRAO_GENETICO } from './dados/configuracao.js'
import { PLANTAS_INICIAIS } from './dados/plantas.js'
import { detalharFitness } from './funcoes/fitness.js'
import { agruparPlantasPorZona, expandirPlantas } from './funcoes/solucao.js'
import './style.css'

const NOMES_ALGORITMOS = { gulosa: 'Busca Gulosa', genetico: 'Algoritmo Genético' }
const ICONES_PLANTAS = {
  Tomate: '🍅', Alface: '🥬', Manjericão: '🌿', Pimentão: '🫑', Pepino: '🥒', Morango: '🍓',
}
const plantas = expandirPlantas(PLANTAS_INICIAIS)
let cenarioAtual = CENARIOS.normal
let resultados = { gulosa: null, genetico: null }
let graficos = []

document.querySelector('#app').innerHTML = `
  <header class="topo"><a class="marca" href="#inicio"><span>🌱</span> Estufa Inteligente</a></header>
  <main class="pagina" id="inicio">
    <section class="intro" aria-labelledby="titulo">
      <p class="sobrelinha">PROJETO DE SISTEMAS INTELIGENTES</p>
      <h1 id="titulo">Um bom lugar para cada planta.</h1>
      <p class="intro-texto">Comparamos duas maneiras de distribuir as mesmas 12 plantas em quatro zonas.</p>
      <div class="algoritmos-intro">
        <article><span class="icone-intro">🔎</span><div><h2>Busca Gulosa</h2><p>Escolhe a opção que parece melhor em cada etapa. Estado é uma distribuição parcial; a heurística estima qual estado explorar primeiro.</p></div></article>
        <article><span class="icone-intro">🧬</span><div><h2>Algoritmo Genético</h2><p>Melhora distribuições possíveis por seleção, cruzamento e mutação ao longo de várias gerações.</p></div></article>
      </div>
      <p class="explicacao-genetico"><b>Etapas do genético:</b> população é o conjunto de distribuições; fitness é a nota; seleção escolhe soluções para gerar outras; cruzamento combina duas soluções; mutação muda alguns destinos; elitismo preserva as melhores; geração é cada etapa de melhoria.</p>
      <p class="explicacao-genetico"><b>Fitness:</b> soma os pontos de temperatura, umidade, luminosidade e água, depois subtrai as penalidades por excesso de água e de capacidade. Água suficiente recebe a nota máxima; água insuficiente reduz a nota. A função é igual para os dois algoritmos.</p>
      <p class="aviso-modelo">Fitness é uma nota acadêmica criada para este modelo. Ela ajuda a comparar distribuições, mas não garante melhor crescimento das plantas na realidade.</p>
    </section>

    <section class="secao cenarios-secao" aria-labelledby="titulo-cenarios">
      <div class="cabecalho-secao"><div><p class="sobrelinha">SIMULAÇÃO</p><h2 id="titulo-cenarios">Escolha um cenário</h2><p class="texto-suave">Apenas a água disponível muda. Plantas, necessidades, condições e capacidades continuam iguais.</p></div></div>
      <div id="botoes-cenarios" class="botoes-cenarios" role="group" aria-label="Cenários de água"></div>
      <p id="descricao-cenario" class="descricao-cenario"></p>
      <p class="nota-cenario">As variações de 20% são simulações didáticas e não recomendações agrícolas.</p>
      <div id="agua-cenario" class="agua-cenario"></div>
    </section>

    <section class="secao estufa-secao" aria-labelledby="titulo-estufa">
      <div class="cabecalho-secao"><div><p class="sobrelinha">DISTRIBUIÇÕES CALCULADAS</p><h2 id="titulo-estufa">Dentro da estufa</h2><p class="texto-suave">Compare os canteiros produzidos por cada algoritmo no cenário selecionado.</p></div></div>
      <div id="estufas-comparacao" class="estufas-comparacao"></div>
      <p class="nota-estufa">Água indicada em litros por dia. O consumo acima da disponibilidade e as plantas acima da capacidade recebem penalidades no fitness.</p>
    </section>

    <section class="secao executar-secao" aria-labelledby="titulo-executar">
      <div class="cabecalho-secao"><div><p class="sobrelinha">EXECUTAR E COMPARAR</p><h2 id="titulo-executar">Veja os resultados</h2><p class="texto-suave">O botão principal executa os dois algoritmos com cópias dos mesmos dados do cenário atual.</p></div></div>
      <div class="botoes-execucao">
        <button id="executar-gulosa" class="botao botao-secundario botao-execucao">Executar Busca Gulosa</button>
        <button id="executar-genetico" class="botao botao-secundario botao-execucao">Executar Algoritmo Genético</button>
        <button id="comparar" class="botao botao-execucao">Comparar algoritmos <span aria-hidden="true">→</span></button>
      </div>
      <p id="estado" class="estado" role="status">Preparando a primeira comparação…</p>
      <div id="resultados" class="resultados"></div>
      <div id="conclusao" class="conclusao" hidden></div>
    </section>

    <section id="graficos" class="secao graficos-secao" aria-labelledby="titulo-graficos" hidden>
      <div class="cabecalho-secao"><div><p class="sobrelinha">LEITURA DOS RESULTADOS</p><h2 id="titulo-graficos">Gráficos da simulação</h2></div></div>
      <div class="graficos">
        <article class="grafico-cartao"><h3>1. Fitness final</h3><p>Uma nota maior indica melhor distribuição segundo o modelo.</p><div class="canvas-wrap"><canvas id="grafico-fitness"></canvas></div></article>
        <article class="grafico-cartao"><h3>2. Tempo de execução</h3><p>Um tempo menor significa execução mais rápida nesta simulação.</p><div class="canvas-wrap"><canvas id="grafico-tempo"></canvas></div></article>
        <article class="grafico-cartao grafico-largo"><h3>3. Evolução do Algoritmo Genético</h3><p>Mostra o melhor e o fitness médio de todas as gerações observadas. Não prova que foi encontrado o ótimo global.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-geracoes"></canvas></div></article>
        <article class="grafico-cartao"><h3>4. De onde vem o fitness</h3><p>Barras à direita de zero somam pontos; barras à esquerda mostram penalidades subtraídas.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-detalhes"></canvas></div></article>
        <article class="grafico-cartao"><h3>5. Capacidade das zonas</h3><p>Compara plantas alocadas por algoritmo com as vagas máximas de cada zona.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-capacidade"></canvas></div></article>
        <article class="grafico-cartao"><h3>6. Água por zona</h3><p>Compara consumo estimado e água disponível no cenário.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-agua"></canvas></div></article>
      </div>
      <p class="nota-aleatoriedade">O Algoritmo Genético usa escolhas aleatórias. Sua distribuição, pontuação e tempo podem mudar entre execuções.</p>
    </section>
  </main>
  <footer>Estufa Inteligente · projeto acadêmico de Sistemas Inteligentes</footer>
`

// Formata o tempo curto em milissegundos e mantém segundos apenas em execuções mais longas.
function formatarTempo(milissegundos) {
  return milissegundos < 1000 ? `${milissegundos.toFixed(2)} ms` : `${(milissegundos / 1000).toFixed(2)} s`
}

// Mede somente o tempo gasto pelo algoritmo, sem incluir a atualização da interface.
function medirExecucao(funcao) {
  const inicio = performance.now()
  const resultado = funcao()
  return { resultado, tempoExecucao: performance.now() - inicio }
}

// Monta o resultado completo usado pelos cartões, pela estufa e pelos gráficos.
function prepararResultado(resposta, tipo, tempoExecucao, plantasCenario, zonasCenario) {
  const fitness = detalharFitness(resposta.melhorSolucao, plantasCenario, zonasCenario)
  return {
    ...resposta,
    tipo,
    tempoExecucao,
    melhorFitness: fitness.total,
    avaliacao: fitness,
    distribuicao: agruparPlantasPorZona(resposta.melhorSolucao, plantasCenario, zonasCenario),
  }
}

// Executa um ou os dois algoritmos com as mesmas plantas e zonas copiadas do cenário.
function executarAlgoritmos(tipos) {
  const plantasCenario = plantas.map((planta) => ({ ...planta }))
  const zonasCenario = cenarioAtual.zonas.map((zona) => ({ ...zona }))
  tipos.forEach((tipo) => {
    const medicao = medirExecucao(() => (tipo === 'gulosa'
      ? executarBuscaGulosa({ plantas: plantasCenario, zonas: zonasCenario })
      : executarAlgoritmoGenetico({ plantas: plantasCenario, zonas: zonasCenario, configuracao: PARAMETROS_PADRAO_GENETICO })))
    resultados[tipo] = prepararResultado(medicao.resultado, tipo, medicao.tempoExecucao, plantasCenario, zonasCenario)
  })
  atualizarInterface()
}

// Apresenta os botões dos cenários, a explicação e a água diária de cada zona.
function mostrarCenario() {
  document.querySelector('#botoes-cenarios').innerHTML = Object.values(CENARIOS).map((cenario) => (
    `<button class="botao-cenario ${cenario.id === cenarioAtual.id ? 'selecionado' : ''}" data-cenario="${cenario.id}" aria-pressed="${cenario.id === cenarioAtual.id}">${cenario.nome}</button>`
  )).join('')
  document.querySelector('#descricao-cenario').textContent = cenarioAtual.descricao
  document.querySelector('#agua-cenario').innerHTML = cenarioAtual.zonas.map((zona) => (
    `<span><b>${zona.nome}</b><strong>${zona.aguaDisponivel} L/dia</strong></span>`
  )).join('')
  document.querySelectorAll('[data-cenario]').forEach((botao) => botao.addEventListener('click', () => {
    escolherCenario(botao.dataset.cenario)
  }))
}

// Troca o cenário, descarta resultados antigos e calcula novamente os dois algoritmos.
function escolherCenario(id) {
  cenarioAtual = CENARIOS[id]
  resultados = { gulosa: null, genetico: null }
  graficos.forEach((grafico) => grafico.destroy())
  graficos = []
  mostrarCenario()
  atualizarInterface()
  executarComEstado(['gulosa', 'genetico'])
}

// Cria os canteiros de uma estufa usando a distribuição real do algoritmo selecionado.
function desenharEstufa(tipo) {
  const nome = NOMES_ALGORITMOS[tipo]
  const resultado = resultados[tipo]
  const canteiros = resultado ? resultado.distribuicao.map(({ zona, plantas: alocadas, consumoAgua, ocupacao }) => {
    const vagasRestantes = Math.max(0, zona.capacidade - ocupacao)
    const plantasHtml = alocadas.length
      ? alocadas.map((planta) => `<span class="planta"><span aria-hidden="true">${ICONES_PLANTAS[planta.nome] ?? '🌱'}</span>${planta.nome}</span>`).join('')
      : '<span class="canteiro-vazio">Sem plantas nesta zona</span>'
    return `<article class="canteiro"><div class="canteiro-topo"><h4>${zona.nome}</h4><span>${zona.temperatura}°C · ${zona.umidade}% · luz ${zona.luminosidade}</span></div><div class="plantas">${plantasHtml}</div><div class="detalhe-zona"><span>Vagas</span><b>${ocupacao} ocupadas · ${vagasRestantes} livres · capacidade ${zona.capacidade}</b></div><div class="detalhe-zona"><span>Água por dia</span><b>${consumoAgua} L necessárias · ${zona.aguaDisponivel} L disponíveis</b></div><div class="barra"><i class="${ocupacao > zona.capacidade ? 'excesso' : ''}" style="width:${Math.min(100, ocupacao / zona.capacidade * 100)}%"></i></div></article>`
  }).join('') : '<p class="sem-resultado">Execute o algoritmo para ver suas plantas nos canteiros.</p>'

  return `<article class="estufa-resultado"><div class="estufa-titulo"><h3>${nome}</h3><span>${resultado ? `Fitness ${resultado.melhorFitness.toFixed(2)}` : 'Aguardando execução'}</span></div><div class="estufa-shell"><div class="estufa-arco"><span>ESTUFA DE VIDRO</span><span class="arco-linha"></span></div><div class="canteiros">${canteiros}</div></div></article>`
}

// Atualiza as duas estufas, as métricas e os gráficos com o último resultado.
function atualizarInterface() {
  document.querySelector('#estufas-comparacao').innerHTML = ['gulosa', 'genetico'].map(desenharEstufa).join('')
  mostrarResultados()
  if (resultados.gulosa && resultados.genetico) {
    document.querySelector('#graficos').hidden = false
    mostrarGraficos()
    document.querySelector('#conclusao').textContent = criarConclusao()
    document.querySelector('#conclusao').hidden = false
  } else {
    document.querySelector('#graficos').hidden = true
    document.querySelector('#conclusao').hidden = true
  }
}

// Resume a nota, o tempo e as contagens da busca, sem apresentar métricas de gerações para ela.
function mostrarResultados() {
  document.querySelector('#resultados').innerHTML = ['gulosa', 'genetico'].map((tipo) => {
    const resultado = resultados[tipo]
    if (!resultado) return `<article class="resultado-cartao"><h3>${NOMES_ALGORITMOS[tipo]}</h3><p>Aguardando execução.</p></article>`
    const estados = tipo === 'gulosa'
      ? `<p><b>Estados:</b> ${resultado.metricas.estadosGerados} gerados · ${resultado.estadosAvaliados} avaliados · ${resultado.metricas.estadosExpandidos} expandidos</p>`
      : `<p><b>Gerações:</b> ${resultado.geracoes} · melhor resultado na geração ${resultado.metricas.geracaoDoMelhor}</p>`
    return `<article class="resultado-cartao"><p class="sobrelinha">${tipo === 'gulosa' ? '🔎 BUSCA LOCAL' : '🧬 EVOLUÇÃO'}</p><h3>${NOMES_ALGORITMOS[tipo]}</h3><div class="metricas"><div><span>Fitness</span><b>${resultado.melhorFitness.toFixed(2)}</b></div><div><span>Tempo</span><b>${formatarTempo(resultado.tempoExecucao)}</b></div></div>${estados}<p class="explicacao-metrica">${tipo === 'gulosa' ? 'Gerado = possibilidade criada; avaliado = heurística calculada; expandido = estado parcial usado para criar outras possibilidades.' : 'População = distribuições possíveis; seleção, cruzamento e mutação criam novas soluções; elitismo preserva algumas das melhores.'}</p></article>`
  }).join('')
}

// Apaga os gráficos antigos e desenha seis novos com os dados atuais da comparação.
function mostrarGraficos() {
  graficos.forEach((grafico) => grafico.destroy())
  const gulosa = resultados.gulosa
  const genetico = resultados.genetico
  const zonas = cenarioAtual.zonas
  const nomesZonas = zonas.map((zona) => zona.nome)
  const cores = { gulosa: '#69894c', genetico: '#c1845d', capacidade: '#bdc8a7', agua: '#8ba9a1' }
  const comum = { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
  const barras = (labels, datasets, horizontal = false) => ({
    type: 'bar', data: { labels, datasets },
    options: {
      ...comum,
      indexAxis: horizontal ? 'y' : 'x',
      scales: horizontal ? { x: { beginAtZero: false }, y: {} } : { x: {}, y: { beginAtZero: true } },
    },
  })
  const dataset = (label, dados, cor) => ({ label, data: dados, backgroundColor: cor, borderColor: cor, borderRadius: 5 })
  const porZona = (resultado, chave) => resultado.distribuicao.map((grupo) => grupo[chave])
  const detalhes = (resultado) => [
    resultado.avaliacao.temperatura,
    resultado.avaliacao.umidade,
    resultado.avaliacao.luminosidade,
    resultado.avaliacao.agua,
    -resultado.avaliacao.penalidadeCapacidade,
    -resultado.avaliacao.penalidadeAgua,
  ]

  graficos = [
    new Chart(document.querySelector('#grafico-fitness'), barras(
      ['Fitness final'], [dataset('Busca Gulosa', [gulosa.melhorFitness], cores.gulosa), dataset('Algoritmo Genético', [genetico.melhorFitness], cores.genetico)],
    )),
    new Chart(document.querySelector('#grafico-tempo'), barras(
      ['Tempo (ms)'], [dataset('Busca Gulosa', [gulosa.tempoExecucao], cores.gulosa), dataset('Algoritmo Genético', [genetico.tempoExecucao], cores.genetico)],
    )),
    new Chart(document.querySelector('#grafico-geracoes'), {
      type: 'line', data: {
        labels: genetico.historicoFitness.map((item) => item.geracao),
        datasets: [
          { label: 'Melhor fitness', data: genetico.historicoFitness.map((item) => item.melhorFitness), borderColor: cores.gulosa, backgroundColor: cores.gulosa, pointRadius: 0, tension: 0 },
          { label: 'Fitness médio', data: genetico.historicoFitness.map((item) => item.fitnessMedio), borderColor: cores.genetico, backgroundColor: cores.genetico, pointRadius: 0, tension: 0 },
        ],
      }, options: { ...comum, scales: { x: { title: { display: true, text: 'Geração' } }, y: { title: { display: true, text: 'Fitness' } } } },
    }),
    new Chart(document.querySelector('#grafico-detalhes'), barras(
      ['Temperatura', 'Umidade', 'Luminosidade', 'Água', 'Penalidade capacidade', 'Penalidade água'],
      [dataset('Busca Gulosa', detalhes(gulosa), cores.gulosa), dataset('Algoritmo Genético', detalhes(genetico), cores.genetico)], true,
    )),
    new Chart(document.querySelector('#grafico-capacidade'), barras(
      nomesZonas,
      [dataset('Busca Gulosa · plantas', porZona(gulosa, 'ocupacao'), cores.gulosa), dataset('Algoritmo Genético · plantas', porZona(genetico, 'ocupacao'), cores.genetico), dataset('Capacidade', zonas.map((zona) => zona.capacidade), cores.capacidade)],
    )),
    new Chart(document.querySelector('#grafico-agua'), barras(
      nomesZonas,
      [dataset('Busca Gulosa · consumo', porZona(gulosa, 'consumoAgua'), cores.gulosa), dataset('Algoritmo Genético · consumo', porZona(genetico, 'consumoAgua'), cores.genetico), dataset('Disponível', zonas.map((zona) => zona.aguaDisponivel), cores.agua)],
    )),
  ]
}

// Descreve só o que aconteceu nesta execução e alerta para excessos encontrados.
function criarConclusao() {
  const { gulosa, genetico } = resultados
  const maisRapido = gulosa.tempoExecucao <= genetico.tempoExecucao ? 'Busca Gulosa' : 'Algoritmo Genético'
  const mesmaNota = Math.abs(gulosa.melhorFitness - genetico.melhorFitness) < 1e-9
  const excessos = [gulosa, genetico].some((resultado) => resultado.distribuicao.some((grupo) => (
    grupo.ocupacao > grupo.zona.capacidade || grupo.consumoAgua > grupo.zona.aguaDisponivel
  )))
  return `Neste cenário, ${maisRapido} foi mais rápido. ${mesmaNota ? 'Os dois tiveram a mesma pontuação.' : 'As pontuações foram diferentes.'} ${excessos ? 'Pelo menos uma distribuição passou do limite de água ou capacidade.' : 'Nenhuma distribuição ultrapassou a água ou a capacidade disponíveis.'} O resultado vale para esta execução; o Algoritmo Genético pode variar por usar aleatoriedade.`
}

// Mostra o estado de execução e sempre reativa os botões ao terminar.
function executarComEstado(tipos) {
  const botoes = document.querySelectorAll('.botao-execucao')
  botoes.forEach((botao) => { botao.disabled = true })
  document.querySelector('#estado').textContent = 'Executando os algoritmos com os dados do cenário…'
  setTimeout(() => {
    try {
      executarAlgoritmos(tipos)
      document.querySelector('#estado').textContent = `Resultados atualizados para o cenário ${cenarioAtual.nome}.`
    } catch (erro) {
      document.querySelector('#estado').textContent = `Não foi possível executar: ${erro.message}`
    } finally {
      botoes.forEach((botao) => { botao.disabled = false })
    }
  }, 20)
}

// Liga os três controles de execução aos algoritmos reais.
document.querySelector('#executar-gulosa').addEventListener('click', () => executarComEstado(['gulosa']))
document.querySelector('#executar-genetico').addEventListener('click', () => executarComEstado(['genetico']))
document.querySelector('#comparar').addEventListener('click', () => executarComEstado(['gulosa', 'genetico']))

mostrarCenario()
atualizarInterface()
executarComEstado(['gulosa', 'genetico'])
