// File: apps/frontend/src/app/router.tsx
// Purpose: Route table with auth guards — public auth pages, protected app shell

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/auth.store'
import { AppShell } from '@shared/components/layout/AppShell'
import { Spinner } from '@shared/components/ui/Spinner'
import { NotificationBell } from '@features/notifications/components/NotificationBell'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { RegisterPage } from '@features/auth/pages/RegisterPage'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { TasksPage } from '@features/tasks/pages/TasksPage'
import { ProjectsPage } from '@features/projects/pages/ProjectsPage'
import { SnippetsPage } from '@features/snippets/pages/SnippetsPage'
import { SettingsPage } from '@features/settings/pages/SettingsPage'

// Markdown/highlight.js pull in ~300 kB — split the pages that use them
const DocumentsPage = lazy(() =>
  import('@features/documents/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })),
)
const AiPage = lazy(() => import('@features/ai/pages/AiPage').then((m) => ({ default: m.AiPage })))
const DevToolsPage = lazy(() =>
  import('@features/devtools/pages/DevToolsPage').then((m) => ({ default: m.DevToolsPage })),
)

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center py-24">
          <Spinner className="h-6 w-6" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

function PublicOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell headerExtras={<NotificationBell />} />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/tasks', element: <TasksPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/documents', element: <Lazy><DocumentsPage /></Lazy> },
          { path: '/documents/:documentId', element: <Lazy><DocumentsPage /></Lazy> },
          { path: '/ai', element: <Lazy><AiPage /></Lazy> },
          { path: '/ai/:conversationId', element: <Lazy><AiPage /></Lazy> },
          { path: '/snippets', element: <SnippetsPage /> },
          { path: '/devtools', element: <Lazy><DevToolsPage /></Lazy> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
