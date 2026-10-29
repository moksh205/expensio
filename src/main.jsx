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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
