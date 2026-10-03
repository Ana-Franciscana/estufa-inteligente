import { rotuloLuminosidade } from '../funcoes/formatacao'

export default function SeloLuminosidade({ nivel }) {
  return <span className={`selo selo-luz-${nivel}`}>Luminosidade {rotuloLuminosidade(nivel)}</span>
}
