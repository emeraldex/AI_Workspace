// File: apps/frontend/src/app/router.tsx
// Purpose: Route table with auth guards — public auth pages, protected app shell

import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/auth.store'
import { AppShell } from '@shared/components/layout/AppShell'
import { NotificationBell } from '@features/notifications/components/NotificationBell'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { RegisterPage } from '@features/auth/pages/RegisterPage'
import { DashboardPage } from '@features/dashboard/pages/DashboardPage'
import { TasksPage } from '@features/tasks/pages/TasksPage'
import { ProjectsPage } from '@features/projects/pages/ProjectsPage'
import { DocumentsPage } from '@features/documents/pages/DocumentsPage'
import { AiPage } from '@features/ai/pages/AiPage'
import { SnippetsPage } from '@features/snippets/pages/SnippetsPage'
import { SettingsPage } from '@features/settings/pages/SettingsPage'

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
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/documents/:documentId', element: <DocumentsPage /> },
          { path: '/ai', element: <AiPage /> },
          { path: '/ai/:conversationId', element: <AiPage /> },
          { path: '/snippets', element: <SnippetsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
