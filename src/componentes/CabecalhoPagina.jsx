export default function CabecalhoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="cabecalho-pagina d-flex flex-wrap align-items-end justify-content-between gap-3">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="texto-suave mb-0">{subtitulo}</p>}
      </div>
      {children && <div className="d-flex gap-2 flex-wrap">{children}</div>}
    </div>
  )
}
