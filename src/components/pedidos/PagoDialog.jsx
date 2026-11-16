// Diálogo para elegir el medio de pago de un pedido (views/MisPedidos). No hace fetch: todo viene por props.
import Dialog from '../comunes/Dialog'

const MEDIOS_PAGO = [
  { valor: 'TARJETA_CREDITO', etiqueta: 'Tarjeta de crédito' },
  { valor: 'TARJETA_DEBITO', etiqueta: 'Tarjeta de débito' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
]

// Props: pedidoId (null = cerrado); medioPago (valor del select); onMedioPagoChange (event); onConfirm; onCancel.
function PagoDialog({ pedidoId, medioPago, onMedioPagoChange, onConfirm, onCancel }) {
  return (
    <Dialog
      open={pedidoId !== null}
      title={`Pagar el pedido n.º ${pedidoId}`}
      message="Elegí cómo vas a pagar. Registramos el pago y queda pendiente hasta que lo aprueben."
      confirmLabel="Registrar pago"
      confirmVariant="primary"
      cancelLabel="Volver"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <label className="label mt-5" htmlFor="medioPago">Medio de pago</label>
      <select id="medioPago" className="field" value={medioPago} onChange={onMedioPagoChange}>
        {MEDIOS_PAGO.map((medio) => (
          <option key={medio.valor} value={medio.valor}>{medio.etiqueta}</option>
        ))}
      </select>
    </Dialog>
  )
}

export default PagoDialog
