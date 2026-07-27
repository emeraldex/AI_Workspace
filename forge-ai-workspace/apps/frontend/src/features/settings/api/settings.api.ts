// File: apps/frontend/src/features/settings/api/settings.api.ts
// Purpose: Typed wrappers for /api/v1/settings, /users/me, and /auth/change-password

import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  UserProfile,
  UserSettings,
} from '@forge/shared'

export const settingsApi = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await apiClient.get<ApiResponse<UserSettings>>('/settings')
    return data.data
  },

  async updateSettings(body: UpdateSettingsRequest): Promise<UserSettings> {
    const { data } = await apiClient.patch<ApiResponse<UserSettings>>('/settings', body)
    return data.data
  },

  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/users/me')
    return data.data
  },

  async updateProfile(body: UpdateProfileRequest): Promise<UserProfile> {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>('/users/me', body)
    return data.data
  },

  async changePassword(body: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', body)
  },
}
