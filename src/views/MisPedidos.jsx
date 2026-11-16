// Mis pedidos (/pedidos, CLIENTE): pedidos en curso y anteriores; permite cancelar los pendientes, pagar y reseñar.
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PedidosLista from '../components/pedidos/PedidosLista'
import Tabs from '../components/comunes/Tabs'
import Dialog from '../components/comunes/Dialog'
import ResenaDialog from '../components/pedidos/ResenaDialog'
import PagoDialog from '../components/pedidos/PagoDialog'
import LoadingState from '../components/comunes/LoadingState'
import ErrorState from '../components/comunes/ErrorState'

const API_URL = import.meta.env.VITE_API_URL

// Mensaje de un error de fetch: el del backend, o uno claro si no hubo respuesta (el error no tiene status).
const mensajeDe = (fallo) =>
  fallo.status === undefined
    ? 'No pudimos conectar con el servidor. Revisá que el backend esté funcionando e intentá de nuevo.'
    : fallo.message

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

// GET con token; las listas vacías llegan como null.
const pedirPrivado = (ruta, token) =>
  fetch(`${API_URL}${ruta}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(leerRespuesta)
    .then((data) => data ?? [])

// Estado del pedido -> texto para el cliente. CANCELADO no está: se muestra aparte, con su propio badge.
const ETIQUETAS_ESTADO = {
  PENDIENTE: 'Pendiente de confirmación',
  CONFIRMADO: 'Recibido',
  EN_PREPARACION: 'Cocinando',
  ENVIADO: 'En camino',
  ENTREGADO: 'Entregado',
}

// Estados del seguimiento, en el orden en que avanza un pedido.
const ORDEN_ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']

// Pasos que dibuja OrderTrack.
const PASOS_SEGUIMIENTO = ORDEN_ESTADOS.map((estado) => ({ estado, etiqueta: ETIQUETAS_ESTADO[estado] }))

// Props: onSesionVencida (cierra la sesión ante un 401), onAviso (muestra un Toast), onVolverAPedir (App agrega los platos
// a la cesta). El token sale del store.
function MisPedidos({ onSesionVencida, onAviso, onVolverAPedir }) {
  // Token del store (ruta privada).
  const token = useSelector((state) => state.auth.token)
  const [pedidos, setPedidos] = useState([])

  // Un pedido puede tener varios pagos (uno rechazado y un reintento).
  const [pagos, setPagos] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [pestana, setPestana] = useState('curso')

  // Diálogo de cancelación: id del pedido, o null si está cerrado.
  const [pedidoACancelarId, setPedidoACancelarId] = useState(null)

  // Diálogo de pago: id del pedido (null = cerrado) y medio de pago elegido.
  const [pedidoAPagarId, setPedidoAPagarId] = useState(null)
  const [medioPago, setMedioPago] = useState('TARJETA_CREDITO')

  // Diálogo de reseña: plato a reseñar (null = cerrado), calificación y comentario.
  const [platoAResenar, setPlatoAResenar] = useState(null)
  const [calificacion, setCalificacion] = useState('5')
  const [comentario, setComentario] = useState('')

  // Platos ya reseñados: la API no tiene "mis reseñas", así que se anotan los de esta sesión y los que dieron 409.
  const [platosResenados, setPlatosResenados] = useState([])

  // Al abrir: GET /orders y GET /pagos juntos (Promise.all).
  useEffect(() => {
    Promise.all([pedirPrivado('/orders', token), pedirPrivado('/pagos', token)])
      .then(([listaPedidos, listaPagos]) => {
        setPedidos(listaPedidos)
        setPagos(listaPagos)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        setError(mensajeDe(fallo))
      })
      .finally(() => setCargando(false))
    // onSesionVencida queda afuera de las dependencias: App la recrea en cada render y el GET se repetiría.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (cargando) {
    return <LoadingState message="Cargando tus pedidos..." />
  }
  if (error !== null) {
    return <ErrorState message={error} />
  }

  // Último pago de un pedido (el más nuevo por fecha) o null si no tiene.
  const ultimoPago = (pedidoId) => {
    const delPedido = pagos
      .filter((pago) => pago.pedidoId === pedidoId)
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
    return delPedido.length === 0 ? null : delPedido[0]
  }

  // Pedidos de más nuevo a más viejo (se ordena una copia: sort modifica el array) y separados en curso y anteriores.
  const ordenados = [...pedidos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
  const enCurso = ordenados.filter((pedido) => pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO')
  const anteriores = ordenados.filter((pedido) => pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO')
  const pedidosVisibles = pestana === 'curso' ? enCurso : anteriores

  const pestanas = [
    { id: 'curso', label: 'En curso', count: enCurso.length },
    { id: 'anteriores', label: 'Anteriores', count: anteriores.length },
  ]

  // Cancela un pedido (PATCH /orders/{id}/cancelar). Solo los PENDIENTE (si no, 409); el backend repone el stock.
  const confirmarCancelacion = () => {
    const pedidoId = pedidoACancelarId
    setPedidoACancelarId(null)

    fetch(`${API_URL}/orders/${pedidoId}/cancelar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }, // ruta privada, sin body
    })
      .then(leerRespuesta)
      .then((cancelado) => {
        setPedidos((actuales) => actuales.map((pedido) => (pedido.id === cancelado.id ? cancelado : pedido)))
        onAviso(`Cancelaste el pedido n.º ${pedidoId}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        onAviso(mensajeDe(fallo), 'error')
      })
  }

  const abrirPago = (pedidoId) => {
    setMedioPago('TARJETA_CREDITO')
    setPedidoAPagarId(pedidoId)
  }

  // Paga un pedido (POST /pagos/createPago): el monto lo fija el servidor y el pago nace PENDIENTE hasta que lo
  // apruebe un ADMIN. El diálogo se cierra enseguida para que un segundo clic no cree un pago duplicado.
  const confirmarPago = () => {
    const pedidoId = pedidoAPagarId
    setPedidoAPagarId(null)

    fetch(`${API_URL}/pagos/createPago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ medioPago, pedidoId }),
    })
      .then(leerRespuesta)
      .then((creado) => {
        setPagos((actuales) => [...actuales, creado])
        onAviso(`Registramos tu pago del pedido n.º ${pedidoId}. Falta que lo aprueben.`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        onAviso(mensajeDe(fallo), 'error')
      })
  }

  const abrirResena = (detalle) => {
    setCalificacion('5')
    setComentario('')
    setPlatoAResenar(detalle)
  }

  // Reseña un plato (POST /resenas/createResena); el comentario es opcional. 400 si no lo recibió, 409 si ya lo reseñó.
  const confirmarResena = () => {
    const { platoId, platoNombre } = platoAResenar
    setPlatoAResenar(null)

    fetch(`${API_URL}/resenas/createResena`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({
        calificacion: Number(calificacion),
        comentario: comentario.trim() === '' ? undefined : comentario.trim(),
        platoId,
      }),
    })
      .then(leerRespuesta)
      .then(() => {
        setPlatosResenados((actuales) => [...actuales, platoId])
        onAviso(`Gracias por tu reseña de ${platoNombre}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        // 409: ya existía la reseña; se marca como reseñado para no ofrecer el botón de nuevo.
        if (fallo.status === 409) {
          setPlatosResenados((actuales) => [...actuales, platoId])
        }
        onAviso(mensajeDe(fallo), 'error')
      })
  }

  return (
    <>
      <h1 className="font-display text-display-lg-mobile text-primary lg:text-[52px] lg:leading-[56px]">Mis pedidos</h1>
      <p className="mt-3 max-w-xl text-body-md text-on-surface-variant">
        Seguí lo que se está cocinando y revisá tus pedidos anteriores.
      </p>

      <div className="mt-10">
        <Tabs tabs={pestanas} activeId={pestana} onChange={setPestana} label="Pedidos" />

        <PedidosLista
          pedidos={pedidosVisibles}
          emptyMessage={pestana === 'curso' ? 'No tenés pedidos en curso.' : 'Todavía no tenés pedidos anteriores.'}
          steps={PASOS_SEGUIMIENTO}
          getPayment={ultimoPago}
          reviewedPlatoIds={platosResenados}
          onCancel={setPedidoACancelarId}
          onPay={abrirPago}
          onReview={abrirResena}
          onReorder={onVolverAPedir}
        />
      </div>

      <Dialog
        open={pedidoACancelarId !== null}
        title={`¿Cancelar el pedido n.º ${pedidoACancelarId}?`}
        message="Se repone el stock de los platos. Solo se puede cancelar mientras el pedido está pendiente de confirmación."
        confirmLabel="Cancelar pedido"
        cancelLabel="Mantener pedido"
        onConfirm={confirmarCancelacion}
        onCancel={() => setPedidoACancelarId(null)}
      />

      <ResenaDialog
        plato={platoAResenar}
        calificacion={calificacion}
        comentario={comentario}
        onCalificacionChange={(event) => setCalificacion(event.target.value)}
        onComentarioChange={(event) => setComentario(event.target.value)}
        onConfirm={confirmarResena}
        onCancel={() => setPlatoAResenar(null)}
      />

      <PagoDialog
        pedidoId={pedidoAPagarId}
        medioPago={medioPago}
        onMedioPagoChange={(event) => setMedioPago(event.target.value)}
        onConfirm={confirmarPago}
        onCancel={() => setPedidoAPagarId(null)}
      />
    </>
  )
}

export default MisPedidos
