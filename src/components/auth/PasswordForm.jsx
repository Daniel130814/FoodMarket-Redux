// Formulario de cambio de contraseña de views/Perfil. No hace fetch ni guarda datos: todo viene por props.
import Alert from '../comunes/Alert'
import FormField from '../comunes/FormField'

// Props: datos ({ actual, nueva, repetir }); errores (por campo); error (del backend); guardando; onChange (event);
// onSubmit (event).
function PasswordForm({ datos, errores, error, guardando, onChange, onSubmit }) {
  return (
    <form className="mt-14 max-w-xl space-y-6" onSubmit={onSubmit} noValidate>
      <h2 className="font-display text-headline-md text-primary">Cambiar la contraseña</h2>

      {error !== null && <Alert title="No pudimos cambiar la contraseña" messages={[error]} />}

      <FormField label="Contraseña actual" name="actual" type="password" value={datos.actual} onChange={onChange} error={errores.actual} autoComplete="current-password" />
      <FormField label="Contraseña nueva" name="nueva" type="password" value={datos.nueva} onChange={onChange} error={errores.nueva} autoComplete="new-password" />
      <FormField label="Repetí la contraseña nueva" name="repetir" type="password" value={datos.repetir} onChange={onChange} error={errores.repetir} autoComplete="new-password" />

      <button type="submit" className="btn btn-primary" disabled={guardando}>
        {guardando ? 'Cambiando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

export default PasswordForm
