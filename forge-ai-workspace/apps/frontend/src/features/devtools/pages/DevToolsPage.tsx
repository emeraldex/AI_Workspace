// File: apps/frontend/src/features/devtools/pages/DevToolsPage.tsx
// Purpose: Developer utilities — JSON, JWT, Base64, Markdown (all client-side)

import { useState } from 'react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { cn } from '@shared/lib/utils'
import { JsonFormatter } from '../components/JsonFormatter'
import { JwtDecoder } from '../components/JwtDecoder'
import { Base64Tool } from '../components/Base64Tool'
import { MarkdownPreviewer } from '../components/MarkdownPreviewer'

const TOOLS = [
  { key: 'json', label: 'JSON', description: 'Format and validate JSON', component: JsonFormatter },
  { key: 'jwt', label: 'JWT', description: 'Decode header and payload (no verification)', component: JwtDecoder },
  { key: 'base64', label: 'Base64', description: 'Encode and decode UTF-8 text', component: Base64Tool },
  { key: 'markdown', label: 'Markdown', description: 'Live preview', component: MarkdownPreviewer },
] as const

type ToolKey = (typeof TOOLS)[number]['key']

export function DevToolsPage() {
  const [active, setActive] = useState<ToolKey>('json')
  const tool = TOOLS.find((t) => t.key === active)!
  const Tool = tool.component

  return (
    <PageContainer title="DevTools" description="Small utilities — everything runs in your browser">
      <div className="mb-4 flex gap-1 border-b" role="tablist" aria-label="Developer tools">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              '-mb-px border-b-2 px-3 py-1.5 text-sm transition-colors',
              active === t.key
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tool.label}</CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tool />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
