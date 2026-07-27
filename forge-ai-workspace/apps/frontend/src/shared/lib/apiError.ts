// File: apps/frontend/src/shared/lib/apiError.ts
// Purpose: Extracts a human-readable message (and field errors) from an API error response

import { isAxiosError } from 'axios'
import type { ApiError, FieldError } from '@forge/shared'

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiError | undefined
    if (body?.message) return body.message
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?'
  }
  return fallback
}

export function getApiFieldErrors(error: unknown): FieldError[] {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiError | undefined
    return body?.errors ?? []
  }
  return []
}
