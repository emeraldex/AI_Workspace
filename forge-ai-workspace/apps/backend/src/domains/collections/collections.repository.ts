// File: apps/backend/src/domains/collections/collections.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'

export const collectionsRepository = {
  async findAll(userId: string) {
    return prisma.collection.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    })
  },

  async findById(id: string, userId: string) {
    return prisma.collection.findFirst({ where: { id, userId, deletedAt: null } })
  },

  async create(userId: string, data: { name: string; parentId?: string }) {
    return prisma.collection.create({ data: { userId, ...data } })
  },

  async update(id: string, data: { name: string }) {
    return prisma.collection.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.collection.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  async detachDocuments(id: string) {
    return prisma.document.updateMany({ where: { collectionId: id }, data: { collectionId: null } })
  },
}
