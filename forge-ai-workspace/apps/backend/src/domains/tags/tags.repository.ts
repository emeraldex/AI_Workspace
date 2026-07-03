// File: apps/backend/src/domains/tags/tags.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'

export const tagsRepository = {
  async findAll(userId: string) {
    return prisma.tag.findMany({ where: { userId }, orderBy: { name: 'asc' } })
  },

  async findById(id: string, userId: string) {
    return prisma.tag.findFirst({ where: { id, userId } })
  },

  async create(userId: string, data: { name: string; color?: string }) {
    return prisma.tag.create({ data: { userId, ...data } })
  },

  async delete(id: string) {
    return prisma.tag.delete({ where: { id } })
  },
}
