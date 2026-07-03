// File: apps/backend/src/domains/users/users.repository.ts
// Purpose: Data access for user profile operations

import { prisma } from '../../infrastructure/database/prisma.client'

export const usersRepository = {
  async findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } })
  },

  async update(id: string, data: { name?: string; avatarUrl?: string; bio?: string; timezone?: string }) {
    return prisma.user.update({ where: { id }, data })
  },

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
