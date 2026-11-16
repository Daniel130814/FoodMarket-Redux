// Panel visual de la derecha de views/Registro (solo pantallas grandes). Contenido fijo, sin props.

// Los tres beneficios del panel: ícono, título y texto.
const BENEFICIOS = [
  {
    icono: 'storefront',
    titulo: 'Si cocinás',
    texto: 'Publicá tus platos con fotos, precio y stock. Mirá tus pedidos y tu stock en un solo lugar.',
  },
  {
    icono: 'shopping_bag',
    titulo: 'Si comprás',
    texto: 'Pedí a talleres de tu barrio y mirá de dónde viene cada ingrediente.',
  },
  {
    icono: 'verified_user',
    titulo: 'Para todos',
    texto: 'Verificamos cada cocina antes de que publique.',
  },
]

function RegistroAside() {
  return (
    <aside
      className="on-dark relative hidden overflow-hidden bg-primary-container lg:flex lg:items-center lg:justify-center lg:p-14"
      aria-hidden="true"
    >
      <div className="max-w-[420px]">
        <h2 className="font-display text-[34px] leading-[40px] tracking-[-0.02em] text-inverse-on-surface">
          Comida con nombre y apellido
        </h2>
        <ul className="mt-8 space-y-6">
          {BENEFICIOS.map((beneficio) => (
            <li key={beneficio.icono} className="flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-primary-fixed">
                <span className="material-symbols-outlined" aria-hidden="true">{beneficio.icono}</span>
              </span>
              <div>
                <p className="text-label-lg text-inverse-on-surface">{beneficio.titulo}</p>
                <p className="mt-0.5 text-body-md text-primary-fixed-dim">{beneficio.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export default RegistroAside
