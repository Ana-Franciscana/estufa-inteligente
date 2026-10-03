import { useState } from 'react'
import { ITENS_NAVEGACAO, NOME_PROJETO } from '../dados/configuracao'

export default function BarraNavegacao({ paginaAtual }) {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <header className="barra-navegacao">
      <nav className="navbar navbar-expand-lg container" aria-label="Navegação principal">
        <a className="navbar-brand marca" href="#estufa" onClick={() => setMenuAberto(false)}>
          <img className="marca-logo" src="/logo%20-%20planta%20Meu%20Jardim.png" alt="" />
          <span>{NOME_PROJETO}</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={menuAberto}
          aria-label="Abrir ou fechar o menu"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="menu-principal" className={`collapse navbar-collapse${menuAberto ? ' show' : ''}`}>
          <ul className="navbar-nav ms-lg-auto gap-lg-1">
            {ITENS_NAVEGACAO.map((item) => {
              const ativo = item.id === paginaAtual
              return (
                <li className="nav-item" key={item.id}>
                  <a
                    className={`nav-link${ativo ? ' ativo' : ''}`}
                    href={`#${item.id}`}
                    aria-current={ativo ? 'page' : undefined}
                    onClick={() => setMenuAberto(false)}
                  >
                    {item.rotulo}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </header>
  )
}
