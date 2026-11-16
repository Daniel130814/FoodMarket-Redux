// Ingreso (/ingreso): formulario de login; el thunk login (authSlice) hace las llamadas y guarda la sesión.

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/layout/Logo'
import { login } from '../components/Redux/authSlice'

// Props: onLogin (iniciarSesion de App; recibe { token, userId, role, nombre }).
function Ingreso({ onLogin }) {
  // Campos del formulario; las claves son las que pide la API.
  const [datos, setDatos] = useState({ username: '', password: '' })

  const [mostrarClave, setMostrarClave] = useState(false)

  // errores: un mensaje por campo. El error del backend y el "cargando" vienen del store.
  const [errores, setErrores] = useState({})
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)

  // Solo se muestra el error del store después de enviar acá (si no, aparecería uno viejo de otra vista).
  const [enviado, setEnviado] = useState(false)
  const errorGeneral = enviado ? error : null

  const navigate = useNavigate()

  // Tras el login vuelve a la ruta de origen (location.state.from) o, si entraron directo, al inicio.
  const location = useLocation()
  const destino = location.state?.from ?? '/'

  // Handler de los inputs: guarda el valor por name y limpia el error de ese campo.
  const handleChange = (event) => {
    const { name, value } = event.target
    setDatos({ ...datos, [name]: value })
    if (errores[name]) {
      setErrores({ ...errores, [name]: null })
    }
  }

  // Envío: valida los campos y, si están bien, hace el login.
  const handleSubmit = (event) => {
    event.preventDefault()

    const nuevosErrores = {}

    if (datos.username.trim() === '') {
      nuevosErrores.username = 'Escribí tu nombre de usuario.'
    }
    // Solo se pide que no esté vacía: la longitud mínima se valida en Registro y las credenciales, en el backend.
    if (datos.password === '') {
      nuevosErrores.password = 'Escribí tu contraseña.'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    // El backend normaliza el username (sin espacios y en minúsculas): se hace igual acá.
    const username = datos.username.trim().toLowerCase()

    setErrores({})
    setEnviado(true)

    dispatch(login({ username, password: datos.password })).then((resultado) => {
      if (resultado.type === 'auth/login/fulfilled') {
        const { token, user } = resultado.payload
        // Transitorio: App todavía guarda su propia sesión (se saca en el paso 15.2.d).
        onLogin({ token, userId: user.userId, role: user.role, nombre: user.nombre })
        navigate(destino)
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased lg:grid lg:grid-cols-2">
      {/* Columna izquierda: formulario */}
      <main id="contenido" className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Appetitos, ir al inicio">
            <Logo />
          </Link>
          <Link to="/" className="link text-label-md">
            Volver al inicio
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col py-10 sm:justify-center lg:py-12">
          <h1 className="font-display text-[40px] leading-[44px] tracking-[-0.02em] text-primary">
            Ingresá a tu cuenta
          </h1>
          <p className="mt-3 text-body-lg text-on-surface-variant">
            Pedí tus platos o gestioná los que vendés.
          </p>

          {errorGeneral && (
            <div
              role="alert"
              className="mt-6 flex gap-3 rounded-lg border border-error/30 bg-error-container p-4 text-on-error-container"
            >
              <span className="material-symbols-outlined fill" aria-hidden="true">
                error
              </span>
              <div>
                <p className="text-label-lg">No pudimos ingresar</p>
                <p className="text-body-sm">{errorGeneral}</p>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="label" htmlFor="username">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="field"
                autoComplete="username"
                placeholder="clara.mendez"
                value={datos.username}
                onChange={handleChange}
                aria-invalid={errores.username ? 'true' : 'false'}
              />
              {errores.username && (
                <p className="hint hint--error">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    error
                  </span>
                  <span>{errores.username}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="password">
                  Contraseña
                </label>
                {/* TODO: pasar a <Link> cuando exista la pantalla de recuperación */}
                <button type="button" className="link text-label-md">
                  Olvidé mi contraseña
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={mostrarClave ? 'text' : 'password'}
                  className="field pr-24"
                  autoComplete="current-password"
                  value={datos.password}
                  onChange={handleChange}
                  aria-invalid={errores.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  className="btn btn-quiet btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                  onClick={() => setMostrarClave(!mostrarClave)}
                  aria-controls="password"
                >
                  {mostrarClave ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errores.password && (
                <p className="hint hint--error">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    error
                  </span>
                  <span>{errores.password}</span>
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block !min-h-[54px]" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-body-md text-on-surface-variant">
            ¿Todavía no tenés cuenta?{' '}
            {/* Se pasa el mismo state para no perder la ruta de origen si se registra */}
            <Link to="/registro" state={location.state} className="link">
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>

      {/* Columna derecha: panel visual (oculto en pantallas chicas) */}
      <aside
        className="on-dark relative hidden overflow-hidden bg-primary-container lg:flex lg:items-center lg:justify-center lg:p-14"
        aria-hidden="true"
      >
        <div className="flex max-w-[420px] flex-col items-center text-center">
          <div className="aspect-[4/5] w-[300px] overflow-hidden rounded-t-full rounded-b-xl bg-primary shadow-lift">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANhvv19i3bO8CZOGjtiv3eGepjcPg20Cxpm7L-atqFfTNCG76iLDbt8QwIEjAQv9EnTFr3FB65DzsJbm18gpLKJumkzw1Q0vw-gY7YtCDrV9_c79Fi339vRxkoEPksZlx9nURqHS14P1r20LceaBdYx8VBLO2-1ieJ9xH6NNPOUpQGUsZwm5LnyBOLAJKE7QzxP4VBS8cVmRw1kzaTHo5ftnWBSkOdm5ysZesa8HjUQhnhBWWMQC36"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <blockquote className="mt-8 font-display text-[24px] italic leading-8 text-inverse-on-surface">
            “Cada plato sale de mi cocina con mi nombre. Por eso lo cocino como si fuera para mi casa.”
          </blockquote>
          <p className="mt-3 text-body-sm text-primary-fixed-dim">
            Clara Méndez · Pastificio en Palermo
          </p>
        </div>
      </aside>
    </div>
  )
}

export default Ingreso
