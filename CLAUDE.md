# Appetitos — Front-End (TPO Aplicaciones Interactivas, 2.º cuatrimestre 2026)

> Este archivo lo lee cualquier agente que trabaje en este repo (Claude Code, Antigravity u otro). Es la fuente de verdad de las reglas del proyecto. Si un prompt contradice algo de acá, **avisá antes de hacerlo**.

## 1. Contexto

- **Appetitos** es un e-commerce gastronómico. Este repo es solo el **front-end**: React + Vite, JavaScript (`.jsx`), Tailwind **v3**.
- El backend (Spring Boot + MySQL) está en **otro repo** y corre en `http://localhost:4002`. Su contrato está en `ENDPOINTS.md` (copia en la raíz de este repo). **Leelo antes de tocar cualquier cosa que llame a la API.**
- **2.ª entrega: 26/10/2026** (conexión front-back; nota 8). **3.ª entrega: lunes 30/11/2026**: rediseño con **Redux Toolkit** (clases del 2/11 y 9/11).
- Esta repo, **`FoodMarket-Redux`**, es la de la 3.ª entrega (una repo por entrega): arrancó como copia de `FoodMarket-FrontEnd`, con sus 211 commits de historia. La repo de la 2.ª entrega no se toca.
- **Alcance de Redux por ahora: los GET y la sesión (JWT).** Las escrituras (POST, PUT, PATCH, DELETE) y los GET privados siguen como en la 2.ª entrega hasta que se avise otra cosa.
- **Fuentes de verdad para Redux, en este orden:** (1) la demo **Redux II** de la profesora (store, `postSlice` con GET, POST y PUT, y los componentes `PostList`, `PostCard`, `PostForm`, `EditPostForm` y `LatestPost`); (2) sus capturas de clase y los apuntes de Redux I; (3) sus 5 PDFs (Redux, Redux Toolkit, Middleware, Integración React-Redux y Slice con Redux Toolkit); (4) el código de FelsaniMotors (un alumno que cursó antes con la misma profesora). Si dos fuentes se contradicen, gana la de número menor.
- Quien programa es estudiante y aprende haciendo: aplicá la sección 2.

## 2. Cómo trabajar conmigo (modo mentor)

- Un paso chico por vez. Al terminar cada sub-paso: **frená**, explicame qué cambiaste y por qué, y esperá mi "seguí".
- Antes de escribir código con un concepto nuevo, explicalo en pocas líneas (qué es, para qué sirve, cómo se usa acá). Después del código, explicá línea por línea lo que sea nuevo.
- Español rioplatense (voseo), tono de mentor, sin vueltas.
- **Comentarios en español dentro del código, cortos**: encabezado del archivo (1-2 líneas), 1-2 líneas por función o handler, y las props en una sola línea. Solo el "por qué" no obvio; nada de explicar conceptos de React o JavaScript que ya se vieron en clase. En JSX: `{/* ... */}`.
- Si falta información (un endpoint, un campo, una decisión de la sección 4), **no inventes**: frená y preguntame.
- Un commit por sub-paso, con mensaje claro. Corré `npm run lint` y `npm run build` antes de commitear.
- No toques archivos fuera del paso pedido. No instales dependencias ni crees carpetas sin avisar y explicar para qué.
- **Código al estilo de la profesora (3.ª entrega):** simple y parecido a su demo. Nada de abstracciones, APIs de Redux ni patrones que ella no haya mostrado (lista en 3.12). Que el código parezca escrito por alguien del curso, no por una IA.

## 3. Reglas de la profesora (obligatorias)

### 3.1 Estructura

- Solo JavaScript (`.jsx`). Nada de TypeScript.
- `src/` contiene **solo** `views/` y `components/`; `App.jsx` y `main.jsx` quedan afuera (más los `index.css`, `App.css` y `assets/` que ya existen). **Sin otras carpetas** en `src/`: nada de `services/`, `hooks/`, `utils/`, `context/`, `redux/` ni `features/` (criterio del equipo, ver 3.11). Dentro de `components/` sí hay subcarpetas por dominio (ver sección 8). **Redux vive en `src/components/Redux/`** (carpeta plana: `store.js` y un `xSlice.js` por dominio, sin subcarpeta `slices/`), igual que en la demo de la profesora.
- No tocar `index.html`. `main.jsx` solo se toca para envolver `<App />` con `<Provider store={store}>` y `<BrowserRouter>` y configurar sus props (decisión #2, 24/10; `BrowserRouter` lleva `useTransitions={false}` para que "Salir" desde una ruta privada llegue a `/` y no a `/ingreso`); `Routes` y `Route` van en `App.jsx`. Las fuentes se importan en `index.css`.
- Front y back son dos repos. Nunca subir `node_modules` ni `.env`.
- Una sola librería de estilos: **Tailwind v3**. No agregar otra.

### 3.2 Prohibido

- `document.*` (manipulación del DOM), cualquier `window.*`, `alert()`, `confirm()`, `prompt()`. Modales, confirmaciones, toasts y mensajes se hacen **con estado de React**. El `alert()` lo prohibió la profesora de forma explícita el 28/09 ("prohibido usar los alerts de Windows") y pidió un modal en su lugar; `confirm()` y `prompt()` caen en la prohibición de `window.*`.
- **`localStorage` está TOTALMENTE prohibido en la 3.ª entrega** (la profesora lo había permitido solo para la 2.ª; usarlo es motivo de desaprobación). Por criterio del equipo tampoco `sessionStorage` ni cookies. **No hay ninguna excepción**: el JWT vive solo en el store de Redux (`state.auth`) y se pierde al recargar (F5); está aceptado.
- `forEach`, `for` y `while` para renderizar; `==`; `var` y `let` (todo `const`).

### 3.3 Estilo de código

- Siempre `const` (la profesora: "todo es `const` hasta que se demuestre lo contrario"), siempre `===`.
- Hooks permitidos: `useState`, `useEffect`, los de Router (`useNavigate`, `useLocation`, `useParams`) y los de Redux (`useDispatch`, `useSelector`). Nada de `useRef`, `useMemo`, `useCallback`, `useContext` ni hooks propios hasta que se vean en clase.
- Los hooks van solo en componentes funcionales, nunca dentro de condicionales ni bucles.

### 3.4 Componentes y vistas

- Un componente es una función con nombre en mayúscula **igual al archivo** (`PlatoCard.jsx` → `function PlatoCard`), devuelve JSX con un único padre o fragment `<>...</>` y termina con `export default`.
- Una sola funcionalidad por componente, reutilizable.
- **Vista** (`views/`): se asocia a una ruta, tiene el estado y los handlers. **Componente** (`components/`): pieza de interfaz.

### 3.5 Listas

- Siempre `.map()` (el callback recibe valor e índice), con `key` única (el id; el índice solo si no hay id).
- `filter` y `find` poco: el backend filtra. `find` por id solo si no hay endpoint. Excepción: actualizar el estado local después de DELETE/PUT (3.9).

### 3.6 Formularios

- `input` + `label` + botón, controlados con `useState`, leyendo el valor con `event.target` (`value`, `name`). Los errores de validación van en estado y se muestran junto al campo.

### 3.7 Flujo de datos unidireccional

- **Lo que ya está en Redux** (sesión, platos, categorías, ingredientes, reseñas) vive en el **store**. La vista **o el componente** que lo necesita lo lee con `useSelector` y dispara el thunk con `useDispatch`: la profesora conecta componentes como `PostForm` y `PostList` directo al store, sin pasar todo por props desde la vista.
- Los componentes de UI pura y reutilizables (`Button`, `PlatoCard`, `OrderCard`, ...) siguen "tontos": reciben props, renderizan y emiten eventos hacia arriba (`onAdd`, `onRemove`, ...). **Ningún componente hace `fetch` ni `axios`**: las llamadas viven en los slices.
- **Lo que todavía no migró** (cesta, aviso/toast, escrituras, GET privados) sigue como en la 2.ª entrega: el padre (vista o `App.jsx`) tiene el estado, los `fetch` y los handlers, y los pasa por props. El `token` de esas llamadas se lee del store.
- Estado local (`useState`) solo para UI propia (ej: si algo está abierto, `isEditing`) y para los campos de un formulario.
- **Sin Context**: Redux lo reemplaza.

### 3.8 Rutas (React Router)

- `Routes` y `Route` en `App.jsx`. `Link to="..."` para enlaces. `useNavigate` para navegar desde un handler (ej: después del login). `useParams` para `:id`. `useLocation` para volver a la ruta previa después del login.
- Nunca `window.location`.

### 3.9 Conexión con el backend (clase del 5/10; Redux en 3.12)

- **GET públicos y sesión (migrados a Redux, 3.ª entrega)**: `createAsyncThunk` + **Axios** dentro de `components/Redux/xSlice.js`. La vista hace `dispatch(fetchX())` en un `useEffect` y lee con `useSelector` (ver 3.12).
- **Todo lo demás todavía no migrado** (escrituras, GET privados): `fetch` nativo con promesas `.then()` / `.catch()`, como en la 2.ª entrega. Axios solo se usa dentro de los slices. Cuando se migre algo, se avisa.
- **GET con `fetch` (los que no se migraron)**: dentro de `useEffect` con array de dependencias (`[]`, o `[id]` / los filtros si cambian). El resultado se guarda con `useState`.
- **POST, PUT, PATCH y DELETE**: dentro del **handler del evento** (submit, click). **Nunca en `useEffect`.**
- Nunca poner en las dependencias de un efecto el mismo estado que ese efecto modifica (se crea un bucle).
- `fetch` **no** manda los errores HTTP (400, 401, 403, 404, 500) al `.catch()`: hay que comprobar `response.ok` y lanzar un error con el `message` del backend.
- URLs completas con protocolo: `const API_URL = import.meta.env.VITE_API_URL` y `${API_URL}/platos`. Las cabeceras van en `headers` (plural).
- Después de crear, editar o borrar, **actualizar el estado local con lo que devuelve el backend**. **Prohibido volver a pedir toda la colección con otro GET** (la profesora lo evalúa negativamente).

  | Operación   | Actualización del estado (después de confirmar el éxito)                     |
  | ----------- | ---------------------------------------------------------------------------- |
  | POST        | `setX((actuales) => [...actuales, creado])`                                  |
  | PUT / PATCH | `setX((actuales) => actuales.map((x) => x.id === editado.id ? editado : x))` |
  | DELETE      | `setX((actuales) => actuales.filter((x) => x.id !== idBorrado))`             |

- **Sesión (JWT)**
  - **La sesión vive en `authSlice`** (`state.auth`: `user`, `token`, `isAuthenticated`, `loading`, `error`). **Cero `localStorage`.**
  - Login: el thunk `login` hace `POST /api/v1/auth/authenticate` y guarda `data.access_token` (**no** `data.token`), `data.userId` y `data.role` en el store. Después se pide `GET /users/me` (con el token) para completar el usuario (`nombre`, etc.).
  - **No se restaura la sesión al recargar**: F5 la pierde y el usuario vuelve a ingresar (aceptado). Por eso desaparecen `cargandoSesion` y el efecto que llamaba a `GET /users/me` al iniciar.
  - Rutas privadas: header `Authorization: Bearer ${token}`, con el token tomado del store. Rutas públicas (catálogo, detalle, categorías, reseñas): **no mandar el token**, porque uno vencido da 401 incluso en rutas públicas.
  - El rol **no** viene dentro del JWT: se usa el `role` de la respuesta de login.
  - 401 en ruta privada → `dispatch(logout())` y `navigate('/ingreso')` (por defecto, pendiente de confirmar: decisión #10). 403 → mensaje de falta de permisos.
  - Logout: el reducer `logout` deja `state.auth` en su estado inicial, y se limpia también la cesta. **Nunca** borrar el token al desmontar una vista (desmontar no es cerrar sesión).
  - React Strict Mode ejecuta los efectos dos veces en desarrollo: es inofensivo para los GET (en Redux se ven dos `pending`/`fulfilled` en DevTools) y es la razón por la que los POST nunca van en efectos.

### 3.10 Qué evalúa la profesora

- Estructura y modularización: vistas con su función de vista, componentes con una responsabilidad, uso correcto de hooks y estado local actualizado **sin GET repetidos**.

### 3.11 De dónde sale cada regla (revisado el 25/10 contra las clases del 14/09, 21/09, 28/09 y 5/10, el PDF de renderizado condicional y los apuntes)

- **Lo dijo la profesora:** nada de `document.*` ni `window.*`; `alert()` prohibido (28/09); `.map()` en lugar de `forEach` y `for` (28/09); `===` siempre (14/09); todo `const` (primeras clases); solo JavaScript; `views/` y `components/` con `App.jsx` y `main.jsx` afuera; componente = función con el nombre del archivo, un solo padre y `export default`; flujo de datos de padre a hijo; formularios con `input`, `label` y botón; GET en `useEffect` y **sin GET repetido** después de escribir; `fetch` con promesas; `localStorage` para el JWT solo en la 2.ª entrega (en la 3.ª, prohibido); front y back en repos separados; la 2.ª entrega tiene que estar completa y conectada; en la 3.ª se refactoriza todo con Redux.
- **Criterio del equipo (la profesora no lo dijo en las clases revisadas):** sin `services/`, `hooks/`, `utils/` ni `context/`, y sin Context API; sin `while` ni `let`/`var` (salvo que se derive de "todo `const`"); la lista exacta de hooks permitidos y "sin hooks propios" (ella los va incorporando de a poco: `useState` el 28/09, `useEffect` y los de Router el 5/10); los POST, PUT y DELETE en el handler y no en un efecto (su ejemplo del 5/10 los pone en un efecto y duplica registros: es un bug que corregimos); comprobar `response.ok`; el estado en la vista o en `App.jsx` (en su ejemplo del 28/09 vive en un componente padre, `Form`); `main.jsx` con `BrowserRouter` y `useTransitions={false}` (ella también pone el `BrowserRouter` ahí).
- **Si preguntan por qué no usamos `services/` o Context:** en su demo el `fetch` está en el componente que pide los datos; nunca los enseñó; y va a refactorizar todo a Redux, así que serían trabajo que se tira. Lo que dijo que evalúa es estructura y modularización, uso correcto de hooks y estado local sin GET repetidos.
- **Redux (clases del 2/11 y 9/11; revisado el 15/11 contra los apuntes, la demo Redux II, los 5 PDFs y un trabajo de otro alumno con la misma profesora):** Redux Toolkit; `configureStore`, `createSlice` y `createAsyncThunk` con `extraReducers`; Axios en los thunks; carpeta `src/components/Redux/` con `store.js` y un slice por dominio; `Provider` en `main.jsx`; componentes conectados directo al store; `useState` local para UI; `localStorage` prohibido para el JWT. **Criterio del equipo:** nada de `try/catch` salvo en `login` y `register` (ver 3.12), sin `redux` ni `redux-thunk` sueltos, y la sesión en un slice aparte de la entidad usuarios.

### 3.12 Redux Toolkit (3.ª entrega)

> Escribí el código como el de la profesora: simple y directo, sin abstracciones extra. Las llamadas a la API van **dentro del slice**; nada de `services/` ni helpers compartidos.

- **Dependencias:** `@reduxjs/toolkit`, `react-redux` y `axios`. No instalar `redux` ni `redux-thunk` (ya vienen dentro de RTK). Avisar antes de instalar.
- **Carpeta:** `src/components/Redux/` con `store.js` y un archivo por dominio: `authSlice.js`, `platosSlice.js`, `categoriasSlice.js`, `ingredientesSlice.js`, `resenasSlice.js`, `subpedidosSlice.js` (más adelante `usuariosSlice.js`). **Un slice por dominio; el thunk va en el mismo archivo.**
- **Forma del slice:** `name` del dominio, `initialState: { items: [], loading: false, error: null }`, `reducers: {}` (vacío si no hay acciones síncronas) y `extraReducers` con `builder.addCase(thunk.pending | fulfilled | rejected)`. `pending` → `loading = true` y `error = null`; `fulfilled` → `loading = false` y `items = action.payload`; `rejected` → `loading = false` y `error = action.error.message`. Mutar el state **solo dentro de un reducer** (Immer lo permite ahí y en ningún otro lado).
- **Thunks al estilo de la profesora:** `createAsyncThunk("dominio/accion", async (arg) => { const { data: cuerpo } = await axios.get(...); return cuerpo.data ?? []; })`. **Sin `try/catch`.** Siempre se llama con paréntesis: `dispatch(fetchPlatos())`.
- **Excepción (decisión #7):** `login` y `register` usan `try/catch` y `rejectWithValue(error.response?.data?.message)`, y su `rejected` guarda `state.error = action.payload`, para mostrar el mensaje del backend (credenciales inválidas, usuario duplicado = 400).
- **Respuesta del backend:** llega como `{ success, message, data }`. El thunk devuelve `cuerpo.data`; las listas vacías llegan con `data: null` → `?? []`.
- **Rutas públicas sin token.** Los filtros de `GET /platos` van en `params` de Axios (`axios.get(url, { params: filtros })`).
- **En la vista o el componente:** `const dispatch = useDispatch()`, `const { items, loading, error } = useSelector((state) => state.platos)` y `useEffect(() => { dispatch(fetchPlatos(filtros)); }, [dispatch, filtros])`. Se despacha en cada montaje, como en la demo. `ContenidoAsync` sigue resolviendo cargando / error / vacío (o `if (loading) return ...` / `if (error) return ...` antes del `return`).
- **Dependencias del `useEffect`:** valores simples (`nombre`, `categoriaId`) o un objeto que viva en un `useState`; **nunca un objeto armado en cada render** (se vuelve a despachar sin parar).
- **Un dato no vive a la vez en Redux y en un `useState`:** al migrar un GET se borran el `useState` y el `fetch` de esa vista.
- **Escrituras en Redux (cuando se pidan):** el patrón de la profesora, solo con `fulfilled`: crear → `[...state.items, action.payload]`; editar → `findIndex` + `state.items[index] = action.payload`; borrar → `filter` por id. Sin volver a pedir la lista. En la demo el formulario hace `dispatch(createPosts({ title, body }))` **sin `await` ni `.unwrap()`** y se limpia al instante.
- **Cuidado con `loading`:** `PostList` devuelve "Cargando..." apenas `loading` es `true`. Una escritura no debe prender el mismo `loading` de la lista, o la lista y el formulario desaparecen mientras se guarda.
- **Qué NO usar (la profesora no lo mostró):** `createSelector`, `createEntityAdapter`, RTK Query, `createListenerMiddleware`, hooks tipados, `.unwrap()`, `rejectWithValue` fuera de `login` y `register`, archivos de selectores, subcarpetas dentro de `components/Redux/`, lógica dentro de `reducers: {}` (salvo `logout`), `redux` o `redux-thunk` sueltos y `useMemo`. Si hace falta alguno, **preguntá primero**. Los thunks escritos a mano (`(dispatch) => ...`) aparecen en un ejemplo de sus PDFs, pero sus demos usan `createAsyncThunk`: usamos `createAsyncThunk`.
- **Alcance de la primera migración:** la sesión y los GET públicos (`GET /platos`, `GET /platos/{id}` en el campo `platoActual`, `GET /categories`, `GET /ingredientes`, `GET /resenas/plato/{id}`). `GET /carrito`, `/domicilios` y `/orders`, y "mis platos" del chef **no se migran todavía**: se modifican con escrituras locales y quedarían la misma lista en Redux y en `useState` (decisión #14). **Excepciones de los pasos 17 y 18:** `deleteResena` (escritura, en `resenasSlice`, con `filter` por id en `fulfilled`, decisión #11) y `fetchSubpedidosChef` (GET privado, token y userId por argumento, en `subpedidosSlice`, solo para el dashboard: `PedidosRecibidos` sigue con su `fetch` y su `useState`, y el dashboard vuelve a pedir los datos cada vez que se abre).
- **`authSlice` ≠ `usuariosSlice`:** `authSlice` es la sesión (quién está logueado, token, rol). `usuariosSlice` será la entidad usuarios del panel Admin (se crea cuando se migre). Si el usuario edita su propio perfil, `authSlice` escucha el thunk de `usuariosSlice` en su `extraReducers`.
- **Verificación obligatoria:** abrir Redux DevTools y comprobar `@@INIT`, `<dominio>/<accion>/pending` y `/fulfilled` (o `/rejected` con el backend caído) antes de dar un paso por terminado.

## 4. Decisiones (pendientes de confirmar con la profesora, salvo las marcadas como resueltas)

Mientras no responda, se usa el comportamiento por defecto. Cada decisión tiene que quedar aislada para cambiarla fácil.

| #   | Duda                                                                                                                        | Por defecto                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `localStorage` para el JWT. En la 2.ª entrega se permitió; **en la 3.ª está totalmente prohibido** | **Resuelta.** Cero `localStorage` (y por criterio, tampoco `sessionStorage` ni cookies). El token vive solo en `state.auth` y se pierde con F5. Hay que borrar los 8 usos que hereda esta repo de `App.jsx` (paso 15.2). |
| 2   | `BrowserRouter` en `main.jsx` (clase del 5/10) o en `App.jsx` (notas anteriores)                                            | **Decidido (24/10): en `main.jsx`**, como en la demo de la profesora. Es el único cambio permitido en ese archivo (más las props del router).                                                                                       |
| 3   | ¿Un archivo compartido para las llamadas a la API?                                                                          | No: Axios dentro de cada slice (lo migrado) y `fetch` directo en cada vista o handler (lo que todavía no migró), con las plantillas de la sección 6.                                                    |
| 4   | Context API                                                                                                                 | No usar: lo reemplaza Redux.                                                                                                                                                                             |
| 5   | Paginación y orden (la API no los tiene)                                                                                    | `slice` y `sort` en la vista.                                                                                                                                                                            |
| 6   | `PortionPicker` (no existe en el backend)                                                                                   | Sacarlo de `DetallePlato`, sin borrar el archivo.                                                                                                                                                        |
| 7   | Manejo de errores en los thunks                                                                                             | **Decidido (opción B):** estilo de la profesora (sin `try/catch`, `state.error = action.error.message`) en todos, salvo `login` y `register`, que usan `rejectWithValue` para mostrar el mensaje del backend.      |
| 8   | Carpeta de Redux                                                                                                            | **Decidido:** `src/components/Redux/`, plana (sin `slices/`), como la demo de la profesora y respetando "`src/` solo `views/` y `components/`".                                                          |
| 9   | Axios                                                                                                                       | **Resuelta:** válido (lo usa la profesora, otro alumno y el PDF). Solo dentro de los slices.                                                                                                              |
| 10  | 401 en una ruta privada                                                                                                     | `dispatch(logout())` y `navigate('/ingreso')`. **Pendiente de confirmar.**                                                                                                                                |
| 11  | Borrar un recurso en Redux (no se vio en clase)                                                                             | `filter` por id dentro de `fulfilled`. **Pendiente de confirmar.**                                                                                                                                        |
| 12  | `useMemo` (la profesora todavía no lo dio)                                                                                  | No usar.                                                                                                                                                                                                  |
| 13  | Qué pasa con la sesión al recargar (F5)                                                                                     | **Resuelta:** se pierde y se vuelve a ingresar. No se guarda el token en ningún lado.                                                                                                                     |
| 14  | Qué GET migrar además de la sesión (¿los privados?)                                                                         | Solo los públicos y los que no se modifican desde el cliente (ver 3.12). **Pendiente de confirmar.**                                                                                                      |
| 15  | Registro: ¿deja la sesión iniciada?                                                                                         | `ENDPOINTS.md` dice que `register` también devuelve `access_token`, `userId` y `role`. Mantener lo que hace hoy `Registro.jsx` y verificarlo antes de escribir el thunk.                                  |

## 5. Contrato con el backend (resumen; manda `ENDPOINTS.md`)

- URL base `http://localhost:4002`. Sin prefijo global; solo auth usa `/api/v1/auth/...`.
- Toda respuesta (éxito y error) llega como `{ success, message, data }`. Se lee `cuerpo.data`; en error se muestra `cuerpo.message`.
- Las listas vacías llegan con `data: null` → tratar como `data ?? []`.
- Roles: `CLIENTE`, `CHEF`, `ADMIN`. El registro público solo permite `CLIENTE` o `CHEF` (`tipoCuenta`).
- Login por **username** (no email). Contraseña de al menos 8 caracteres; username de 3 a 50.
- Usuario duplicado = HTTP 400 (no 409). Reseña duplicada, estados inválidos y stock en conflicto = 409.
- Las fechas son ISO sin zona (`2026-10-19T14:30:00`); los importes son números.
- No hay paginación ni orden. Filtros de `GET /platos`: `nombre`, `categoriaId`, `precioMin`, `precioMax`.
- Las imágenes son URLs (`imagenesUrls: string[]`). Desde el 24/10 también se pueden subir por archivo con `POST /platos/{id}/imagenes` (multipart, campo `file`); el backend devuelve el plato con la URL absoluta nueva.
- Nuevos desde el 24/10 (ver `ENDPOINTS.md`): `GET /platos/mis-platos` (CHEF, todos los estados), `GET /platos/{id}` visible para el dueño aunque esté en `BORRADOR`/`PAUSADO`, `PUT /users/me/password`, `PATCH /users/{userId}/role` (ADMIN) y mensajes distintos en `DELETE /platos/{id}` ("Plato eliminado" / "Plato pausado porque tiene historial").
- Estados de pedido y subpedido: `PENDIENTE`, `CONFIRMADO`, `EN_PREPARACION`, `ENVIADO`, `ENTREGADO`, `CANCELADO`. Mapeo del seguimiento: `PENDIENTE` = "Pendiente de confirmación", `CONFIRMADO` = Recibido, `EN_PREPARACION` = Cocinando, `ENVIADO` = En camino, `ENTREGADO` = Entregado. "Cancelar" solo si el estado es `PENDIENTE`.
- Estados de plato: `BORRADOR`, `PUBLICADO`, `AGOTADO`, `PAUSADO` (`AGOTADO` lo calcula el backend). `DELETE /platos/{id}` borra o **pausa** si tiene historial.
- Unidades de medida: `GRAMOS` = g, `KILOGRAMOS` = kg, `MILILITROS` = ml, `LITROS` = l, `UNIDAD` = u.
- Cesta en el servidor, solo `CLIENTE`. El checkout necesita un `domicilioEntregaId` y descuenta el stock al crear el pedido. El pago (`/pagos`) es opcional y lo aprueba un ADMIN.

| Vista                        | Endpoints                                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home / Catálogo              | `GET /platos` (con filtros), `GET /categories`                                                                                                           |
| Detalle                      | `GET /platos/{id}`, `GET /resenas/plato/{id}`                                                                                                            |
| Ingreso / Registro / sesión  | `POST /api/v1/auth/authenticate`, `POST /api/v1/auth/register`, `GET /users/me`                                                                          |
| Cesta                        | `GET /carrito`, `POST /carrito/items`, `PUT` y `DELETE /carrito/items/{itemId}`, `DELETE /carrito`                                                       |
| Checkout                     | `GET /domicilios`, `POST /domicilios/createDomicilio`, `POST /carrito/checkout`                                                                          |
| Mis pedidos                  | `GET /orders`, `PATCH /orders/{id}/cancelar`, `POST /resenas/createResena`                                                                               |
| Publicar / Mis publicaciones | `POST /platos/createPlato`, `PUT /platos/{id}`, `DELETE /platos/{id}`, `PATCH` y `DELETE /platos/{id}/descuento`, `GET /categories`, `GET /ingredientes` |
| Admin / categorías           | `GET /categories` (pública, sin token), `POST /categories/createCategory`, `PUT /categories/{id}`, `DELETE /categories/{id}` (las tres, ADMIN; el campo es `description`) |

**Dependencias del backend (resueltas en el paso 19).** El contrato vigente es `ENDPOINTS-CAMBIOS.md`, que manda sobre `ENDPOINTS.md`. Si falta algo, dejá un placeholder con un comentario `TODO(backend)` y listalo al terminar el paso:

- ~~CORS para `http://localhost:5173`~~ (**ya está**).
- ~~Datos semilla de categorías e ingredientes; un ADMIN inicial~~ (**ya está**, por variables de entorno del backend).
- ~~Listar "mis platos" del chef en todos los estados y `GET /platos/{id}` visible para el dueño~~ (**ya está, 24/10**). ~~El `PATCH` de stock y de estado~~ (**ya está, paso 19.7**).
- ~~`chefNombre` en los platos y en el perfil del chef; `imagenUrl`, `stockDisponible` y `chefNombre` en los ítems del carrito; `clienteNombre` en las reseñas~~ (**ya están, paso 19**).
- ~~Que `DELETE /platos/{id}` informe si el plato quedó borrado o pausado~~ (**ya está**: lo dice el `message`).

## 6. Plantillas de código aprobadas

### 6.1 Redux Toolkit (3.ª entrega: GET y sesión)

> Se copian los nombres y la forma de la demo de la profesora (`items`, `loading`, `error`, `extraReducers` con `builder`). Comentarios cortos, solo el "por qué".

**`components/Redux/store.js`**

```js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import platosReducer from "./platosSlice";

export const store = configureStore({
  reducer: { auth: authReducer, platos: platosReducer },
});
```

**`main.jsx`** (solo se agrega el `Provider`; el resto queda igual)

```jsx
<StrictMode>
  <Provider store={store}>
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </Provider>
</StrictMode>
```

**`components/Redux/platosSlice.js`** (GET público con filtros y detalle)

```js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPlatos = createAsyncThunk(
  "platos/fetchPlatos",
  async (filtros) => {
    const { data: cuerpo } = await axios.get(`${API_URL}/platos`, {
      params: filtros,
    });
    return cuerpo.data ?? []; // lista vacía llega como null
  },
);

export const fetchPlatoById = createAsyncThunk(
  "platos/fetchPlatoById",
  async (id) => {
    const { data: cuerpo } = await axios.get(`${API_URL}/platos/${id}`);
    return cuerpo.data;
  },
);

const platosSlice = createSlice({
  name: "platos",
  initialState: { items: [], platoActual: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPlatos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPlatoById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.platoActual = null; // evita mostrar el plato anterior
      })
      .addCase(fetchPlatoById.fulfilled, (state, action) => {
        state.loading = false;
        state.platoActual = action.payload;
      })
      .addCase(fetchPlatoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default platosSlice.reducer;
```

**`components/Redux/authSlice.js`** (sesión; única excepción con `try/catch`)

```js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credenciales, { rejectWithValue }) => {
    try {
      const { data: auth } = await axios.post(
        `${API_URL}/api/v1/auth/authenticate`,
        credenciales,
      );
      const { access_token, userId, role } = auth.data; // access_token, no token
      // El rol no viene en el JWT: se completa el usuario con GET /users/me
      const { data: me } = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      return { token: access_token, user: { ...me.data, userId, role } };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ?? "No se pudo conectar con el servidor",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState, // sin localStorage: no hay nada más que borrar
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // mensaje del backend (rejectWithValue)
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

`register` sigue la misma forma que `login` (mismo `try/catch` y `rejectWithValue`, el usuario duplicado es 400). Antes de escribirlo, revisá en `Registro.jsx` y en `ENDPOINTS.md` qué hace hoy después del `POST` (si deja la sesión iniciada o manda a `/ingreso`) y mantené ese comportamiento.

**En una vista o componente**

```jsx
const dispatch = useDispatch();
const { items: platos, loading, error } = useSelector((state) => state.platos);

useEffect(() => {
  dispatch(fetchPlatos(filtros)); // se llama con paréntesis
}, [dispatch, filtros]);
```

**Ruta protegida por rol (`components/auth/RutaProtegida.jsx`)**

```jsx
function RutaProtegida({ rolesPermitidos, children }) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Guardamos la ruta de origen para volver después del login
  if (!isAuthenticated)
    return (
      <Navigate to="/ingreso" replace state={{ from: location.pathname }} />
    );
  if (!rolesPermitidos.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
export default RutaProtegida;
```

Sin `cargandoSesion`: como la sesión no se restaura al recargar, no hay un estado intermedio de "verificando".

### 6.2 Con `fetch` (lo que todavía no migró a Redux)

> **Cómo se aplican hoy:** el bloque `response.json().then((cuerpo) => ...)` de las plantillas va definido **una sola vez** arriba de cada archivo como `const leerRespuesta = (response) => ...` y se usa como `.then(leerRespuesta)` en todos sus `fetch` (sin archivos compartidos: decisión #3). En `App.jsx` el `.catch` repetido de las escrituras también está en una función, `manejarFallo`. Excepciones a propósito: el `DELETE /platos/{id}` de `MisPublicaciones` lee `cuerpo.message` (no `data`) para saber si el plato se borró o quedó pausado, y el efecto de la cesta de `App` repite el 401 en línea porque `manejarFallo` no puede ir en sus dependencias.

**GET al montar la vista**

```jsx
const API_URL = import.meta.env.VITE_API_URL;

const [platos, setPlatos] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch(`${API_URL}/platos`)
    .then((response) =>
      // Leemos el cuerpo y recién ahí decidimos si fue éxito o error,
      // porque fetch NO manda los errores HTTP al .catch()
      response.json().then((cuerpo) => {
        if (!response.ok) {
          const fallo = new Error(cuerpo.message);
          fallo.status = response.status;
          throw fallo;
        }
        return cuerpo.data;
      }),
    )
    .then((data) => setPlatos(data ?? [])) // lista vacía llega como null
    .catch((fallo) => setError(fallo.message))
    .finally(() => setCargando(false));
}, []);
```

**Escritura dentro de un handler (nunca en un efecto)**

```jsx
const crearDomicilio = (datos) => {
  fetch(`${API_URL}/domicilios/createDomicilio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ruta privada
    },
    body: JSON.stringify(datos),
  })
    .then((response) =>
      response.json().then((cuerpo) => {
        if (!response.ok) {
          const fallo = new Error(cuerpo.message);
          fallo.status = response.status;
          throw fallo;
        }
        return cuerpo.data;
      }),
    )
    // Sumamos el recurso creado al estado: SIN volver a pedir la lista
    .then((creado) => setDomicilios((actuales) => [...actuales, creado]))
    .catch((fallo) => setError(fallo.message));
};
```

**Errores que NO hay que cometer (salen del ejemplo de clase)**

- Un POST dentro de `useEffect` con `[products]` como dependencia: se re-ejecuta y crea duplicados.
- Agregar `{data}` en lugar de `data` (envuelve el recurso en otro objeto) o usar `data.token` en vez de `data.access_token`.
- Escribir `header` en singular, o una URL sin `http://`.
- Asumir que `response.json()` devuelve un array, o saltear `response.ok`.
- Usar `localStorage` (o `sessionStorage`) para el token: en la 3.ª entrega desaprueba.
- Borrar el token al desmontar una vista.
- Mutar el state (`state.items.push(...)`) fuera de un reducer, o escribir `dispatch(fetchPlatos)` sin paréntesis.
- Poner un `fetch` o `axios` dentro de un componente en lugar de un slice, o instalar `redux` y `redux-thunk` aparte.
- Poner `try/catch` en todos los thunks: solo `login` y `register`.
- Usar `action.error.message` en `login` o `register`: ahí el mensaje está en `action.payload`.
- Olvidarse del `<Provider>` en `main.jsx`, o que la clave del store no coincida con el selector (`platos: ...` → `state.platos`).
- Dejar el mismo dato en Redux y en un `useState`, o poner en las dependencias del `useEffect` un objeto creado en cada render.
- Volver a pedir toda la lista después de cada escritura.

## 7. Diseño (Tailwind v3)

- Tokens y estilos base en `tailwind.config.js` e `index.css` (clases propias: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-quiet`, `.btn-sand`, `.btn-danger`, `.field`, `.chip`, `.badge-*`, `.qty`). **Los valores exactos están en esos archivos; no los inventes.**
- Paleta: verde oliva oscuro (primario), fondo crema `#fcf9f0`, acento terracota `#c46a4a`. Tipografías: Newsreader (títulos), Sora (interfaz), Fraunces (logo). Íconos Material Symbols Outlined.
- La carpeta `referencia-visual/` tiene los HTML del diseño: son **solo referencia visual y de estructura**, no son parte de la app y no se importan. Para armar una vista, leé el HTML correspondiente (ej: `detalle.html`) y convertilo a componentes JSX. Ignorá `referencia-visual/assets/app.js` (usa el DOM, está prohibido).
- Responsive: probar en ancho móvil y de escritorio.

## 8. Mapa de vistas y componentes

| Vista                               | Ruta                         | Acceso               |
| ----------------------------------- | ---------------------------- | -------------------- |
| Home                                | `/`                          | público              |
| Catalogo                            | `/catalogo`                  | público              |
| DetallePlato                        | `/plato/:id`                 | público              |
| Ingreso / Registro                  | `/ingreso`, `/registro`      | público              |
| Carrito (Cesta)                     | `/cesta`                     | CLIENTE              |
| Checkout                            | `/checkout`                  | CLIENTE              |
| MisPedidos                          | `/pedidos`                   | CLIENTE              |
| MisPublicaciones                    | `/mis-publicaciones`         | CHEF                 |
| PublicarPlato                       | `/publicar`, `/publicar/:id` | CHEF                 |
| Admin (usuarios, pagos, categorías y reseñas) | `/admin`           | ADMIN                |
| PedidosRecibidos                    | `/pedidos-recibidos`         | CHEF                 |
| Dashboard ("Mis ventas")             | `/dashboard`                 | CHEF                 |
| Perfil (el CHEF también edita su presentación) | `/perfil`         | CLIENTE, CHEF, ADMIN |
| PerfilChef (presentación, platos y reseñas del chef) | `/chef/:userId` | público              |
| NoEncontrado (404)                  | cualquier otra ruta (`*`)    | público              |

Componentes compartidos, en subcarpetas de `src/components/` (imports como `../components/comunes/Button`):

- `comunes/`: `Button`, `Dialog`, `Toast`, `FormField`, `EmptyState`, `LoadingState`, `ErrorState`, `ContenidoAsync` (resuelve cargando / error / vacío / datos con `children`), `Tabs`, `Pagination`, `Alert`.
- `layout/`: `Header` (con el globito de pedidos por atender del chef), `MenuMovil`, `Insignia`, `Footer`, `Logo`, `LogoCloche`, `Hero3D`, `FondoMesa`, `FondoFoto`.
- `platos/`: `PlatoCard`, `Gallery`, `IngredientTrace`, `IngredientRows`, `ReviewList` (con `onDelete` opcional: solo el ADMIN lo recibe), `PlatoRating` (promedio de estrellas; lee las reseñas del store), `CategoryChips`, `CategoryPicker`, `FilterChips`, `SearchBar`, `ChefCard`.
- `cesta/`: `CartItem`, `QuantityStepper` (controlado: el valor viene por props), `OrderSummary`, `DomicilioPicker`, `DomicilioForm`.
- `pedidos/`: `OrderCard`, `OrderTrack`, `SubPedidoCard`, `PedidosLista`, `ResenaDialog` (con el filtro de lenguaje ofensivo), `PagoDialog`, `MedioPagoSelect` (lo usan el checkout y `PagoDialog`).
- `chef/`: `PublicationRow` (con la etiqueta "Stock bajo"), `StatCard` y `BarChart` (del dashboard), `ImageUrlList`, `ImageFilePicker`, `ChefProfileForm` (formulario de la presentación del chef en `Perfil`; el estado y los `fetch` viven en `Perfil.jsx`).
- `auth/`: `RoleOption`, `RutaProtegida` (lee `state.auth` con `useSelector`), `PasswordForm` y `DatosCuentaForm` (de `Perfil`), `RegistroAside`.
- `Redux/` (3.ª entrega, carpeta plana): `store.js`, `authSlice.js`, `platosSlice.js`, `categoriasSlice.js`, `ingredientesSlice.js`, `resenasSlice.js` (con `deleteResena` y `fetchResenasByChef`), `subpedidosSlice.js` (dashboard del chef). Se crearon en los pasos 15 a 18; más adelante `usuariosSlice.js`.
- `admin/`: `CategoriasPanel`, `PagosPanel`, `UsuariosPanel`, `ResenasPanel` (una por pestaña de `Admin`), `UsuarioDetalleDialog` y `CategoriaEditDialog`. Solo dibujan: el estado, los `fetch` y los handlers viven en `Admin.jsx`.

## 9. Hoja de ruta

Prioridad: lo que pide el TPO (registro y login, catálogo, detalle, carrito y checkout, gestión de productos del vendedor, administración de cuentas) antes que los extras.

- [x] **1–10** Proyecto Vite, estructura, Tailwind + tokens, Logo/Button, PlatoCard, Header/Footer/rutas, Home + Catálogo, Detalle, Cesta (primero con `CartContext`, ya migrada a estado en `App.jsx` por props: si todavía existe `src/context/`, hay que borrarla), Ingreso + Registro.
- [x] **11** Mis pedidos (interfaz con datos de ejemplo): Tabs, OrderCard, OrderTrack, Dialog controlado por estado.
- [x] **11b (recortado por la fecha)** Solo esto, con datos de ejemplo: (a) Registro e Ingreso con los campos reales, (b) `RutaProtegida` por rol con `useLocation`, (c) `LoadingState` y `ErrorState` en las vistas, (d) vista `Checkout` con `DomicilioPicker` y `DomicilioForm`. Todo lo demás (forma de los datos, filtros, estados de pedido, vistas del chef) se hace directamente contra la API real.
- [x] **12 Conexión con el backend** (hecho y probado en el navegador con el backend real; el 400 de stock en el checkout se probó el 24/10 y el 401 de token vencido en las escrituras se probó simulando la respuesta):
  - [x] 12.1 `.env` + CORS funcionando; login y registro reales; guardar el JWT; restaurar sesión; logout.
  - [x] 12.2 Catálogo y detalle reales (GET, filtros por query params, categorías).
  - [x] 12.3 Cesta del servidor (POST/PUT/DELETE con estado local, sin re-GET; incluye vaciar con `DELETE /carrito`).
  - [x] 12.4 Checkout con domicilio → pedido (`GET /domicilios`, `POST createDomicilio`, `POST /carrito/checkout`).
  - [x] 12.5 Mis pedidos reales + cancelar (`GET /orders`, `PATCH /orders/{id}/cancelar`).
- [x] **13** Vistas del chef conectadas: Mis publicaciones, Publicar/editar (fotos como URLs, categorías e ingredientes desde los catálogos), eliminar, stock y descuento. Hecho con las limitaciones del backend de entonces: sin "mis platos" (la lista salía de `GET /platos` filtrado por `chefId`; **resuelto en el 3.2 del plan de mejoras**, hoy usa `GET /platos/mis-platos`) y sin `PATCH` de stock ni de estado (se usaba `PUT` con el plato completo; **resuelto en el paso 19.7**).
- [x] **14** Flujo completo de compra y extras (hecho). Para que un pedido salga de PENDIENTE hacen falta el pago del cliente, la aprobación de un ADMIN y que el chef avance el subpedido:
  - [x] 14a Pagos del cliente (`POST /pagos/createPago`, `GET /pagos`) en Mis pedidos.
  - [x] 14b Administración en `/admin`: pagos (aprobar, rechazar, reembolsar) y usuarios (listar y crear con rol; la API todavía no cambia roles). Incluye el componente `FormField`.
  - [x] 14c Pedidos recibidos del chef (`GET /subpedidos/chef/{userId}`, `PATCH /subpedidos/{id}/estado`).
  - [x] 14d Reseñas del cliente (`POST /resenas/createResena`) en pedidos entregados.
  - [x] 14e Perfil del chef en Inicio (`GET /chef-profiles`) y `src/data/` borrada (ya no quedan datos de ejemplo).
  - [x] 14f Hero de la home con 3D de CSS (`Hero3D`: perspectiva, capas y animación, sin librerías ni `useRef`; un render 3D real con three.js queda fuera de las reglas).
- [x] **Plan de mejoras previo a la exposición** (`PLAN-mejoras.md`, 24/10; guion de la demo en `GUION-DEMO.md`). Hecho, un commit por sub-paso:
  - [x] 1 Ruta 404 (`NoEncontrado`, `path="*"` como última ruta).
  - [x] 2 Legibilidad del JSX: `ContenidoAsync` (en `Inicio`, `Catalogo`, `MisPublicaciones` y `Perfil`) y funciones auxiliares en lugar de ternarios anidados (chefs de `Inicio`, `OrderTrack`). El 2.3 se salteó: `Checkout`, `PublicarPlato` y `Admin` ya resolvían carga y error con `if` + `return`.
  - [x] 3.1 `BrowserRouter` en `main.jsx` y `AppContent` eliminado (decisión #2).
  - [x] 4 Vista `Perfil` (`GET` y `PUT /users/me`). Sin cambio de contraseña: no hay endpoint.
  - [x] 5 Detalle y edición de usuario en `Admin` (`GET` y `PUT /users/{id}`) con `Dialog`; después se sumó el cambio de rol (ver el extra más abajo).
  - [x] 6 Subcarpetas por dominio en `components/`.
  - [x] 7 Guion de demo (`GUION-DEMO.md`).
  - [x] 3.2 Estado del chef en `MisPublicaciones`: `PublicarPlato` pide su plato con `GET /platos/{id}` (3.2.a); `MisPublicaciones` tiene su lista (`GET /platos/mis-platos`), su catálogo de categorías y los handlers de stock, pausa, descuento y eliminar (3.2.b y 3.2.c, en un solo commit porque separados no funcionaban); `App` ya no guarda los platos (3.2.d). Los borradores y pausados sobreviven a la recarga. Probado con el backend real, incluido el `DELETE` que responde "Plato pausado porque tiene historial" (la fila queda Pausado, sin re-GET).
  - [x] 8 Subida de imágenes multipart (`POST /platos/{id}/imagenes`): `ImageFilePicker` (nuevo, en `components/chef/`) y `PublicarPlato` guardan en tiempos: plato (JSON), cada archivo por `FormData` (uno por uno, sin `Content-Type` a mano) y un `PUT` final solo si se publica un plato cuyas únicas imágenes son archivos (el backend exige una para publicar). Si falla una subida después de crear el plato, pasa a `/publicar/{id}` para no duplicarlo. Probado con el backend real. Límite conocido: los archivos no se borran del disco del backend.
  - [x] Extra: cambio de contraseña en `Perfil` (`PUT /users/me/password`), con su propio formulario, validación y error junto al campo. Probado con el backend real.
  - [x] Extra: el `message` del `DELETE /platos/{id}` ya se muestra en el Toast (desde el 3.2).
  - [x] Extra: cambio de rol en el detalle de usuario de `Admin` (`PATCH /users/{userId}/role`), con selector y botón propios y los errores 400 y 409 del backend en el diálogo. Probado con el backend real: éxito, 409 y el 400 "No podés quitarte a vos mismo el rol ADMIN".
- [x] **Simplificación del código (25/10)**, refactor sin cambiar comportamiento, un commit por archivo:
  - [x] 1 `App.jsx`: `protegida(roles, vista)` envuelve `RutaProtegida` (9 repeticiones menos) y `formularioPlato` se arma una vez para `/publicar` y `/publicar/:id`.
  - [x] 2 Una sola lectura de respuesta por archivo (`leerRespuesta`; en `App` también `manejarFallo`) en `App`, `Admin`, `MisPedidos`, `Checkout`, `PublicarPlato`, `PedidosRecibidos`, `MisPublicaciones` y `Registro`: de 31 bloques copiados a uno por archivo. El 2c pasó el ternario de dos niveles de `Catalogo` a `validarPrecios(filtros)` con `if` y `return`.
  - [x] 3 Comentarios más cortos en `App` y las 12 vistas (sin referencias a pasos viejos ni explicaciones repetidas; se mantienen encabezados, props y la primera aparición de cada concepto).
  - Verificado: lint, build y, en el navegador con el backend real, las rutas privadas sin sesión (las 9 redirigen a `/ingreso`) y con sesión de CLIENTE, CHEF y ADMIN (cada rol entra a lo suyo y el resto lo manda a `/`), la cesta (agregar, cambiar cantidad, quitar y vaciar, sin GET extra), un 401 simulado, el registro, Admin (pagos, usuarios y detalle), la validación de `Registro` y los tres casos de `validarPrecios` en `Catalogo`. **Sin probar** el flujo de escritura del chef (crear o editar platos), el checkout con un pedido real, pagar, aprobar pagos y avanzar subpedidos.
- [x] **Comentarios más cortos en todo el front (25/10)**: de ~15-20 % de comentarios a ~7 % (442 líneas sobre 5.748 en `App`, las 14 vistas y los 38 componentes), sin tocar código (verificado archivo por archivo contra `HEAD`). Un commit por archivo (`comentarios más cortos en <Archivo>`).
- [x] **Gestión de categorías en `/admin` (25/10)**, tercera pestaña "Categorías" en `Admin.jsx` con `CategoriasPanel`; un commit por sub-paso:
  - [x] 1 Listado (`GET /categories` público, sin token, en el `Promise.all` del primer efecto).
  - [x] 2 Crear (`POST /categories/createCategory`; vacío junto al campo, 409 por nombre repetido dentro del formulario; suma con `[...actuales, creada]`).
  - [x] 3 Editar con `Dialog` (`PUT /categories/{id}`, que devuelve la categoría; reemplaza con `map`; sin llamar al backend si el nombre está vacío o no cambió).
  - [x] 4 Eliminar con confirmación (`DELETE /categories/{id}`, `data: null`; saca con `filter`; el 409 de una categoría asignada a un plato va al Toast y la deja en la lista).
  - [x] 5 Cierre: una categoría nueva aparece sola en los chips de `/catalogo` y en el selector de `/publicar`, y al borrarla desaparece. Probado con el backend real y un ADMIN: crear, duplicada (409), editar (renombrar, 409, vacío, sin cambios), eliminar (libre y asignada) y error de red simulado. Ninguna escritura vuelve a pedir `GET /categories`. **Sin probar:** el 404 de editar o eliminar una categoría que otro admin ya borró (el código muestra el mensaje del backend) y el 401 en estas escrituras (lo resuelve `onSesionVencida`, igual que en el resto de `Admin`).
- [x] **Portada con cloche, plato recomendado y fondo (26/10)**, mejora de `Inicio.jsx` (`PLAN-portada`); un commit por sub-paso:
  - [x] 1 `LogoCloche` (en `components/layout/`) y tamaño `xl` de `Logo`: la tapa sube, el logo se enfoca y el aro se dibuja (~2,3 s, solo CSS).
  - [x] 2 Titular `<h1>` "¿Qué te gustaría comer hoy?" con la clase `.aparece` (animación `rise`; el delay sale de `--retraso`, 1,6 s por defecto; el buscador usa 1,8 s y los chips 2 s).
  - [x] 3 Buscador: estado `busqueda` en `Inicio`, `SearchBar` sin cambios y `navigate('/catalogo', { state: { nombre } })`.
  - [x] 4 `Catalogo` toma `location.state?.nombre` y `location.state?.categoriaId` como valores iniciales de `filtros` (sin GET de más).
  - [x] 5 Chips de categorías dentro de la portada (la sección "Qué se te antoja" ya no existe). Navegan con `state.categoriaId`; `selectedId={-1}` evita que "Todas" aparezca marcado.
  - [x] 6 Sección "Platos de autor..." (`<h2>`) con `Hero3D` y el plato recomendado: `GET /platos?nombre=Milanesa napolitana con papas` (el filtro es por coincidencia parcial, comprobado contra el backend); si no hay o falla, el primer plato `PUBLICADO`. `Hero3D` usa la foto del plato, enlaza a `/plato/{id}` y deshabilita agregar si está `AGOTADO`; se le sacó la entrada `settle`.
  - [x] 7 Fondo "mesa vista desde arriba": `FondoMesa` y `FondoFoto` (en `components/layout/`), anillos centrados en el logo y hasta 6 fotos de platos desde 1280 px (con menos de 3 fotos, íconos). Única animación: la deriva lenta de las fotos.
  - Verificado con el backend real: secuencia sin saltos de layout, 375 px y 1280 px sin scroll horizontal, foco con Tab, búsqueda y chips hacia `/catalogo` (también tras recargar), recomendada con foto y precio, agotada (botón deshabilitado), sin milanesa (respaldo), backend caído (sin tarjeta, sin romper), agregar sin sesión (lleva a `/ingreso`, sin GET) y fondo con fotos y con íconos. **Sin probar:** agregar a la cesta con sesión iniciada, `prefers-reduced-motion` activado en el navegador (solo se revisó la regla de `index.css`) y la secuencia en un celular real.

- [x] **Pruebas finales y ajustes (26/10)**: recorrido completo de CLIENTE, CHEF y ADMIN contra el backend real; un commit por arreglo:
  - [x] Foto de cada plato en la cesta (`Carrito` pide `GET /platos` al abrir; los ítems de la API no traen imagen).
  - [x] Total sin el envío de ejemplo ($3.200): la API no cobra envío y `precioFinal` es la suma de los platos (`OrderSummary` ya no recibe `shipping`).
  - [x] Claves únicas (`FondoMesa` saca fotos repetidas; `Gallery` usa el índice) y botón del resumen sin desborde entre 1024 y 1200 px.
  - [x] Toast con ícono de error (`App.avisar(texto, tipo)`, los avisos de falla pasan `'error'`) y `Dialog` que se cierra con Esc (el botón de cancelar toma el foco al abrirse).
  - [x] Tarjeta "Quién lo cocina" en `DetallePlato`, editor de la presentación del chef en `Perfil` (`POST` y `PUT /chef-profiles`) y vista pública `PerfilChef` (`/chef/:userId`: perfil, platos, reseñas y promedio) con enlaces "Ver perfil y platos" desde Inicio y el detalle. El backend ignora `?chefId=` en `GET /platos` y no tiene reseñas por chef: `PerfilChef` pide `GET /platos` y `GET /resenas` y los recorta en la vista.
  - [x] Foto del chef desde el equipo (`PUT /chef-profiles/{id}/foto`, multipart, campo `file`): `ChefProfileForm` tiene el selector y `Perfil` guarda en tiempos (primero el texto con `POST` o `PUT`, después el archivo; si falla la subida conserva el perfil para no duplicarlo). **SIN PROBAR contra el backend: estaba caído al terminar; falta subir una foto real, ver el rechazo de un formato o tamaño inválido y comprobar que la foto se vea en `/plato/:id` y `/chef/:userId`.** Lint y build pasan.
  - Verificado con el backend real: registro, ingreso, cesta, checkout (doble clic = un solo pedido), pago, aprobación del ADMIN, avance del chef hasta Entregado, reseña (aparece en el plato), cancelar con reposición de stock, publicar, stock, descuento, pausar, editar y eliminar, perfil y contraseña, 401 simulado y red caída. **Límites conocidos:** la portada se ensancha en 375 px (MVP pensado para escritorio, no se arregla); tras F5 la cesta muestra "vacía" unos ~60 ms; el pedido queda `ENVIADO` aunque un subpedido esté `CONFIRMADO` (lo calcula el backend). **Sin probar:** subida de imágenes por archivo en esta pasada y el 403 del ADMIN en escrituras de otros roles.

- [ ] **15 Redux Toolkit (3.ª entrega, 30/11)**: solo GET y sesión; un commit por sub-paso, frenando después de cada uno (sección 2). Orden de las lecturas a migrar según el mapa de `fetch` del repo:
  - [x] 15.0 Reglas de la 3.ª entrega en este `CLAUDE.md` y repo `FoodMarket-Redux` lista.
  - [x] 15.1 Instalar `@reduxjs/toolkit react-redux axios` (avisando); `store.js` con `reducer: {}`; `Provider` en `main.jsx`. Verificar `@@INIT` en Redux DevTools.
  - [x] 15.2 `authSlice`: `login` (con `rejectWithValue`), `register` y `logout`. Sacar los **8 usos de `localStorage` de `App.jsx`**, `cargandoSesion`, el efecto de `GET /users/me` al iniciar y las props de sesión; migrar `Ingreso`, `Registro`, `Header`, `RutaProtegida` y las vistas que reciben `sesion` por props (el token pasa a leerse del store). 401 → `dispatch(logout())` + `navigate('/ingreso')`.
  - [x] 15.3 `platosSlice`: `fetchPlatos(filtros)`, `fetchPlatoById` y `fetchPlatoRecomendado` (campo `recomendado`, solo `fulfilled`, para no prender el `loading` de la lista). Vistas: `Inicio` (lista y plato recomendado), `Catalogo` (filtros), `DetallePlato`, `Carrito` (fotos de la cesta) y `PerfilChef`.
  - [x] 15.4 `categoriasSlice` e `ingredientesSlice` (`Inicio`, `Catalogo`, `PublicarPlato`, `MisPublicaciones`). **`Admin` queda sin migrar** (decisión #14): modifica las categorías con escrituras locales y quedaría la misma lista en Redux y en `useState`; se migra con las escrituras (15.7).
  - [x] 15.5 `resenasSlice` (`fetchResenasByPlato` para `DetallePlato` y `fetchResenas` para `PerfilChef`).
  - [x] 15.6 Limpieza: `leerRespuesta` y estados `cargando`/`error` que quedaron sin uso; buscar `localStorage`, `sessionStorage`, `fetch` en componentes y `let`/`var`; README con la estructura de Redux.
  - [ ] 15.7 **Solo si la profesora lo pide:** GET privados (pedidos, domicilios, perfil, Admin, chef-profiles) y escrituras; `usuariosSlice`.
  - **Pendientes conocidos de la migración (a confirmar):** (1) se perdió el aviso "Ingresaste como X" (salía de `iniciarSesion`; un efecto que llame a `setAviso` lo rechaza `react-hooks/set-state-in-effect`); (2) el nombre del `Header` no se actualiza al editar el perfil (opción B: lo resolverá `usuariosSlice` en 15.7, `TODO(redux)` en `Perfil.jsx`); (3) el 404 del detalle de un plato se detecta con `error.includes('404')` porque el thunk solo guarda `action.error.message`; (4) sin `AbortController`, dos respuestas cruzadas de `fetchPlatos` podrían pisarse al escribir rápido en el catálogo.
  - Sin migrar a propósito: cesta, avisos/toast, escrituras y GET privados (ver el alcance en la sección 1).

- [x] **16 Más componentes, una sola función cada uno (A1, 16/11)**: extracciones sin cambiar el comportamiento, un commit por componente. `MisPedidos` (`ResenaDialog`, `PagoDialog`, `PedidosLista`), `Perfil` (`PasswordForm`, `DatosCuentaForm`), `Admin` (`PagosPanel`, `UsuariosPanel`, `UsuarioDetalleDialog`, `CategoriaEditDialog`), `Header` (`MenuMovil` y enlaces por rol en una constante), `Registro` (`FormField`, `Alert` y `RegistroAside`) y `PublicarPlato` (`FormField`). `FormField` suma `placeholder`, `hint`, `min` y `step`. **Límite:** `Admin` (648), `PublicarPlato` (443) y `Perfil` (394) no llegan a ~250 líneas porque su estado y sus handlers se quedan en la vista (sin hooks propios ni helpers compartidos).
- [x] **17 Moderación de reseñas**:
  - [x] A2 `ResenaDialog` bloquea comentarios con lenguaje ofensivo antes de llamar a la API (normaliza tildes, símbolos, letras repetidas y separadores; compara por palabra entera; la lista `PALABRAS_PROHIBIDAS` está dentro del componente y se revisa a mano). El backend ya valida lo mismo (paso 19.6); decisión del 16/11: **el filtro principal es el del backend** (`palabras-prohibidas-es.txt`) y el del front queda como aviso rápido sin pedido. Sus listas no coinciden (el backend bloquea más palabras).
  - [x] A3 El ADMIN elimina reseñas: `deleteResena` en `resenasSlice`, pestaña "Reseñas" en `/admin` (`ResenasPanel`) y botón "Eliminar" en `ReviewList` del detalle del plato. Errores 401, 403 y 404 por el código al final del mensaje de Axios.
- [x] **18 Features nuevas (16/11)**:
  - [x] B1 Dashboard de ventas del chef (`/dashboard`, "Mis ventas"): `subpedidosSlice`, tarjetas, pedidos por estado y platos más vendidos con barras de `div`. Sin ventas por día todavía: desde el paso 19.3 el subpedido trae `fechaCreacion`, así que se puede agregar cuando se pida.
  - [x] B4 Globito de pedidos por atender (PENDIENTE o CONFIRMADO) en el `Header` del chef, al ingresar y en cada navegación; Toast si aumentó. Sin temporizador (pendiente de confirmar con la profesora).
  - [x] B3 El checkout elige el medio de pago y registra el pago con el pedido (`POST /pagos/createPago` después del checkout; si falla, el pedido queda creado y se paga desde Mis pedidos). Sin datos de tarjeta.
  - [x] C1 "Volver a pedir" en pedidos entregados o cancelados (agrega los platos a la cesta en fila; los que no se pueden se nombran en el Toast).
  - [x] C2 `PlatoRating` en las tarjetas y sección "Mejor puntuados" en `Inicio` (promedios calculados en el front con `GET /resenas`).
  - [x] C3 Etiqueta "Stock bajo" (5 unidades o menos) en las publicaciones del chef.
  - **Sin hacer:** B2 favoritos (necesita el backend), C4 métricas del admin, C5 platos relacionados, C6 esqueletos de carga. **Probado con el backend real (16/11, con un ADMIN):** las 4 pestañas de `/admin`, aprobar un pago, el detalle de usuario y la validación de `CategoriaEditDialog`, el diálogo de reseña (el insulto `p3l0tud0` se bloquea sin llamar a la API; uno válido da 201) y el borrado de reseñas desde `/admin` y desde el detalle del plato (`DELETE` 200, sin `GET` extra, el promedio se recalcula). **Sin probar:** el globito y el Toast del chef con pedidos reales, el dashboard con ventas, el caso mixto de "Volver a pedir" y el 403 de borrar una reseña ajena como CLIENTE. Regla de las últimas dos semanas: nada nuevo después del viernes 27/11.

- [x] **19 Adaptar el front a los campos y endpoints nuevos del backend (16/11)**: un commit por sub-paso, probado con el backend real.
  - [x] 19.1 Cesta: `CartItem` usa `imagenUrl` (ícono si es `null`), muestra `chefNombre` y topa la cantidad en `stockDisponible`; `Carrito` ya no pide los platos para las fotos.
  - [x] 19.2 `chefNombre` en `PlatoCard`, `DetallePlato` y la tarjeta del plato recomendado (`Hero3D`).
  - [x] 19.3 Pedidos recibidos: "Pedido n.º {pedidoId}", fecha con hora y cliente; se ordena por la fecha del pedido; el diálogo y el Toast hablan del pedido. El `PATCH` de estado sigue actualizando la lista local sin `GET`.
  - [x] 19.4 Reseñas con `clienteNombre` y `platoNombre` (`ReviewList` con la prop `showPlato`, `ResenasPanel`); `PerfilChef` pide `GET /resenas/chef/{id}` (`fetchResenasByChef`) y `GET /platos?chefId=`; `Admin` ya no cruza reseñas con platos. El 404 de un chef inexistente se muestra como "no disponible".
  - [x] 19.5 `ChefCard` con nombre, apellido, especialidad y nacionalidad; `ChefProfileForm` suma `nacionalidad`; largos máximos (100 y 2000) validados junto al campo.
  - [x] 19.6 `ResenaDialog` y `MisPedidos` muestran el 400 del backend ("El comentario contiene lenguaje no permitido") junto al comentario; el diálogo queda abierto hasta saber el resultado.
  - [x] 19.7 `MisPublicaciones` usa `PATCH /platos/{id}/stock` y `/estado` (y ya no pide las categorías): la fila se actualiza con el plato devuelto, sin `PUT` ni `GET`.
  - [x] 19.8 Esta documentación; se sacó la nota "no hay ventas por día" del Dashboard.
  - **Sin hacer (pasos 20 y 21, a pedir):** favoritos (`GET`, `POST` y `DELETE /favoritos/{platoId}`, ya existen en el backend), métricas del admin y simplificar el Dashboard.

**`TODO(backend)` que siguen abiertos:** el origen y la distancia de cada ingrediente (`IngredientTrace`, la API no los tiene); revisar `palabras-prohibidas-es.txt` del backend (propuesta inicial, pendiente de revisión de Daniel); la foto del chef desde el equipo (`PUT /chef-profiles/{id}/foto`) sigue sin probarse desde el front. **Endpoints que ya existen y el front todavía no usa** (mejoras opcionales): `GET /chef-profiles/user/{userId}` (hoy `PerfilChef` y `DetallePlato` listan todos los perfiles y buscan), `GET /subpedidos/me`, `GET /subpedidos/chef/{id}/pendientes` (el globito cuenta los subpedidos en el front) y los favoritos.

## 10. Antes de dar un paso por terminado

- `npm run lint` y `npm run build` sin errores.
- Buscar en `src/`: `forEach`, `==` que no sea `===`, `document.`, `window.`, `alert(`, `confirm(`, `prompt(`, `sessionStorage`, `localStorage`, `let `, `var ` y `try` (este último solo en `login` y `register` de `authSlice`). **No debe quedar ninguna coincidencia** (en la 3.ª entrega `localStorage` ya no tiene excepciones; `document.getElementById` de `main.jsx` es la única heredada de Vite).
- Probar en el navegador: caso de éxito, validación, credenciales inválidas, token ausente o vencido, falta de permisos, error de red (backend caído), que no se dupliquen registros y que la pantalla se actualice sin F5 ni GET adicional.
- Abrir **Redux DevTools** y comprobar `@@INIT`, `/pending` y `/fulfilled` (o `/rejected` con el backend caído) del paso.
- Que los componentes de `components/` no tengan `fetch` ni `axios` (las llamadas viven en los slices), que `axios` esté solo dentro de `src/components/Redux/`, que `rejectWithValue` aparezca solo en `login` y `register`, que no haya carpetas nuevas en `src/`, que ningún dato migrado viva también en un `useState` y que el token exista solo en `state.auth`.
- Actualizar este checklist de la hoja de ruta y listar los `TODO(backend)` que quedaron.
