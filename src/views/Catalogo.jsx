// Catálogo (/catalogo): platos y categorías del backend. Filtra por query params; ordena y pagina acá (la API no lo hace).
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import PlatoCard from '../components/platos/PlatoCard'
import SearchBar from '../components/platos/SearchBar'
import CategoryChips from '../components/platos/CategoryChips'
import Pagination from '../components/comunes/Pagination'
import EmptyState from '../components/comunes/EmptyState'
import Button from '../components/comunes/Button'
import ContenidoAsync from '../components/comunes/ContenidoAsync'
import { fetchPlatos } from '../components/Redux/platosSlice'
import { fetchCategorias } from '../components/Redux/categoriasSlice'
import { fetchResenas } from '../components/Redux/resenasSlice'

const PLATOS_POR_PAGINA = 6

// Filtros vacíos (categoriaId null = todas). Los precios van como texto, como vienen de los inputs.
const FILTROS_INICIALES = { nombre: '', categoriaId: null, precioMin: '', precioMax: '' }

// Ordena una copia de los platos (sort modifica el array y el estado no se toca): la API no ordena.
const ordenarPlatos = (platos, orden) => {
  const copia = [...platos]
  if (orden === 'precio-asc') {
    return copia.sort((a, b) => a.precioConDescuento - b.precioConDescuento)
  }
  if (orden === 'precio-desc') {
    return copia.sort((a, b) => b.precioConDescuento - a.precioConDescuento)
  }
  if (orden === 'nombre-asc') {
    return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }
  return copia
}

// Valida los precios como la API (400 si hay negativos o el mínimo supera al máximo): mensaje de error o null.
const validarPrecios = (filtros) => {
  if (Number(filtros.precioMin) < 0 || Number(filtros.precioMax) < 0) {
    return 'Los precios no pueden ser negativos.'
  }
  if (filtros.precioMin !== '' && filtros.precioMax !== '' && Number(filtros.precioMin) > Number(filtros.precioMax)) {
    return 'El precio mínimo no puede ser mayor que el máximo.'
  }
  return null
}

// Props: onAdd (agregar a la cesta de App; solo se reenvía a cada PlatoCard).
function Catalogo({ onAdd }) {
  // Los platos y las categorías vienen del store. Si las categorías fallan, solo se avisa debajo de los chips.
  const dispatch = useDispatch()
  const { items: platos, loading: cargando, error } = useSelector((state) => state.platos)
  const { items: categorias, error: errorCategorias } = useSelector((state) => state.categorias)

  // Si llegamos desde Inicio, el nombre y la categoría vienen en el state de la navegación (valores iniciales: no disparan un GET de más).
  const location = useLocation()
  const [filtros, setFiltros] = useState({
    ...FILTROS_INICIALES,
    nombre: location.state?.nombre ?? '',
    categoriaId: location.state?.categoriaId ?? null,
  })

  const [orden, setOrden] = useState('sin-orden')

  // Cuántas "páginas" de platos se muestran (cada "Ver más" suma una).
  const [paginaActual, setPaginaActual] = useState(1)

  // Se valida antes de pedir los platos para no mandarle al backend un filtro inválido.
  const errorPrecios = validarPrecios(filtros)

  // Valores que se mandan al backend (con precios inválidos, no se mandan).
  const nombre = filtros.nombre.trim()
  const categoriaId = filtros.categoriaId
  const precioMin = errorPrecios === null ? filtros.precioMin.trim() : ''
  const precioMax = errorPrecios === null ? filtros.precioMax.trim() : ''

  // Categorías: se piden una sola vez, al abrir. Ruta pública: sin token.
  // Las reseñas de todos los platos: PlatoCard calcula el promedio de estrellas con ellas.
  useEffect(() => {
    dispatch(fetchResenas())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchCategorias())
  }, [dispatch])

  // Platos: se piden al abrir y cada vez que cambia un filtro. Filtra el backend, con query params.
  useEffect(() => {
    // Solo viajan los filtros con valor (un precio vacío le daría un 400 al backend).
    const filtrosApi = {}
    if (nombre !== '') filtrosApi.nombre = nombre
    if (categoriaId !== null) filtrosApi.categoriaId = categoriaId
    if (precioMin !== '') filtrosApi.precioMin = precioMin
    if (precioMax !== '') filtrosApi.precioMax = precioMax

    dispatch(fetchPlatos(filtrosApi))
  }, [dispatch, nombre, categoriaId, precioMin, precioMax])

  // Handler de los inputs de texto y precio; al cambiar un filtro vuelve a la página 1.
  const handleFiltroChange = (event) => {
    const { name, value } = event.target
    setFiltros({ ...filtros, [name]: value })
    setPaginaActual(1)
  }

  // Handler de los chips: id de la categoría, o null para "Todas".
  const handleCategoria = (id) => {
    setFiltros({ ...filtros, categoriaId: id })
    setPaginaActual(1)
  }

  const handleOrdenChange = (event) => {
    setOrden(event.target.value)
    setPaginaActual(1)
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES)
    setOrden('sin-orden')
    setPaginaActual(1)
  }

  // Lista visible: los platos ya filtrados por el backend, ordenados y recortados a la página actual.
  const platosOrdenados = ordenarPlatos(platos, orden)
  const platosVisibles = platosOrdenados.slice(0, paginaActual * PLATOS_POR_PAGINA)

  const hayFiltros = filtros.nombre !== '' || filtros.categoriaId !== null || filtros.precioMin !== '' || filtros.precioMax !== '' || orden !== 'sin-orden'

  return (
    <>
      <h1 className="font-display text-headline-lg text-primary">Catálogo</h1>
      <div className="mt-8">
        <SearchBar value={filtros.nombre} onChange={handleFiltroChange} />
      </div>
      <div className="mt-4">
        <CategoryChips categories={categorias} selectedId={filtros.categoriaId} onSelect={handleCategoria} />
        {errorCategorias && (
          <p className="hint hint--error">No pudimos cargar las categorías.</p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="precioMin">Precio mínimo</label>
          <input
            id="precioMin"
            name="precioMin"
            type="number"
            min="0"
            className="field"
            placeholder="$ 0"
            value={filtros.precioMin}
            onChange={handleFiltroChange}
            aria-invalid={errorPrecios !== null ? 'true' : 'false'}
          />
        </div>
        <div>
          <label className="label" htmlFor="precioMax">Precio máximo</label>
          <input
            id="precioMax"
            name="precioMax"
            type="number"
            min="0"
            className="field"
            placeholder="$ 30000"
            value={filtros.precioMax}
            onChange={handleFiltroChange}
            aria-invalid={errorPrecios !== null ? 'true' : 'false'}
          />
        </div>
        <div>
          <label className="label" htmlFor="orden">Ordenar por</label>
          <select id="orden" name="orden" className="field" value={orden} onChange={handleOrdenChange}>
            <option value="sin-orden">Sin orden</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre-asc">Nombre: A a Z</option>
          </select>
        </div>
      </div>
      {errorPrecios !== null && (
        <p className="hint hint--error" role="alert">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
          <span>{errorPrecios}</span>
        </p>
      )}
      {hayFiltros && (
        <div className="mt-4">
          <Button variant="secondary" onClick={limpiarFiltros}>Limpiar filtros</Button>
        </div>
      )}

      <ContenidoAsync
        cargando={cargando}
        error={error}
        vacio={platos.length === 0}
        mensajeCarga="Cargando el catálogo..."
        contenidoVacio={
          <EmptyState
            title="No encontramos platos"
            message="Probá con otro nombre, otra categoría o un rango de precios distinto."
            actionLabel="Limpiar filtros"
            onAction={limpiarFiltros}
          />
        }
      >
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {platosVisibles.map((plato) => (
            <PlatoCard key={plato.id} dish={plato} onAdd={onAdd} />
          ))}
        </div>
        <Pagination
          shown={platosVisibles.length}
          total={platosOrdenados.length}
          onMore={() => setPaginaActual(paginaActual + 1)}
        />
      </ContenidoAsync>
    </>
  )
}

export default Catalogo
