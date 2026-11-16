// Lista de pedidos de la pestaña activa de views/MisPedidos, con su mensaje de vacío. No hace fetch: todo viene por props.
import OrderCard from './OrderCard'

// Props: pedidos; emptyMessage (texto si no hay); steps (pasos del seguimiento); getPayment (pedidoId -> último pago o
// null); reviewedPlatoIds; onCancel, onPay, onReview y onReorder: se pasan tal cual a OrderCard.
function PedidosLista({ pedidos, emptyMessage, steps, getPayment, reviewedPlatoIds, onCancel, onPay, onReview, onReorder }) {
  return (
    <div role="tabpanel" className="mt-8 space-y-6">
      {pedidos.length === 0 && <p className="text-body-md text-on-surface-variant">{emptyMessage}</p>}
      {pedidos.map((pedido) => (
        <OrderCard
          key={pedido.id}
          order={pedido}
          steps={steps}
          payment={getPayment(pedido.id)}
          reviewedPlatoIds={reviewedPlatoIds}
          onCancel={onCancel}
          onPay={onPay}
          onReview={onReview}
          onReorder={onReorder}
        />
      ))}
    </div>
  )
}

export default PedidosLista
