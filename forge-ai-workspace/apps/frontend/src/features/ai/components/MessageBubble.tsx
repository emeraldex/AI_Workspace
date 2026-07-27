// File: apps/frontend/src/features/ai/components/MessageBubble.tsx
// Purpose: One chat message — user right-aligned, assistant left with markdown

import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@shared/lib/utils'

interface MessageBubbleProps {
  role: 'USER' | 'ASSISTANT'
  content: string
  /** Streaming reply still in progress — shows a pulsing caret */
  streaming?: boolean
}

export function MessageBubble({ role, content, streaming = false }: MessageBubbleProps) {
  if (role === 'USER') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'prose prose-sm dark:prose-invert max-w-[85%] rounded-lg border bg-surface px-4 py-2.5',
          streaming && 'after:ml-0.5 after:inline-block after:h-4 after:w-2 after:animate-pulse after:bg-primary after:align-text-bottom after:content-[""]',
        )}
      >
        {content ? (
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
        ) : (
          streaming && <span className="text-muted-foreground">Thinking…</span>
        )}
      </div>
    </div>
  )
}
