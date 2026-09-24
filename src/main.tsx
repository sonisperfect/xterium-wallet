import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import Preloader from './components/Preloader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preloader>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Preloader>
  </StrictMode>,
)
