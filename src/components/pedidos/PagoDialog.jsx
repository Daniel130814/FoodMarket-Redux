// Diálogo para elegir el medio de pago de un pedido (views/MisPedidos). No hace fetch: todo viene por props.
import Dialog from '../comunes/Dialog'
import MedioPagoSelect from './MedioPagoSelect'

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
      <div className="mt-5">
        <MedioPagoSelect value={medioPago} onChange={onMedioPagoChange} />
      </div>
    </Dialog>
  )
}

export default PagoDialog
