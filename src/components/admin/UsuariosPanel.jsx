// Pestaña Usuarios de views/Admin: formulario de alta y lista de cuentas. No hace fetch ni guarda datos: todo viene por props.
import Alert from '../comunes/Alert'
import FormField from '../comunes/FormField'

// Props: usuarios; etiquetasRol (rol -> { texto, clase }); mostrarForm; form (valores de los campos); errores (por
// campo); errorCrear (del backend); onAbrirForm; onCerrarForm; onChange (event); onCrear (event, submit);
// onVerDetalle (id): el padre abre el diálogo de detalle.
function UsuariosPanel({ usuarios, etiquetasRol, mostrarForm, form, errores, errorCrear, onAbrirForm, onCerrarForm, onChange, onCrear, onVerDetalle }) {
  return (
    <div role="tabpanel" className="mt-8 space-y-4">
      {mostrarForm ? (
        <form
          className="space-y-5 rounded-xl bg-surface-container-lowest p-5 shadow-ambient sm:p-7"
          onSubmit={onCrear}
          noValidate
        >
          <h2 className="font-display text-headline-sm text-primary">Nueva cuenta</h2>
          {errorCrear !== null && <Alert title="No pudimos crear la cuenta" messages={[errorCrear]} />}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nombre" name="nombre" value={form.nombre} onChange={onChange} error={errores.nombre} />
            <FormField label="Apellido" name="apellido" value={form.apellido} onChange={onChange} error={errores.apellido} />
            <FormField label="Usuario" name="username" value={form.username} onChange={onChange} error={errores.username} autoComplete="off" />
            <FormField label="Correo electrónico" name="email" type="email" value={form.email} onChange={onChange} error={errores.email} autoComplete="off" />
            <FormField label="Contraseña" name="password" type="password" value={form.password} onChange={onChange} error={errores.password} autoComplete="new-password" />
            <div>
              <label className="label" htmlFor="role">Rol</label>
              <select id="role" name="role" className="field" value={form.role} onChange={onChange}>
                <option value="CLIENTE">Cliente</option>
                <option value="CHEF">Chef</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">Crear cuenta</button>
            <button type="button" className="btn btn-quiet" onClick={onCerrarForm}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={onAbrirForm}>
          Crear usuario
        </button>
      )}

      {/* El rol de un usuario existente se cambia desde "Ver y editar" */}
      {usuarios.map((usuario) => (
        <article
          key={usuario.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
        >
          <div className="min-w-0 flex-1 basis-[220px]">
            <h2 className="font-display text-headline-sm text-primary">{usuario.nombre} {usuario.apellido}</h2>
            <p className="text-body-sm text-on-surface-variant">@{usuario.username} · {usuario.email}</p>
          </div>
          <span className={`badge ${etiquetasRol[usuario.role].clase}`}>{etiquetasRol[usuario.role].texto}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onVerDetalle(usuario.id)}>
            Ver y editar
          </button>
        </article>
      ))}
    </div>
  )
}

export default UsuariosPanel
