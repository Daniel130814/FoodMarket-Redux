// Protege una ruta según la sesión y el rol. Se usa en App.jsx envolviendo las vistas privadas.
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

// Props: rolesPermitidos (por ejemplo ['CLIENTE']), children (la vista a proteger). La sesión se lee del store.
function RutaProtegida({ rolesPermitidos, children }) {
  const location = useLocation()
  // Usuario logueado (null sin sesión).
  const sesion = useSelector((state) => state.auth.user)

  // <Navigate> redirige dentro de la app; "replace" evita que el botón "atrás" vuelva a la ruta bloqueada en bucle.

  // Sin sesión: a /ingreso, con la ruta de origen en "state" para volver después del login.
  if (sesion === null) {
    return <Navigate to="/ingreso" replace state={{ from: location.pathname }} />
  }

  // Con sesión pero con un rol que no corresponde: al inicio.
  if (!rolesPermitidos.includes(sesion.role)) {
    return <Navigate to="/" replace />
  }

  // Todo en orden: la vista protegida.
  return <>{children}</>
}

export default RutaProtegida
