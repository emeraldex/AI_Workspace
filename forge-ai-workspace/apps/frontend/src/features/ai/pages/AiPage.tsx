// File: apps/frontend/src/features/ai/pages/AiPage.tsx
// Purpose: AI chat page — conversation sidebar + active conversation view

import { useNavigate, useParams } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { useCreateConversation } from '../hooks/useConversations'
import { ConversationList } from '../components/ConversationList'
import { ConversationView } from '../components/ConversationView'

export function AiPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const createConversation = useCreateConversation()

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl gap-6 px-6 py-6">
      <aside className="w-64 shrink-0">
        <ConversationList selectedId={conversationId} />
      </aside>

      <div className="min-w-0 flex-1">
        {conversationId ? (
          <ConversationView key={conversationId} conversationId={conversationId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <MessagesSquare className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Pick a conversation or start a new one.
              <br />
              Set your OpenAI key in Settings to get replies.
            </p>
            <Button
              size="sm"
              disabled={createConversation.isPending}
              onClick={() =>
                createConversation.mutate(undefined, {
                  onSuccess: (conv) => navigate(`/ai/${conv.id}`),
                })
              }
            >
              New chat
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
