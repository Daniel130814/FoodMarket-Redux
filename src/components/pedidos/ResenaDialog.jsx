// Diálogo para reseñar un plato de un pedido entregado (views/MisPedidos). No hace fetch: todo viene por props.
// El filtro oficial es el del backend (400 "El comentario contiene lenguaje no permitido", que se muestra junto al campo).
// Este es un aviso rápido, sin pedido: si el comentario tiene lenguaje ofensivo, no llama a onConfirm y muestra el error.
import { useState } from 'react'
import Dialog from '../comunes/Dialog'

// Lista del aviso rápido (no es la oficial: manda palabras-prohibidas-es.txt del backend, que puede bloquear más palabras).
// Va sin tildes y sin letras repetidas, como queda el texto normalizado.
const PALABRAS_PROHIBIDAS = [
  'pelotudo', 'pelotuda', 'boludo', 'boluda', 'forro', 'forra', 'puta', 'puto', 'mierda', 'carajo',
  'idiota', 'imbecil', 'estupido', 'estupida', 'tarado', 'tarada', 'trolo', 'mogolico', 'cagon',
  'culiado', 'conchudo', 'conchuda', 'pendejo', 'pendeja', 'cabron', 'verga', 'malparido', 'hdp',
]

// Deja el texto en una forma comparable: minúsculas, sin tildes, símbolos por letras (p3l0tud0 -> pelotudo),
// letras sueltas unidas (p.e.l.o -> pelo) y letras repetidas colapsadas (pelotuuudo -> pelotudo).
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z]/g, ' ')
    .replace(/(?<=(?:^|\s)[a-z]) (?=[a-z](?:\s|$))/g, '')
    .replace(/(.)\1+/g, '$1')

// Compara palabra entera (no subcadena), así "computadora" o "putrefacto" no se bloquean por parecerse.
const tieneLenguajeOfensivo = (texto) => {
  const prohibidas = PALABRAS_PROHIBIDAS.map(normalizar)
  return normalizar(texto)
    .split(' ')
    .some((palabra) => prohibidas.includes(palabra))
}

// Props: plato ({ platoId, platoNombre } o null = cerrado); calificacion y comentario (valores de los campos);
// errorBackend (mensaje de un 400 del backend, por ejemplo "El comentario contiene lenguaje no permitido", o null);
// enviando (la reseña se está enviando); onCalificacionChange y onComentarioChange (event); onConfirm; onCancel.
function ResenaDialog({ plato, calificacion, comentario, errorBackend, enviando, onCalificacionChange, onComentarioChange, onConfirm, onCancel }) {
  // Error junto al campo del comentario (null = sin error).
  const [errorComentario, setErrorComentario] = useState(null)

  const confirmar = () => {
    if (tieneLenguajeOfensivo(comentario)) {
      setErrorComentario('Tu comentario contiene lenguaje no permitido.')
      return
    }
    onConfirm()
  }

  // El error del filtro del front tiene prioridad; si no hay, se muestra el que mandó el backend.
  const mensajeError = errorComentario ?? errorBackend

  const cerrar = () => {
    setErrorComentario(null)
    onCancel()
  }

  const cambiarComentario = (event) => {
    setErrorComentario(null)
    onComentarioChange(event)
  }

  return (
    // Cerrado, el título va vacío (Dialog no dibuja nada con open en false)
    <Dialog
      open={plato !== null}
      title={plato === null ? '' : `Reseñar ${plato.platoNombre}`}
      message="Contale a otros cómo estuvo. Solo podés dejar una reseña por plato."
      confirmLabel={enviando ? 'Publicando...' : 'Publicar reseña'}
      confirmVariant="primary"
      cancelLabel="Volver"
      onConfirm={confirmar}
      onCancel={cerrar}
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
      <textarea
        id="comentario"
        className="field"
        value={comentario}
        onChange={cambiarComentario}
        aria-invalid={mensajeError ? 'true' : 'false'}
      />
      {mensajeError && (
        <p className="hint hint--error">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
          <span>{mensajeError}</span>
        </p>
      )}
    </Dialog>
  )
}

export default ResenaDialog
