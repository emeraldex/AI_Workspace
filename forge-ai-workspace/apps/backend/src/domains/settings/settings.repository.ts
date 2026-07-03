// File: apps/backend/src/domains/settings/settings.repository.ts
import { prisma } from '../../infrastructure/database/prisma.client'
import { Theme } from '@prisma/client'

export const settingsRepository = {
  async findByUserId(userId: string) {
    return prisma.userSettings.findUnique({ where: { userId } })
  },

  async upsert(
    userId: string,
    data: {
      theme?: Theme
      openaiApiKeyEncrypted?: string | null
      openaiModel?: string
      notifyTaskDueSoon?: boolean
      notifyTaskOverdue?: boolean
      notifyAiTaskCreated?: boolean
      dismissedWidgets?: string[]
    },
  ) {
    return prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })
  },
}
