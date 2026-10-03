export default function EstadoVazio({ mensagem, icone = '🌿' }) {
  return (
    <div className="estado-vazio" role="status">
      <span className="estado-vazio-icone" aria-hidden="true">{icone}</span>
      <p className="mb-0">{mensagem}</p>
    </div>
  )
}
