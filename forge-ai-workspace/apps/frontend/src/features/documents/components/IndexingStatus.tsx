// File: apps/frontend/src/features/documents/components/IndexingStatus.tsx
// Purpose: Badge for a document's RAG indexing state

import { Badge } from '@shared/components/ui/Badge'
import { cn } from '@shared/lib/utils'
import type { IndexingStatus as Status } from '../api/documents.api'

const STYLES: Record<Status, { label: string; className: string }> = {
  PENDING: { label: 'Not indexed', className: 'text-slate-400 bg-slate-400/10' },
  INDEXING: { label: 'Indexing…', className: 'text-blue-400 bg-blue-400/10' },
  INDEXED: { label: 'Indexed', className: 'text-green-400 bg-green-400/10' },
  FAILED: { label: 'Index failed', className: 'text-red-400 bg-red-400/10' },
}

export function IndexingStatus({ status }: { status: Status }) {
  const { label, className } = STYLES[status]
  return (
    <Badge variant="outline" className={cn('border-transparent', className)}>
      {label}
    </Badge>
  )
}
