import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './components/Redux/store'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provider: le pasa el store a toda la app. */}
    <Provider store={store}>
      {/* useTransitions={false}: los cambios de ruta se aplican junto con el resto del estado. Sin esto, al
          cerrar sesión desde una ruta privada, RutaProtegida redirigía a /ingreso antes de llegar a "/". */}
      <BrowserRouter useTransitions={false}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
