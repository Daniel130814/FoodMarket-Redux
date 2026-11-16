// Encabezado fijo (sticky) de las páginas principales.

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import Insignia from './Insignia'
import MenuMovil from './MenuMovil'
import { fetchSubpedidosChef } from '../Redux/subpedidosSlice'

const ENLACES = [
  { texto: 'Inicio', ruta: '/' },
  { texto: 'Platos', ruta: '/catalogo' },
]

// Enlaces extra: cada rol ve solo los suyos.
const ENLACES_POR_ROL = {
  CLIENTE: [{ texto: 'Mis pedidos', ruta: '/pedidos' }],
  CHEF: [
    { texto: 'Mis publicaciones', ruta: '/mis-publicaciones' },
    { texto: 'Pedidos recibidos', ruta: '/pedidos-recibidos' },
    { texto: 'Mis ventas', ruta: '/dashboard' },
  ],
  ADMIN: [{ texto: 'Administración', ruta: '/admin' }],
}

// Subpedidos que el chef todavía tiene que atender.
const contarNuevos = (subPedidos) =>
  subPedidos.filter((subPedido) => subPedido.estado === 'PENDIENTE' || subPedido.estado === 'CONFIRMADO').length

// Props: cartCount (número de la insignia), onLogout (App cierra la sesión), onAviso (Toast). La sesión se lee del store.
function Header({ cartCount, onLogout, onAviso }) {
  // Usuario logueado (null sin sesión): decide qué se muestra.
  const sesion = useSelector((state) => state.auth.user)

  // Pedidos nuevos del chef: se piden al ingresar y en cada navegación (no hay avisos en tiempo real ni temporizador).
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const token = useSelector((state) => state.auth.token)
  const subPedidos = useSelector((state) => state.subpedidos.items)
  const esChef = sesion !== null && sesion.role === 'CHEF'
  const userId = sesion?.userId
  const nuevos = contarNuevos(subPedidos)

  useEffect(() => {
    if (!esChef) {
      return
    }
    dispatch(fetchSubpedidosChef({ token, userId })).then((resultado) => {
      // Si hay más que la última vez que se contó, se avisa (al ingresar, la última vez es 0).
      if (resultado.payload !== undefined && contarNuevos(resultado.payload) > nuevos) {
        onAviso(`Tenés ${contarNuevos(resultado.payload)} pedidos por atender`)
      }
    })
    // nuevos y onAviso quedan afuera de las dependencias: se leen al momento de pedir y no deben volver a disparar el GET.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, esChef, token, userId, pathname])

  // Enlaces comunes más los del rol (sin sesión, solo los comunes); "Pedidos recibidos" lleva el globito.
  const enlacesDelRol = sesion === null ? [] : ENLACES_POR_ROL[sesion.role]
  const enlaces = [...ENLACES, ...enlacesDelRol].map((enlace) =>
    enlace.ruta === '/pedidos-recibidos' ? { ...enlace, contador: nuevos } : enlace,
  )

  // Menú móvil abierto o cerrado (UI propia del Header).
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-shell items-center gap-2 px-4 sm:px-5 lg:h-[76px] lg:gap-8 lg:px-12">
        <button
          type="button"
          className="btn btn-quiet btn-icon -ml-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>

        <Link to="/" aria-label="Appetitos, ir al inicio">
          <Logo />
        </Link>

        {/* Navegación (pantallas grandes) */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.ruta} to={enlace.ruta} className="nav-link">
              {enlace.texto}
              {enlace.contador !== undefined && <Insignia cantidad={enlace.contador} label="pedidos por atender" />}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Sin sesión: Ingresar y Registrarse; con sesión: el nombre y Salir. Ícono en pantallas chicas, texto en las grandes */}
          {sesion === null ? (
            <>
              <Link
                to="/ingreso"
                className="icon-link lg:hidden"
                aria-label="Ingresar a tu cuenta"
                title="Ingresar"
              >
                <span className="material-symbols-outlined">person</span>
              </Link>
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/ingreso" className="btn btn-quiet btn-sm">Ingresar</Link>
                <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/perfil" className="hidden max-w-[10rem] truncate text-label-md text-primary hover:underline sm:inline" title="Mi perfil">
                {sesion.nombre}
              </Link>
              <button type="button" className="btn btn-quiet btn-sm" onClick={onLogout}>Salir</button>
            </div>
          )}

          <Link to="/cesta" className="icon-link" aria-label={`Cesta, ${cartCount} platos`}>
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="count" aria-hidden="true">{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <MenuMovil
          enlaces={enlaces}
          sesion={sesion}
          onCerrar={() => setMenuOpen(false)}
          onLogout={onLogout}
        />
      )}
    </header>
  )
}

export default Header
