// File: apps/frontend/src/features/settings/hooks/useSettings.ts
// Purpose: Settings/profile queries and mutations; theme changes apply immediately

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../api/settings.api'
import { applyTheme } from '@shared/lib/theme'
import { useAuthStore } from '@shared/stores/auth.store'
import type { ChangePasswordRequest, UpdateProfileRequest, UpdateSettingsRequest } from '@forge/shared'

export const SETTINGS_QUERY_KEY = 'settings'
export const PROFILE_QUERY_KEY = 'profile'

export function useSettings() {
  return useQuery({ queryKey: [SETTINGS_QUERY_KEY], queryFn: settingsApi.getSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateSettingsRequest) => settingsApi.updateSettings(body),
    onSuccess: (settings) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY], settings)
      applyTheme(settings.theme)
    },
  })
}

export function useProfile() {
  return useQuery({ queryKey: [PROFILE_QUERY_KEY], queryFn: settingsApi.getProfile })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => settingsApi.updateProfile(body),
    onSuccess: (profile) => {
      queryClient.setQueryData([PROFILE_QUERY_KEY], profile)
      // Header shows the name from the auth store — keep it in sync
      updateUser({ name: profile.name, avatarUrl: profile.avatarUrl })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => settingsApi.changePassword(body),
  })
}
