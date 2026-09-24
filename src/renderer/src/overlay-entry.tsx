import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import OverlayView from './OverlayView'
import './styles/theme.css'
import './components/sidebar.css'
import './overlay/overlay.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OverlayView />
  </StrictMode>
)
