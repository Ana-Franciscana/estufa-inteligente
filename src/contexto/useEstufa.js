import { useContext } from 'react'
import { EstufaContexto } from './EstufaContexto'

export function useEstufa() {
  const contexto = useContext(EstufaContexto)
  if (!contexto) throw new Error('useEstufa deve ser usado dentro de EstufaProvider.')
  return contexto
}
