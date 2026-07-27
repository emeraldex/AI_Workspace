// File: apps/frontend/src/app/providers.tsx
// Purpose: Global providers — React Query + session restore gate.
//          Children render only after the session restore attempt completes,
//          so route guards always see settled auth state.

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Hammer } from 'lucide-react'
import { queryClient } from './queryClient'
import { useSessionRestore } from '@features/auth/hooks/useAuth'

function SessionGate({ children }: { children: React.ReactNode }) {
  const restoring = useSessionRestore()

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Hammer className="h-8 w-8 animate-pulse text-primary" aria-label="Loading Forge" />
      </div>
    )
  }
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionGate>{children}</SessionGate>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
