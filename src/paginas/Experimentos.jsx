import { useState } from 'react'
import Alerta from '../componentes/Alerta'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import GraficoComparacao from '../componentes/GraficoComparacao'
import PainelExperimento from '../componentes/PainelExperimento'
import TabelaExperimento from '../componentes/TabelaExperimento'
import { CORES_GRAFICO, RODADAS_PADRAO, TIPOS_EXPERIMENTO } from '../dados/configuracao'
import { useEstufa } from '../contexto/useEstufa'
import { converterTextoEmNumero, textoParaValores, valoresParaTexto } from '../funcoes/formatacao'
import { executarExperimento } from '../servicos/executorExperimentos'
import { STATUS_EXECUCAO } from '../servicos/executorAlgoritmos'

const textoPadrao = (tipoId) => {
  const tipo = TIPOS_EXPERIMENTO[tipoId]
  return tipo.parametro ? valoresParaTexto(tipo.valoresPadrao, tipo.formato) : ''
}

export default function Experimentos() {
  const { plantasIndividuais, zonas, experimento, registrarExperimento } = useEstufa()
  const [tipoExperimento, setTipoExperimento] = useState('mutacao')
  const [textoValores, setTextoValores] = useState(textoPadrao('mutacao'))
  const [rodadas, setRodadas] = useState(String(RODADAS_PADRAO))
  const [executando, setExecutando] = useState(false)
  const [retorno, setRetorno] = useState(null)

  const mudarTipo = (tipoId) => {
    setTipoExperimento(tipoId)
    setTextoValores(textoPadrao(tipoId))
  }

  const executar = async () => {
    setExecutando(true)
    setRetorno(null)
    const resposta = await executarExperimento({
      tipoExperimento,
      valores: textoParaValores(textoValores, TIPOS_EXPERIMENTO[tipoExperimento].formato),
      rodadas: converterTextoEmNumero(rodadas),
      plantas: plantasIndividuais,
      zonas,
    })
    if (resposta.status === STATUS_EXECUCAO.CONCLUIDO) registrarExperimento(resposta.experimento)
    setRetorno(resposta)
    setExecutando(false)
  }

  const tipoExecutado = experimento ? TIPOS_EXPERIMENTO[experimento.tipoExperimento] : null
  const rotuloEixo = tipoExecutado?.rotuloEixo ?? ''
  const aguardando = retorno?.status === STATUS_EXECUCAO.AGUARDANDO_ALGORITMO
  const falhou = retorno && retorno.status !== STATUS_EXECUCAO.CONCLUIDO && !aguardando

  return (
    <>
      <CabecalhoPagina titulo="Experimentos" subtitulo="Varie parâmetros, repita as execuções e compare as métricas." />

      <div className="d-flex flex-column gap-4">
        <PainelExperimento
          tipoExperimento={tipoExperimento}
          aoMudarTipo={mudarTipo}
          textoValores={textoValores}
          aoMudarValores={setTextoValores}
          rodadas={rodadas}
          aoMudarRodadas={setRodadas}
          aoExecutar={executar}
          executando={executando}
        />
        {aguardando && <Alerta tipo="info" titulo="Aguardando algoritmo" mensagens={[retorno.mensagem]} />}
        {falhou && <Alerta tipo="danger" titulo={retorno.mensagem} mensagens={retorno.erros} />}

        <TabelaExperimento linhas={experimento?.linhas} />

        <div className="row g-4">
          <div className="col-xl-6">
            <GraficoComparacao
              titulo={`${rotuloEixo || 'Cenário'} × Fitness`}
              dados={experimento?.linhas}
              chaveX="rotulo"
              rotuloX={rotuloEixo}
              rotuloY="Fitness"
              series={[
                { chave: 'fitnessMedio', nome: 'Fitness médio', cor: CORES_GRAFICO.principal },
                { chave: 'melhorFitness', nome: 'Melhor', cor: CORES_GRAFICO.apoio },
                { chave: 'piorFitness', nome: 'Pior', cor: CORES_GRAFICO.secundaria },
              ]}
            />
          </div>
          <div className="col-xl-6">
            <GraficoComparacao
              titulo={`${rotuloEixo || 'Cenário'} × Tempo de execução`}
              dados={experimento?.linhas}
              chaveX="rotulo"
              rotuloX={rotuloEixo}
              rotuloY="Tempo médio (ms)"
              series={[{ chave: 'tempoMedio', nome: 'Tempo médio (ms)', cor: CORES_GRAFICO.principal }]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
