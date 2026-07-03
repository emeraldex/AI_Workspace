// File: apps/backend/src/domains/documents/documents.service.ts
import { documentsRepository } from './documents.repository'
import { NotFoundError } from '../../shared/errors/AppError'

function toDocDto(doc: any, includeBody = false) {
  return {
    id: doc.id,
    title: doc.title,
    collectionId: doc.collectionId,
    indexingStatus: doc.indexingStatus,
    tags: doc.documentTags?.map((dt: any) => dt.tag) ?? [],
    ...(includeBody && { body: doc.body }),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export const documentsService = {
  async getAll(userId: string, filters: any) {
    const result = await documentsRepository.findAll(userId, filters)
    return {
      data: result.docs.map((d) => toDocDto(d)),
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async getById(id: string, userId: string) {
    const doc = await documentsRepository.findById(id, userId)
    if (!doc) throw new NotFoundError('Document')
    return toDocDto(doc, true)
  },

  async create(userId: string, data: any) {
    const doc = await documentsRepository.create(userId, data)
    // RAG indexing will be triggered here in Phase 12
    return toDocDto(doc, true)
  },

  async update(id: string, userId: string, data: any) {
    const existing = await documentsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Document')
    const doc = await documentsRepository.update(id, data)
    // RAG re-indexing will be triggered here in Phase 12
    return toDocDto(doc)
  },

  async delete(id: string, userId: string) {
    const existing = await documentsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Document')
    await documentsRepository.softDelete(id)
  },

  async export(id: string, userId: string) {
    const doc = await documentsRepository.findById(id, userId)
    if (!doc) throw new NotFoundError('Document')
    return { title: doc.title, body: doc.body }
  },
}
