// File: apps/frontend/src/features/notifications/components/NotificationList.tsx
// Purpose: Notification feed inside the bell dropdown

import { AlarmClock, Bot, CalendarClock, Info, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Spinner } from '@shared/components/ui/Spinner'
import { cn, formatRelativeTime } from '@shared/lib/utils'
import {
  useDeleteNotification,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from '../hooks/useNotifications'
import type { NotificationType } from '../api/notifications.api'

const TYPE_ICONS: Record<NotificationType, typeof Info> = {
  TASK_DUE_SOON: CalendarClock,
  TASK_OVERDUE: AlarmClock,
  AI_TASK_CREATED: Bot,
  SYSTEM: Info,
}

export function NotificationList({ open }: { open: boolean }) {
  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications(open)
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const notifications = data?.pages.flatMap((page) => page.data) ?? []
  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="flex max-h-96 w-80 flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">Notifications</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          Mark all read
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            Nothing here — you're all caught up.
          </p>
        ) : (
          notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Info
            return (
              <div
                key={n.id}
                className={cn(
                  'group flex items-start gap-2.5 border-b px-3 py-2.5 last:border-b-0',
                  !n.isRead && 'bg-primary/5',
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => !n.isRead && markRead.mutate(n.id)}
                  aria-label={n.isRead ? n.title : `${n.title} (unread — click to mark read)`}
                >
                  <span className={cn('block text-sm', !n.isRead && 'font-medium')}>
                    {n.title}
                    {!n.isRead && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{n.body}</span>
                  <span className="block text-xs text-muted-foreground/70">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete notification"
                  onClick={() => deleteNotification.mutate(n.id)}
                >
                  <Trash2 className="!h-3 !w-3" />
                </Button>
              </div>
            )
          })
        )}
        {hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            className="m-2 w-[calc(100%-16px)] text-muted-foreground"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <Spinner />}
            Load more
          </Button>
        )}
      </div>
    </div>
  )
}
