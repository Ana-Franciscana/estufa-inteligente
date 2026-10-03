import { useState } from 'react'
import Campo from './Campo'

const NOVA_ZONA = {
  nome: '',
  temperatura: 24,
  umidade: 70,
  luminosidade: 'media',
  aguaDisponivel: 60,
  capacidade: 5,
}

const CAMPOS_NUMERICOS = [
  ['temperatura', 'Temperatura (°C)', 0],
  ['umidade', 'Umidade (%)', 0],
  ['aguaDisponivel', 'Água disponível (L/dia)', 0],
  ['capacidade', 'Capacidade de plantas', 1],
]

export default function FormularioZona({ zona, aoSalvar, aoCancelar }) {
  const [valores, setValores] = useState(() => ({ ...NOVA_ZONA, ...zona }))

  const atualizar = (evento) => {
    const { name, value, type } = evento.target
    setValores((atuais) => ({ ...atuais, [name]: type === 'number' ? Number(value) : value }))
  }

  const enviar = (evento) => {
    evento.preventDefault()
    aoSalvar(valores)
  }

  return (
    <form onSubmit={enviar}>
      <div className="row g-3">
        <div className="col-12">
          <Campo id="zona-nome" rotulo="Identificação da zona">
            <input id="zona-nome" name="nome" className="form-control" value={valores.nome} onChange={atualizar} required />
          </Campo>
        </div>
        {CAMPOS_NUMERICOS.map(([chave, rotulo, minimo]) => (
          <div className="col-sm-6" key={chave}>
            <Campo id={`zona-${chave}`} rotulo={rotulo}>
              <input id={`zona-${chave}`} name={chave} type="number" min={minimo} step="any" className="form-control" value={valores[chave]} onChange={atualizar} required />
            </Campo>
          </div>
        ))}
        <div className="col-12">
          <Campo id="zona-luminosidade" rotulo="Luminosidade disponível">
            <select id="zona-luminosidade" name="luminosidade" className="form-select" value={valores.luminosidade} onChange={atualizar}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </Campo>
        </div>
      </div>
      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-primary">Salvar zona</button>
        <button type="button" className="btn btn-outline-secondary" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
