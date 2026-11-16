// Pestaña Pagos de views/Admin: lista de pagos con sus acciones. No hace fetch ni guarda datos: todo viene por props.

// Estado del pago -> texto y color del badge.
const ETIQUETAS_PAGO = {
  PENDIENTE: { texto: 'Pendiente', clase: 'badge-sand' },
  APROBADO: { texto: 'Aprobado', clase: 'badge-leaf' },
  RECHAZADO: { texto: 'Rechazado', clase: 'badge-terra' },
  REEMBOLSADO: { texto: 'Reembolsado', clase: 'badge-mute' },
}

const ETIQUETAS_MEDIO = {
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO: 'Tarjeta de débito',
  TRANSFERENCIA: 'Transferencia',
  EFECTIVO: 'Efectivo',
}

const formatear = (monto) => `$${monto.toLocaleString('es-AR')}`

// Transiciones válidas: PENDIENTE -> APROBADO o RECHAZADO; APROBADO -> REEMBOLSADO; el resto no tiene acciones.
const accionesDe = (pago) => {
  if (pago.estado === 'PENDIENTE') {
    return ['APROBADO', 'RECHAZADO']
  }
  if (pago.estado === 'APROBADO') {
    return ['REEMBOLSADO']
  }
  return []
}

// Props: pagos (ya ordenados); textosAccion (estado nuevo -> { boton }); onAccion (pagoId, estado): el padre abre el
// diálogo de confirmación.
function PagosPanel({ pagos, textosAccion, onAccion }) {
  return (
    <div role="tabpanel" className="mt-8 space-y-4">
      {pagos.length === 0 && (
        <p className="text-body-md text-on-surface-variant">
          No hay pagos todavía. Cuando un cliente pague un pedido, lo vas a ver acá para aprobarlo.
        </p>
      )}
      {pagos.map((pago) => (
        <article
          key={pago.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
        >
          <div className="min-w-0 flex-1 basis-[220px]">
            <h2 className="font-display text-headline-sm text-primary">Pago n.º {pago.id} · Pedido n.º {pago.pedidoId}</h2>
            <p className="text-body-sm text-on-surface-variant">
              {ETIQUETAS_MEDIO[pago.medioPago]} ·{' '}
              {new Date(pago.fechaCreacion).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <p className="font-display text-price-md tabular text-primary">{formatear(pago.monto)}</p>
          <span className={`badge ${ETIQUETAS_PAGO[pago.estado].clase}`}>{ETIQUETAS_PAGO[pago.estado].texto}</span>
          <div className="flex gap-2">
            {accionesDe(pago).map((estado) => (
              <button
                key={estado}
                type="button"
                className={estado === 'APROBADO' ? 'btn btn-primary btn-sm' : 'btn btn-quiet btn-sm text-error'}
                onClick={() => onAccion(pago.id, estado)}
              >
                {textosAccion[estado].boton}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export default PagosPanel
