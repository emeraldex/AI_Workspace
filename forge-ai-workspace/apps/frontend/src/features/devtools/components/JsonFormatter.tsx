// File: apps/frontend/src/features/devtools/components/JsonFormatter.tsx
// Purpose: Pretty-print / validate JSON entirely client-side

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { Textarea } from '@shared/components/ui/Textarea'
import { useClipboard } from '@shared/hooks/useClipboard'

export function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, copy } = useClipboard()

  function format(indent: number) {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, indent))
      setError(null)
    } catch (e) {
      setOutput('')
      setError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"paste": "json here"}'
        spellCheck={false}
        className="min-h-40 font-mono text-xs"
        aria-label="JSON input"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => format(2)} disabled={!input.trim()}>
          Format
        </Button>
        <Button size="sm" variant="outline" onClick={() => format(0)} disabled={!input.trim()}>
          Minify
        </Button>
        {output && (
          <Button size="sm" variant="ghost" onClick={() => copy(output)}>
            {copied ? <Check className="text-success" /> : <Copy />}
            Copy
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {output && (
        <pre className="max-h-72 overflow-auto rounded-md border bg-background p-3 font-mono text-xs">
          {output}
        </pre>
      )}
    </div>
  )
}
