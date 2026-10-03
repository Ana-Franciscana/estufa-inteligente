import CartaoZona from './CartaoZona'

// `distribuicao` (opcional): lista de grupos por zona (agruparPlantasPorZona).
export default function GradeEstufa({ zonas, distribuicao = null, compacto = false }) {
  return (
    <div className="row g-3 row-cols-1 row-cols-md-2">
      {zonas.map((zona) => (
        <div className="col" key={zona.id}>
          <CartaoZona
            zona={zona}
            grupo={distribuicao?.find((grupo) => grupo.zona.id === zona.id)}
            compacto={compacto}
          />
        </div>
      ))}
    </div>
  )
}
