// Rótulo + controle de formulário (o input/select é passado como filho).
export default function Campo({ id, rotulo, dica, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{rotulo}</label>
      {children}
      {dica && <div className="form-text">{dica}</div>}
    </div>
  )
}
