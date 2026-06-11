import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './routes/index.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <RouterProvider router={router} />
  // </StrictMode>
  <RouterProvider router={router} />
)