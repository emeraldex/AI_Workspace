// File: apps/frontend/src/features/ai/hooks/useAiStream.ts
// Purpose: Joins the conversation socket room and accumulates the streaming
//          AI reply (ai:token / ai:done / ai:error per Phase 8).

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@shared/hooks/useSocket'
import { CONVERSATIONS_QUERY_KEY } from './useConversations'

export function useAiStream(conversationId: string | undefined) {
  const socket = useSocket()
  const queryClient = useQueryClient()
  const [streamText, setStreamText] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const activeStreamId = useRef<string | null>(null)

  useEffect(() => {
    if (!conversationId) return

    const join = () => socket.emit('conversation:join', { conversationId })
    join()
    socket.on('connect', join) // rejoin after reconnects

    const onToken = ({ streamId, token }: { streamId: string; token: string }) => {
      if (streamId !== activeStreamId.current) return
      setStreamText((text) => (text ?? '') + token)
    }

    const onDone = async ({ streamId }: { streamId: string }) => {
      if (streamId !== activeStreamId.current) return
      activeStreamId.current = null
      // Refetch first, then clear the streaming bubble — no flicker gap
      await queryClient.invalidateQueries({
        queryKey: [CONVERSATIONS_QUERY_KEY, 'detail', conversationId],
      })
      setStreamText(null)
    }

    const onError = ({ streamId, message }: { streamId: string; message: string }) => {
      if (streamId !== activeStreamId.current) return
      activeStreamId.current = null
      setStreamText(null)
      setStreamError(message)
    }

    socket.on('ai:token', onToken)
    socket.on('ai:done', onDone)
    socket.on('ai:error', onError)

    return () => {
      socket.emit('conversation:leave', { conversationId })
      socket.off('connect', join)
      socket.off('ai:token', onToken)
      socket.off('ai:done', onDone)
      socket.off('ai:error', onError)
    }
  }, [conversationId, socket, queryClient])

  const beginStream = useCallback((streamId: string) => {
    activeStreamId.current = streamId
    setStreamText('')
    setStreamError(null)
  }, [])

  return {
    /** Accumulated partial reply, or null when idle */
    streamText,
    isStreaming: streamText !== null,
    streamError,
    beginStream,
    clearError: useCallback(() => setStreamError(null), []),
  }
}
