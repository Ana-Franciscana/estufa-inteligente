import { useState } from 'react'
import Alerta from '../componentes/Alerta'
import CabecalhoPagina from '../componentes/CabecalhoPagina'
import ComparacaoAlgoritmos from '../componentes/ComparacaoAlgoritmos'
import PainelParametros from '../componentes/PainelParametros'
import ResultadoOtimizacao from '../componentes/ResultadoOtimizacao'
import SeletorAlgoritmo from '../componentes/SeletorAlgoritmo'
// Os valores padrão inicializam os controles do Algoritmo Genético e da Busca Gulosa.
import { PARAMETROS_PADRAO_GENETICO, PARAMETROS_PADRAO_GULOSA } from '../dados/configuracao'
import { useEstufa } from '../contexto/useEstufa'
import { gerarAvisosProblema, validarConfiguracao, validarProblema } from '../funcoes/validacao'
import { executarAlgoritmo, obterStatusAlgoritmos, STATUS_EXECUCAO } from '../servicos/executorAlgoritmos'

// Mantém uma configuração separada por algoritmo para não misturar seus parâmetros.
const CONFIGURACOES_INICIAIS = { genetico: PARAMETROS_PADRAO_GENETICO, gulosa: PARAMETROS_PADRAO_GULOSA }

export default function Otimizacao() {
  // Recebe do contexto as plantas e zonas da estufa e a função que guarda resultados.
  const { plantasIndividuais, zonas, resultados, registrarResultado } = useEstufa()
  // Guarda qual algoritmo está selecionado, seus parâmetros e o estado da execução.
  const [tipo, setTipo] = useState('genetico')
  const [configuracoes, setConfiguracoes] = useState(CONFIGURACOES_INICIAIS)
  const [executando, setExecutando] = useState(false)
  const [retorno, setRetorno] = useState(null)

  // Seleciona os parâmetros do algoritmo ativo e valida dados e configuração antes de executar.
  const configuracao = configuracoes[tipo]
  // Combina erros gerais da estufa e erros específicos dos parâmetros.
  const erros = [...validarProblema(plantasIndividuais, zonas), ...validarConfiguracao(tipo, configuracao)]
  // Avisos, como falta de vagas, não impedem a execução.
  const avisos = gerarAvisosProblema(plantasIndividuais, zonas)

  // Copia o objeto de configurações e troca apenas o algoritmo atualmente selecionado.
  const mudarConfiguracao = (nova) => setConfiguracoes({ ...configuracoes, [tipo]: nova })

  const executar = async () => {
    // Desativa o botão e limpa a resposta antiga enquanto o serviço executa o algoritmo.
    setExecutando(true)
    setRetorno(null)
    // Envia ao serviço o id do algoritmo, plantas individuais, zonas e seus parâmetros.
    const resposta = await executarAlgoritmo({ tipo, plantas: plantasIndividuais, zonas, configuracao })
    // Só registra um resultado quando a execução foi concluída com sucesso.
    if (resposta.status === STATUS_EXECUCAO.CONCLUIDO) registrarResultado(resposta.resultado)
    // Guarda a resposta junto do algoritmo que a produziu e libera o botão.
    setRetorno({ ...resposta, tipo })
    setExecutando(false)
  }

  // Não mostra uma resposta antiga se a pessoa mudou para outro algoritmo.
  const retornoAtual = retorno?.tipo === tipo ? retorno : null
  // Separa o estado de espera para mostrar a mensagem apropriada.
  const aguardando = retornoAtual?.status === STATUS_EXECUCAO.AGUARDANDO_ALGORITMO

  return (
    <>
      <CabecalhoPagina titulo="Otimização" subtitulo="Escolha o algoritmo, ajuste os parâmetros e execute." />

      <div className="row g-4 mb-4">
        <div className="col-xl-5 d-flex flex-column gap-3">
          <SeletorAlgoritmo algoritmos={obterStatusAlgoritmos()} valor={tipo} aoMudar={setTipo} />
          {/* O painel envia os valores digitados para mudarConfiguracao. */}
          <PainelParametros
            tipo={tipo}
            configuracao={configuracao}
            aoMudar={mudarConfiguracao}
            aoRestaurar={() => mudarConfiguracao(PARAMETROS_PADRAO_GENETICO)}
          />
          {/* A execução só é liberada quando não há erro e não está rodando. */}
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
          {/* Mostra o último resultado registrado para o algoritmo selecionado. */}
          <ResultadoOtimizacao resultado={resultados[tipo] ?? null} zonas={zonas} />
        </div>
      </div>

      <ComparacaoAlgoritmos resultados={resultados} plantas={plantasIndividuais} />
    </>
  )
}
