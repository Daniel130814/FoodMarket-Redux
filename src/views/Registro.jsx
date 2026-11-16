// Registro (/registro): crea la cuenta como CLIENTE (compra) o CHEF (vende); el thunk register (authSlice) llama al backend.

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/layout/Logo'
import RoleOption from '../components/auth/RoleOption'
import Alert from '../components/comunes/Alert'
import FormField from '../components/comunes/FormField'
import { register } from '../components/Redux/authSlice'

function Registro() {
  // location.search trae el rol preseleccionado (?rol=vendedor); location.state, la ruta de origen para volver.
  const location = useLocation()
  const tipoCuentaPorDefecto = location.search === '?rol=vendedor' ? 'CHEF' : 'CLIENTE'
  const destino = location.state?.from ?? '/'

  // Campos del formulario (las claves son las de la API); tipoCuenta es "CLIENTE" o "CHEF".
  const [datos, setDatos] = useState({
    tipoCuenta: tipoCuentaPorDefecto,
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    password: '',
  })

  const [mostrarClave, setMostrarClave] = useState(false)

  // Errores por campo. El error del backend (usuario duplicado) y el "cargando" vienen del store.
  const [errores, setErrores] = useState({})
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)

  // Solo se muestra el error del store después de enviar acá (si no, aparecería uno viejo de otra vista).
  const [enviado, setEnviado] = useState(false)
  const errorGeneral = enviado ? error : null

  const navigate = useNavigate()

  // Handler de los inputs y radios: guarda el valor por name y limpia el error de ese campo.
  const handleChange = (event) => {
    const { name, value } = event.target
    setDatos({ ...datos, [name]: value })
    if (errores[name]) {
      setErrores({ ...errores, [name]: null })
    }
  }

  // Valida con las reglas de la API (ENDPOINTS.md, sección 2) y envía el registro.
  const handleSubmit = (event) => {
    event.preventDefault()

    const nuevosErrores = {}

    if (datos.nombre.trim() === '') nuevosErrores.nombre = 'Escribí tu nombre.'
    if (datos.apellido.trim() === '') nuevosErrores.apellido = 'Escribí tu apellido.'

    const largoUsername = datos.username.trim().length
    if (largoUsername === 0) {
      nuevosErrores.username = 'Escribí tu nombre de usuario.'
    } else if (largoUsername < 3 || largoUsername > 50) {
      nuevosErrores.username = 'Usá entre 3 y 50 caracteres.'
    }

    if (datos.email.trim() === '') {
      nuevosErrores.email = 'Escribí tu correo electrónico.'
    } else if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
      nuevosErrores.email = 'Escribí un correo válido, por ejemplo nombre@correo.com.'
    }

    if (datos.password === '') {
      nuevosErrores.password = 'Escribí una contraseña.'
    } else if (datos.password.length < 8) {
      nuevosErrores.password = 'Usá al menos 8 caracteres.'
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    // El backend normaliza username e email (sin espacios y en minúsculas): se hace igual acá.
    const cuerpoPedido = {
      username: datos.username.trim().toLowerCase(),
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      tipoCuenta: datos.tipoCuenta,
    }

    setErrores({})
    setEnviado(true)

    dispatch(register(cuerpoPedido)).then((resultado) => {
      if (resultado.type === 'auth/register/fulfilled') {
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
            Creá tu cuenta
          </h1>
          <p className="mt-3 text-body-lg text-on-surface-variant">
            Lleva un minuto. Podés cambiar de rol después.
          </p>

          {errorGeneral && (
            <div className="mt-6">
              <Alert title="No pudimos crear la cuenta" messages={[errorGeneral]} />
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Tipo de cuenta: CLIENTE (compra) o CHEF (vende) */}
            <fieldset>
              <legend className="label">¿Para qué usás Appetitos?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <RoleOption
                  value="CLIENTE"
                  checked={datos.tipoCuenta === 'CLIENTE'}
                  onChange={handleChange}
                  icon="shopping_bag"
                  title="Quiero comprar"
                  description="Pedís platos de chefs de tu barrio."
                />
                <RoleOption
                  value="CHEF"
                  checked={datos.tipoCuenta === 'CHEF'}
                  onChange={handleChange}
                  icon="soup_kitchen"
                  title="Quiero vender"
                  description="Publicás tus platos y manejás tu stock."
                />
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nombre" name="nombre" value={datos.nombre} onChange={handleChange} error={errores.nombre} autoComplete="given-name" />
              <FormField label="Apellido" name="apellido" value={datos.apellido} onChange={handleChange} error={errores.apellido} autoComplete="family-name" />
            </div>

            <FormField
              label="Nombre de usuario"
              name="username"
              value={datos.username}
              onChange={handleChange}
              error={errores.username}
              autoComplete="username"
              placeholder="clara.mendez"
              hint="Es el nombre con el que vas a ingresar. Entre 3 y 50 caracteres."
            />

            <FormField
              label="Correo electrónico"
              name="email"
              type="email"
              value={datos.email}
              onChange={handleChange}
              error={errores.email}
              autoComplete="email"
              placeholder="nombre@correo.com"
            />

            <div>
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={mostrarClave ? 'text' : 'password'}
                  className="field pr-24"
                  autoComplete="new-password"
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
              <p className="hint">Mínimo 8 caracteres.</p>
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
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-8 text-center text-body-md text-on-surface-variant">
            ¿Ya tenés cuenta?{' '}
            <Link to="/ingreso" state={location.state} className="link">
              Ingresar
            </Link>
          </p>
        </div>
      </main>

      {/* Columna derecha: panel visual (oculto en pantallas chicas) */}
      <aside
        className="on-dark relative hidden overflow-hidden bg-primary-container lg:flex lg:items-center lg:justify-center lg:p-14"
        aria-hidden="true"
      >
        <div className="max-w-[420px]">
          <h2 className="font-display text-[34px] leading-[40px] tracking-[-0.02em] text-inverse-on-surface">
            Comida con nombre y apellido
          </h2>
          <ul className="mt-8 space-y-6">
            <li className="flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-primary-fixed">
                <span className="material-symbols-outlined" aria-hidden="true">
                  storefront
                </span>
              </span>
              <div>
                <p className="text-label-lg text-inverse-on-surface">Si cocinás</p>
                <p className="mt-0.5 text-body-md text-primary-fixed-dim">
                  Publicá tus platos con fotos, precio y stock. Mirá tus pedidos y tu stock en un solo lugar.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-primary-fixed">
                <span className="material-symbols-outlined" aria-hidden="true">
                  shopping_bag
                </span>
              </span>
              <div>
                <p className="text-label-lg text-inverse-on-surface">Si comprás</p>
                <p className="mt-0.5 text-body-md text-primary-fixed-dim">
                  Pedí a talleres de tu barrio y mirá de dónde viene cada ingrediente.
                </p>
              </div>
            </li>

            <li className="flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-primary-fixed">
                <span className="material-symbols-outlined" aria-hidden="true">
                  verified_user
                </span>
              </span>
              <div>
                <p className="text-label-lg text-inverse-on-surface">Para todos</p>
                <p className="mt-0.5 text-body-md text-primary-fixed-dim">
                  Verificamos cada cocina antes de que publique.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default Registro
