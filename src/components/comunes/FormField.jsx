// Campo de formulario (etiqueta, input y error). No guarda el valor: lo manda el padre y recibe cada cambio.

// Props: label, name (el handler del padre lo lee con event.target.name), type ('text' por defecto), value,
// onChange, error (texto o null), autoComplete, placeholder y hint (ayuda debajo del campo; opcionales).
function FormField({ label, name, type = 'text', value, onChange, error, autoComplete, placeholder, hint }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="field"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
      />
      {hint && <p className="hint">{hint}</p>}
      {error && (
        <p className="hint hint--error">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default FormField
