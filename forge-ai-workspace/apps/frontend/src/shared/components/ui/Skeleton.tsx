// File: apps/frontend/src/shared/components/ui/Skeleton.tsx
// Purpose: Loading placeholder — pulse animation matching content layout

import { cn } from '@shared/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}
