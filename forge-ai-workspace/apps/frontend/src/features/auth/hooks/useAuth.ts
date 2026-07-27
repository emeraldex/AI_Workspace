// File: apps/frontend/src/features/auth/hooks/useAuth.ts
// Purpose: Auth mutations (login/register) and session restore on app load

import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { apiClient } from '@shared/api/client'
import { applyTheme } from '@shared/lib/theme'
import { useAuthStore } from '@shared/stores/auth.store'
import type { ApiResponse, LoginRequest, RegisterRequest, UserSettings } from '@forge/shared'

// Best-effort: sync the saved theme once a session exists. Kept here (not in
// the settings feature) so restoring a session on a fresh browser applies it.
async function syncTheme() {
  try {
    const { data } = await apiClient.get<ApiResponse<UserSettings>>('/settings')
    applyTheme(data.data.theme)
  } catch {
    // Theme stays on the pre-paint default
  }
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: ({ user, accessToken }) => setAuth(user, accessToken),
  })
}

// Attempts to restore the session from the httpOnly refresh cookie.
// Access tokens are memory-only, so every full page load starts here.
export function useSessionRestore() {
  const [restoring, setRestoring] = useState(true)

  const restore = useCallback(async () => {
    const { setAuth, setAccessToken, clearAuth } = useAuthStore.getState()
    try {
      const { accessToken } = await authApi.refresh()
      setAccessToken(accessToken)
      const profile = await authApi.me()
      setAuth(
        { id: profile.id, name: profile.name, email: profile.email, avatarUrl: profile.avatarUrl },
        accessToken,
      )
      void syncTheme()
    } catch {
      clearAuth() // No valid refresh cookie — user simply isn't logged in
    } finally {
      setRestoring(false)
    }
  }, [])

  useEffect(() => {
    void restore()
  }, [restore])

  return restoring
}
