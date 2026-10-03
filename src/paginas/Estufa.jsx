import GradeEstufa from '../componentes/GradeEstufa'
import { useEstufa } from '../contexto/useEstufa'

const ICONES_PLANTA = { Tomate: '🍅', Alface: '🥬', Manjericão: '🌿', Pimentão: '🫑', Pepino: '🥒', Morango: '🍓' }

function Passo({ icone, titulo, descricao, ultimo = false }) {
  return (
    <div className="passo-fluxo">
      <span className="passo-icone" aria-hidden="true">{icone}</span>
      <h3>{titulo}</h3>
      <p>{descricao}</p>
      {!ultimo && <span className="passo-seta" aria-hidden="true">→</span>}
    </div>
  )
}

export default function Estufa() {
  const { plantas, plantasIndividuais, zonas, resultados } = useEstufa()
  const resultadoAtual = Object.values(resultados).slice(-1)[0]

  return (
    <>
      <section className="estufa-intro" aria-labelledby="titulo-estufa">
        <div className="estufa-intro-texto">
          <span className="sobretitulo">Sistemas Inteligentes · cenário de estudo</span>
          <h1 id="titulo-estufa">Uma estufa.<br /><em>Muitas combinações.</em></h1>
          <p>
            Cada planta tem necessidades próprias. Cada zona oferece condições diferentes.
            Conheça a instância-base usada para explorar como os algoritmos encontram uma distribuição adequada.
          </p>
          <a className="btn btn-primary" href="#cenario-base">Ver cenário-base</a>
        </div>
        <aside className="problema-resumo">
          <h2>O problema</h2>
          <p>
            Temperatura, umidade, luminosidade, água e capacidade definem onde cada planta
            pode crescer melhor. O objetivo é distribuir as plantas pelas zonas considerando
            essas características.
          </p>
          <div className="problema-tags" aria-label="Fatores considerados">
            <span>Temperatura</span><span>Umidade</span><span>Luminosidade</span><span>Água</span>
          </div>
        </aside>
      </section>

      <section className="como-funciona" aria-labelledby="titulo-como-funciona">
        <div className="secao-heading">
          <div>
            <span className="sobretitulo">Do cenário ao resultado</span>
            <h2 id="titulo-como-funciona">Como funciona</h2>
          </div>
          <p>As necessidades das plantas são comparadas às condições das zonas.</p>
        </div>
        <div className="fluxo-passos">
          <Passo icone="🌱" titulo="Plantas" descricao="Necessidades" />
          <Passo icone="☀️" titulo="Zonas" descricao="Condições disponíveis" />
          <Passo icone="⌘" titulo="Algoritmo" descricao="Busca combinações" />
          <Passo icone="🌿" titulo="Distribuição" descricao="Uma planta por gene" />
          <Passo icone="↗" titulo="Resultado" descricao="Fitness e métricas" ultimo />
        </div>
      </section>

      <section id="dentro-estufa" className="estufa-secao" aria-labelledby="titulo-visual-estufa">
        <div className="secao-heading">
          <div>
            <span className="sobretitulo">Instância-base · {zonas.length} zonas · {plantasIndividuais.length} plantas</span>
            <h2 id="titulo-visual-estufa">Dentro da estufa</h2>
          </div>
          <span className="estufa-legenda"><span /> Cenário de estudo fixo</span>
        </div>
        <div className="estufa-casca">
          <div className="estufa-casca-topo">
            <span className="estufa-arco" aria-hidden="true">⌒</span>
            <span>ESTUFA INTELIGENTE</span>
            <span className="estufa-status">{resultadoAtual ? 'DISTRIBUIÇÃO ENCONTRADA' : 'CENÁRIO-BASE'}</span>
          </div>
          {zonas.length > 0 ? (
            <GradeEstufa zonas={zonas} distribuicao={resultadoAtual?.distribuicao ?? null} />
          ) : (
            <p className="estufa-sem-zonas">Nenhuma zona está definida nos dados-base.</p>
          )}
          {!resultadoAtual && zonas.length > 0 && (
            <p className="estufa-nota">Execute uma otimização para visualizar a distribuição das plantas pelas zonas.</p>
          )}
        </div>
      </section>

      <section id="cenario-base" className="configuracao-cenario" aria-labelledby="titulo-cenario-base">
        <div className="secao-heading">
          <div>
            <span className="sobretitulo">Entrada controlada dos experimentos</span>
            <h2 id="titulo-cenario-base">Cenário-base</h2>
          </div>
          <p>Plantas e zonas são fixas e compartilhadas entre as execuções para manter a comparação justa.</p>
        </div>

        <div className="configuracao-bloco" aria-labelledby="titulo-plantas">
          <div className="configuracao-subtitulo">
            <div><span className="subtitulo-icone" aria-hidden="true">🌿</span><h3 id="titulo-plantas">Plantas <small>{plantas.length} tipos · {plantasIndividuais.length} individuais</small></h3></div>
          </div>
          <div className="row g-3">
            {plantas.map((planta) => (
              <div className="col-md-6 col-xl-4" key={planta.id}>
                <article className="planta-item">
                  <div className="planta-item-topo">
                    <span className="planta-ilustracao" aria-hidden="true">{ICONES_PLANTA[planta.nome] ?? '🌱'}</span>
                    <div><h4>{planta.nome}</h4><span className="texto-suave">{planta.quantidade} plantas</span></div>
                  </div>
                  <p>{planta.temperaturaMinima}–{planta.temperaturaMaxima}°C <span>·</span> {planta.umidadeMinima}–{planta.umidadeMaxima}% umidade</p>
                  <p className="planta-detalhe">Luz {planta.luminosidade} <span>·</span> {planta.consumoAgua} L/dia</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relacao-otimizacao" aria-label="Relação entre plantas, zonas e otimização">
        <span className="relacao-icone" aria-hidden="true">{plantas.length ? ICONES_PLANTA[plantas[0].nome] ?? '🌱' : '🌱'}</span>
        <p>Cada planta tem necessidades específicas. Cada zona tem condições próprias. A otimização busca uma distribuição que atenda essas necessidades da melhor forma possível.</p>
        <a href="#otimizacao" className="btn btn-outline-secondary">Explorar otimização <span aria-hidden="true">→</span></a>
      </section>
    </>
  )
}
