// File: apps/frontend/src/shared/components/layout/PageContainer.tsx
// Purpose: Standard page wrapper — title row + content with px-6 py-6 padding (Phase 7 §5)

import { cn } from '@shared/lib/utils'

interface PageContainerProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageContainer({ title, description, actions, children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-6 py-6', className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
