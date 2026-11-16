// Diálogo de detalle de usuario de views/Admin: edita sus datos y cambia su rol. No hace fetch: todo viene por props.
import Alert from '../comunes/Alert'
import Dialog from '../comunes/Dialog'
import FormField from '../comunes/FormField'

const ROLES = ['CLIENTE', 'CHEF', 'ADMIN']

// Props: abierto; detalle (usuario cargado o null); cargando; errorCarga; etiquetasRol (rol -> { texto });
// form, errores y errorGuardar (edición de datos); guardando; rolElegido, cambiandoRol y errorRol (cambio de rol);
// onChange (event); onRolChange (event); onCambiarRol; onGuardar; onCerrar.
function UsuarioDetalleDialog({
  abierto,
  detalle,
  cargando,
  errorCarga,
  etiquetasRol,
  form,
  errores,
  errorGuardar,
  guardando,
  rolElegido,
  cambiandoRol,
  errorRol,
  onChange,
  onRolChange,
  onCambiarRol,
  onGuardar,
  onCerrar,
}) {
  // Contenido según el estado (cargando, error o formulario).
  const contenido = () => {
    if (cargando) {
      return <p className="mt-5 text-body-md text-on-surface-variant">Cargando los datos...</p>
    }
    if (errorCarga !== null) {
      return <div className="mt-5"><Alert title="No pudimos cargar el usuario" messages={[errorCarga]} /></div>
    }
    if (detalle === null) {
      return null
    }
    return (
      <div className="mt-5 space-y-4">
        {errorGuardar !== null && <Alert title="No pudimos guardar los cambios" messages={[errorGuardar]} />}
        <FormField label="Nombre" name="nombre" value={form.nombre} onChange={onChange} error={errores.nombre} />
        <FormField label="Apellido" name="apellido" value={form.apellido} onChange={onChange} error={errores.apellido} />
        <FormField label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} error={errores.email} />

        {/* Cambio de rol: tiene su propio botón, no depende de "Guardar cambios" */}
        <div className="border-t border-hairline pt-4">
          <label className="label" htmlFor="rol-usuario">Rol</label>
          <div className="flex gap-3">
            <select id="rol-usuario" className="field" value={rolElegido} onChange={onRolChange}>
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>{etiquetasRol[rol].texto}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary flex-none"
              onClick={onCambiarRol}
              disabled={cambiandoRol || rolElegido === detalle.role}
            >
              {cambiandoRol ? 'Cambiando...' : 'Cambiar rol'}
            </button>
          </div>
          {errorRol !== null && <div className="mt-3"><Alert title="No pudimos cambiar el rol" messages={[errorRol]} /></div>}
        </div>
      </div>
    )
  }

  return (
    <Dialog
      open={abierto}
      title="Editar usuario"
      message={detalle === null ? 'Datos de la cuenta.' : `@${detalle.username} · ${etiquetasRol[detalle.role].texto}`}
      confirmLabel={guardando ? 'Guardando...' : 'Guardar cambios'}
      confirmVariant="primary"
      cancelLabel="Cerrar"
      onConfirm={onGuardar}
      onCancel={onCerrar}
    >
      {contenido()}
    </Dialog>
  )
}

export default UsuarioDetalleDialog
