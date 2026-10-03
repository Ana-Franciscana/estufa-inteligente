import { useMemo, useState } from 'react'
import { PLANTAS_INICIAIS } from '../dados/plantas'
import { ZONAS_INICIAIS } from '../dados/zonas'
import { expandirPlantas } from '../funcoes/solucao'
import { EstufaContexto } from './EstufaContexto'

// Plantas e zonas formam a instância-base fixa usada pelos algoritmos e experimentos.
export function EstufaProvider({ children }) {
  const plantas = PLANTAS_INICIAIS
  const zonas = ZONAS_INICIAIS
  const plantasIndividuais = useMemo(() => expandirPlantas(plantas), [plantas])
  const [resultados, setResultados] = useState({})
  const [experimento, setExperimento] = useState(null)

  const registrarResultado = (resultado) => {
    setResultados((atuais) => ({ ...atuais, [resultado.algoritmo]: resultado }))
  }

  const valor = {
    plantas,
    plantasIndividuais,
    zonas,
    resultados,
    experimento,
    registrarResultado,
    registrarExperimento: setExperimento,
  }

  return <EstufaContexto.Provider value={valor}>{children}</EstufaContexto.Provider>
}
