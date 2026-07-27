// File: apps/backend/src/infrastructure/ai/ai.provider.factory.ts
// Purpose: Resolves the AI provider for a user — their own encrypted key first,
//          falling back to the server-wide OPENAI_API_KEY if configured.

import { config } from '../../shared/config'
import { settingsService } from '../../domains/settings/settings.service'
import { OpenAIProvider } from './openai.provider'
import type { IAIProvider } from './ai.provider.interface'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No OpenAI API key configured — add one in Settings')
    this.name = 'MissingApiKeyError'
  }
}

export async function getProviderForUser(userId: string): Promise<IAIProvider> {
  const userKey = await settingsService.getDecryptedApiKey(userId)
  const apiKey = userKey ?? config.openaiApiKey
  if (!apiKey) throw new MissingApiKeyError()
  return new OpenAIProvider(apiKey)
}
