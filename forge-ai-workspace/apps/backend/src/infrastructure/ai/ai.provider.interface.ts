// File: apps/backend/src/infrastructure/ai/ai.provider.interface.ts
// Purpose: Provider-agnostic contract for streaming chat completions

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamChatOptions {
  model: string
  messages: ChatMessage[]
  onToken: (token: string) => void
  signal?: AbortSignal
}

export interface StreamChatResult {
  content: string
  tokenCount: number
}

export interface IAIProvider {
  streamChat(options: StreamChatOptions): Promise<StreamChatResult>
}
