// Promedio de estrellas de un plato ("★ 4,5 (3)"). Lee las reseñas del store; no se dibuja si el plato no tiene ninguna.
import { useSelector } from 'react-redux'

// Props: platoId. La API no manda promedios: se calculan acá con las reseñas que haya pedido la vista (fetchResenas).
function PlatoRating({ platoId }) {
  const resenas = useSelector((state) => state.resenas.items)

  const deEstePlato = resenas.filter((resena) => resena.platoId === platoId)
  if (deEstePlato.length === 0) {
    return null
  }

  const promedio = deEstePlato.reduce((acumulado, resena) => acumulado + resena.calificacion, 0) / deEstePlato.length
  const promedioTexto = (Math.round(promedio * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1 })

  return (
    <p className="text-label-md text-primary" aria-label={`${promedioTexto} de 5 estrellas, ${deEstePlato.length} reseñas`}>
      ★ {promedioTexto} <span className="font-normal text-on-surface-variant">({deEstePlato.length})</span>
    </p>
  )
}

export default PlatoRating
