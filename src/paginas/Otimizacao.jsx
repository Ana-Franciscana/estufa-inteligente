import { useState } from 'react'
import Alerta from '../componentes/Alerta'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import ComparacaoAlgoritmos from '../componentes/ComparacaoAlgoritmos'
import PainelParametros from '../componentes/PainelParametros'
import ResultadoOtimizacao from '../componentes/ResultadoOtimizacao'
import SeletorAlgoritmo from '../componentes/SeletorAlgoritmo'
import { PARAMETROS_PADRAO_GENETICO, PARAMETROS_PADRAO_GULOSA } from '../dados/configuracao'
import { useEstufa } from '../contexto/useEstufa'
import { gerarAvisosProblema, validarConfiguracao, validarProblema } from '../funcoes/validacao'
import { executarAlgoritmo, obterStatusAlgoritmos, STATUS_EXECUCAO } from '../servicos/executorAlgoritmos'

const CONFIGURACOES_INICIAIS = { genetico: PARAMETROS_PADRAO_GENETICO, gulosa: PARAMETROS_PADRAO_GULOSA }

export default function Otimizacao() {
  const { plantasIndividuais, zonas, resultados, registrarResultado } = useEstufa()
  const [tipo, setTipo] = useState('genetico')
  const [configuracoes, setConfiguracoes] = useState(CONFIGURACOES_INICIAIS)
  const [executando, setExecutando] = useState(false)
  const [retorno, setRetorno] = useState(null)

  const configuracao = configuracoes[tipo]
  const erros = [...validarProblema(plantasIndividuais, zonas), ...validarConfiguracao(tipo, configuracao)]
  const avisos = gerarAvisosProblema(plantasIndividuais, zonas)

  const mudarConfiguracao = (nova) => setConfiguracoes({ ...configuracoes, [tipo]: nova })

  const executar = async () => {
    setExecutando(true)
    setRetorno(null)
    const resposta = await executarAlgoritmo({ tipo, plantas: plantasIndividuais, zonas, configuracao })
    if (resposta.status === STATUS_EXECUCAO.CONCLUIDO) registrarResultado(resposta.resultado)
    setRetorno({ ...resposta, tipo })
    setExecutando(false)
  }

  const retornoAtual = retorno?.tipo === tipo ? retorno : null
  const aguardando = retornoAtual?.status === STATUS_EXECUCAO.AGUARDANDO_ALGORITMO

  return (
    <>
      <CabecalhoPagina titulo="Otimização" subtitulo="Escolha o algoritmo, ajuste os parâmetros e execute." />

      <div className="row g-4 mb-4">
        <div className="col-xl-5 d-flex flex-column gap-3">
          <SeletorAlgoritmo algoritmos={obterStatusAlgoritmos()} valor={tipo} aoMudar={setTipo} />
          <PainelParametros
            tipo={tipo}
            configuracao={configuracao}
            aoMudar={mudarConfiguracao}
            aoRestaurar={() => mudarConfiguracao(PARAMETROS_PADRAO_GENETICO)}
          />
          <Alerta tipo="danger" titulo={erros.length > 0 ? 'Configuração inválida' : undefined} mensagens={erros} />
          <Alerta tipo="warning" mensagens={avisos} />
          <div>
            <button type="button" className="btn btn-primary btn-lg" onClick={executar} disabled={executando || erros.length > 0}>
              {executando ? 'Executando…' : 'Executar otimização'}
            </button>
          </div>
          {retornoAtual && !aguardando && retornoAtual.status !== STATUS_EXECUCAO.CONCLUIDO && (
            <Alerta tipo="danger" titulo={retornoAtual.mensagem} mensagens={retornoAtual.erros} />
          )}
          {aguardando && <Alerta tipo="info" titulo="Aguardando algoritmo" mensagens={[retornoAtual.mensagem]} />}
        </div>

        <div className="col-xl-7">
          <ResultadoOtimizacao resultado={resultados[tipo] ?? null} zonas={zonas} />
        </div>
      </div>

      <ComparacaoAlgoritmos resultados={resultados} plantas={plantasIndividuais} />
    </>
  )
}
