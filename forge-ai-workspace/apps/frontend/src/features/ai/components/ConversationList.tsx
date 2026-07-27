// File: apps/frontend/src/features/ai/components/ConversationList.tsx
// Purpose: Conversation sidebar — new chat, select, delete

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Spinner } from '@shared/components/ui/Spinner'
import { cn, formatRelativeTime } from '@shared/lib/utils'
import { useConversations, useCreateConversation, useDeleteConversation } from '../hooks/useConversations'

export function ConversationList({ selectedId }: { selectedId: string | undefined }) {
  const navigate = useNavigate()
  const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations()
  const createConversation = useCreateConversation()
  const deleteConversation = useDeleteConversation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleNew() {
    createConversation.mutate(undefined, {
      onSuccess: (conv) => navigate(`/ai/${conv.id}`),
    })
  }

  const conversations = data?.pages.flatMap((page) => page.data) ?? []

  return (
    <div className="flex h-full flex-col gap-2">
      <Button onClick={handleNew} disabled={createConversation.isPending} className="w-full">
        {createConversation.isPending ? <Spinner /> : <Plus />}
        New chat
      </Button>

      {isPending ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">No conversations yet</p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 rounded-md pr-1 transition-colors',
                selectedId === conv.id ? 'bg-primary/10' : 'hover:bg-muted',
              )}
            >
              <button
                onClick={() => navigate(`/ai/${conv.id}`)}
                className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-2 py-1.5 text-left"
              >
                <span
                  className={cn(
                    'w-full truncate text-sm',
                    selectedId === conv.id ? 'font-medium text-primary' : 'text-foreground',
                  )}
                >
                  {conv.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {conv.messageCount} message{conv.messageCount === 1 ? '' : 's'} ·{' '}
                  {formatRelativeTime(conv.updatedAt)}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 hover:text-destructive group-hover:opacity-100"
                aria-label={`Delete ${conv.title}`}
                onClick={() => setDeletingId(conv.id)}
              >
                <Trash2 className="!h-3.5 !w-3.5" />
              </Button>
            </div>
          ))}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-muted-foreground"
            >
              {isFetchingNextPage && <Spinner />}
              Load more
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete conversation?"
        description="The conversation and its messages will be moved to trash."
        onConfirm={() =>
          deletingId &&
          deleteConversation.mutate(deletingId, {
            onSuccess: () => {
              setDeletingId(null)
              if (selectedId === deletingId) navigate('/ai')
            },
          })
        }
        isPending={deleteConversation.isPending}
      />

    </div>
  )
}
