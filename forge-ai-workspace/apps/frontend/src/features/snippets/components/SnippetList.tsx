// File: apps/frontend/src/features/snippets/components/SnippetList.tsx
// Purpose: Snippet card grid with loading/error/empty states and cursor pagination

import { Code2, RefreshCw } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useSnippets } from '../hooks/useSnippets'
import { SnippetCard } from './SnippetCard'
import type { Snippet, SnippetFilters } from '../api/snippets.api'

interface SnippetListProps {
  filters: SnippetFilters
  onEdit: (snippet: Snippet) => void
  onCreate: () => void
}

export function SnippetList({ filters, onEdit, onCreate }: SnippetListProps) {
  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSnippets(filters)

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load snippets')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const snippets = data.pages.flatMap((page) => page.data)
  const total = data.pages[0]?.pagination.total ?? 0

  if (snippets.length === 0) {
    const hasFilters = Boolean(filters.search || filters.language)
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Code2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'No snippets match these filters.' : 'No snippets yet. Save your first one.'}
          </p>
          {!hasFilters && (
            <Button size="sm" onClick={onCreate}>
              New snippet
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {snippets.length} of {total} snippet{total === 1 ? '' : 's'}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} onEdit={onEdit} />
        ))}
      </div>
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
