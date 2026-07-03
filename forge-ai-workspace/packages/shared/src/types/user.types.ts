// File: packages/shared/src/types/user.types.ts
// Purpose: User profile types

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  bio: string | null
  timezone: string
  createdAt: string
}

export interface UpdateProfileRequest {
  name?: string
  avatarUrl?: string
  bio?: string
  timezone?: string
}

export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM'

export interface UserSettings {
  theme: Theme
  openaiModel: string
  hasOpenaiKey: boolean
  notifyTaskDueSoon: boolean
  notifyTaskOverdue: boolean
  notifyAiTaskCreated: boolean
  dismissedWidgets: string[]
}

export interface UpdateSettingsRequest {
  theme?: Theme
  openaiApiKey?: string
  openaiModel?: string
  notifyTaskDueSoon?: boolean
  notifyTaskOverdue?: boolean
  notifyAiTaskCreated?: boolean
  dismissedWidgets?: string[]
}
