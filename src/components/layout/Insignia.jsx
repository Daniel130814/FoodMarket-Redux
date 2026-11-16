// Globito con un número al lado de un enlace del Header (por ejemplo, los pedidos nuevos del chef). No se dibuja si es 0.

// Props: cantidad (número); label (texto para lectores de pantalla, por ejemplo "pedidos por atender").
function Insignia({ cantidad, label }) {
  if (cantidad === 0) {
    return null
  }
  return (
    <span
      className="ml-1.5 inline-block min-w-[1.25rem] rounded-full bg-secondary px-1.5 text-center text-[12px] font-semibold leading-5 text-on-secondary"
      aria-label={`${cantidad} ${label}`}
    >
      {cantidad}
    </span>
  )
}

export default Insignia
