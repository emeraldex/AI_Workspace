// File: apps/backend/src/domains/auth/auth.repository.ts
// Purpose: All database operations for the auth domain.
//          No business logic — pure data access only.

import { prisma } from '../../infrastructure/database/prisma.client'

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    })
  },

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
  },

  async createUser(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        ...data,
        settings: { create: {} }, // provision default settings on registration
      },
    })
  },

  async updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
  },

  async createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data })
  },

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
  },

  async deleteRefreshToken(tokenHash: string) {
    return prisma.refreshToken.deleteMany({ where: { tokenHash } })
  },

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } })
  },

  async deleteExpiredRefreshTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  },
}
