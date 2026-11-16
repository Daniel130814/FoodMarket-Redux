# Appetitos — Front-End

Appetitos es un e-commerce gastronómico de venta de comida, desarrollado como proyecto Full Stack para la materia **Aplicaciones Interactivas**. Su propuesta es **«De todos para todos»**.

Este repositorio corresponde al **Front-End de Appetitos**, construido con **React + Vite**. Transforma los prototipos visuales generados con **Google Stitch** en una aplicación web funcional, con componentes reutilizables, conectada al backend desarrollado en **Spring Boot** (otro repositorio).

## Tecnologías

- **React:** construcción de la interfaz mediante componentes reutilizables.
- **Vite:** entorno de desarrollo y generación de la aplicación para producción.
- **React Router:** navegación entre vistas y rutas protegidas por rol.
- **Tailwind CSS 3:** única librería de estilos, con los tokens de diseño de Appetitos.
- **Redux Toolkit y React-Redux:** estado global de la sesión y de los GET públicos (3.ª entrega).
- **Axios:** llamadas a la API de lo que vive en Redux, solo dentro de los slices.
- **fetch nativo:** el resto de las llamadas (escrituras y GET privados), como en la 2.ª entrega.
- **ESLint:** revisión estática del código.

Solo se usa JavaScript (archivos `.jsx`).

## Qué se puede hacer

La app tiene tres tipos de cuenta, cada uno con su propio recorrido:

- **Cliente:** explora el catálogo (con filtros), mira el detalle de un plato, arma su cesta, elige un domicilio y confirma el pedido, lo paga, sigue su estado y deja una reseña cuando se lo entregan.
- **Chef:** publica, edita, pausa y elimina sus platos (con imágenes por URL o subidas desde su equipo), maneja su stock y sus descuentos, y avanza los pedidos que le tocan (Recibido, Cocinando, En camino, Entregado).
- **Administrador:** aprueba o rechaza los pagos de los clientes, crea cuentas con el rol que quiera, edita el nombre, el apellido, el correo y el rol de cualquier usuario, y crea, edita y elimina las categorías de los platos.

Las tres cuentas pueden ver y editar sus propios datos y cambiar su contraseña en **Mi perfil** (haciendo clic en su nombre del Header).

Un pedido no sale de «Pendiente de confirmación» hasta que el cliente lo paga y un administrador aprueba ese pago; recién entonces el chef puede empezar a prepararlo.

## Rutas

| Ruta                 | Vista                                        | Acceso  |
| -------------------- | -------------------------------------------- | ------- |
| `/`                  | Inicio                                       | Público |
| `/catalogo`          | Catálogo de platos                           | Público |
| `/plato/:id`         | Detalle del plato y sus reseñas              | Público |
| `/ingreso`           | Ingreso (login)                              | Público |
| `/registro`          | Registro (cliente o chef)                    | Público |
| `/cesta`             | Cesta                                        | Cliente |
| `/checkout`          | Elegir domicilio y confirmar el pedido       | Cliente |
| `/pedidos`           | Mis pedidos: seguimiento, pago y reseñas     | Cliente |
| `/mis-publicaciones` | Platos del chef: stock, descuento, eliminar  | Chef    |
| `/publicar`          | Publicar un plato nuevo                      | Chef    |
| `/publicar/:id`      | Editar un plato                              | Chef    |
| `/pedidos-recibidos` | Pedidos que le tocan al chef                 | Chef    |
| `/admin`             | Administración de pagos, usuarios y categorías | Admin |
| `/perfil`            | Mi perfil: ver y editar nombre, apellido y correo | Cliente, Chef, Admin |
| cualquier otra       | Página no encontrada (404)                   | Público |

`/ingreso` y `/registro` se muestran a pantalla completa, sin Header ni Footer. Las rutas privadas redirigen a `/ingreso` si no hay sesión, y al inicio si el rol no corresponde.

## Estructura de `src/`

- `views/`: una vista por pantalla; tiene el estado y las llamadas a la API.
- `components/`: piezas de interfaz reutilizables (Header, PlatoCard, Dialog, etc.), ordenadas en subcarpetas por dominio: `comunes/`, `layout/`, `platos/`, `cesta/`, `pedidos/`, `chef/`, `auth/` y `admin/`. Solo reciben props y avisan hacia arriba: no hacen llamadas a la API.
- `components/Redux/`: el store y un slice por dominio (ver la sección siguiente). Es la única parte que usa Axios.
- `App.jsx` y `main.jsx`: punto de entrada. `main.jsx` envuelve la app con `Provider` (Redux) y `BrowserRouter`; `App.jsx` define las rutas y guarda el estado que todavía no migró a Redux (cesta y avisos).

## Redux (3.ª entrega)

Redux Toolkit maneja la sesión y los GET públicos. Cada slice está en `src/components/Redux/` con su thunk (`createAsyncThunk` + Axios) y guarda `items`, `loading` y `error`. Las vistas despachan el thunk en un `useEffect` y leen el resultado con `useSelector`.

| Slice (`state.<clave>`) | Qué guarda | Thunks |
| ----------------------- | ---------- | ------ |
| `auth` | Sesión: `user`, `token`, `isAuthenticated`, `loading`, `error` | `login`, `register` y el reducer `logout` |
| `platos` | Lista de platos (con filtros), plato del detalle y plato recomendado de la portada | `fetchPlatos`, `fetchPlatoById`, `fetchPlatoRecomendado` |
| `categorias` | Categorías de los platos | `fetchCategorias` |
| `ingredientes` | Ingredientes para armar un plato | `fetchIngredientes` |
| `resenas` | Reseñas de un plato o todas (perfil del chef) | `fetchResenasByPlato`, `fetchResenas` |

Todavía **no** están en Redux y siguen con `fetch` en la vista o en `App.jsx`: la cesta, los avisos (Toast), todas las escrituras (POST, PUT, PATCH y DELETE) y los GET privados (pedidos, pagos, domicilios, perfil, administración y perfiles de chef). El panel de categorías de `Admin` tampoco, porque las modifica con escrituras.

## Ejecución local

Este repositorio es solo el Front-End: **necesita el backend corriendo** para funcionar.

1. **Backend:** levantar el proyecto Spring Boot (con su base de datos MySQL) en `http://localhost:4002`. Su contrato está en [ENDPOINTS.md](ENDPOINTS.md).
2. **Variables de entorno:** copiar `.env.example` como `.env` (no se sube al repositorio). Por defecto apunta a `http://localhost:4002`:

   ```bash
   cp .env.example .env        # en Windows (cmd): copy .env.example .env
   ```

3. **Instalar y ejecutar**, con Node.js y npm instalados, desde la raíz del proyecto:

   ```bash
   npm install
   npm run dev
   ```

4. Abrir **`http://localhost:5173`**. El backend solo permite pedidos desde ese origen (CORS): si Vite usa otro puerto porque el 5173 está ocupado, la app no va a poder conectarse. En ese caso hay que cerrar el otro servidor.

Si cambiás el `.env`, reiniciá `npm run dev`.

### Otros comandos

```bash
npm run build    # Genera la versión de producción
npm run preview  # Permite previsualizar la versión generada
npm run lint     # Revisa el código con ESLint
```

## Sesión

El login guarda el token JWT solo en el store de Redux (`state.auth`), sin `localStorage`, `sessionStorage` ni cookies. **Al recargar la página (F5) la sesión se pierde** y hay que volver a ingresar. Las rutas privadas mandan el token en `Authorization: Bearer`, y las públicas no lo mandan. Si el backend responde 401 en una ruta privada, se despacha `logout` y se pide ingresar de nuevo. «Salir» también vacía la cesta.

## Limitaciones conocidas del backend

Cosas que el front resuelve como puede mientras el backend no las ofrezca (están marcadas como `TODO(backend)` en el código):

- Los platos, los perfiles de chef y los ítems de la cesta no traen el nombre del chef; las reseñas no traen el nombre del autor.
- No hay un administrador inicial: hay que cargarlo a mano en la base de datos.
- Las imágenes subidas por archivo no se borran del disco del backend al quitarlas o eliminar el plato, y no hay límite de imágenes por plato.

## Integrantes del grupo

- Daniel Vidal.
- Martin Garcia Kurilkowich.
- Nehuen Zaloaga.
