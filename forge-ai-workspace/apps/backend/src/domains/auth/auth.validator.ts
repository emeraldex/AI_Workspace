// File: apps/backend/src/domains/auth/auth.validator.ts
// Purpose: Zod schemas for auth request validation (re-exported from shared + extended)

import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
})
