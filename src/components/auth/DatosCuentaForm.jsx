// Formulario de datos de la cuenta de views/Perfil (nombre, apellido y correo). No hace fetch: todo viene por props.
import Alert from '../comunes/Alert'
import FormField from '../comunes/FormField'

const NOMBRES_ROL = {
  CLIENTE: 'Cliente',
  CHEF: 'Chef',
  ADMIN: 'Administrador',
}

// Props: usuario ({ username, role }, solo lectura); datos ({ nombre, apellido, email }); errores (por campo);
// error (del backend); guardando; onChange (event); onSubmit (event).
function DatosCuentaForm({ usuario, datos, errores, error, guardando, onChange, onSubmit }) {
  return (
    <form className="mt-10 max-w-xl space-y-6" onSubmit={onSubmit} noValidate>
      {/* No editables: la API ignora el usuario y el rol en PUT /users/me */}
      <dl className="grid gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient sm:grid-cols-2">
        <div>
          <dt className="text-label-md text-on-surface-variant">Usuario</dt>
          <dd className="text-body-md text-primary">@{usuario.username}</dd>
        </div>
        <div>
          <dt className="text-label-md text-on-surface-variant">Rol</dt>
          <dd className="text-body-md text-primary">{NOMBRES_ROL[usuario.role]}</dd>
        </div>
      </dl>

      {error !== null && <Alert title="No pudimos guardar tus datos" messages={[error]} />}

      <FormField label="Nombre" name="nombre" value={datos.nombre} onChange={onChange} error={errores.nombre} />
      <FormField label="Apellido" name="apellido" value={datos.apellido} onChange={onChange} error={errores.apellido} />
      <FormField label="Correo electrónico" name="email" type="email" value={datos.email} onChange={onChange} error={errores.email} />

      <button type="submit" className="btn btn-primary" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

export default DatosCuentaForm
