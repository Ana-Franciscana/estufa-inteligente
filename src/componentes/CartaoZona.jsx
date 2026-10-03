import { resumirPlantasPorTipo } from '../funcoes/solucao'
import { formatarAgua, formatarTemperatura, formatarUmidade } from '../funcoes/formatacao'
import SeloLuminosidade from './SeloLuminosidade'

// `grupo` (opcional) vem de agruparPlantasPorZona: { plantas, consumoAgua, ocupacao }.
// Sem `grupo`, a zona é exibida vazia (nenhuma distribuição aplicada).
const ICONE_PLANTA = { Tomate: '🍅', Alface: '🥬', Manjericão: '🌿' }

export default function CartaoZona({ zona, grupo, compacto = false, acoes }) {
  const ocupacao = grupo?.ocupacao ?? 0
  const excedida = ocupacao > zona.capacidade
  const percentual = Math.min(100, (ocupacao / zona.capacidade) * 100)

  return (
    <article className={`cartao-zona${excedida ? ' cartao-zona-excedida' : ''}`}>
      <header className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h3 className="cartao-zona-nome">{zona.nome}</h3>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {!compacto && <SeloLuminosidade nivel={zona.luminosidade} />}
          {acoes}
        </div>
      </header>

      <p className="cartao-zona-condicoes">
        <span>{formatarTemperatura(zona.temperatura)}</span>
        <span>{formatarUmidade(zona.umidade)} umidade</span>
        {!compacto && <span>{formatarAgua(zona.aguaDisponivel)}</span>}
      </p>

      <div className="d-flex justify-content-between small texto-suave mb-1">
        <span>Ocupação</span>
        <span>{ocupacao} de {zona.capacidade} vagas</span>
      </div>
      <div
        className="progress barra-ocupacao"
        role="progressbar"
        aria-label={`Ocupação da ${zona.nome}`}
        aria-valuenow={ocupacao}
        aria-valuemin={0}
        aria-valuemax={zona.capacidade}
      >
        <div className="progress-bar" style={{ width: `${percentual}%` }} />
      </div>

      {!compacto && (
        <div className="mt-3">
          {grupo ? (
            <>
              <ul className="lista-plantas">
                {resumirPlantasPorTipo(grupo.plantas).map(({ nome, quantidade }) => (
                  <li key={nome}><span aria-hidden="true">{ICONE_PLANTA[nome] ?? '🌱'} </span>{nome} <span className="texto-suave">× {quantidade}</span></li>
                ))}
                {grupo.plantas.length === 0 && <li className="texto-suave">Nenhuma planta alocada</li>}
              </ul>
              <p className="small texto-suave mb-0">
                Água: {grupo.consumoAgua} de {zona.aguaDisponivel} L/dia
              </p>
            </>
          ) : (
            <p className="small texto-suave mb-0">Aguardando distribuição das plantas.</p>
          )}
        </div>
      )}
    </article>
  )
}
