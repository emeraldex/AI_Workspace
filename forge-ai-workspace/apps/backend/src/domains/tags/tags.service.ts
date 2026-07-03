// File: apps/backend/src/domains/tags/tags.service.ts
import { tagsRepository } from './tags.repository'
import { ConflictError, NotFoundError } from '../../shared/errors/AppError'
import { prisma } from '../../infrastructure/database/prisma.client'

export const tagsService = {
  async getAll(userId: string) {
    return tagsRepository.findAll(userId)
  },

  async create(userId: string, data: { name: string; color?: string }) {
    const existing = await prisma.tag.findUnique({ where: { userId_name: { userId, name: data.name } } })
    if (existing) throw new ConflictError('Tag name already exists')
    return tagsRepository.create(userId, data)
  },

  async delete(id: string, userId: string) {
    const tag = await tagsRepository.findById(id, userId)
    if (!tag) throw new NotFoundError('Tag')
    await tagsRepository.delete(id)
  },
}
