// Administración (ruta /admin, solo ADMIN). Pestaña Pagos: aprobar, rechazar o reembolsar (aprobar habilita a los chefs).
// Pestaña Usuarios: listar, crear y abrir el detalle para editar datos y cambiar el rol.
// Pestaña Categorías: listar, crear, editar y eliminar las categorías de los platos.
// Pestaña Reseñas: listar todas las reseñas (Redux) y eliminar las que no corresponden.
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Tabs from '../components/comunes/Tabs'
import CategoriasPanel from '../components/admin/CategoriasPanel'
import PagosPanel from '../components/admin/PagosPanel'
import UsuariosPanel from '../components/admin/UsuariosPanel'
import UsuarioDetalleDialog from '../components/admin/UsuarioDetalleDialog'
import CategoriaEditDialog from '../components/admin/CategoriaEditDialog'
import ResenasPanel from '../components/admin/ResenasPanel'
import Dialog from '../components/comunes/Dialog'
import LoadingState from '../components/comunes/LoadingState'
import ErrorState from '../components/comunes/ErrorState'
import { fetchPlatos } from '../components/Redux/platosSlice'
import { deleteResena, fetchResenas } from '../components/Redux/resenasSlice'

const API_URL = import.meta.env.VITE_API_URL

// Mensaje de un error de fetch: el del backend, o uno claro si no hubo respuesta (el error no tiene status).
const mensajeDe = (fallo) =>
  fallo.status === undefined
    ? 'No pudimos conectar con el servidor. Revisá que el backend esté funcionando e intentá de nuevo.'
    : fallo.message

// Textos del diálogo de confirmación; la clave es el estado nuevo del pago.
const TEXTOS_ACCION = {
  APROBADO: {
    titulo: '¿Aprobar este pago?',
    mensaje: 'El pedido y sus subpedidos pasan a "Recibido" y los chefs pueden empezar a prepararlo.',
    boton: 'Aprobar pago',
    variante: 'primary',
    aviso: 'Aprobaste el pago',
  },
  RECHAZADO: {
    titulo: '¿Rechazar este pago?',
    mensaje: 'El cliente va a poder intentar pagar de nuevo. Después de 5 rechazos se bloquean los pagos del pedido.',
    boton: 'Rechazar pago',
    variante: 'danger',
    aviso: 'Rechazaste el pago',
  },
  REEMBOLSADO: {
    titulo: '¿Marcar el pago como reembolsado?',
    mensaje: 'Solo registra el reembolso en el sistema: la API no devuelve el dinero ni cambia el pedido.',
    boton: 'Marcar reembolsado',
    variante: 'danger',
    aviso: 'Marcaste el pago como reembolsado',
  },
}

const ETIQUETAS_ROL = {
  CLIENTE: { texto: 'Cliente', clase: 'badge-leaf' },
  CHEF: { texto: 'Chef', clase: 'badge-sand' },
  ADMIN: { texto: 'Administrador', clase: 'badge-dark' },
}

const FORM_VACIO = { username: '', nombre: '', apellido: '', email: '', password: '', role: 'CLIENTE' }

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

// GET con token; las listas vacías llegan como null. signal (opcional) permite cancelar el pedido.
const pedirPrivado = (ruta, token, signal) =>
  fetch(`${API_URL}${ruta}`, { headers: { Authorization: `Bearer ${token}` }, signal })
    .then(leerRespuesta)
    .then((data) => data ?? [])

// Valida con las reglas de UserRequest (ENDPOINTS.md 3.2). Devuelve un mensaje por campo con error; vacío si está bien.
const validar = (datos) => ({
  ...((datos.username.trim().length < 3 || datos.username.trim().length > 50) && {
    username: 'El usuario tiene que tener entre 3 y 50 caracteres.',
  }),
  ...(datos.nombre.trim() === '' && { nombre: 'Escribí el nombre.' }),
  ...(datos.apellido.trim() === '' && { apellido: 'Escribí el apellido.' }),
  ...(!/\S+@\S+\.\S+/.test(datos.email.trim()) && { email: 'Escribí un correo válido.' }),
  ...(datos.password.length < 8 && { password: 'La contraseña tiene que tener al menos 8 caracteres.' }),
})

// Valida la edición (UserUpdateRequest): nombre, apellido y correo. Usuario, contraseña y rol no se editan acá.
const validarEdicion = (datos) => ({
  ...(datos.nombre.trim() === '' && { nombre: 'Escribí el nombre.' }),
  ...(datos.apellido.trim() === '' && { apellido: 'Escribí el apellido.' }),
  ...(!/\S+@\S+\.\S+/.test(datos.email.trim()) && { email: 'Escribí un correo válido.' }),
})

// Props: onSesionVencida (cierra la sesión ante un 401), onAviso (muestra un Toast). El token sale del store.
function Admin({ onSesionVencida, onAviso }) {
  // Token del store (ruta privada).
  const token = useSelector((state) => state.auth.token)

  // Reseñas y platos vienen del store (los platos sirven para ponerle nombre a cada reseña).
  const dispatch = useDispatch()
  const { items: resenas, loading: cargandoResenas, error: errorResenas } = useSelector((state) => state.resenas)
  const platos = useSelector((state) => state.platos.items)

  // Diálogo de confirmación para eliminar una reseña: la reseña elegida o null si está cerrado.
  const [resenaAEliminar, setResenaAEliminar] = useState(null)

  const [pagos, setPagos] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [usuarios, setUsuarios] = useState([])

  const [categorias, setCategorias] = useState([])

  // Formulario de categoría nueva: abierto, nombre, error junto al campo y error del backend.
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false)
  const [descripcionNueva, setDescripcionNueva] = useState('')
  const [errorDescripcion, setErrorDescripcion] = useState(null)
  const [errorCrearCategoria, setErrorCrearCategoria] = useState(null)

  // Diálogo de edición de categoría: la categoría abierta (null = cerrado), el nombre, error junto al campo,
  // error del backend y PUT en curso (evita el doble envío).
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [descripcionEditada, setDescripcionEditada] = useState('')
  const [errorDescripcionEditada, setErrorDescripcionEditada] = useState(null)
  const [errorEditarCategoria, setErrorEditarCategoria] = useState(null)
  const [guardandoCategoria, setGuardandoCategoria] = useState(false)

  // Diálogo de confirmación para eliminar: la categoría elegida o null si está cerrado.
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null)

  const [pestana, setPestana] = useState('pagos')

  // Formulario de usuario nuevo: abierto, datos, errores por campo y error del backend.
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [erroresForm, setErroresForm] = useState({})
  const [errorCrear, setErrorCrear] = useState(null)

  // Diálogo de pago: { pagoId, estado nuevo } o null si está cerrado.
  const [accion, setAccion] = useState(null)

  // Diálogo de detalle: id abierto (null = cerrado), usuario, carga y error.
  const [usuarioAbiertoId, setUsuarioAbiertoId] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState(null)

  // Edición del usuario: campos, errores por campo, error del backend y PUT en curso (evita el doble envío).
  const [formEdicion, setFormEdicion] = useState({ nombre: '', apellido: '', email: '' })
  const [erroresEdicion, setErroresEdicion] = useState({})
  const [errorGuardarEdicion, setErrorGuardarEdicion] = useState(null)
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  // Cambio de rol (independiente de la edición): rol elegido, error del backend y PATCH en curso.
  const [rolElegido, setRolElegido] = useState('CLIENTE')
  const [errorRol, setErrorRol] = useState(null)
  const [cambiandoRol, setCambiandoRol] = useState(false)

  // Al abrir: GET /pagos, /users y /categories juntos (Promise.all). /categories es pública: va sin token.
  useEffect(() => {
    Promise.all([
      pedirPrivado('/pagos', token),
      pedirPrivado('/users', token),
      fetch(`${API_URL}/categories`).then(leerRespuesta).then((data) => data ?? []),
    ])
      .then(([listaPagos, listaUsuarios, listaCategorias]) => {
        setPagos(listaPagos)
        setUsuarios(listaUsuarios)
        setCategorias(listaCategorias)
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

  // Reseñas y platos del store, al abrir (rutas públicas, sin token).
  useEffect(() => {
    dispatch(fetchResenas())
    dispatch(fetchPlatos())
  }, [dispatch])

  // GET /users/{id} cada vez que se abre el detalle de un usuario.
  useEffect(() => {
    if (usuarioAbiertoId === null) {
      return
    }

    // Se cancela si se cierra el diálogo o se elige otro usuario: una respuesta vieja no pisa los datos del nuevo.
    const controlador = new AbortController()

    pedirPrivado(`/users/${usuarioAbiertoId}`, token, controlador.signal)
      .then((data) => {
        setDetalle(data)
        setFormEdicion({ nombre: data.nombre, apellido: data.apellido, email: data.email })
        setRolElegido(data.role)
        setCargandoDetalle(false)
      })
      .catch((fallo) => {
        if (fallo.name === 'AbortError') {
          return
        }
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        setErrorDetalle(mensajeDe(fallo))
        setCargandoDetalle(false)
      })

    return () => controlador.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioAbiertoId, token])

  if (cargando) {
    return <LoadingState message="Cargando los pagos..." />
  }
  if (error !== null) {
    return <ErrorState message={error} />
  }

  // Confirma el diálogo: PATCH /pagos/{id}/estado. Se cierra enseguida para que un segundo clic no repita la acción.
  const confirmarAccion = () => {
    const { pagoId, estado } = accion
    setAccion(null)

    fetch(`${API_URL}/pagos/${pagoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ estado }),
    })
      .then(leerRespuesta)
      .then((actualizado) => {
        setPagos((actuales) => actuales.map((pago) => (pago.id === actualizado.id ? actualizado : pago)))
        onAviso(`${TEXTOS_ACCION[estado].aviso} n.º ${pagoId}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        onAviso(mensajeDe(fallo), 'error')
      })
  }

  // Handler de los inputs del formulario nuevo; al corregir un campo limpia su error.
  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (erroresForm[name]) {
      setErroresForm({ ...erroresForm, [name]: null })
    }
  }

  const cerrarForm = () => {
    setMostrarForm(false)
    setForm(FORM_VACIO)
    setErroresForm({})
    setErrorCrear(null)
  }

  // Crea un usuario (POST /users/createUser) y lo suma a la lista sin volver a pedirla.
  const crearUsuario = (event) => {
    event.preventDefault()

    const errores = validar(form)
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores)
      return
    }

    setErrorCrear(null)
    fetch(`${API_URL}/users/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({
        username: form.username.trim(),
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      }),
    })
      .then(leerRespuesta)
      .then((creado) => {
        setUsuarios((actuales) => [...actuales, creado])
        cerrarForm()
        onAviso(`Creaste la cuenta de ${creado.nombre}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        setErrorCrear(mensajeDe(fallo))
      })
  }

  const cerrarFormCategoria = () => {
    setMostrarFormCategoria(false)
    setDescripcionNueva('')
    setErrorDescripcion(null)
    setErrorCrearCategoria(null)
  }

  const handleDescripcionChange = (event) => {
    setDescripcionNueva(event.target.value)
    setErrorDescripcion(null)
  }

  // Crea una categoría (POST /categories/createCategory) y la suma a la lista sin volver a pedirla.
  const crearCategoria = (event) => {
    event.preventDefault()

    if (descripcionNueva.trim() === '') {
      setErrorDescripcion('Escribí el nombre de la categoría.')
      return
    }

    setErrorCrearCategoria(null)
    fetch(`${API_URL}/categories/createCategory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ description: descripcionNueva.trim() }),
    })
      .then(leerRespuesta)
      .then((creada) => {
        setCategorias((actuales) => [...actuales, creada])
        cerrarFormCategoria()
        onAviso(`Creaste la categoría ${creada.description}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        // 409 (nombre repetido, sin distinguir mayúsculas), 403: el mensaje del backend va dentro del formulario.
        setErrorCrearCategoria(mensajeDe(fallo))
      })
  }

  const abrirEdicionCategoria = (categoria) => {
    setCategoriaEditando(categoria)
    setDescripcionEditada(categoria.description)
    setErrorDescripcionEditada(null)
    setErrorEditarCategoria(null)
  }

  const cerrarEdicionCategoria = () => setCategoriaEditando(null)

  const handleDescripcionEditadaChange = (event) => {
    setDescripcionEditada(event.target.value)
    setErrorDescripcionEditada(null)
  }

  // Guarda el nombre (PUT /categories/{id}); el backend devuelve la categoría y reemplaza la de la lista (map).
  const guardarCategoria = () => {
    if (categoriaEditando === null || guardandoCategoria) {
      return
    }

    const descripcion = descripcionEditada.trim()
    if (descripcion === '') {
      setErrorDescripcionEditada('Escribí el nombre de la categoría.')
      return
    }
    // Sin cambios no hace falta llamar al backend.
    if (descripcion === categoriaEditando.description) {
      cerrarEdicionCategoria()
      return
    }

    setGuardandoCategoria(true)
    setErrorEditarCategoria(null)
    fetch(`${API_URL}/categories/${categoriaEditando.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ description: descripcion }),
    })
      .then(leerRespuesta)
      .then((editada) => {
        setCategorias((actuales) => actuales.map((c) => (c.id === editada.id ? editada : c)))
        cerrarEdicionCategoria()
        onAviso(`Guardaste la categoría ${editada.description}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        // 409 (nombre repetido), 404 (ya no existe), 400: el mensaje del backend va dentro del diálogo.
        setErrorEditarCategoria(mensajeDe(fallo))
      })
      .finally(() => setGuardandoCategoria(false))
  }

  // Al confirmar: DELETE /categories/{id} (responde data: null) y la saca de la lista con filter, sin re-GET.
  // El diálogo se cierra enseguida para que un segundo clic no repita el pedido. Si el backend la rechaza
  // (409: está asignada a un plato; 404: ya no existe) el mensaje va al Toast y la lista queda como estaba.
  const eliminarCategoria = () => {
    const { id, description } = categoriaAEliminar
    setCategoriaAEliminar(null)

    fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }, // ruta privada
    })
      .then(leerRespuesta)
      .then(() => {
        setCategorias((actuales) => actuales.filter((c) => c.id !== id))
        onAviso(`Eliminaste la categoría ${description}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        onAviso(mensajeDe(fallo), 'error')
      })
  }

  // Abre el detalle: reinicia el diálogo y guarda el id (el efecto de arriba hace el GET).
  const abrirDetalle = (userId) => {
    setDetalle(null)
    setCargandoDetalle(true)
    setErrorDetalle(null)
    setErroresEdicion({})
    setErrorGuardarEdicion(null)
    setErrorRol(null)
    setUsuarioAbiertoId(userId)
  }

  const cerrarDetalle = () => setUsuarioAbiertoId(null)

  // Handler de los inputs de la edición.
  const handleEdicionChange = (event) => {
    const { name, value } = event.target
    setFormEdicion({ ...formEdicion, [name]: value })
    if (erroresEdicion[name]) {
      setErroresEdicion({ ...erroresEdicion, [name]: null })
    }
  }

  // Guarda la edición (PUT /users/{id}) y reemplaza al usuario en la lista sin volver a pedirla.
  const guardarEdicion = () => {
    if (detalle === null || guardandoEdicion) {
      return
    }

    const errores = validarEdicion(formEdicion)
    if (Object.keys(errores).length > 0) {
      setErroresEdicion(errores)
      return
    }

    setGuardandoEdicion(true)
    setErrorGuardarEdicion(null)
    fetch(`${API_URL}/users/${detalle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({
        nombre: formEdicion.nombre.trim(),
        apellido: formEdicion.apellido.trim(),
        email: formEdicion.email.trim(),
      }),
    })
      .then(leerRespuesta)
      .then((editado) => {
        setUsuarios((actuales) => actuales.map((usuario) => (usuario.id === editado.id ? editado : usuario)))
        cerrarDetalle()
        onAviso(`Guardaste los cambios de ${editado.nombre}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        // Un 400 ya validados los campos solo puede ser el correo repetido: va junto a ese campo; el resto, en una alerta.
        if (fallo.status === 400) {
          setErroresEdicion({ email: fallo.message })
          return
        }
        setErrorGuardarEdicion(mensajeDe(fallo))
      })
      .finally(() => setGuardandoEdicion(false))
  }

  // Cambia el rol (PATCH /users/{id}/role). Errores del backend: 400 si un ADMIN se quita su propio rol, 409 si se
  // saca CHEF a quien tiene platos o subpedidos sin terminar; se muestran en el diálogo.
  const cambiarRol = () => {
    if (detalle === null || cambiandoRol || rolElegido === detalle.role) {
      return
    }

    setCambiandoRol(true)
    setErrorRol(null)
    fetch(`${API_URL}/users/${detalle.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ruta privada
      },
      body: JSON.stringify({ role: rolElegido }),
    })
      .then(leerRespuesta)
      .then((actualizado) => {
        setUsuarios((actuales) => actuales.map((usuario) => (usuario.id === actualizado.id ? actualizado : usuario)))
        setDetalle(actualizado)
        onAviso(`${actualizado.nombre} ahora es ${ETIQUETAS_ROL[actualizado.role].texto}`)
      })
      .catch((fallo) => {
        if (fallo.status === 401) {
          onSesionVencida()
          return
        }
        setErrorRol(mensajeDe(fallo))
      })
      .finally(() => setCambiandoRol(false))
  }

  // Pagos de más nuevo a más viejo (se ordena una copia: sort modifica el array y el estado no se toca).
  const ordenados = [...pagos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
  const pendientes = pagos.filter((pago) => pago.estado === 'PENDIENTE').length

  // Cada reseña trae solo platoId: el nombre sale de los platos del store (los no publicados quedan como "Plato n.º").
  const resenasConPlato = resenas.map((resena) => ({
    ...resena,
    platoNombre: platos.find((plato) => plato.id === resena.platoId)?.nombre ?? `Plato n.º ${resena.platoId}`,
  }))

  // Elimina la reseña elegida (DELETE /resenas/{id}); el slice la saca de la lista. Los errores salen en el Toast.
  const eliminarResena = () => {
    const { id } = resenaAEliminar
    setResenaAEliminar(null)

    dispatch(deleteResena({ id, token })).then((resultado) => {
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
      if (mensaje.includes('404')) {
        onAviso('La reseña ya no existe', 'error')
        return
      }
      onAviso('No pudimos eliminar la reseña', 'error')
    })
  }

  const pestanas = [
    { id: 'pagos', label: 'Pagos', count: pendientes },
    { id: 'usuarios', label: 'Usuarios', count: usuarios.length },
    { id: 'categorias', label: 'Categorías', count: categorias.length },
    { id: 'resenas', label: 'Reseñas', count: resenas.length },
  ]

  return (
    <>
      <h1 className="font-display text-display-lg-mobile text-primary lg:text-[52px] lg:leading-[56px]">Administración</h1>
      <p className="mt-3 max-w-xl text-body-md text-on-surface-variant">
        Aprobá los pagos de los clientes para que los chefs puedan preparar los pedidos y creá cuentas nuevas.
      </p>

      <div className="mt-10">
        <Tabs tabs={pestanas} activeId={pestana} onChange={setPestana} label="Administración" />

        {pestana === 'pagos' && (
          <PagosPanel
            pagos={ordenados}
            textosAccion={TEXTOS_ACCION}
            onAccion={(pagoId, estado) => setAccion({ pagoId, estado })}
          />
        )}

        {pestana === 'usuarios' && (
          <UsuariosPanel
            usuarios={usuarios}
            etiquetasRol={ETIQUETAS_ROL}
            mostrarForm={mostrarForm}
            form={form}
            errores={erroresForm}
            errorCrear={errorCrear}
            onAbrirForm={() => setMostrarForm(true)}
            onCerrarForm={cerrarForm}
            onChange={handleFormChange}
            onCrear={crearUsuario}
            onVerDetalle={abrirDetalle}
          />
        )}

        {pestana === 'categorias' && (
          <CategoriasPanel
            categorias={categorias}
            mostrarForm={mostrarFormCategoria}
            descripcion={descripcionNueva}
            errorDescripcion={errorDescripcion}
            errorCrear={errorCrearCategoria}
            onAbrirForm={() => setMostrarFormCategoria(true)}
            onCerrarForm={cerrarFormCategoria}
            onDescripcionChange={handleDescripcionChange}
            onCrear={crearCategoria}
            onEditar={abrirEdicionCategoria}
            onEliminar={setCategoriaAEliminar}
          />
        )}

        {pestana === 'resenas' && (
          <ResenasPanel
            resenas={resenasConPlato}
            cargando={cargandoResenas}
            error={errorResenas}
            onEliminar={setResenaAEliminar}
          />
        )}
      </div>

      {/* Diálogo de confirmación del pago; cerrado, los textos van vacíos (Dialog no dibuja nada con open en false) */}
      <Dialog
        open={accion !== null}
        title={accion === null ? '' : `${TEXTOS_ACCION[accion.estado].titulo} (n.º ${accion.pagoId})`}
        message={accion === null ? '' : TEXTOS_ACCION[accion.estado].mensaje}
        confirmLabel={accion === null ? '' : TEXTOS_ACCION[accion.estado].boton}
        confirmVariant={accion === null ? 'primary' : TEXTOS_ACCION[accion.estado].variante}
        cancelLabel="Volver"
        onConfirm={confirmarAccion}
        onCancel={() => setAccion(null)}
      />

      {/* Diálogo de detalle: se abre cuando usuarioAbiertoId deja de ser null; confirmar guarda con PUT */}
      <UsuarioDetalleDialog
        abierto={usuarioAbiertoId !== null}
        detalle={detalle}
        cargando={cargandoDetalle}
        errorCarga={errorDetalle}
        etiquetasRol={ETIQUETAS_ROL}
        form={formEdicion}
        errores={erroresEdicion}
        errorGuardar={errorGuardarEdicion}
        guardando={guardandoEdicion}
        rolElegido={rolElegido}
        cambiandoRol={cambiandoRol}
        errorRol={errorRol}
        onChange={handleEdicionChange}
        onRolChange={(event) => setRolElegido(event.target.value)}
        onCambiarRol={cambiarRol}
        onGuardar={guardarEdicion}
        onCerrar={cerrarDetalle}
      />

      {/* Diálogo de edición de categoría: se abre cuando categoriaEditando deja de ser null; confirmar guarda con PUT */}
      <CategoriaEditDialog
        abierto={categoriaEditando !== null}
        descripcion={descripcionEditada}
        errorDescripcion={errorDescripcionEditada}
        errorGuardar={errorEditarCategoria}
        guardando={guardandoCategoria}
        onChange={handleDescripcionEditadaChange}
        onGuardar={guardarCategoria}
        onCerrar={cerrarEdicionCategoria}
      />

      {/* Diálogo de confirmación para eliminar una categoría; cerrado, el título va vacío */}
      <Dialog
        open={categoriaAEliminar !== null}
        title={categoriaAEliminar === null ? '' : `¿Eliminar ${categoriaAEliminar.description}?`}
        message="Si hay platos que usan esta categoría, no se puede eliminar."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={eliminarCategoria}
        onCancel={() => setCategoriaAEliminar(null)}
      />

      {/* Diálogo de confirmación para eliminar una reseña; cerrado, el título va vacío */}
      <Dialog
        open={resenaAEliminar !== null}
        title={resenaAEliminar === null ? '' : `¿Eliminar la reseña de ${resenaAEliminar.platoNombre}?`}
        message="La reseña se borra para todos y cambia la calificación del plato. No se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={eliminarResena}
        onCancel={() => setResenaAEliminar(null)}
      />
    </>
  )
}

export default Admin
