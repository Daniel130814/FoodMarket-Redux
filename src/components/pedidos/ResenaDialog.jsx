// Diálogo para reseñar un plato de un pedido entregado (views/MisPedidos). No hace fetch: todo viene por props.
import Dialog from '../comunes/Dialog'

// Props: plato ({ platoId, platoNombre } o null = cerrado); calificacion y comentario (valores de los campos);
// onCalificacionChange y onComentarioChange (event); onConfirm; onCancel.
function ResenaDialog({ plato, calificacion, comentario, onCalificacionChange, onComentarioChange, onConfirm, onCancel }) {
  return (
    // Cerrado, el título va vacío (Dialog no dibuja nada con open en false)
    <Dialog
      open={plato !== null}
      title={plato === null ? '' : `Reseñar ${plato.platoNombre}`}
      message="Contale a otros cómo estuvo. Solo podés dejar una reseña por plato."
      confirmLabel="Publicar reseña"
      confirmVariant="primary"
      cancelLabel="Volver"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <label className="label mt-5" htmlFor="calificacion">Calificación</label>
      <select id="calificacion" className="field" value={calificacion} onChange={onCalificacionChange}>
        <option value="5">5 · Excelente</option>
        <option value="4">4 · Muy bueno</option>
        <option value="3">3 · Bueno</option>
        <option value="2">2 · Regular</option>
        <option value="1">1 · Malo</option>
      </select>
      <label className="label mt-4" htmlFor="comentario">Comentario (opcional)</label>
      <textarea id="comentario" className="field" value={comentario} onChange={onComentarioChange} />
    </Dialog>
  )
}

export default ResenaDialog
