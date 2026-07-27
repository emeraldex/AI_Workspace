// File: apps/frontend/src/features/documents/components/DocumentList.tsx
// Purpose: Document rows with loading/error/empty states and cursor pagination

import { Link } from 'react-router-dom'
import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { formatRelativeTime } from '@shared/lib/utils'
import { useDocuments } from '../hooks/useDocuments'
import { IndexingStatus } from './IndexingStatus'
import type { DocumentFilters } from '../api/documents.api'

interface DocumentListProps {
  filters: DocumentFilters
  onCreate: () => void
}

export function DocumentList({ filters, onCreate }: DocumentListProps) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDocuments(filters)

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load documents')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const documents = data.pages.flatMap((page) => page.data)
  const total = data.pages[0]?.pagination.total ?? 0

  if (documents.length === 0) {
    const hasFilters = Boolean(filters.search || filters.collectionId)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'No documents match.' : 'No documents yet. Write your first one.'}
          </p>
          {!hasFilters && (
            <Button size="sm" onClick={onCreate}>
              New document
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {documents.length} of {total} document{total === 1 ? '' : 's'}
      </p>
      {documents.map((doc) => (
        <Link
          key={doc.id}
          to={`/documents/${doc.id}`}
          className="flex items-center gap-3 rounded-lg border bg-surface px-4 py-3 transition-colors hover:border-primary/40"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{doc.title}</span>
          {doc.tags.map((tag) => (
            <span key={tag.id} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {tag.name}
            </span>
          ))}
          <IndexingStatus status={doc.indexingStatus} />
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(doc.updatedAt)}
          </span>
        </Link>
      ))}
      {hasNextPage && (
        <Button
          variant="outline"
          className="mt-2 self-center"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage && <Spinner />}
          Load more
        </Button>
      )}
    </div>
  )
}
