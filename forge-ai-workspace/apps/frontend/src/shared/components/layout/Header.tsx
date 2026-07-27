// File: apps/frontend/src/shared/components/layout/Header.tsx
// Purpose: Top bar — sidebar toggle, user identity, logout (h-14 per Phase 7 §5)

import { useNavigate } from 'react-router-dom'
import { LogOut, PanelLeft } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { logout } from '@shared/lib/session'
import { useAuthStore } from '@shared/stores/auth.store'
import { useUIStore } from '@shared/stores/ui.store'

interface HeaderProps {
  /** Feature-provided widgets (e.g. notification bell) — injected from the
   *  app layer so shared/ never imports from features/ */
  extras?: React.ReactNode
}

export function Header({ extras }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-surface px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <PanelLeft />
      </Button>

      <div className="flex items-center gap-3">
        {extras}
        <span className="text-sm text-muted-foreground">{user?.name}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut />
        </Button>
      </div>
    </header>
  )
}
