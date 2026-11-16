// Dashboard de ventas (/dashboard, solo CHEF): números y gráficos calculados con sus subpedidos (Redux, GET privado).
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ContenidoAsync from '../components/comunes/ContenidoAsync'
import StatCard from '../components/chef/StatCard'
import BarChart from '../components/chef/BarChart'
import { fetchSubpedidosChef } from '../components/Redux/subpedidosSlice'

// Estado -> texto, igual que en Pedidos recibidos.
const ETIQUETAS_ESTADO = {
  PENDIENTE: 'Pendiente de confirmación',
  CONFIRMADO: 'Recibido',
  EN_PREPARACION: 'Cocinando',
  ENVIADO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const ESTADOS = Object.keys(ETIQUETAS_ESTADO)

const formatear = (monto) => `$${monto.toLocaleString('es-AR')}`

// Props: onSesionVencida (401). El token y el userId salen del store.
function Dashboard({ onSesionVencida }) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const userId = useSelector((state) => state.auth.user?.userId)
  const { items: subPedidos, loading, error } = useSelector((state) => state.subpedidos)

  // Al abrir: GET /subpedidos/chef/{userId}. Un 401 (token vencido) cierra la sesión.
  useEffect(() => {
    dispatch(fetchSubpedidosChef({ token, userId })).then((resultado) => {
      if (resultado.error?.message.includes('401')) {
        onSesionVencida()
      }
    })
    // onSesionVencida queda afuera de las dependencias: App la recrea en cada render y el GET se repetiría.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token, userId])

  // Los cancelados no cuentan como venta.
  const vendidos = subPedidos.filter((subPedido) => subPedido.estado !== 'CANCELADO')
  const ventasTotales = vendidos.reduce((acumulado, subPedido) => acumulado + subPedido.subtotal, 0)
  const ventasEntregadas = vendidos
    .filter((subPedido) => subPedido.estado === 'ENTREGADO')
    .reduce((acumulado, subPedido) => acumulado + subPedido.subtotal, 0)

  // Subpedidos por estado (todos, también los cancelados).
  const filasEstado = ESTADOS.map((estado) => {
    const cantidad = subPedidos.filter((subPedido) => subPedido.estado === estado).length
    return { label: ETIQUETAS_ESTADO[estado], value: cantidad, detail: String(cantidad) }
  })

  // Platos más vendidos: se suman cantidad e ingresos por plato y quedan los 5 con más unidades.
  const porPlato = vendidos
    .flatMap((subPedido) => subPedido.detalles)
    .reduce(
      (acumulado, detalle) => ({
        ...acumulado,
        [detalle.platoId]: {
          nombre: detalle.platoNombre,
          cantidad: (acumulado[detalle.platoId]?.cantidad ?? 0) + detalle.cantidad,
          ingresos: (acumulado[detalle.platoId]?.ingresos ?? 0) + detalle.subtotal,
        },
      }),
      {},
    )
  const filasPlatos = Object.values(porPlato)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
    .map((plato) => ({
      label: plato.nombre,
      value: plato.cantidad,
      detail: `${plato.cantidad} u. · ${formatear(plato.ingresos)}`,
    }))

  return (
    <>
      <h1 className="font-display text-display-lg-mobile text-primary lg:text-[52px] lg:leading-[56px]">Mis ventas</h1>
      <p className="mt-3 max-w-xl text-body-md text-on-surface-variant">
        Cómo viene tu cocina: lo que vendiste, en qué estado están tus pedidos y qué platos salen más.
      </p>

      <ContenidoAsync
        cargando={loading}
        error={error}
        vacio={subPedidos.length === 0}
        mensajeCarga="Calculando tus ventas..."
        mensajeVacio="Todavía no tenés ventas. Cuando te pidan un plato, lo vas a ver acá."
      >
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard label="Ventas totales" value={formatear(ventasTotales)} hint="Sin contar los cancelados" />
          <StatCard label="Ya entregadas" value={formatear(ventasEntregadas)} hint="Pedidos en estado Entregado" />
          <StatCard label="Pedidos recibidos" value={String(vendidos.length)} hint="Sin contar los cancelados" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <BarChart title="Pedidos por estado" rows={filasEstado} />
          <BarChart title="Platos más vendidos" rows={filasPlatos} />
        </div>
      </ContenidoAsync>
    </>
  )
}

export default Dashboard
