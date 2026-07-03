// File: apps/backend/tests/unit/auth/auth.service.test.ts
// Purpose: Unit tests for auth service business logic
// Dependencies: Jest, mocked auth.repository

import { authService } from '../../../src/domains/auth/auth.service'
import { authRepository } from '../../../src/domains/auth/auth.repository'
import { AuthError, ConflictError } from '../../../src/shared/errors/AppError'
import bcrypt from 'bcrypt'

jest.mock('../../../src/domains/auth/auth.repository')
jest.mock('../../../src/infrastructure/database/prisma.client', () => ({}))
jest.mock('../../../src/infrastructure/cache/redis.client', () => ({}))

const mockRepo = authRepository as jest.Mocked<typeof authRepository>

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: '',
  avatarUrl: null,
  bio: null,
  timezone: 'UTC',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeAll(async () => {
  mockUser.passwordHash = await bcrypt.hash('password123', 12)
})

beforeEach(() => jest.clearAllMocks())

describe('authService.register', () => {
  it('creates user and returns tokens when email is unique', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null)
    mockRepo.createUser.mockResolvedValue(mockUser)
    mockRepo.createRefreshToken.mockResolvedValue({} as any)

    const result = await authService.register('Test User', 'test@example.com', 'password123')

    expect(result.user.email).toBe('test@example.com')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(mockRepo.createUser).toHaveBeenCalledTimes(1)
  })

  it('throws ConflictError when email already exists', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(mockUser)

    await expect(
      authService.register('Test User', 'test@example.com', 'password123'),
    ).rejects.toThrow(ConflictError)
  })
})

describe('authService.login', () => {
  it('returns tokens on valid credentials', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(mockUser)
    mockRepo.createRefreshToken.mockResolvedValue({} as any)

    const result = await authService.login('test@example.com', 'password123')

    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('throws AuthError on unknown email', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null)

    await expect(authService.login('unknown@example.com', 'password123')).rejects.toThrow(
      AuthError,
    )
  })

  it('throws AuthError on wrong password', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(mockUser)

    await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
      AuthError,
    )
  })
})

describe('authService.changePassword', () => {
  it('updates password and invalidates all sessions', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUser)
    mockRepo.updatePasswordHash.mockResolvedValue(mockUser)
    mockRepo.deleteAllUserRefreshTokens.mockResolvedValue({ count: 1 })

    await authService.changePassword('user-1', 'password123', 'newpassword456')

    expect(mockRepo.updatePasswordHash).toHaveBeenCalledTimes(1)
    expect(mockRepo.deleteAllUserRefreshTokens).toHaveBeenCalledWith('user-1')
  })

  it('throws AuthError when current password is wrong', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUser)

    await expect(
      authService.changePassword('user-1', 'wrongpassword', 'newpassword456'),
    ).rejects.toThrow(AuthError)
  })
})
