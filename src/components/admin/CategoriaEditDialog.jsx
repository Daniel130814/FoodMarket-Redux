// Diálogo para editar el nombre de una categoría (views/Admin). No hace fetch: todo viene por props.
import Alert from '../comunes/Alert'
import Dialog from '../comunes/Dialog'
import FormField from '../comunes/FormField'

// Props: abierto; descripcion (valor del campo); errorDescripcion (junto al campo); errorGuardar (del backend);
// guardando; onChange (event); onGuardar; onCerrar.
function CategoriaEditDialog({ abierto, descripcion, errorDescripcion, errorGuardar, guardando, onChange, onGuardar, onCerrar }) {
  return (
    <Dialog
      open={abierto}
      title="Editar categoría"
      message="Cambiá el nombre con el que se muestra en el catálogo y en el formulario de platos."
      confirmLabel={guardando ? 'Guardando...' : 'Guardar cambios'}
      confirmVariant="primary"
      cancelLabel="Cancelar"
      onConfirm={onGuardar}
      onCancel={onCerrar}
    >
      <div className="mt-5 space-y-4">
        {errorGuardar !== null && <Alert title="No pudimos guardar la categoría" messages={[errorGuardar]} />}
        <FormField
          label="Nombre de la categoría"
          name="descripcionEditada"
          value={descripcion}
          onChange={onChange}
          error={errorDescripcion}
          autoComplete="off"
        />
      </div>
    </Dialog>
  )
}

export default CategoriaEditDialog
