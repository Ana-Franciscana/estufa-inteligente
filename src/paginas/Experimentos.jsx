import { useState } from 'react'
import Alerta from '../componentes/Alerta'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import GraficoComparacao from '../componentes/GraficoComparacao'
import PainelExperimento from '../componentes/PainelExperimento'
import TabelaExperimento from '../componentes/TabelaExperimento'
import { ALGORITMOS, CORES_GRAFICO, RODADAS_PADRAO, TIPOS_EXPERIMENTO } from '../dados/configuracao'
import { useEstufa } from '../contexto/useEstufa'
import { calcularMedia } from '../funcoes/metricas'
import { converterTextoEmNumero } from '../funcoes/formatacao'
import { executarExperimento } from '../servicos/executorExperimentos'
import { obterStatusAlgoritmos, STATUS_EXECUCAO } from '../servicos/executorAlgoritmos'

export default function Experimentos() {
  // Obtém os dados da estufa e a função que guarda o último experimento concluído.
  const { plantasIndividuais, zonas, experimento, registrarExperimento } = useEstufa()
  // Guarda a opção escolhida, o número de repetições e o estado da execução.
  const [tipoExperimento, setTipoExperimento] = useState('mutacao')
  const [repeticoes, setRepeticoes] = useState(String(RODADAS_PADRAO))
  const [executando, setExecutando] = useState(false)
  const [retorno, setRetorno] = useState(null)

  const mudarTipo = (tipoId) => {
    // Ao trocar o tipo, limpa mensagens da tentativa anterior.
    setTipoExperimento(tipoId)
    setRetorno(null)
  }

  const executar = async () => {
    // Envia ao serviço os valores previstos para o cenário e converte repetições em número.
    setExecutando(true)
    setRetorno(null)
    // Os cenários usam os valores previstos na configuração; repetições vêm do campo editável.
    const resposta = await executarExperimento({
      tipoExperimento,
      valores: TIPOS_EXPERIMENTO[tipoExperimento].valoresPadrao,
      rodadas: converterTextoEmNumero(repeticoes),
      plantas: plantasIndividuais,
      zonas,
    })
    // Guarda o experimento no contexto somente se todas as execuções tiverem sido concluídas.
    if (resposta.status === STATUS_EXECUCAO.CONCLUIDO) registrarExperimento(resposta.experimento)
    setRetorno(resposta)
    setExecutando(false)
  }

  // Separa as informações do último experimento salvo e o tipo que deve aparecer na tela.
  const tipoExecutado = experimento ? TIPOS_EXPERIMENTO[experimento.tipoExperimento] : null
  const tipoVisivel = tipoExecutado ?? TIPOS_EXPERIMENTO[tipoExperimento]
  // Interpreta os estados devolvidos pelo serviço para exibir avisos ou erros.
  const aguardando = retorno?.status === STATUS_EXECUCAO.AGUARDANDO_ALGORITMO
  const falhou = retorno && retorno.status !== STATUS_EXECUCAO.CONCLUIDO && !aguardando
  // Consulta se o algoritmo genético pode ser usado nos experimentos escolhidos.
  const geneticoDisponivel = obterStatusAlgoritmos().find((algoritmo) => algoritmo.id === ALGORITMOS.genetico.id)?.disponivel

  // Acrescenta a cada linha a média de estados avaliados, quando as rodadas têm esse dado.
  const linhasGraficos = experimento?.linhas.map((linha) => {
    // Algumas execuções podem não fornecer esse contador; mantém só os números válidos.
    const avaliacoes = linha.execucoes
      ?.map((execucao) => execucao.estadosAvaliados)
      .filter(Number.isFinite) ?? []
    return { ...linha, estadosAvaliadosMedio: calcularMedia(avaliacoes) }
  }) ?? []
  // Decide qual conjunto de gráficos mostrar e se existe média de estados para comparar.
  const compararAlgoritmos = experimento?.tipoExperimento === 'algoritmos'
  const mostrarEstados = linhasGraficos.some((linha) => Number.isFinite(linha.estadosAvaliadosMedio))

  return (
    <>
      <CabecalhoPagina
        titulo="Experimentos"
        subtitulo="Laboratório de testes para investigar parâmetros e comparar algoritmos com uma mesma estufa como base."
      />

      <div className="d-flex flex-column gap-4">
        <section className="experimentos-metodologia" aria-label="Metodologia dos experimentos">
          <div>
            <span className="sobretitulo">Uma instância-base compartilhada</span>
            <p>
              Um cenário corresponde a uma configuração específica do teste. Em cada experimento, alteramos apenas o parâmetro que está sendo investigado e mantemos os demais constantes.
            </p>
          </div>
          <span className="experimentos-instancia">
            {plantasIndividuais.length} plantas · {zonas.length} zonas · mesma função de fitness
          </span>
        </section>

        <PainelExperimento
          tipoExperimento={tipoExperimento}
          aoMudarTipo={mudarTipo}
          repeticoes={repeticoes}
          aoMudarRepeticoes={setRepeticoes}
          aoExecutar={executar}
          executando={executando}
          geneticoDisponivel={geneticoDisponivel}
        />

        {aguardando && <Alerta tipo="info" titulo="Algoritmo aguardando implementação" mensagens={[retorno.mensagem]} />}
        {falhou && <Alerta tipo="danger" titulo={retorno.mensagem} mensagens={retorno.erros} />}

        <TabelaExperimento experimento={experimento} />

        {/* Os gráficos recebem as linhas resumidas que vieram do serviço de experimentos. */}
        <div className="row g-4">
          <div className="col-xl-6">
            <GraficoComparacao
              titulo={compararAlgoritmos ? 'Algoritmos × Fitness médio' : `${tipoVisivel.rotuloEixo} × Fitness médio`}
              dados={linhasGraficos}
              chaveX="rotulo"
              rotuloX={compararAlgoritmos ? 'Algoritmo' : tipoVisivel.rotuloEixo}
              rotuloY="Fitness médio"
              series={[{ chave: 'fitnessMedio', nome: 'Fitness médio', cor: CORES_GRAFICO.principal }]}
            />
          </div>
          <div className="col-xl-6">
            <GraficoComparacao
              titulo={compararAlgoritmos ? 'Algoritmos × Tempo médio' : `${tipoVisivel.rotuloEixo} × Tempo médio`}
              dados={linhasGraficos}
              chaveX="rotulo"
              rotuloX={compararAlgoritmos ? 'Algoritmo' : tipoVisivel.rotuloEixo}
              rotuloY="Tempo médio (ms)"
              series={[{ chave: 'tempoMedio', nome: 'Tempo médio (ms)', cor: CORES_GRAFICO.secundaria }]}
            />
          </div>
          {compararAlgoritmos && mostrarEstados && (
            <div className="col-xl-6">
              <GraficoComparacao
                titulo="Algoritmos × Estados avaliados"
                dados={linhasGraficos}
                chaveX="rotulo"
                rotuloX="Algoritmo"
                rotuloY="Estados avaliados (média)"
                series={[{ chave: 'estadosAvaliadosMedio', nome: 'Estados avaliados (média)', cor: CORES_GRAFICO.apoio }]}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
