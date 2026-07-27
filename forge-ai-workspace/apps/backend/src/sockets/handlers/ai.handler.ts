// File: apps/backend/src/sockets/handlers/ai.handler.ts
// Purpose: Streams an AI reply for a just-sent user message into the
//          conversation room (ai:token / ai:done / ai:error per Phase 8),
//          persisting the assistant message when complete.

import { logger } from '../../shared/logger'
import { settingsService } from '../../domains/settings/settings.service'
import { conversationsRepository } from '../../domains/conversations/conversations.repository'
import {
  getProviderForUser,
  resolveApiKeyForUser,
  MissingApiKeyError,
} from '../../infrastructure/ai/ai.provider.factory'
import { embedTexts } from '../../infrastructure/ai/embeddings'
import { vectorService } from '../../infrastructure/vector/vector.service'
import type { ChatMessage } from '../../infrastructure/ai/ai.provider.interface'
import { getIO } from '../socket.server'

const SYSTEM_PROMPT =
  'You are Forge, a concise assistant inside the Forge AI Workspace. ' +
  'Answer in Markdown. Keep responses focused and practical.'

const HISTORY_LIMIT = 20
const RAG_CHUNK_LIMIT = 6

// Best-effort document grounding: embed the question, pull the most similar
// chunks from the attached documents, and prepend them as context.
async function buildContextBlock(
  userId: string,
  question: string,
  documentIds: string[],
): Promise<string> {
  try {
    const apiKey = await resolveApiKeyForUser(userId)
    const [embedding] = await embedTexts(apiKey, [question])
    const hits = await vectorService.similaritySearch(userId, embedding, {
      documentIds,
      limit: RAG_CHUNK_LIMIT,
    })
    if (hits.length === 0) return ''

    const excerpts = hits
      .map((h) => `### ${h.documentTitle}\n${h.excerpt}`)
      .join('\n\n')
    return (
      '\n\nThe user attached documents. Ground your answer in these excerpts ' +
      'and mention the document titles you drew from:\n\n' +
      excerpts
    )
  } catch (err) {
    logger.warn({ err, userId }, 'RAG grounding failed — answering without context')
    return ''
  }
}

export async function streamAiResponse(params: {
  userId: string
  conversationId: string
  streamId: string
  documentIds?: string[]
}): Promise<void> {
  const { userId, conversationId, streamId, documentIds } = params
  const room = `conversation:${conversationId}`
  const io = getIO()

  try {
    const [provider, settings, conversation] = await Promise.all([
      getProviderForUser(userId),
      settingsService.getSettings(userId),
      conversationsRepository.findById(conversationId, userId),
    ])
    if (!conversation) throw new Error('Conversation not found')

    const history: ChatMessage[] = conversation.messages
      .slice(-HISTORY_LIMIT)
      .map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }))

    const lastUserMessage = [...history].reverse().find((m) => m.role === 'user')
    const contextBlock =
      documentIds?.length && lastUserMessage
        ? await buildContextBlock(userId, lastUserMessage.content, documentIds)
        : ''

    const result = await provider.streamChat({
      model: settings.openaiModel,
      messages: [{ role: 'system', content: SYSTEM_PROMPT + contextBlock }, ...history],
      onToken: (token) => io.to(room).emit('ai:token', { streamId, token }),
    })

    const message = await conversationsRepository.addMessage(
      conversationId,
      'ASSISTANT',
      result.content,
      result.tokenCount,
    )

    io.to(room).emit('ai:done', {
      streamId,
      messageId: message.id,
      tokenCount: result.tokenCount,
    })
  } catch (err) {
    const message =
      err instanceof MissingApiKeyError
        ? err.message
        : err instanceof Error && err.message.startsWith('OpenAI')
          ? err.message
          : 'AI response failed — please try again'
    logger.error({ err, conversationId, streamId }, 'AI stream failed')
    io.to(room).emit('ai:error', { streamId, message })
  }
}
