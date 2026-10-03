import { useMemo, useState } from 'react'
import { PLANTAS_INICIAIS } from '../dados/plantas'
import { ZONAS_INICIAIS } from '../dados/zonas'
import { expandirPlantas } from '../funcoes/solucao'
import { EstufaContexto } from './EstufaContexto'

const clonarDados = (dados) => dados.map((item) => ({ ...item }))

// A configuração do cenário fica em memória durante a sessão e parte dos arquivos em dados/.
export function EstufaProvider({ children }) {
  const [plantas, setPlantas] = useState(() => clonarDados(PLANTAS_INICIAIS))
  const [zonas, setZonas] = useState(() => clonarDados(ZONAS_INICIAIS))
  const [resultados, setResultados] = useState({})
  const [experimento, setExperimento] = useState(null)
  const plantasIndividuais = useMemo(() => expandirPlantas(plantas), [plantas])

  const descartarResultados = () => {
    setResultados({})
    setExperimento(null)
  }

  const salvarPlanta = (planta) => {
    setPlantas((atuais) => {
      const id = planta.id ?? Math.max(0, ...atuais.map((atual) => atual.id)) + 1
      const atualizada = { ...planta, id }
      return planta.id
        ? atuais.map((atual) => (atual.id === id ? atualizada : atual))
        : [...atuais, atualizada]
    })
    descartarResultados()
  }

  const removerPlanta = (id) => {
    setPlantas((atuais) => atuais.filter((planta) => planta.id !== id))
    descartarResultados()
  }

  const salvarZona = (zona) => {
    setZonas((atuais) => {
      const id = zona.id ?? Math.max(0, ...atuais.map((atual) => atual.id)) + 1
      const atualizada = { ...zona, id }
      return zona.id
        ? atuais.map((atual) => (atual.id === id ? atualizada : atual))
        : [...atuais, atualizada]
    })
    descartarResultados()
  }

  const removerZona = (id) => {
    setZonas((atuais) => atuais.filter((zona) => zona.id !== id))
    descartarResultados()
  }

  const registrarResultado = (resultado) => {
    setResultados((atuais) => ({ ...atuais, [resultado.algoritmo]: resultado }))
  }

  const valor = {
    plantas,
    plantasIndividuais,
    zonas,
    resultados,
    experimento,
    salvarPlanta,
    removerPlanta,
    salvarZona,
    removerZona,
    registrarResultado,
    registrarExperimento: setExperimento,
  }

  return <EstufaContexto.Provider value={valor}>{children}</EstufaContexto.Provider>
}
