import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import Preloader from './components/Preloader.tsx'

// Every visit starts at the top, where the hero and the pinned stages begin,
// rather than where a refresh left off. Links to an anchor still land on it.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!location.hash) window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preloader>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Preloader>
  </StrictMode>,
)
