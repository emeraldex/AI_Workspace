// File: apps/frontend/src/features/ai/components/MessageInput.tsx
// Purpose: Chat composer — Enter sends, Shift+Enter for a newline

import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Textarea } from '@shared/components/ui/Textarea'

interface MessageInputProps {
  disabled: boolean
  onSend: (content: string) => void
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [content, setContent] = useState('')

  function send() {
    const trimmed = content.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setContent('')
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        placeholder={disabled ? 'Waiting for the reply…' : 'Message Forge… (Enter to send)'}
        aria-label="Message"
        rows={1}
        className="max-h-40 min-h-[44px] flex-1 resize-none"
      />
      <Button type="submit" size="icon" disabled={disabled || !content.trim()} aria-label="Send message">
        <SendHorizonal />
      </Button>
    </form>
  )
}
