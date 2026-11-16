// Inicio (/): portada con buscador y categorías, platos de hoy y chefs (GET /platos, /categories y /chef-profiles).
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import PlatoCard from '../components/platos/PlatoCard'
import SearchBar from '../components/platos/SearchBar'
import CategoryChips from '../components/platos/CategoryChips'
import ChefCard from '../components/platos/ChefCard'
import LogoCloche from '../components/layout/LogoCloche'
import Hero3D from '../components/layout/Hero3D'
import FondoMesa from '../components/layout/FondoMesa'
import ContenidoAsync from '../components/comunes/ContenidoAsync'
import { fetchPlatos, fetchPlatoRecomendado } from '../components/Redux/platosSlice'
import { fetchCategorias } from '../components/Redux/categoriasSlice'
import { fetchResenas } from '../components/Redux/resenasSlice'

// URL base del backend (viene de .env).
const API_URL = import.meta.env.VITE_API_URL

// Plato destacado de la portada (el filtro `nombre` del backend busca por coincidencia parcial).
const NOMBRE_RECOMENDADO = 'Milanesa napolitana con papas'

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

// Props: onAdd (agregar a la cesta de App; solo se reenvía a cada PlatoCard).
function Inicio({ onAdd }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // Platos y plato recomendado vienen del store (platosSlice); si no hay recomendado, la portada usa el primer plato publicado.
  const { items: platos, recomendado, loading: cargando, error } = useSelector((state) => state.platos)
  // Si las categorías fallan, solo se avisa debajo de los chips: el resto de la portada se puede usar.
  const { items: categorias, error: errorCategorias } = useSelector((state) => state.categorias)
  // Reseñas de todos los platos: sirven para el promedio de cada tarjeta y para "Mejor puntuados".
  const resenas = useSelector((state) => state.resenas.items)

  // Texto del buscador de la portada: se manda al catálogo al enviar.
  const [busqueda, setBusqueda] = useState('')

  // Perfiles de chef, con su carga y error: si fallan, solo se avisa en su sección.
  const [chefs, setChefs] = useState([])
  const [cargandoChefs, setCargandoChefs] = useState(true)
  const [errorChefs, setErrorChefs] = useState(false)


  // Al abrir: pide los platos (a Redux) y las categorías, cada uno en su efecto. Rutas públicas: sin token.
  useEffect(() => {
    dispatch(fetchPlatos())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchCategorias())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchResenas())
  }, [dispatch])

  // GET /chef-profiles (público, sin token).
  useEffect(() => {
    fetch(`${API_URL}/chef-profiles`)
      .then(leerRespuesta)
      .then((data) => setChefs(data ?? [])) // lista vacía llega como null
      .catch(() => setErrorChefs(true))
      .finally(() => setCargandoChefs(false))
  }, [])

  // Plato recomendado de la portada (público, sin token).
  useEffect(() => {
    dispatch(fetchPlatoRecomendado(NOMBRE_RECOMENDADO))
  }, [dispatch])

  const manejarBusqueda = (event) => {
    setBusqueda(event.target.value)
  }

  // Va al catálogo con el texto en el state de la navegación (sin fetch acá); vacío = sin filtro.
  const buscar = (event) => {
    event.preventDefault()
    navigate('/catalogo', { state: { nombre: busqueda.trim() } })
  }

  // Va al catálogo con la categoría elegida en el state (null = "Todas").
  const irACategoria = (id) => {
    navigate('/catalogo', { state: { categoriaId: id } })
  }

  // Plato de la tarjeta del hero: el recomendado o, si no hay, el primero publicado.
  const platoDelHero = recomendado ?? platos.find((plato) => plato.estado === 'PUBLICADO')

  // Los primeros 4 platos para "Platos de hoy".
  const platosDeHoy = platos.slice(0, 4)

  // Los 4 platos con mejor promedio (la API no lo calcula): se arma con las reseñas del store; desempata quien tiene más.
  const mejorPuntuados = platos
    .map((plato) => {
      const deEstePlato = resenas.filter((resena) => resena.platoId === plato.id)
      const suma = deEstePlato.reduce((acumulado, resena) => acumulado + resena.calificacion, 0)
      return { plato, cantidad: deEstePlato.length, promedio: suma / deEstePlato.length }
    })
    .filter((puntuado) => puntuado.cantidad > 0)
    .sort((a, b) => b.promedio - a.promedio || b.cantidad - a.cantidad)
    .slice(0, 4)

  // Contenido de la sección de chefs según el estado (carga, error, vacío o tarjetas), con if y return en vez de ternarios anidados.
  const contenidoChefs = () => {
    if (cargandoChefs) {
      return <p className="mt-12 text-body-md text-on-surface-variant">Cargando los chefs...</p>
    }
    if (errorChefs) {
      return <p className="hint hint--error mt-12">No pudimos cargar los chefs.</p>
    }
    if (chefs.length === 0) {
      return <p className="mt-12 text-body-md text-on-surface-variant">Todavía no hay chefs con perfil.</p>
    }
    return (
      <ul className="mt-12 divide-y divide-hairline md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* Solo 3 perfiles: el diseño tiene 3 columnas */}
        {chefs.slice(0, 3).map((chef) => (
          <ChefCard key={chef.id} chef={chef} verPerfil />
        ))}
      </ul>
    )
  }

  return (
    <>
      {/* Portada: el logo grande aparece al levantar la cloche */}
      <section className="portada relative isolate grid place-items-center py-10 lg:py-16">
        <FondoMesa platos={platos} />
        <LogoCloche />
        {/* Único h1 de la página */}
        <h1 className="aparece balance mt-8 text-center font-display text-display-lg-mobile text-primary lg:text-display-lg">
          ¿Qué te gustaría comer hoy?
        </h1>

        {/* Buscador: entra un poco después del titular */}
        <form onSubmit={buscar} className="aparece mt-8 flex w-full max-w-xl items-center gap-3" style={{ '--retraso': '1.8s' }}>
          <div className="flex-1">
            <SearchBar value={busqueda} onChange={manejarBusqueda} placeholder="Buscá un plato, por ejemplo ravioles" />
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>

        {/* Chips de categorías: entran al final de la secuencia. selectedId={-1}: ninguno marcado ("Todas" viene marcado con null) */}
        <div role="group" aria-label="Categorías" className="aparece mt-6 w-full max-w-xl" style={{ '--retraso': '2s' }}>
          <CategoryChips categories={categorias} selectedId={-1} onSelect={irACategoria} />
          {errorCategorias && (
            <p className="hint hint--error">No pudimos cargar las categorías.</p>
          )}
        </div>
      </section>

      {/* Qué es Appetitos y el plato recomendado (en el celular, uno debajo del otro) */}
      <section aria-labelledby="h-que-es" className="mt-14 grid items-center gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h2 id="h-que-es" className="font-display text-headline-lg text-primary">
            Platos de autor, cocinados hoy por chefs de tu barrio
          </h2>
          <p className="mt-5 max-w-[34rem] text-body-lg text-on-surface-variant">
            Pedile a talleres pequeños e independientes. Cada plato se prepara en tandas cortas y llega el mismo día.
          </p>
          <Link to="/catalogo" className="btn btn-primary mt-8">Ver los platos</Link>
        </div>
        <div className="lg:col-span-5">
          {/* Hero3D no dibuja la tarjeta si plato es undefined */}
          <Hero3D plato={platoDelHero} onAdd={onAdd} />
        </div>
      </section>

      <section aria-labelledby="h-hoy" className="mt-14 lg:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="h-hoy" className="font-display text-headline-lg text-primary">Para pedir hoy</h2>
            <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">
              Platos que se están cocinando ahora. Cuando se acaban las porciones, se acaban.
            </p>
          </div>
          <Link to="/catalogo" className="link text-label-lg">Ver todos los platos</Link>
        </div>
        <ContenidoAsync
          cargando={cargando}
          error={error}
          vacio={platosDeHoy.length === 0}
          mensajeCarga="Cargando los platos de hoy..."
          mensajeVacio="Todavía no hay platos publicados."
        >
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {platosDeHoy.map((plato) => (
              <PlatoCard key={plato.id} dish={plato} onAdd={onAdd} />
            ))}
          </div>
        </ContenidoAsync>
      </section>

      {/* Solo se muestra si hay platos con reseñas */}
      {mejorPuntuados.length > 0 && (
        <section aria-labelledby="h-mejores" className="mt-14 lg:mt-20">
          <h2 id="h-mejores" className="font-display text-headline-lg text-primary">Mejor puntuados</h2>
          <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">
            Los platos que más les gustaron a quienes los pidieron.
          </p>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {mejorPuntuados.map((puntuado) => (
              <PlatoCard key={puntuado.plato.id} dish={puntuado.plato} onAdd={onAdd} />
            ))}
          </div>
        </section>
      )}

      {/* TODO(backend): el perfil de chef no trae el nombre de la persona ni su taller; la tarjeta no los muestra. */}
      <section aria-labelledby="h-chefs" className="mt-20 lg:mt-28">
        <h2 id="h-chefs" className="font-display text-headline-lg text-primary">Quiénes cocinan</h2>
        <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">
          Talleres chicos, con nombre y apellido. Cada chef firma lo que cocina.
        </p>
        {contenidoChefs()}
      </section>
    </>
  )
}

export default Inicio
