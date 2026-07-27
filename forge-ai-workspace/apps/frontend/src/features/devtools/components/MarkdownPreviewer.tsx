// File: apps/frontend/src/features/devtools/components/MarkdownPreviewer.tsx
// Purpose: Side-by-side markdown editor and rendered preview

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { Textarea } from '@shared/components/ui/Textarea'

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState('# Hello\n\nType **markdown** on the left.')

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        spellCheck={false}
        className="min-h-72 font-mono text-xs"
        aria-label="Markdown input"
      />
      <div className="prose prose-sm dark:prose-invert min-h-72 max-w-none overflow-auto rounded-md border bg-background p-4">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  )
}
