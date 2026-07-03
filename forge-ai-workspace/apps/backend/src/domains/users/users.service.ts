// File: apps/backend/src/domains/users/users.service.ts
// Purpose: User profile business logic

import { usersRepository } from './users.repository'
import { NotFoundError } from '../../shared/errors/AppError'

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId)
    if (!user) throw new NotFoundError('User')
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      timezone: user.timezone,
      createdAt: user.createdAt,
    }
  },

  async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string; bio?: string; timezone?: string },
  ) {
    const user = await usersRepository.update(userId, data)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      timezone: user.timezone,
      createdAt: user.createdAt,
    }
  },

  async deleteAccount(userId: string) {
    await usersRepository.softDelete(userId)
  },
}
