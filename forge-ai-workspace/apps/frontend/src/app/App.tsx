// File: apps/frontend/src/app/App.tsx
// Purpose: Root component — providers wrapping the router

import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
