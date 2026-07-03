// File: apps/backend/src/domains/settings/settings.service.ts
// Purpose: Settings business logic — encrypts API key before storage, never returns raw key

import { settingsRepository } from './settings.repository'
import { encrypt, decrypt } from '../../shared/crypto/encryption'
import { Theme } from '@prisma/client'

export const settingsService = {
  async getSettings(userId: string) {
    const s = await settingsRepository.findByUserId(userId)
    return {
      theme: s?.theme ?? 'SYSTEM',
      openaiModel: s?.openaiModel ?? 'gpt-4o',
      hasOpenaiKey: !!s?.openaiApiKeyEncrypted,
      notifyTaskDueSoon: s?.notifyTaskDueSoon ?? true,
      notifyTaskOverdue: s?.notifyTaskOverdue ?? true,
      notifyAiTaskCreated: s?.notifyAiTaskCreated ?? true,
      dismissedWidgets: s?.dismissedWidgets ?? [],
    }
  },

  async updateSettings(
    userId: string,
    data: {
      theme?: Theme
      openaiApiKey?: string
      openaiModel?: string
      notifyTaskDueSoon?: boolean
      notifyTaskOverdue?: boolean
      notifyAiTaskCreated?: boolean
      dismissedWidgets?: string[]
    },
  ) {
    const { openaiApiKey, ...rest } = data
    const updateData: Parameters<typeof settingsRepository.upsert>[1] = { ...rest }

    if (openaiApiKey !== undefined) {
      updateData.openaiApiKeyEncrypted = openaiApiKey ? encrypt(openaiApiKey) : null
    }

    await settingsRepository.upsert(userId, updateData)
    return this.getSettings(userId)
  },

  async getDecryptedApiKey(userId: string): Promise<string | null> {
    const s = await settingsRepository.findByUserId(userId)
    if (!s?.openaiApiKeyEncrypted) return null
    return decrypt(s.openaiApiKeyEncrypted)
  },
}
