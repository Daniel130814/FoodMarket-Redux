// Detalle de un plato (/plato/:id): GET /platos/{id}, /resenas/plato/{id} (Redux) y /chef-profiles, y agregar a la cesta.
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../components/comunes/Button'
import EmptyState from '../components/comunes/EmptyState'
import LoadingState from '../components/comunes/LoadingState'
import ErrorState from '../components/comunes/ErrorState'
import Gallery from '../components/platos/Gallery'
import QuantityStepper from '../components/cesta/QuantityStepper'
import IngredientTrace from '../components/platos/IngredientTrace'
import ReviewList from '../components/platos/ReviewList'
import ChefCard from '../components/platos/ChefCard'
import { fetchPlatoById } from '../components/Redux/platosSlice'
import Dialog from '../components/comunes/Dialog'
import { deleteResena, fetchResenasByPlato } from '../components/Redux/resenasSlice'

// URL base del backend (viene de .env).
const API_URL = import.meta.env.VITE_API_URL

// Devuelve `data` o lanza un Error con message y status (fetch no manda los errores HTTP al .catch).
const leerRespuesta = (response) =>
  response.json().then((cuerpo) => {
    if (!response.ok) {
      const fallo = new Error(cuerpo.message)
      fallo.status = response.status
      throw fallo
    }
    return cuerpo.data
  })

// Props: onAdd (agregar a la cesta de App; la vista solo avisa y App decide si se puede); onSesionVencida (401) y
// onAviso (Toast): para que el ADMIN elimine reseñas.
function DetallePlato({ onAdd, onSesionVencida, onAviso }) {
  // Ojo: el id de la URL es un string.
  const { id } = useParams()

  const navigate = useNavigate()

  // Cantidad elegida: vive acá y no en QuantityStepper porque el botón de agregar y el precio también la necesitan.
  const [cantidad, setCantidad] = useState(1)

  // El plato y sus reseñas vienen del store; el perfil del chef todavía se pide acá.
  const dispatch = useDispatch()
  const { platoActual: plato, loading: cargando, error } = useSelector((state) => state.platos)
  const { items: itemsResenas, loading: cargandoResenas, error: errorResenas } = useSelector((state) => state.resenas)

  // Si las reseñas fallan, el detalle se ve igual, sin reseñas (no se muestran las que haya dejado otro plato).
  const resenas = errorResenas === null ? itemsResenas : []

  // Solo el ADMIN modera: token y rol del store, y la reseña que está por eliminar (null = diálogo cerrado).
  const token = useSelector((state) => state.auth.token)
  const rol = useSelector((state) => state.auth.user?.role)
  const [resenaAEliminar, setResenaAEliminar] = useState(null)

  // Perfil del chef del plato, o null si no tiene (no todos los chefs lo cargaron).
  const [perfilChef, setPerfilChef] = useState(null)

  // Un id que no es entero positivo (/plato/abc) no se le pregunta al backend: respondería 500.
  const idValido = Number.isInteger(Number(id)) && Number(id) > 0

  // Con 404 (el plato no existe o está pausado) el mensaje de Axios termina en "404": no es una falla, es "no disponible".
  const noDisponible = error !== null && error.includes('404')

  // Pide el plato y sus reseñas al abrir y si cambia el id. Rutas públicas: sin token.
  useEffect(() => {
    if (idValido) {
      dispatch(fetchPlatoById(id))
      dispatch(fetchResenasByPlato(id))
    }
  }, [dispatch, id, idValido])

  // Perfil del chef: es un extra, si falla el detalle se ve igual. No hay endpoint por chefId, así que se busca en la lista.
  const chefId = plato?.chefId
  useEffect(() => {
    if (chefId === undefined) {
      return
    }

    const controlador = new AbortController()

    fetch(`${API_URL}/chef-profiles`, { signal: controlador.signal })
      .then(leerRespuesta)
      .then((perfiles) => setPerfilChef((perfiles ?? []).find((perfil) => perfil.userId === chefId) ?? null))
      .catch(() => setPerfilChef(null))

    return () => controlador.abort()
  }, [chefId])

  if (!idValido || noDisponible) {
    return (
      <EmptyState
        title="Este plato no está disponible"
        message="Puede que se haya pausado o que ya no exista."
        actionLabel="Volver al catálogo"
        onAction={() => navigate('/catalogo')}
      />
    )
  }

  // El store puede traer el plato de otra visita: hasta que llegue el de este id se muestra "cargando".
  if (cargando || cargandoResenas || (error === null && (plato === null || plato.id !== Number(id)))) {
    return <LoadingState message="Cargando el plato..." />
  }
  if (error !== null) {
    return <ErrorState message={error} />
  }

  // Elimina la reseña elegida (DELETE /resenas/{id}); el slice la saca de la lista y el promedio se recalcula solo.
  const eliminarResena = () => {
    const { id: resenaId } = resenaAEliminar
    setResenaAEliminar(null)

    dispatch(deleteResena({ id: resenaId, token })).then((resultado) => {
      if (resultado.type === 'resenas/deleteResena/fulfilled') {
        onAviso('Eliminaste la reseña')
        return
      }
      // El mensaje de Axios termina en el código HTTP ("Request failed with status code 403").
      const mensaje = resultado.error.message
      if (mensaje.includes('401')) {
        onSesionVencida()
        return
      }
      if (mensaje.includes('403')) {
        onAviso('No tenés permisos para eliminar reseñas', 'error')
        return
      }
      onAviso('No pudimos eliminar la reseña', 'error')
    })
  }

  const agotado = plato.estado === 'AGOTADO'

  // El total se calcula en cada render: como estado aparte podría quedar desincronizado de la cantidad.
  const tieneDescuento = plato.descuentoPorcentaje > 0
  const total = plato.precioConDescuento * cantidad
  const formatear = (monto) => `$${monto.toLocaleString('es-AR')}`

  const tieneIngredientes = plato.ingredientes.length > 0
  const tieneResenas = resenas.length > 0

  // Promedio de calificaciones (la API no lo manda), a 1 decimal; sin reseñas queda en null para no dividir por 0.
  const promedio = tieneResenas
    ? resenas.reduce((acumulado, resena) => acumulado + resena.calificacion, 0) / resenas.length
    : null
  const promedioTexto = promedio === null
    ? ''
    : (Math.round(promedio * 10) / 10).toLocaleString('es-AR', { minimumFractionDigits: 1 })

  return (
    <>
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <Gallery images={plato.imagenesUrls} title={plato.nombre} />
      <div>
        {agotado && <span className="badge badge-dark mb-3">Agotado</span>}
        <h1 className="font-display text-headline-lg text-primary">{plato.nombre}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Cocina {plato.chefNombre}</p>
        {tieneResenas && (
          <p className="mt-2 text-label-md text-primary">
            ★ {promedioTexto}{' '}
            <span className="font-normal text-on-surface-variant">
              ({resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'})
            </span>
          </p>
        )}
        <p className="mt-3 max-w-xl text-body-md text-on-surface-variant">{plato.descripcion}</p>

        {/* Precio con descuento destacado; el base tachado y el badge solo si hay descuento */}
        <div className="mt-6 border-t border-hairline pt-6">
          <p className="text-body-sm text-on-surface-variant">Precio</p>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-price-lg tabular text-primary">{formatear(plato.precioConDescuento)}</span>
            {tieneDescuento && (
              <>
                <span className="text-body-md text-on-surface-variant line-through">{formatear(plato.precio)}</span>
                <span className="badge badge-sand">−{plato.descuentoPorcentaje}%</span>
              </>
            )}
          </p>
        </div>

        {agotado ? (
          <p className="mt-6 text-label-lg text-on-surface-variant">
            Este plato está agotado por hoy. Volvé más tarde o mirá otros platos del catálogo.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantityStepper value={cantidad} min={1} max={plato.stockDisponible} onChange={setCantidad} />
            <span className="text-body-sm text-on-surface-variant">Quedan {plato.stockDisponible} hoy</span>
          </div>
        )}

        <div className="mt-6">
          <Button
            disabled={agotado}
            onClick={() => onAdd(plato, cantidad)}
          >
            {agotado ? 'Agotado' : `Agregar a la cesta · ${formatear(total)}`}
          </Button>
        </div>
      </div>
    </div>

    {perfilChef !== null && (
      <section className="mt-16" aria-labelledby="h-chef">
        <h2 id="h-chef" className="font-display text-headline-md text-primary">Quién lo cocina</h2>
        <ul className="mt-6 max-w-2xl">
          <ChefCard chef={perfilChef} verPerfil />
        </ul>
      </section>
    )}

    {tieneIngredientes && (
      <div className="mt-16">
        <IngredientTrace items={plato.ingredientes} />
      </div>
    )}
    {tieneResenas && (
      <div className="mt-16">
        <ReviewList reviews={resenas} onDelete={rol === 'ADMIN' ? setResenaAEliminar : undefined} />
      </div>
    )}

    {/* Diálogo de confirmación (solo ADMIN); cerrado, el título va vacío */}
    <Dialog
      open={resenaAEliminar !== null}
      title="¿Eliminar esta reseña?"
      message="La reseña se borra para todos y cambia la calificación del plato. No se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      onConfirm={eliminarResena}
      onCancel={() => setResenaAEliminar(null)}
    />
    </>
  )
}

export default DetallePlato
