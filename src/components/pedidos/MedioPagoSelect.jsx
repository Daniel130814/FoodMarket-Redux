// Selector del medio de pago (checkout y diálogo de pago de Mis pedidos). No guarda datos: todo viene por props.

const MEDIOS_PAGO = [
  { valor: 'TARJETA_CREDITO', etiqueta: 'Tarjeta de crédito' },
  { valor: 'TARJETA_DEBITO', etiqueta: 'Tarjeta de débito' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
]

// Props: value (valor del medio elegido); onChange (event). Solo se elige el medio: no se piden ni guardan datos de tarjeta.
function MedioPagoSelect({ value, onChange }) {
  return (
    <>
      <label className="label" htmlFor="medioPago">Medio de pago</label>
      <select id="medioPago" className="field" value={value} onChange={onChange}>
        {MEDIOS_PAGO.map((medio) => (
          <option key={medio.valor} value={medio.valor}>{medio.etiqueta}</option>
        ))}
      </select>
    </>
  )
}

export default MedioPagoSelect
