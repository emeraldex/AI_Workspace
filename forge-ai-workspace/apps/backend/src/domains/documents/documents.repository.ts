// File: apps/backend/src/domains/documents/documents.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'

export const documentsRepository = {
  async findAll(userId: string, filters: { collectionId?: string; search?: string; tagIds?: string[]; cursor?: string; limit?: number }) {
    const limit = Math.min(filters.limit ?? 20, 100)
    const where: any = {
      userId,
      deletedAt: null,
      ...(filters.collectionId && { collectionId: filters.collectionId }),
      ...(filters.tagIds?.length && { documentTags: { some: { tagId: { in: filters.tagIds } } } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { body: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.cursor && { id: { lt: filters.cursor } }),
    }

    const [docs, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true, title: true, collectionId: true, indexingStatus: true,
          createdAt: true, updatedAt: true,
          documentTags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
      }),
      prisma.document.count({ where }),
    ])

    const hasMore = docs.length > limit
    if (hasMore) docs.pop()
    return { docs, total, hasMore, nextCursor: hasMore ? (docs[docs.length - 1]?.id ?? null) : null }
  },

  async findById(id: string, userId: string) {
    return prisma.document.findFirst({
      where: { id, userId, deletedAt: null },
      include: { documentTags: { include: { tag: true } } },
    })
  },

  async create(userId: string, data: { title: string; body?: string; collectionId?: string; tagIds?: string[] }) {
    const { tagIds, ...docData } = data
    return prisma.document.create({
      data: {
        userId,
        ...docData,
        ...(tagIds?.length && { documentTags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      },
      include: { documentTags: { include: { tag: true } } },
    })
  },

  async update(id: string, data: { title?: string; body?: string; collectionId?: string; tagIds?: string[] }) {
    const { tagIds, ...docData } = data
    return prisma.document.update({
      where: { id },
      data: {
        ...docData,
        ...(tagIds !== undefined && {
          documentTags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) },
        }),
      },
      include: { documentTags: { include: { tag: true } } },
    })
  },

  async updateIndexingStatus(id: string, status: 'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED') {
    return prisma.document.update({ where: { id }, data: { indexingStatus: status } })
  },

  async softDelete(id: string) {
    return prisma.document.update({ where: { id }, data: { deletedAt: new Date() } })
  },
}
