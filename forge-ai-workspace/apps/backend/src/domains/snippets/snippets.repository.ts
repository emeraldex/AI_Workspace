// File: apps/backend/src/domains/snippets/snippets.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'

export const snippetsRepository = {
  async findAll(userId: string, filters: { language?: string; search?: string; tags?: string[]; cursor?: string; limit?: number }) {
    const limit = Math.min(filters.limit ?? 20, 100)
    const where: any = {
      userId,
      deletedAt: null,
      ...(filters.language && { language: filters.language }),
      ...(filters.tags?.length && { tags: { hasSome: filters.tags } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.cursor && { id: { lt: filters.cursor } }),
    }

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({ where, orderBy: { updatedAt: 'desc' }, take: limit + 1 }),
      prisma.snippet.count({ where }),
    ])

    const hasMore = snippets.length > limit
    if (hasMore) snippets.pop()
    return { snippets, total, hasMore, nextCursor: hasMore ? (snippets[snippets.length - 1]?.id ?? null) : null }
  },

  async findById(id: string, userId: string) {
    return prisma.snippet.findFirst({ where: { id, userId, deletedAt: null } })
  },

  async create(userId: string, data: { title: string; language: string; code: string; tags?: string[] }) {
    return prisma.snippet.create({ data: { userId, ...data } })
  },

  async update(id: string, data: { title?: string; language?: string; code?: string; tags?: string[] }) {
    return prisma.snippet.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.snippet.update({ where: { id }, data: { deletedAt: new Date() } })
  },
}
