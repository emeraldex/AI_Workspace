// File: apps/backend/src/domains/auth/auth.router.ts
// Purpose: Express router for /api/v1/auth — wires middleware, validators, and controller

import { Router } from 'express'
import { authController } from './auth.controller'
import { validate } from '../../shared/middleware/validate'
import { authenticate } from '../../shared/middleware/authenticate'
import { authRateLimiter, registerRateLimiter } from '../../shared/middleware/rateLimiter'
import { registerSchema, loginSchema, changePasswordSchema } from './auth.validator'

const router = Router()

// Wrap async controllers to forward errors to the global error handler
const asyncHandler =
  (fn: (req: any, res: any) => Promise<void>) =>
  (req: any, res: any, next: any) =>
    fn(req, res).catch(next)

router.post(
  '/register',
  registerRateLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
)

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
)

router.post('/refresh', asyncHandler(authController.refresh))

router.post('/logout', authenticate, asyncHandler(authController.logout))

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
)

export { router as authRouter }
