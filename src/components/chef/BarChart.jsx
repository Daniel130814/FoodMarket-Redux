// Gráfico de barras horizontales hecho con div y Tailwind (sin librerías). No guarda datos: todo viene por props.

// Props: title (encabezado); rows ({ label, value (número que fija el largo de la barra), detail (texto a la derecha) }[]).
function BarChart({ title, rows }) {
  // El máximo fija el 100 % de la barra; con todo en 0 se usa 1 para no dividir por cero.
  const maximo = Math.max(...rows.map((fila) => fila.value), 1)

  return (
    <section className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient sm:p-7">
      <h2 className="font-display text-headline-sm text-primary">{title}</h2>
      <ul className="mt-5 space-y-4">
        {rows.map((fila) => (
          <li key={fila.label}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-label-md text-on-surface">{fila.label}</p>
              <p className="flex-none text-body-sm tabular text-on-surface-variant">{fila.detail}</p>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(fila.value / maximo) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BarChart
