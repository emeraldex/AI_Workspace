// File: apps/backend/src/infrastructure/ai/ai.provider.factory.ts
// Purpose: Resolves the AI provider for a user — their own encrypted key first,
//          falling back to the server-wide OPENAI_API_KEY if configured.

import { config } from '../../shared/config'
import { AppError } from '../../shared/errors/AppError'
import { settingsService } from '../../domains/settings/settings.service'
import { OpenAIProvider } from './openai.provider'
import type { IAIProvider } from './ai.provider.interface'

export class MissingApiKeyError extends AppError {
  constructor() {
    super('No OpenAI API key configured — add one in Settings', 400)
  }
}

export async function resolveApiKeyForUser(userId: string): Promise<string> {
  const userKey = await settingsService.getDecryptedApiKey(userId)
  const apiKey = userKey ?? config.openaiApiKey
  if (!apiKey) throw new MissingApiKeyError()
  return apiKey
}

export async function getProviderForUser(userId: string): Promise<IAIProvider> {
  return new OpenAIProvider(await resolveApiKeyForUser(userId))
}
