// `algoritmos`: lista de { id, nome, icone, descricao, status, disponivel } (obterStatusAlgoritmos).
export default function SeletorAlgoritmo({ algoritmos, valor, aoMudar }) {
  return (
    <div className="row g-3" role="radiogroup" aria-label="Algoritmo">
      {algoritmos.map((algoritmo) => {
        const selecionado = algoritmo.id === valor
        return (
          <div className="col-sm-6" key={algoritmo.id}>
            <button
              type="button"
              role="radio"
              aria-checked={selecionado}
              className={`opcao-algoritmo${selecionado ? ' selecionada' : ''}`}
              onClick={() => aoMudar(algoritmo.id)}
            >
              <span className="opcao-algoritmo-icone" aria-hidden="true">{algoritmo.icone}</span>
              <span className="opcao-algoritmo-nome">{algoritmo.nome}</span>
              <span className="opcao-algoritmo-descricao">{algoritmo.descricao}</span>
              <span className={`selo ${algoritmo.disponivel ? 'selo-ok' : 'selo-pendente'}`}>{algoritmo.status}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
