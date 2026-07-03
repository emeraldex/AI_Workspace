// File: apps/backend/src/domains/auth/auth.service.ts
// Purpose: All auth business logic — registration, login, token lifecycle, password change.
//          Depends on auth.repository and never touches HTTP layer.

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { authRepository } from './auth.repository'
import { config } from '../../shared/config'
import { AuthError, ConflictError, NotFoundError } from '../../shared/errors/AppError'
import type { AuthUser } from '@forge/shared'

const BCRYPT_ROUNDS = 12

// ── Token helpers ────────────────────────────────────────────────────────────

function generateAccessToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
  )
}

function generateRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = crypto.randomBytes(64).toString('hex')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  return { raw, hash, expiresAt }
}

function toAuthUser(user: { id: string; name: string; email: string; avatarUrl: string | null }): AuthUser {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
}

// ── Service methods ──────────────────────────────────────────────────────────

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await authRepository.findUserByEmail(email)
    if (existing) throw new ConflictError('Email already in use')

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await authRepository.createUser({ name, email, passwordHash })

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken()

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshToken.hash,
      expiresAt: refreshToken.expiresAt,
    })

    return { user: toAuthUser(user), accessToken, refreshToken: refreshToken.raw }
  },

  async login(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email)
    if (!user) throw new AuthError('Invalid email or password')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new AuthError('Invalid email or password')

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken()

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshToken.hash,
      expiresAt: refreshToken.expiresAt,
    })

    return { user: toAuthUser(user), accessToken, refreshToken: refreshToken.raw }
  },

  async refresh(rawToken: string) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const stored = await authRepository.findRefreshToken(hash)

    if (!stored) throw new AuthError('Invalid refresh token')
    if (stored.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(hash)
      throw new AuthError('Refresh token expired')
    }
    if (stored.user.deletedAt) throw new AuthError('Account not found')

    // Rotate: delete old, issue new
    await authRepository.deleteRefreshToken(hash)

    const newRefreshToken = generateRefreshToken()
    await authRepository.createRefreshToken({
      userId: stored.userId,
      tokenHash: newRefreshToken.hash,
      expiresAt: newRefreshToken.expiresAt,
    })

    const accessToken = generateAccessToken(stored.user)
    return { accessToken, refreshToken: newRefreshToken.raw }
  },

  async logout(rawToken: string) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
    await authRepository.deleteRefreshToken(hash)
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId)
    if (!user) throw new NotFoundError('User')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new AuthError('Current password is incorrect')

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    await authRepository.updatePasswordHash(userId, newHash)

    // Invalidate all sessions on password change
    await authRepository.deleteAllUserRefreshTokens(userId)
  },
}
