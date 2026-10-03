// tipo: 'info' | 'warning' | 'danger' | 'success'
export default function Alerta({ tipo = 'info', titulo, mensagens = [] }) {
  if (!titulo && mensagens.length === 0) return null
  return (
    <div className={`alert alert-${tipo} alerta`} role={tipo === 'danger' ? 'alert' : 'status'}>
      {titulo && <p className="fw-semibold mb-1">{titulo}</p>}
      {mensagens.length > 0 && (
        <ul className="mb-0 ps-3">
          {mensagens.map((mensagem) => <li key={mensagem}>{mensagem}</li>)}
        </ul>
      )}
    </div>
  )
}
