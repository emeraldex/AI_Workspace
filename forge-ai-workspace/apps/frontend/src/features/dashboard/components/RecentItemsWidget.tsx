// File: apps/frontend/src/features/dashboard/components/RecentItemsWidget.tsx
// Purpose: Generic "recent items" list card — used for documents and conversations

import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { formatRelativeTime } from '@shared/lib/utils'
import type { DashboardRecentItem } from '../api/dashboard.api'

interface RecentItemsWidgetProps {
  title: string
  icon: LucideIcon
  items: DashboardRecentItem[]
  hrefBase: string
  emptyText: string
}

export function RecentItemsWidget({ title, icon: Icon, items, hrefBase, emptyText }: RecentItemsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`${hrefBase}/${item.id}`}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(item.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
