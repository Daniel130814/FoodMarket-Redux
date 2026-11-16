// Tarjeta con un número destacado del dashboard del chef. No guarda datos: todo viene por props.

// Props: label (qué mide); value (el número ya formateado); hint (aclaración opcional).
function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient">
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="mt-2 font-display text-price-lg tabular text-primary">{value}</p>
      {hint && <p className="mt-1 text-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  )
}

export default StatCard
