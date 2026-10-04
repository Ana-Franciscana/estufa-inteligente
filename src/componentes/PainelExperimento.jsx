import { LIMITE_RODADAS, TIPOS_EXPERIMENTO } from '../dados/configuracao'
import { formatarPercentual } from '../funcoes/formatacao'

function rotularCenario(tipo, valor) {
  if (tipo.formato === 'percentual') return formatarPercentual(valor)
  return `${valor.toLocaleString('pt-BR')} indivíduos`
}

export default function PainelExperimento({
  tipoExperimento,
  aoMudarTipo,
  repeticoes,
  aoMudarRepeticoes,
  aoExecutar,
  executando,
  geneticoDisponivel,
}) {
  const experimentos = Object.values(TIPOS_EXPERIMENTO)

  return (
    <section className="cartao painel-experimentos" aria-labelledby="titulo-escolher-experimento">
      <div className="secao-heading">
        <div>
          <span className="sobretitulo">Desenho dos testes</span>
          <h2 id="titulo-escolher-experimento">Escolha um experimento</h2>
        </div>
        <p>Selecione uma pergunta de pesquisa para ver seus cenários fixos.</p>
      </div>

      <div className="experimentos-opcoes">
        {experimentos.map((tipo, indice) => {
          const selecionado = tipo.id === tipoExperimento
          return (
            <button
              key={tipo.id}
              type="button"
              className={`experimento-opcao${selecionado ? ' selecionado' : ''}`}
              aria-pressed={selecionado}
              onClick={() => aoMudarTipo(tipo.id)}
            >
              <span className="experimento-opcao-topo">
                <span className="experimento-numero">0{indice + 1}</span>
                <span className="selo">
                  {tipo.parametro ? 'Somente Algoritmo Genético' : 'Algoritmo Genético + Busca Gulosa'}
                </span>
              </span>
              <strong className="experimento-opcao-titulo">{tipo.rotulo}</strong>
              <span className="experimento-pergunta">{tipo.pergunta}</span>
              <span className="experimento-descricao">{tipo.descricao}</span>

              {tipo.parametro ? (
                <>
                  <span className="experimento-explicacao">{tipo.explicacaoParametro}</span>
                  <span className="experimento-cenarios" aria-label="Cenários fixos">
                    {tipo.valoresPadrao.map((valor, cenario) => (
                      <span className="experimento-cenario" key={valor}>
                        <small>Cenário {cenario + 1}</small>
                        <b>{rotularCenario(tipo, valor)}</b>
                      </span>
                    ))}
                  </span>
                </>
              ) : (
                <span className="experimento-comparacao">
                  <span>Algoritmo Genético</span><b aria-hidden="true">×</b><span>Busca Gulosa</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="experimento-controles">
        <div className="experimento-repeticoes">
          <label htmlFor="exp-repeticoes" className="form-label">Repetições</label>
          <input
            id="exp-repeticoes"
            type="number"
            min="1"
            max={LIMITE_RODADAS}
            className="form-control"
            value={repeticoes}
            onChange={(evento) => aoMudarRepeticoes(evento.target.value)}
          />
          <span className="form-text">
            Cada cenário pode ser executado várias vezes para observar a variação dos resultados e calcular médias.
            Isso é especialmente importante para o Algoritmo Genético, que possui componentes aleatórios.
            Padrão adotado pelo projeto: 10 repetições.
          </span>
        </div>
        <button type="button" className="btn btn-primary" onClick={aoExecutar} disabled={executando}>
          {executando ? 'Executando…' : 'Executar experimento'}
        </button>
      </div>

      {!geneticoDisponivel && (
        <p className="experimento-disponibilidade" role="status">
          O Algoritmo Genético ainda aguarda implementação. Os experimentos que dependem dele poderão ser executados quando estiver disponível.
        </p>
      )}
    </section>
  )
}
