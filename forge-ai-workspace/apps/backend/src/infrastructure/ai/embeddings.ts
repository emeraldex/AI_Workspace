// File: apps/backend/src/infrastructure/ai/embeddings.ts
// Purpose: OpenAI embeddings via native fetch — text-embedding-3-small,
//          1536 dimensions, matching the DocumentChunk vector column.

import { AppError } from '../../shared/errors/AppError'

const EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings'
export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

export async function embedTexts(apiKey: string, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const response = await fetch(EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new AppError('OpenAI rejected the API key — check it in Settings', 502)
    }
    const detail = await response.text().catch(() => '')
    throw new AppError(
      `Embedding request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
      502,
    )
  }

  const json = (await response.json()) as { data: Array<{ index: number; embedding: number[] }> }
  // OpenAI preserves order, but sort by index defensively
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding)
}
