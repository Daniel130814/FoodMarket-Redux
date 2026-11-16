// Pestaña Reseñas de views/Admin: todas las reseñas con su botón Eliminar. No hace fetch: todo viene por props.
import ContenidoAsync from '../comunes/ContenidoAsync'

// Props: resenas ({ id, calificacion, comentario, fechaCreacion, platoNombre, clienteId }); cargando; error (texto o
// null); onEliminar (resena): el padre pide confirmar.
function ResenasPanel({ resenas, cargando, error, onEliminar }) {
  const formatearFecha = (fechaIso) =>
    new Date(fechaIso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div role="tabpanel" className="mt-8 space-y-4">
      <ContenidoAsync
        cargando={cargando}
        error={error}
        vacio={resenas.length === 0}
        mensajeCarga="Cargando las reseñas..."
        mensajeVacio="Todavía no hay reseñas."
      >
        {resenas.map((resena) => (
          <article
            key={resena.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
          >
            <div className="min-w-0 flex-1 basis-[220px]">
              <h2 className="font-display text-headline-sm text-primary">{resena.platoNombre}</h2>
              <p className="text-body-sm text-on-surface-variant">
                {formatearFecha(resena.fechaCreacion)} · Cliente n.º {resena.clienteId}
              </p>
              {resena.comentario && <p className="mt-2 text-body-md text-on-surface">{resena.comentario}</p>}
            </div>
            <p className="text-secondary" aria-label={`${resena.calificacion} de 5 estrellas`}>
              {'★'.repeat(resena.calificacion)}
            </p>
            <button type="button" className="btn btn-quiet btn-sm text-error" onClick={() => onEliminar(resena)}>
              Eliminar
            </button>
          </article>
        ))}
      </ContenidoAsync>
    </div>
  )
}

export default ResenasPanel
