// File: apps/frontend/src/features/ai/components/ConversationView.tsx
// Purpose: Message history + live streaming bubble + composer for one conversation

import { useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useConversation, useSendMessage } from '../hooks/useConversations'
import { useAiStream } from '../hooks/useAiStream'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

export function ConversationView({ conversationId }: { conversationId: string }) {
  const { data: conversation, isPending, isError, error, refetch } = useConversation(conversationId)
  const sendMessage = useSendMessage(conversationId)
  const { streamText, isStreaming, streamError, beginStream, clearError } = useAiStream(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messageCount = conversation?.messages.length ?? 0
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount, streamText])

  function handleSend(content: string) {
    clearError()
    sendMessage.mutate(content, {
      onSuccess: ({ streamId }) => beginStream(streamId),
    })
  }

  if (isPending) {
    return (
      <div className="flex h-full flex-col gap-3">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-16 w-1/2 self-end" />
        <Skeleton className="h-24 w-3/4" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load this conversation')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {conversation.messages.length === 0 && !isStreaming && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Ask anything — replies stream in live.
          </p>
        )}
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} role={message.role} content={message.content} />
        ))}
        {isStreaming && <MessageBubble role="ASSISTANT" content={streamText ?? ''} streaming />}
        <div ref={bottomRef} />
      </div>

      {(streamError || sendMessage.isError) && (
        <p role="alert" className="mb-2 text-xs text-destructive">
          {streamError ?? getApiErrorMessage(sendMessage.error, 'Could not send the message')}
        </p>
      )}

      <MessageInput disabled={sendMessage.isPending || isStreaming} onSend={handleSend} />
    </div>
  )
}
