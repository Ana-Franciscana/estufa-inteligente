import { useEffect, useSyncExternalStore } from 'react'
import BarraNavegacao from './componentes/BarraNavegacao'
import { EstufaProvider } from './contexto/EstufaProvider'
import Estufa from './paginas/Estufa'
import Experimentos from './paginas/Experimentos'
import Otimizacao from './paginas/Otimizacao'

const PAGINAS = {
  estufa: Estufa,
  otimizacao: Otimizacao,
  experimentos: Experimentos,
}

const assinarHash = (aoMudar) => {
  window.addEventListener('hashchange', aoMudar)
  return () => window.removeEventListener('hashchange', aoMudar)
}
const lerHash = () => window.location.hash.replace('#', '')

export default function App() {
  const hash = useSyncExternalStore(assinarHash, lerHash)
  const idPagina = Object.hasOwn(PAGINAS, hash) ? hash : 'estufa'
  const Pagina = PAGINAS[idPagina]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [idPagina])

  return (
    <EstufaProvider>
      <a className="link-pular" href="#conteudo-principal" onClick={(evento) => { evento.preventDefault(); document.getElementById('conteudo-principal').focus() }}>
        Pular para o conteúdo
      </a>
      <BarraNavegacao paginaAtual={idPagina} />
      <main id="conteudo-principal" className="container conteudo" tabIndex={-1}>
        <Pagina />
      </main>
      <footer className="rodape container">
        Estufa Inteligente · projeto acadêmico de Sistemas Inteligentes · em desenvolvimento
      </footer>
    </EstufaProvider>
  )
}
