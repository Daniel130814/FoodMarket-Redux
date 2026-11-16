// Cesta (/cesta, CLIENTE): muestra la cesta que le pasa App y sigue al checkout.
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../components/cesta/CartItem'
import OrderSummary from '../components/cesta/OrderSummary'
import EmptyState from '../components/comunes/EmptyState'
import Dialog from '../components/comunes/Dialog'
import { fetchPlatos } from '../components/Redux/platosSlice'

// Props (de App): carrito, cartCount (unidades), onQuantityChange (itemId, cantidad), onRemove (itemId), onClear (vacía la cesta).
function Carrito({ carrito, cartCount, onQuantityChange, onRemove, onClear }) {
  const navigate = useNavigate()

  // Diálogo de "Vaciar cesta" abierto o cerrado.
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  // Los ítems de la API no traen imagen: se piden los platos al catálogo (público, sin token) y se usa la primera foto de cada uno.
  const dispatch = useDispatch()
  const { items: platos } = useSelector((state) => state.platos)
  const fotos = Object.fromEntries(platos.map((plato) => [plato.id, plato.imagenesUrls[0]]))

  // Al abrir: GET /platos. Si falla se queda el ícono de siempre, porque la foto es solo decorativa.
  useEffect(() => {
    dispatch(fetchPlatos())
  }, [dispatch])

  const { items, totalEstimado } = carrito

  if (items.length === 0) {
    return (
      <EmptyState
        title="Tu cesta está vacía"
        message="Sumá platos de los chefs de tu barrio y los armamos para entregártelos hoy."
        actionLabel="Ver platos de hoy"
        onAction={() => navigate('/catalogo')}
      />
    )
  }

  return (
    <>
      <Link to="/catalogo" className="inline-flex min-h-[44px] items-center gap-1 text-label-lg text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_back</span>
        Seguir explorando
      </Link>
      <h1 className="mt-4 font-display text-display-lg-mobile text-primary lg:text-[52px] lg:leading-[56px]">Tu cesta</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          {/* Lista simple: la API no trae el chef en los ítems, así que no se agrupa por chef */}
          <ul className="divide-hair rounded-xl bg-surface-container-lowest p-5 shadow-ambient sm:p-7">
            {items.map((item) => (
              <CartItem key={item.id} item={item} imagenUrl={fotos[item.platoId]} onQuantityChange={onQuantityChange} onRemove={onRemove} />
            ))}
          </ul>
          <button type="button" className="btn btn-quiet mt-4" onClick={() => setConfirmandoVaciar(true)}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">delete_sweep</span>
            Vaciar cesta
          </button>
        </div>
        <div className="lg:col-span-4">
          <OrderSummary
            units={cartCount}
            subtotal={totalEstimado}
            onConfirm={() => navigate('/checkout')}
            buttonLabel="Continuar con la compra"
          />
        </div>
      </div>

      <Dialog
        open={confirmandoVaciar}
        title="¿Vaciar tu cesta?"
        message="Se van a quitar todos los platos que agregaste."
        confirmLabel="Vaciar cesta"
        cancelLabel="Mantener"
        onConfirm={() => {
          onClear()
          setConfirmandoVaciar(false)
        }}
        onCancel={() => setConfirmandoVaciar(false)}
      />
    </>
  )
}

export default Carrito
