// File: apps/frontend/src/shared/components/layout/AppShell.tsx
// Purpose: Root authenticated layout — sidebar + header + scrollable content area

import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from '@shared/components/CommandPalette'

export function AppShell({ headerExtras }: { headerExtras?: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header extras={headerExtras} />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
