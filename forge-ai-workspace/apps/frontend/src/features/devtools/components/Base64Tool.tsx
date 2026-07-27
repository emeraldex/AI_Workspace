// File: apps/frontend/src/features/devtools/components/Base64Tool.tsx
// Purpose: Base64 encode/decode (UTF-8 safe) client-side

import { useState } from 'react'
import { ArrowDownUp, Check, Copy } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Textarea } from '@shared/components/ui/Textarea'
import { useClipboard } from '@shared/hooks/useClipboard'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useClipboard()

  function encode() {
    try {
      setOutput(btoa(String.fromCharCode(...new TextEncoder().encode(input))))
      setError(null)
    } catch {
      setError('Could not encode input')
    }
  }

  function decode() {
    try {
      const bytes = Uint8Array.from(atob(input.trim()), (c) => c.charCodeAt(0))
      setOutput(new TextDecoder().decode(bytes))
      setError(null)
    } catch {
      setOutput('')
      setError('Not valid Base64')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Text or Base64…"
        spellCheck={false}
        className="min-h-32 font-mono text-xs"
        aria-label="Base64 input"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={encode} disabled={!input}>
          Encode
        </Button>
        <Button size="sm" variant="outline" onClick={decode} disabled={!input}>
          Decode
        </Button>
        {output && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInput(output)
                setOutput('')
              }}
              aria-label="Use output as input"
            >
              <ArrowDownUp />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => copy(output)}>
              {copied ? <Check className="text-success" /> : <Copy />}
              Copy
            </Button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {output && (
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all rounded-md border bg-background p-3 font-mono text-xs">
          {output}
        </pre>
      )}
    </div>
  )
}
