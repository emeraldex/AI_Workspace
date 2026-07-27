// File: apps/frontend/src/features/notifications/components/NotificationBell.tsx
// Purpose: Header bell with unread badge; opens the notification feed

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/components/ui/DropdownMenu'
import { useLiveNotifications, useUnreadCount } from '../hooks/useNotifications'
import { NotificationList } from './NotificationList'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unread = 0 } = useUnreadCount()
  useLiveNotifications()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <NotificationList open={open} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
