import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ModusWcThemeProvider } from '@trimble-oss/moduswebcomponents-react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModusWcThemeProvider>
      <App />
    </ModusWcThemeProvider>
  </StrictMode>,
)
