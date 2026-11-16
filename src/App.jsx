// Raíz de la app: define las rutas y tiene el estado compartido (cesta y aviso); la sesión vive en Redux. Se monta en main.jsx.
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Toast from './components/comunes/Toast'
import RutaProtegida from './components/auth/RutaProtegida'
import Inicio from './views/Inicio'
import Catalogo from './views/Catalogo'
import DetallePlato from './views/DetallePlato'
import PerfilChef from './views/PerfilChef'
import Carrito from './views/Carrito'
import Checkout from './views/Checkout'
import MisPedidos from './views/MisPedidos'
import MisPublicaciones from './views/MisPublicaciones'
import PublicarPlato from './views/PublicarPlato'
import Ingreso from './views/Ingreso'
import Registro from './views/Registro'
import Admin from './views/Admin'
import PedidosRecibidos from './views/PedidosRecibidos'
import Perfil from './views/Perfil'
import NoEncontrado from './views/NoEncontrado'
import { logout } from './components/Redux/authSlice'

// URL base del backend (viene de .env).
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

// Arma un carrito nuevo recalculando subtotales y total (al quitar o vaciar el backend no devuelve la cesta).
const calcularCarrito = (id, items) => {
  const itemsCalculados = items.map((item) => ({
    ...item,
    subtotalEstimado: Math.round(item.precioUnitarioActual * item.cantidad * 100) / 100,
  }))
  const totalEstimado = itemsCalculados.reduce((acumulado, item) => acumulado + item.subtotalEstimado, 0)
  return { id, items: itemsCalculados, totalEstimado: Math.round(totalEstimado * 100) / 100 }
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Cesta (CarritoResponse). Ojo: el id de cada ítem no es el del plato; la API lo usa para editarlo o quitarlo.
  const [carrito, setCarrito] = useState({ id: 1, items: [], totalEstimado: 0 })

  // Sesión del store: user es null sin sesión, o { userId, role, nombre, ... }.
  const { token, user } = useSelector((state) => state.auth)

  // Aviso del Toast: null o { texto, tipo } con tipo 'exito' o 'error'.
  const [aviso, setAviso] = useState(null)

  // Muestra un aviso; los de error pasan 'error' para que el Toast cambie el ícono.
  const avisar = (texto, tipo = 'exito') => setAviso({ texto, tipo })

  // Cierra la sesión por un 401 (token vencido); RutaProtegida manda a /ingreso al ver la sesión vacía.
  const sesionVencida = () => {
    dispatch(logout())
    setCarrito((actual) => calcularCarrito(actual.id, []))
    // Con setAviso directo (no avisar): el efecto de la cesta la llama y no debe tener funciones nuevas en sus dependencias.
    setAviso({ texto: 'Tu sesión venció, ingresá de nuevo', tipo: 'error' })
  }

  // .catch de las escrituras: un 401 cierra la sesión; cualquier otro error va al Toast.
  const manejarFallo = (fallo) => {
    if (fallo.status === 401) {
      sesionVencida()
      return
    }
    avisar(mensajeDe(fallo), 'error')
  }

  // Agrega un plato a la cesta (POST). Si ya estaba, el backend suma la cantidad y valida el stock.
  const agregar = (plato, cantidad) => {
    fetch(`${API_URL}/carrito/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ platoId: plato.id, cantidad }),
    })
      .then(leerRespuesta)
      .then((carritoServidor) => {
        setCarrito(carritoServidor)
        avisar(`Agregaste ${plato.nombre} a tu carrito`)
      })
      .catch(manejarFallo)
  }

  // Cambia la cantidad de un ítem por su id (PUT): la reemplaza, no suma.
  const cambiarCantidad = (itemId, cantidad) => {
    if (cantidad < 1) {
      return
    }

    fetch(`${API_URL}/carrito/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ cantidad }),
    })
      .then(leerRespuesta)
      .then((carritoServidor) => setCarrito(carritoServidor))
      .catch(manejarFallo)
  }

  // Quita un ítem (DELETE). Responde data: null, así que lo sacamos del estado y recalculamos el total.
  const quitar = (itemId) => {
    fetch(`${API_URL}/carrito/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }, // ruta privada
    })
      .then(leerRespuesta)
      .then(() =>
        setCarrito((actual) => calcularCarrito(actual.id, actual.items.filter((item) => item.id !== itemId)))
      )
      .catch(manejarFallo)
  }

  // Vacía la cesta en el servidor (DELETE /carrito) y después la copia local.
  const vaciar = () => {
    fetch(`${API_URL}/carrito`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }, // ruta privada
    })
      .then(leerRespuesta)
      .then(() => {
        setCarrito((actual) => calcularCarrito(actual.id, []))
        avisar('Vaciaste tu cesta')
      })
      .catch(manejarFallo)
  }

  // Checkout ya creó el pedido y el backend vació la cesta: vaciamos la copia local.
  const pedidoCreado = () => {
    setCarrito((actual) => calcularCarrito(actual.id, []))
    avisar('Pedido confirmado')
  }

  // Carga la cesta del servidor cuando se inicia la sesión. Solo el CLIENTE tiene cesta.
  useEffect(() => {
    if (user === null || user.role !== 'CLIENTE') {
      return
    }

    fetch(`${API_URL}/carrito`, { headers: { Authorization: `Bearer ${token}` } })
      .then(leerRespuesta)
      .then((carritoServidor) => setCarrito(carritoServidor))
      // Sin manejarFallo: es una función nueva en cada render y entraría en las dependencias del efecto.
      .catch((fallo) => {
        if (fallo.status === 401) {
          // Lo mismo que sesionVencida, en línea (esa función no puede ir en las dependencias).
          dispatch(logout())
          setCarrito((actual) => calcularCarrito(actual.id, []))
          setAviso({ texto: 'Tu sesión venció, ingresá de nuevo', tipo: 'error' })
          return
        }
        avisar(mensajeDe(fallo), 'error')
      })
  }, [user, token, dispatch])

  // Cierra la sesión y limpia la cesta, para que la próxima persona no herede sus platos.
  const cerrarSesion = () => {
    dispatch(logout())
    setCarrito(calcularCarrito(carrito.id, []))
    avisar('Cerraste sesión')
  }

  const cantidadTotal = carrito.items.reduce((acumulado, item) => acumulado + item.cantidad, 0)

  // "Salir": cierra la sesión y va al inicio (sin el navigate, RutaProtegida lo mandaría a /ingreso).
  const salir = () => {
    cerrarSesion()
    navigate('/')
  }

  // onAdd de las vistas: sin sesión manda a /ingreso, CHEF y ADMIN no pueden comprar.
  const agregarSegunSesion = (plato, cantidad) => {
    if (user === null) {
      navigate('/ingreso', { state: { from: location.pathname } })
      return
    }
    if (user.role !== 'CLIENTE') {
      avisar('Solo los clientes pueden comprar', 'error')
      return
    }
    agregar(plato, cantidad)
  }

  // Envuelve una vista con RutaProtegida para los roles permitidos.
  const protegida = (roles, vista) => (
    <RutaProtegida rolesPermitidos={roles}>
      {vista}
    </RutaProtegida>
  )

  // Elige qué dibujar: las pantallas de auth ocupan todo y el resto va con Header y Footer.
  const pantalla = () => {
    const esPantallaAuth = location.pathname === '/ingreso' || location.pathname === '/registro'

    if (esPantallaAuth) {
      return (
        <Routes>
          <Route path="/ingreso" element={<Ingreso />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      )
    }

    // PublicarPlato sirve para crear y para editar: se arma una vez y se usa en las dos rutas.
    const formularioPlato = protegida(
      ['CHEF'],
      <PublicarPlato
        onSesionVencida={sesionVencida}
        onAviso={avisar}
      />
    )

    return (
      <>
        <a className="skip-link" href="#contenido">Ir al contenido</a>
        <Header cartCount={cantidadTotal} onLogout={salir} />
        <main id="contenido" className="mx-auto max-w-shell px-5 py-10 lg:px-12">
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Inicio onAdd={agregarSegunSesion} />} />
            <Route path="/catalogo" element={<Catalogo onAdd={agregarSegunSesion} />} />
            <Route path="/plato/:id" element={<DetallePlato onAdd={agregarSegunSesion} onSesionVencida={sesionVencida} onAviso={avisar} />} />
            <Route path="/chef/:userId" element={<PerfilChef onAdd={agregarSegunSesion} />} />

            {/* CLIENTE */}
            <Route
              path="/cesta"
              element={protegida(
                ['CLIENTE'],
                <Carrito
                  carrito={carrito}
                  cartCount={cantidadTotal}
                  onQuantityChange={cambiarCantidad}
                  onRemove={quitar}
                  onClear={vaciar}
                />
              )}
            />
            <Route
              path="/checkout"
              element={protegida(
                ['CLIENTE'],
                <Checkout
                  carrito={carrito}
                  cartCount={cantidadTotal}
                  onSesionVencida={sesionVencida}
                  onPedidoCreado={pedidoCreado}
                />
              )}
            />
            <Route
              path="/pedidos"
              element={protegida(
                ['CLIENTE'],
                <MisPedidos onSesionVencida={sesionVencida} onAviso={avisar} />
              )}
            />

            {/* CHEF */}
            <Route
              path="/mis-publicaciones"
              element={protegida(
                ['CHEF'],
                <MisPublicaciones onSesionVencida={sesionVencida} onAviso={avisar} />
              )}
            />
            <Route
              path="/pedidos-recibidos"
              element={protegida(
                ['CHEF'],
                <PedidosRecibidos
                  onSesionVencida={sesionVencida}
                  onAviso={avisar}
                />
              )}
            />
            <Route path="/publicar" element={formularioPlato} />
            <Route path="/publicar/:id" element={formularioPlato} />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={protegida(
                ['ADMIN'],
                <Admin onSesionVencida={sesionVencida} onAviso={avisar} />
              )}
            />

            {/* Cualquier rol con sesión */}
            <Route
              path="/perfil"
              element={protegida(
                ['CLIENTE', 'CHEF', 'ADMIN'],
                <Perfil
                  onSesionVencida={sesionVencida}
                  onAviso={avisar}
                />
              )}
            />

            {/* 404: tiene que ir última */}
            <Route path="*" element={<NoEncontrado />} />
          </Routes>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      {pantalla()}
      <Toast message={aviso?.texto ?? ''} tipo={aviso?.tipo} visible={aviso !== null} onClose={() => setAviso(null)} />
    </>
  )
}

export default App
