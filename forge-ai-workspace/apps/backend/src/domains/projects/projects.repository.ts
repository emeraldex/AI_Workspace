// File: apps/backend/src/domains/projects/projects.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'

export const projectsRepository = {
  async findAll(userId: string, includeArchived: boolean) {
    return prisma.project.findMany({
      where: { userId, deletedAt: null, ...(includeArchived ? {} : { isArchived: false }) },
      include: { _count: { select: { tasks: { where: { deletedAt: null } } } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: { id, userId, deletedAt: null },
      include: { _count: { select: { tasks: { where: { deletedAt: null } } } } },
    })
  },

  async create(userId: string, data: { name: string; description?: string; color?: string; icon?: string }) {
    return prisma.project.create({ data: { userId, ...data } })
  },

  async update(id: string, data: { name?: string; description?: string; color?: string; icon?: string; isArchived?: boolean }) {
    return prisma.project.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } })
  },

  async getCompletedCount(projectId: string) {
    return prisma.task.count({
      where: { projectId, deletedAt: null, status: 'DONE' },
    })
  },
}
