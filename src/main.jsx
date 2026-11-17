import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🔹 Block copy / cut of page text (inputs still allowed)
const isField = (el) => el?.closest?.('input, textarea')
;['copy', 'cut'].forEach((type) =>
  document.addEventListener(type, (e) => {
    if (!isField(e.target)) e.preventDefault()
  })
)

// 🔹 PWA: register service worker (production only, so dev HMR isn't affected)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
