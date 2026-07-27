// File: apps/frontend/src/shared/components/layout/Sidebar.tsx
// Purpose: Fixed left navigation — w-60 expanded, w-14 icon-only collapsed (Phase 7 §5, §6.3)

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  MessagesSquare,
  Code2,
  Settings,
  Hammer,
  Wrench,
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { useUIStore } from '@shared/stores/ui.store'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/ai', label: 'AI Chat', icon: MessagesSquare },
  { to: '/snippets', label: 'Snippets', icon: Code2 },
  { to: '/devtools', label: 'DevTools', icon: Wrench },
]

function SidebarLink({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
}: (typeof NAV_ITEMS)[number] & { collapsed: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r bg-surface transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center gap-2 border-b px-4', collapsed && 'justify-center px-0')}>
        <Hammer className="h-5 w-5 shrink-0 text-primary" />
        {!collapsed && <span className="truncate font-semibold">Forge</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="border-t p-2">
        <SidebarLink to="/settings" label="Settings" icon={Settings} collapsed={collapsed} />
      </div>
    </aside>
  )
}
