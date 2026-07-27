// File: apps/frontend/src/features/snippets/components/SnippetCard.tsx
// Purpose: Snippet tile — language badge, code preview, copy/edit/delete actions

import { useState } from 'react'
import { Check, Copy, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardHeader } from '@shared/components/ui/Card'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { useClipboard } from '@shared/hooks/useClipboard'
import { formatRelativeTime } from '@shared/lib/utils'
import { useDeleteSnippet } from '../hooks/useSnippets'
import type { Snippet } from '../api/snippets.api'

export function SnippetCard({ snippet, onEdit }: { snippet: Snippet; onEdit: (s: Snippet) => void }) {
  const deleteSnippet = useDeleteSnippet()
  const { copied, copy } = useClipboard()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{snippet.title}</h3>
        <Badge variant="secondary" className="shrink-0 font-mono">
          {snippet.language}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <pre className="max-h-40 flex-1 overflow-hidden rounded-md border bg-background p-3 text-xs leading-relaxed">
          <code className="font-mono">{snippet.code}</code>
        </pre>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {snippet.tags.map((tag) => (
              <span key={tag} className="rounded bg-muted px-1.5 py-0.5">
                {tag}
              </span>
            ))}
            <span className="truncate">{formatRelativeTime(snippet.updatedAt)}</span>
          </div>

          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copy(snippet.code)}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? <Check className="text-success" /> : <Copy />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(snippet)} aria-label="Edit snippet">
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete snippet"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete snippet?"
        description={`"${snippet.title}" will be moved to trash.`}
        onConfirm={() => deleteSnippet.mutate(snippet.id, { onSuccess: () => setConfirmOpen(false) })}
        isPending={deleteSnippet.isPending}
      />
    </Card>
  )
}
