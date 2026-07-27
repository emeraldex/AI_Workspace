// File: apps/backend/src/infrastructure/ai/openai.provider.ts
// Purpose: OpenAI chat-completions streaming via native fetch (SSE parsing).
//          No SDK dependency — the streaming protocol is a stable line format.

import { AppError } from '../../shared/errors/AppError'
import type { IAIProvider, StreamChatOptions, StreamChatResult } from './ai.provider.interface'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export class OpenAIProvider implements IAIProvider {
  constructor(private readonly apiKey: string) {}

  async streamChat(options: StreamChatOptions): Promise<StreamChatResult> {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: options.signal,
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: true,
        stream_options: { include_usage: true },
      }),
    })

    if (!response.ok || !response.body) {
      if (response.status === 401) {
        throw new AppError('OpenAI rejected the API key — check it in Settings', 502)
      }
      const detail = await response.text().catch(() => '')
      throw new AppError(
        `OpenAI request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`,
        502,
      )
    }

    let content = ''
    let completionTokens: number | null = null
    const decoder = new TextDecoder()
    let buffer = ''

    // SSE frames: lines of `data: {json}` separated by blank lines, ending with `data: [DONE]`
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk as Uint8Array, { stream: true })
      let newlineIndex: number
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6)
        if (payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const token: string | undefined = parsed.choices?.[0]?.delta?.content
          if (token) {
            content += token
            options.onToken(token)
          }
          if (parsed.usage?.completion_tokens != null) {
            completionTokens = parsed.usage.completion_tokens
          }
        } catch {
          // Partial/keep-alive frame — ignore
        }
      }
    }

    return {
      content,
      // ~4 chars/token is a reasonable estimate if usage was not reported
      tokenCount: completionTokens ?? Math.ceil(content.length / 4),
    }
  }
}
