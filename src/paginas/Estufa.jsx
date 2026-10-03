import { useState } from 'react'
import FormularioPlanta from '../componentes/FormularioPlanta'
import FormularioZona from '../componentes/FormularioZona'
import GradeEstufa from '../componentes/GradeEstufa'
import { useEstufa } from '../contexto/useEstufa'

const ICONES_PLANTA = { Tomate: '🍅', Alface: '🥬', Manjericão: '🌿' }

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
  const {
    plantas,
    zonas,
    resultados,
    salvarPlanta,
    removerPlanta,
    salvarZona,
    removerZona,
  } = useEstufa()
  const [edicao, setEdicao] = useState(null)
  const resultadoAtual = Object.values(resultados).slice(-1)[0]

  const guardarPlanta = (planta) => {
    salvarPlanta(planta)
    setEdicao(null)
  }

  const guardarZona = (zona) => {
    salvarZona(zona)
    setEdicao(null)
  }

  return (
    <>
      <section className="estufa-intro" aria-labelledby="titulo-estufa">
        <div className="estufa-intro-texto">
          <span className="sobretitulo">Sistemas Inteligentes · cenário de estudo</span>
          <h1 id="titulo-estufa">Uma estufa.<br /><em>Muitas combinações.</em></h1>
          <p>
            Cada planta tem necessidades próprias. Cada zona oferece condições diferentes.
            Configure o cenário e explore como os algoritmos podem encontrar uma distribuição adequada.
          </p>
          <a className="btn btn-primary" href="#configuracao-cenario">Configurar cenário</a>
        </div>
        <aside className="problema-resumo">
          <span className="problema-selo" aria-hidden="true">01</span>
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

      <section className="estufa-secao" aria-labelledby="titulo-visual-estufa">
        <div className="secao-heading">
          <div>
            <span className="sobretitulo">Instância atual · {zonas.length} zonas</span>
            <h2 id="titulo-visual-estufa">Dentro da estufa</h2>
          </div>
          <span className="estufa-legenda"><span /> Cenário configurado</span>
        </div>
        <div className="estufa-casca">
          <div className="estufa-casca-topo">
            <span className="estufa-arco" aria-hidden="true">⌒</span>
            <span>ESTUFA INTELIGENTE</span>
            <span className="estufa-status">{resultadoAtual ? 'DISTRIBUIÇÃO ENCONTRADA' : 'CENÁRIO DE ESTUDO'}</span>
          </div>
          {zonas.length > 0 ? (
            <GradeEstufa
              zonas={zonas}
              distribuicao={resultadoAtual?.distribuicao ?? null}
              acoesZona={(zona) => (
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Editar ${zona.nome}`} onClick={() => setEdicao({ tipo: 'zona', registro: zona })}>Editar</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Remover ${zona.nome}`} onClick={() => removerZona(zona.id)}>Remover</button>
                </div>
              )}
            />
          ) : (
            <p className="estufa-sem-zonas">Adicione zonas na configuração do cenário para compor a estufa.</p>
          )}
          {!resultadoAtual && zonas.length > 0 && (
            <p className="estufa-nota">Execute uma otimização para visualizar as plantas distribuídas pelas zonas.</p>
          )}
        </div>
      </section>

      <section id="configuracao-cenario" className="configuracao-cenario" aria-labelledby="titulo-configuracao">
        <div className="secao-heading">
          <div>
            <span className="sobretitulo">A instância do problema</span>
            <h2 id="titulo-configuracao">Configuração do cenário</h2>
          </div>
          <p>Defina quais plantas e zonas serão usadas na próxima execução.</p>
        </div>

        <div className="configuracao-bloco" aria-labelledby="titulo-plantas">
          <div className="configuracao-subtitulo">
            <div><span className="subtitulo-icone" aria-hidden="true">🌿</span><h3 id="titulo-plantas">Plantas <small>{plantas.length} tipos</small></h3></div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEdicao({ tipo: 'planta', registro: null })}>Adicionar planta</button>
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
                  <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEdicao({ tipo: 'planta', registro: planta })}>Editar</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => removerPlanta(planta.id)}>Remover</button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="configuracao-bloco configuracao-zonas" aria-labelledby="titulo-zonas">
          <div className="configuracao-subtitulo">
            <div><span className="subtitulo-icone" aria-hidden="true">☀️</span><h3 id="titulo-zonas">Zonas <small>{zonas.length} destinos possíveis</small></h3></div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEdicao({ tipo: 'zona', registro: null })}>Adicionar zona</button>
          </div>
          <p className="configuracao-explicacao">Cada zona representa um destino possível, com condições ambientais e capacidade próprias.</p>
        </div>

        {edicao && (
          <section className="formulario-cenario" aria-labelledby="titulo-formulario-cenario">
            <h3 id="titulo-formulario-cenario">{edicao.registro ? 'Editar' : 'Adicionar'} {edicao.tipo === 'planta' ? 'planta' : 'zona'}</h3>
            {edicao.tipo === 'planta' ? (
              <FormularioPlanta key={`planta-${edicao.registro?.id ?? 'nova'}`} planta={edicao.registro} aoSalvar={guardarPlanta} aoCancelar={() => setEdicao(null)} />
            ) : (
              <FormularioZona key={`zona-${edicao.registro?.id ?? 'nova'}`} zona={edicao.registro} aoSalvar={guardarZona} aoCancelar={() => setEdicao(null)} />
            )}
          </section>
        )}
      </section>

      <section className="relacao-otimizacao" aria-label="Relação entre plantas, zonas e otimização">
        <span className="relacao-icone" aria-hidden="true">{plantas.length ? ICONES_PLANTA[plantas[0].nome] ?? '🌱' : '🌱'}</span>
        <p>Cada planta tem necessidades específicas. Cada zona tem condições próprias. A otimização busca uma distribuição que atenda essas necessidades da melhor forma possível.</p>
        <a href="#otimizacao" className="btn btn-outline-secondary">Explorar otimização <span aria-hidden="true">→</span></a>
      </section>
    </>
  )
}
