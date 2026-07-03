// File: apps/backend/src/domains/conversations/conversations.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'
import { MessageRole } from '@prisma/client'

export const conversationsRepository = {
  async findAll(userId: string, filters: { cursor?: string; limit?: number }) {
    const limit = Math.min(filters.limit ?? 20, 100)
    const where: any = { userId, deletedAt: null, ...(filters.cursor && { id: { lt: filters.cursor } }) }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: { _count: { select: { messages: true } } },
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
      }),
      prisma.conversation.count({ where }),
    ])

    const hasMore = conversations.length > limit
    if (hasMore) conversations.pop()
    return { conversations, total, hasMore, nextCursor: hasMore ? (conversations[conversations.length - 1]?.id ?? null) : null }
  },

  async findById(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: { id, userId, deletedAt: null },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
  },

  async create(userId: string, title: string) {
    return prisma.conversation.create({ data: { userId, title }, include: { messages: true } })
  },

  async update(id: string, data: { title: string }) {
    return prisma.conversation.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.conversation.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  async addMessage(conversationId: string, role: MessageRole, content: string, tokenCount?: number) {
    return prisma.message.create({ data: { conversationId, role, content, tokenCount } })
  },

  async getLastAssistantMessage(conversationId: string) {
    return prisma.message.findFirst({
      where: { conversationId, role: 'ASSISTANT' },
      orderBy: { createdAt: 'desc' },
    })
  },

  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } })
  },
}
