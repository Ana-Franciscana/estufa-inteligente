import Chart from 'chart.js/auto'
import { executarBuscaGulosa } from './algoritmos/buscaGulosa.js'
import { executarAlgoritmoGenetico } from './algoritmos/algoritmoGenetico.js'
import { CENARIOS } from './cenarios.js'
import { PARAMETROS_PADRAO_GENETICO } from './dados/configuracao.js'
import { PLANTAS_INICIAIS } from './dados/plantas.js'
import { detalharFitness } from './funcoes/fitness.js'
import { agruparPlantasPorZona, expandirPlantas } from './funcoes/solucao.js'
import './style.css'

const RODADAS = 10
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
        <article><span class="icone-intro">🔎</span><div><h2>Busca Gulosa</h2><p>Escolhe qual distribuição parcial explorar usando uma heurística. A quantidade de estados avaliados é medida durante a busca.</p></div></article>
        <article><span class="icone-intro">🧬</span><div><h2>Algoritmo Genético</h2><p>Melhora distribuições por seleção de pais, cruzamento e mutação ao longo das gerações.</p></div></article>
      </div>
      <p class="explicacao-genetico"><b>Fitness:</b> soma as contribuições de temperatura, umidade, luminosidade e água; subtrai penalidades por ultrapassar capacidade e água disponível. Mais água nunca reduz a nota. Uma nota maior indica melhor distribuição pelas regras acadêmicas deste modelo. Os dois algoritmos usam a mesma função.</p>
      <p class="aviso-modelo">Os valores e as pontuações são simulações acadêmicas, não recomendações agrícolas nem previsões de crescimento real.</p>
    </section>

    <section class="secao configuracao-secao" aria-labelledby="titulo-configuracao">
      <div class="cabecalho-secao"><div><p class="sobrelinha">VALORES FIXOS</p><h2 id="titulo-configuracao">Configuração utilizada</h2><p class="texto-suave">Os parâmetros do Algoritmo Genético são os mesmos em todas as comparações.</p></div></div>
      <div class="configuracao" id="configuracao"></div>
    </section>

    <section class="secao cenarios-secao" aria-labelledby="titulo-cenarios">
      <div class="cabecalho-secao"><div><p class="sobrelinha">SIMULAÇÃO</p><h2 id="titulo-cenarios">Escolha um cenário</h2><p class="texto-suave">Apenas a água disponível muda. Plantas, necessidades ambientais e capacidades permanecem iguais.</p></div></div>
      <div id="botoes-cenarios" class="botoes-cenarios" role="group" aria-label="Cenários de água"></div>
      <p class="nota-cenario">Valores são simulações acadêmicas, não recomendações agrícolas.</p>
    </section>

    <section class="secao estufa-secao" aria-labelledby="titulo-estufa">
      <div class="cabecalho-secao"><div><p class="sobrelinha">MELHORES SOLUÇÕES</p><h2 id="titulo-estufa">Dentro da estufa</h2><p class="texto-suave">Distribuição da execução com maior fitness entre as 10 rodadas de cada algoritmo.</p></div></div>
      <div id="estufas-comparacao" class="estufas-comparacao"></div>
      <p class="nota-estufa">Água indicada em litros por dia. O consumo acima da disponibilidade e as plantas acima da capacidade recebem penalidades.</p>
    </section>

    <section class="secao executar-secao" aria-labelledby="titulo-executar">
      <div class="cabecalho-secao"><div><p class="sobrelinha">EXECUTAR E COMPARAR</p><h2 id="titulo-executar">Veja os resultados</h2><p class="texto-suave">Cada clique executa 10 rodadas de cada algoritmo com as mesmas plantas e o cenário selecionado.</p></div></div>
      <div class="botoes-execucao"><button id="comparar" class="botao">Comparar algoritmos <span aria-hidden="true">→</span></button></div>
      <p id="estado" class="estado" role="status">Selecione o cenário e compare os algoritmos.</p>
      <div id="resultados" class="resultados"></div>
      <div id="conclusao" class="conclusao" hidden></div>
    </section>

    <section id="graficos" class="secao graficos-secao" aria-labelledby="titulo-graficos" hidden>
      <div class="cabecalho-secao"><div><p class="sobrelinha">LEITURA DOS RESULTADOS</p><h2 id="titulo-graficos">Gráficos da simulação</h2><p class="texto-suave">Fitness e tempo mostram a média de 10 rodadas. Os outros gráficos usam as melhores distribuições; o histórico genético é da rodada que encontrou a melhor solução.</p></div></div>
      <div class="graficos">
        <article class="grafico-cartao"><h3>1. Fitness médio</h3><p>Média das 10 execuções de cada algoritmo.</p><div class="canvas-wrap"><canvas id="grafico-fitness"></canvas></div></article>
        <article class="grafico-cartao"><h3>2. Tempo médio</h3><p>Média do tempo das 10 execuções, em milissegundos.</p><div class="canvas-wrap"><canvas id="grafico-tempo"></canvas></div></article>
        <article class="grafico-cartao grafico-largo"><h3>3. Evolução do Algoritmo Genético</h3><p>Histórico real das 200 gerações da execução que encontrou a melhor distribuição. É uma execução específica; a comparação usa as médias das 10 rodadas.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-geracoes"></canvas></div></article>
        <article class="grafico-cartao"><h3>4. Composição do melhor fitness</h3><p>Mostra contribuições e penalidades da melhor distribuição de cada algoritmo.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-detalhes"></canvas></div></article>
        <article class="grafico-cartao"><h3>5. Ocupação e capacidade</h3><p>Plantas nas melhores distribuições e capacidade por zona.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-capacidade"></canvas></div></article>
        <article class="grafico-cartao"><h3>6. Consumo e água disponível</h3><p>Litros por dia nas melhores distribuições e no cenário.</p><div class="canvas-wrap canvas-alto"><canvas id="grafico-agua"></canvas></div></article>
      </div>
    </section>
  </main>
  <footer>Estufa Inteligente · projeto acadêmico de Sistemas Inteligentes</footer>
`

// Exibe em formato curto os tempos medidos em milissegundos.
function formatarTempo(milissegundos) {
  return milissegundos < 1000 ? `${milissegundos.toFixed(2)} ms` : `${(milissegundos / 1000).toFixed(2)} s`
}

// Executa o algoritmo uma vez e mede só o tempo de cálculo, sem renderizar a interface.
function executarUmaVez(tipo, plantasCenario, zonasCenario) {
  const inicio = performance.now()
  const resposta = tipo === 'gulosa'
    ? executarBuscaGulosa({ plantas: plantasCenario, zonas: zonasCenario })
    : executarAlgoritmoGenetico({ plantas: plantasCenario, zonas: zonasCenario, configuracao: PARAMETROS_PADRAO_GENETICO })
  const tempoExecucao = performance.now() - inicio
  const avaliacao = detalharFitness(resposta.melhorSolucao, plantasCenario, zonasCenario)
  return {
    ...resposta,
    tempoExecucao,
    melhorFitness: avaliacao.total,
    avaliacao,
    distribuicao: agruparPlantasPorZona(resposta.melhorSolucao, plantasCenario, zonasCenario),
  }
}

// Resume dez rodadas: calcula médias, extremos e guarda a distribuição da melhor rodada.
function executarDezRodadas(tipo, plantasCenario, zonasCenario) {
  const rodadas = Array.from({ length: RODADAS }, () => executarUmaVez(tipo, plantasCenario, zonasCenario))
  const fitness = rodadas.map((rodada) => rodada.melhorFitness)
  const melhor = rodadas.reduce((atual, rodada) => rodada.melhorFitness > atual.melhorFitness ? rodada : atual)
  const primeiraSolucao = JSON.stringify(rodadas[0].melhorSolucao)
  return {
    melhor,
    fitnessMedio: fitness.reduce((soma, valor) => soma + valor, 0) / RODADAS,
    tempoMedio: rodadas.reduce((soma, rodada) => soma + rodada.tempoExecucao, 0) / RODADAS,
    melhorFitness: Math.max(...fitness),
    piorFitness: Math.min(...fitness),
    rodadas,
    deterministico: rodadas.every((rodada) => JSON.stringify(rodada.melhorSolucao) === primeiraSolucao),
  }
}

// Executa ambos os algoritmos dez vezes sobre cópias iguais dos dados do cenário atual.
function compararAlgoritmos() {
  const plantasCenario = plantas.map((planta) => ({ ...planta }))
  const zonasCenario = cenarioAtual.zonas.map((zona) => ({ ...zona }))
  resultados = {
    gulosa: executarDezRodadas('gulosa', plantasCenario, zonasCenario),
    genetico: executarDezRodadas('genetico', plantasCenario, zonasCenario),
  }
  atualizarInterface()
}

// Mostra os valores fixos do Algoritmo Genético com uma explicação breve.
function mostrarConfiguracao() {
  const { tamanhoPopulacao, numeroGeracoes, taxaCrossover, taxaMutacao, elitismo, tamanhoTorneio } = PARAMETROS_PADRAO_GENETICO
  const itens = [
    ['População', `${tamanhoPopulacao} indivíduos`, 'Distribuições avaliadas em cada geração.'],
    ['Gerações', numeroGeracoes, 'Etapas de evolução da população.'],
    ['Crossover', `${taxaCrossover * 100}%`, 'Chance de combinar cada par de pais.'],
    ['Mutação', `${taxaMutacao * 100}%`, 'Chance de mudar o destino de cada planta.'],
    ['Elitismo', `${elitismo} indivíduos`, 'Melhores soluções preservadas sem alteração.'],
    ['Torneio', `${tamanhoTorneio} participantes`, 'Candidatos comparados para escolher cada pai.'],
  ]
  document.querySelector('#configuracao').innerHTML = itens.map(([nome, valor, descricao]) => (
    `<article><b>${nome}</b><strong>${valor}</strong><span>${descricao}</span></article>`
  )).join('')
}

// Apresenta cada cenário com sua explicação e os litros disponíveis por zona.
function mostrarCenarios() {
  document.querySelector('#botoes-cenarios').innerHTML = Object.values(CENARIOS).map((cenario) => (
    `<button class="botao-cenario ${cenario.id === cenarioAtual.id ? 'selecionado' : ''}" data-cenario="${cenario.id}" aria-pressed="${cenario.id === cenarioAtual.id}"><b>${cenario.nome}</b><span>${cenario.descricao}</span><span class="litros-cenario">${cenario.zonas.map((zona) => `${zona.nome}: ${zona.aguaDisponivel} L/dia`).join(' · ')}</span></button>`
  )).join('')
  document.querySelectorAll('[data-cenario]').forEach((botao) => botao.addEventListener('click', () => {
    cenarioAtual = CENARIOS[botao.dataset.cenario]
    resultados = { gulosa: null, genetico: null }
    graficos.forEach((grafico) => grafico.destroy())
    graficos = []
    document.querySelector('#graficos').hidden = true
    document.querySelector('#conclusao').hidden = true
    document.querySelector('#estado').textContent = `Cenário ${cenarioAtual.nome} selecionado. Clique em “Comparar algoritmos” para executar 10 rodadas.`
    mostrarCenarios()
    atualizarInterface()
  }))
}

// Desenha uma estufa usando a melhor distribuição observada nas dez rodadas.
function desenharEstufa(tipo) {
  const resumo = resultados[tipo]
  const melhor = resumo?.melhor
  const canteiros = melhor ? melhor.distribuicao.map(({ zona, plantas: alocadas, consumoAgua, ocupacao }) => {
    const vagasRestantes = Math.max(0, zona.capacidade - ocupacao)
    const plantasHtml = alocadas.length
      ? alocadas.map((planta) => `<span class="planta"><span aria-hidden="true">${ICONES_PLANTAS[planta.nome] ?? '🌱'}</span>${planta.nome}</span>`).join('')
      : '<span class="canteiro-vazio">Sem plantas nesta zona</span>'
    return `<article class="canteiro"><div class="canteiro-topo"><h4>${zona.nome}</h4><span>${zona.temperatura}°C · ${zona.umidade}% · luz ${zona.luminosidade}</span></div><div class="plantas">${plantasHtml}</div><div class="detalhe-zona"><span>Vagas</span><b>${ocupacao} ocupadas · ${vagasRestantes} livres · capacidade ${zona.capacidade}</b></div><div class="detalhe-zona"><span>Água por dia</span><b>${consumoAgua} L necessárias · ${zona.aguaDisponivel} L disponíveis</b></div><div class="barra"><i class="${ocupacao > zona.capacidade ? 'excesso' : ''}" style="width:${Math.min(100, ocupacao / zona.capacidade * 100)}%"></i></div></article>`
  }).join('') : '<p class="sem-resultado">Clique em “Comparar algoritmos” para ver as plantas nos canteiros.</p>'
  const nome = NOMES_ALGORITMOS[tipo]
  return `<article class="estufa-resultado"><div class="estufa-titulo"><h3>${nome}</h3><span>${melhor ? `Melhor fitness: ${melhor.melhorFitness.toFixed(2)}` : 'Aguardando execução'}</span></div><p class="rotulo-melhor">Melhor distribuição encontrada nas 10 execuções</p><div class="estufa-shell"><div class="estufa-arco"><span>ESTUFA DE VIDRO</span><span class="arco-linha"></span></div><div class="canteiros">${canteiros}</div></div></article>`
}

// Atualiza estufas, métricas e gráficos a partir dos resultados calculados.
function atualizarInterface() {
  document.querySelector('#estufas-comparacao').innerHTML = ['gulosa', 'genetico'].map(desenharEstufa).join('')
  mostrarResultados()
  if (resultados.gulosa && resultados.genetico) {
    document.querySelector('#graficos').hidden = false
    mostrarGraficos()
    document.querySelector('#conclusao').textContent = `As métricas resumem ${RODADAS} execuções por algoritmo. A Busca Gulosa ${resultados.gulosa.deterministico ? 'produziu a mesma solução nas dez rodadas, como esperado para uma busca sem sorteios.' : 'apresentou soluções diferentes entre as rodadas.'} O histórico genético exibido corresponde à rodada com o melhor fitness.`
    document.querySelector('#conclusao').hidden = false
  }
}

// Apresenta médias, extremos e o contador real de estados avaliados pela Busca Gulosa.
function mostrarResultados() {
  document.querySelector('#resultados').innerHTML = ['gulosa', 'genetico'].map((tipo) => {
    const resumo = resultados[tipo]
    if (!resumo) return `<article class="resultado-cartao"><h3>${NOMES_ALGORITMOS[tipo]}</h3><p>Aguardando execução.</p></article>`
    const detalhe = tipo === 'gulosa'
      ? `<p><b>Estados avaliados:</b> ${resumo.melhor.estadosAvaliados} por execução, medidos durante a busca.</p><p><b>Determinística:</b> ${resumo.deterministico ? 'sim, mesma distribuição nas 10 rodadas' : 'não, houve soluções diferentes'}.</p>`
      : `<p><b>Gerações:</b> ${resumo.melhor.geracoes} em cada execução · melhor solução na geração ${resumo.melhor.metricas.geracaoDoMelhor} da rodada campeã.</p>`
    return `<article class="resultado-cartao"><p class="sobrelinha">${tipo === 'gulosa' ? '🔎 BUSCA HEURÍSTICA' : '🧬 EVOLUÇÃO'}</p><h3>${NOMES_ALGORITMOS[tipo]}</h3><div class="metricas"><div><span>Fitness médio (10 execuções)</span><b>${resumo.fitnessMedio.toFixed(2)}</b></div><div><span>Tempo médio</span><b>${formatarTempo(resumo.tempoMedio)}</b></div></div><p><b>Melhor fitness:</b> ${resumo.melhorFitness.toFixed(2)} · <b>Pior:</b> ${resumo.piorFitness.toFixed(2)}</p>${detalhe}</article>`
  }).join('')
}

// Gera os seis gráficos usando as médias e melhores distribuições calculadas nesta comparação.
function mostrarGraficos() {
  graficos.forEach((grafico) => grafico.destroy())
  const gulosa = resultados.gulosa
  const genetico = resultados.genetico
  const melhorGulosa = gulosa.melhor
  const melhorGenetico = genetico.melhor
  const zonas = cenarioAtual.zonas
  const nomesZonas = zonas.map((zona) => zona.nome)
  const cores = { gulosa: '#69894c', genetico: '#c1845d', capacidade: '#bdc8a7', agua: '#8ba9a1' }
  const comum = { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { position: 'bottom' } } }
  const barras = (labels, datasets, horizontal = false) => ({
    type: 'bar', data: { labels, datasets }, options: {
      ...comum, indexAxis: horizontal ? 'y' : 'x',
      scales: horizontal ? { x: { beginAtZero: false }, y: {} } : { x: {}, y: { beginAtZero: true } },
    },
  })
  const dataset = (label, dados, cor) => ({ label, data: dados, backgroundColor: cor, borderColor: cor, borderRadius: 5 })
  const porZona = (resultado, chave) => resultado.distribuicao.map((grupo) => grupo[chave])
  const detalhes = (resultado) => [
    resultado.avaliacao.temperatura, resultado.avaliacao.umidade, resultado.avaliacao.luminosidade,
    resultado.avaliacao.agua, -resultado.avaliacao.penalidadeCapacidade, -resultado.avaliacao.penalidadeAgua,
  ]
  graficos = [
    new Chart(document.querySelector('#grafico-fitness'), barras(
      ['Fitness médio'], [dataset('Busca Gulosa · média', [gulosa.fitnessMedio], cores.gulosa), dataset('Algoritmo Genético · média', [genetico.fitnessMedio], cores.genetico)],
    )),
    new Chart(document.querySelector('#grafico-tempo'), barras(
      ['Tempo médio (ms)'], [dataset('Busca Gulosa · média', [gulosa.tempoMedio], cores.gulosa), dataset('Algoritmo Genético · média', [genetico.tempoMedio], cores.genetico)],
    )),
    new Chart(document.querySelector('#grafico-geracoes'), {
      type: 'line', data: {
        labels: melhorGenetico.historicoFitness.map((item) => item.geracao),
        datasets: [
          { label: 'Melhor fitness', data: melhorGenetico.historicoFitness.map((item) => item.melhorFitness), borderColor: cores.gulosa, backgroundColor: cores.gulosa, pointRadius: 0, tension: 0 },
          { label: 'Fitness médio', data: melhorGenetico.historicoFitness.map((item) => item.fitnessMedio), borderColor: cores.genetico, backgroundColor: cores.genetico, pointRadius: 0, tension: 0 },
        ],
      }, options: { ...comum, scales: { x: { title: { display: true, text: 'Geração' } }, y: { title: { display: true, text: 'Fitness' } } } },
    }),
    new Chart(document.querySelector('#grafico-detalhes'), barras(
      ['Temperatura', 'Umidade', 'Luminosidade', 'Água', 'Penalidade capacidade', 'Penalidade água'],
      [dataset('Busca Gulosa · melhor', detalhes(melhorGulosa), cores.gulosa), dataset('Algoritmo Genético · melhor', detalhes(melhorGenetico), cores.genetico)], true,
    )),
    new Chart(document.querySelector('#grafico-capacidade'), barras(
      nomesZonas,
      [dataset('Busca Gulosa · plantas', porZona(melhorGulosa, 'ocupacao'), cores.gulosa), dataset('Algoritmo Genético · plantas', porZona(melhorGenetico, 'ocupacao'), cores.genetico), dataset('Capacidade', zonas.map((zona) => zona.capacidade), cores.capacidade)],
    )),
    new Chart(document.querySelector('#grafico-agua'), barras(
      nomesZonas,
      [dataset('Busca Gulosa · consumo', porZona(melhorGulosa, 'consumoAgua'), cores.gulosa), dataset('Algoritmo Genético · consumo', porZona(melhorGenetico, 'consumoAgua'), cores.genetico), dataset('Disponível', zonas.map((zona) => zona.aguaDisponivel), cores.agua)],
    )),
  ]
}

// Desativa o botão durante as 20 execuções e apresenta erros sem interromper a página.
function executarComEstado() {
  const botao = document.querySelector('#comparar')
  botao.disabled = true
  document.querySelector('#estado').textContent = `Executando ${RODADAS} rodadas de cada algoritmo no cenário ${cenarioAtual.nome}…`
  setTimeout(() => {
    try {
      compararAlgoritmos()
      document.querySelector('#estado').textContent = `Comparação concluída: médias de ${RODADAS} execuções no cenário ${cenarioAtual.nome}.`
    } catch (erro) {
      document.querySelector('#estado').textContent = `Não foi possível executar: ${erro.message}`
    } finally {
      botao.disabled = false
    }
  }, 20)
}

mostrarConfiguracao()
mostrarCenarios()
atualizarInterface()
document.querySelector('#comparar').addEventListener('click', executarComEstado)
