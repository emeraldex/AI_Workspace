// File: apps/backend/src/domains/auth/auth.controller.ts
// Purpose: HTTP layer for auth — reads request, calls service, writes response.
//          No business logic here.

import { Request, Response } from 'express'
import { authService } from './auth.service'
import { config } from '../../shared/config'

const COOKIE_NAME = 'refreshToken'

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/v1/auth',
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body
    const result = await authService.register(name, email, password)

    res.cookie(COOKIE_NAME, result.refreshToken, cookieOptions)
    res.status(201).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    })
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    const result = await authService.login(email, password)

    res.cookie(COOKIE_NAME, result.refreshToken, cookieOptions)
    res.status(200).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    })
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.[COOKIE_NAME] as string | undefined
    if (!rawToken) {
      res.status(401).json({ success: false, message: 'Refresh token missing' })
      return
    }

    const result = await authService.refresh(rawToken)

    res.cookie(COOKIE_NAME, result.refreshToken, cookieOptions)
    res.status(200).json({ success: true, data: { accessToken: result.accessToken } })
  },

  async logout(req: Request, res: Response): Promise<void> {
    const rawToken = req.cookies?.[COOKIE_NAME] as string | undefined

    if (rawToken) {
      await authService.logout(rawToken)
    }

    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth' })
    res.status(204).send()
  },

  async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body
    await authService.changePassword(req.user!.id, currentPassword, newPassword)

    // Clear refresh token cookie — user must re-login
    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth' })
    res.status(200).json({ success: true, data: { message: 'Password updated' } })
  },
}
