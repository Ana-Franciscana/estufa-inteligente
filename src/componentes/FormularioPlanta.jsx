import { useState } from 'react'
import Campo from './Campo'

const NOVA_PLANTA = {
  nome: '',
  temperaturaMinima: 18,
  temperaturaMaxima: 24,
  umidadeMinima: 60,
  umidadeMaxima: 80,
  luminosidade: 'media',
  consumoAgua: 5,
  quantidade: 1,
}

const CAMPOS_NUMERICOS = [
  ['temperaturaMinima', 'Temperatura mínima (°C)', 0],
  ['temperaturaMaxima', 'Temperatura máxima (°C)', 0],
  ['umidadeMinima', 'Umidade mínima (%)', 0],
  ['umidadeMaxima', 'Umidade máxima (%)', 0],
  ['consumoAgua', 'Consumo de água (L/dia)', 0],
  ['quantidade', 'Quantidade de plantas', 1],
]

export default function FormularioPlanta({ planta, aoSalvar, aoCancelar }) {
  const [valores, setValores] = useState(() => ({ ...NOVA_PLANTA, ...planta }))

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
          <Campo id="planta-nome" rotulo="Nome da planta">
            <input id="planta-nome" name="nome" className="form-control" value={valores.nome} onChange={atualizar} required />
          </Campo>
        </div>
        {CAMPOS_NUMERICOS.map(([chave, rotulo, minimo]) => (
          <div className="col-sm-6" key={chave}>
            <Campo id={`planta-${chave}`} rotulo={rotulo}>
              <input id={`planta-${chave}`} name={chave} type="number" min={minimo} step="any" className="form-control" value={valores[chave]} onChange={atualizar} required />
            </Campo>
          </div>
        ))}
        <div className="col-12">
          <Campo id="planta-luminosidade" rotulo="Luminosidade necessária">
            <select id="planta-luminosidade" name="luminosidade" className="form-select" value={valores.luminosidade} onChange={atualizar}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </Campo>
        </div>
      </div>
      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-primary">Salvar planta</button>
        <button type="button" className="btn btn-outline-secondary" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  )
}
