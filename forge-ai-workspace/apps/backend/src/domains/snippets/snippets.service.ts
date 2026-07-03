// File: apps/backend/src/domains/snippets/snippets.service.ts
import { snippetsRepository } from './snippets.repository'
import { NotFoundError } from '../../shared/errors/AppError'

export const snippetsService = {
  async getAll(userId: string, filters: any) {
    const result = await snippetsRepository.findAll(userId, filters)
    return {
      data: result.snippets,
      pagination: { nextCursor: result.nextCursor, hasMore: result.hasMore, total: result.total },
    }
  },

  async create(userId: string, data: any) {
    return snippetsRepository.create(userId, data)
  },

  async update(id: string, userId: string, data: any) {
    const existing = await snippetsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Snippet')
    return snippetsRepository.update(id, data)
  },

  async delete(id: string, userId: string) {
    const existing = await snippetsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Snippet')
    await snippetsRepository.softDelete(id)
  },
}
