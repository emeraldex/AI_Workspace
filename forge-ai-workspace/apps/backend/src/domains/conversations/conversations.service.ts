// File: apps/backend/src/domains/conversations/conversations.service.ts
// Purpose: Conversation CRUD. AI streaming logic is wired in Phase 12.

import { conversationsRepository } from './conversations.repository'
import { NotFoundError } from '../../shared/errors/AppError'
import { v4 as uuidv4 } from 'uuid'

export const conversationsService = {
  async getAll(userId: string, filters: any) {
    const result = await conversationsRepository.findAll(userId, filters)
    return {
      data: result.conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messageCount: c._count.messages,
        updatedAt: c.updatedAt,
      })),
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async getById(id: string, userId: string) {
    const conv = await conversationsRepository.findById(id, userId)
    if (!conv) throw new NotFoundError('Conversation')
    return conv
  },

  async create(userId: string, title = 'New Conversation') {
    return conversationsRepository.create(userId, title)
  },

  async update(id: string, userId: string, data: { title: string }) {
    const conv = await conversationsRepository.findById(id, userId)
    if (!conv) throw new NotFoundError('Conversation')
    return conversationsRepository.update(id, data)
  },

  async delete(id: string, userId: string) {
    const conv = await conversationsRepository.findById(id, userId)
    if (!conv) throw new NotFoundError('Conversation')
    await conversationsRepository.softDelete(id)
  },

  // Returns streamId — actual AI streaming wired in Phase 12
  async sendMessage(conversationId: string, userId: string, content: string) {
    const conv = await conversationsRepository.findById(conversationId, userId)
    if (!conv) throw new NotFoundError('Conversation')

    const userMessage = await conversationsRepository.addMessage(conversationId, 'USER', content)
    const streamId = uuidv4()

    return { userMessage, streamId }
  },
}
