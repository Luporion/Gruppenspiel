import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import './index.css'
import App from './App.tsx'
import { GameStoreProvider } from './engine'
import { initializeBeamerMode } from './utils/beamerMode'

// Initialize beamer mode on app load
initializeBeamerMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameStoreProvider>
      <App />
    </GameStoreProvider>
  </StrictMode>,
)
