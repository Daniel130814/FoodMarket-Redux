// Menú desplegable del Header en pantallas chicas: enlaces de navegación y de la cuenta. No lee el store: todo viene por props.
import { NavLink } from 'react-router-dom'
import Insignia from './Insignia'

// Props: enlaces ({ texto, ruta, contador opcional }[], ya con los del rol); sesion (usuario o null); onCerrar (cierra el menú);
// onLogout (App cierra la sesión).
function MenuMovil({ enlaces, sesion, onCerrar, onLogout }) {
  return (
    <div id="menu-movil" className="border-t border-hairline bg-surface px-4 pb-4 pt-2 lg:hidden">
      <nav aria-label="Principal móvil" className="flex flex-col">
        {enlaces.map((enlace) => (
          <NavLink key={enlace.ruta} to={enlace.ruta} className="nav-link block !py-3" onClick={onCerrar}>
            {enlace.texto}
            {enlace.contador !== undefined && <Insignia cantidad={enlace.contador} label="pedidos por atender" />}
          </NavLink>
        ))}
      </nav>

      <nav aria-label="Cuenta móvil" className="mt-2 flex flex-col border-t border-hairline pt-2">
        {sesion === null ? (
          <>
            <NavLink to="/ingreso" className="nav-link block !py-3" onClick={onCerrar}>Ingresar</NavLink>
            <NavLink to="/registro" className="nav-link block !py-3" onClick={onCerrar}>Registrarse</NavLink>
          </>
        ) : (
          <>
            <p className="px-3 py-2 text-label-md text-on-surface-variant">Hola, {sesion.nombre}</p>
            <NavLink to="/perfil" className="nav-link block !py-3" onClick={onCerrar}>Mi perfil</NavLink>
            <button
              type="button"
              className="nav-link block !py-3 text-left"
              onClick={() => {
                onCerrar()
                onLogout()
              }}
            >
              Salir
            </button>
          </>
        )}
      </nav>
    </div>
  )
}

export default MenuMovil
