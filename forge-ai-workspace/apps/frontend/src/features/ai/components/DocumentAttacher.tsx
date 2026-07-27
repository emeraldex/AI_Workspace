// File: apps/frontend/src/features/ai/components/DocumentAttacher.tsx
// Purpose: Attach indexed documents to ground the AI's replies

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, FileText, Paperclip, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/Dialog'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/lib/utils'
import { conversationsApi, type DocumentOption } from '../api/conversations.api'

interface DocumentAttacherProps {
  attached: DocumentOption[]
  onChange: (attached: DocumentOption[]) => void
}

export function DocumentAttacher({ attached, onChange }: DocumentAttacherProps) {
  const [open, setOpen] = useState(false)
  const { data: options } = useQuery({
    queryKey: ['documents', 'attach-options'],
    queryFn: conversationsApi.listDocumentOptions,
    enabled: open,
  })

  function toggle(doc: DocumentOption) {
    onChange(
      attached.some((d) => d.id === doc.id)
        ? attached.filter((d) => d.id !== doc.id)
        : [...attached, doc],
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Paperclip />
          {attached.length > 0 ? `${attached.length} attached` : 'Attach documents'}
        </Button>
        {attached.map((doc) => (
          <span
            key={doc.id}
            className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
          >
            <FileText className="h-3 w-3" />
            <span className="max-w-32 truncate">{doc.title}</span>
            <button onClick={() => toggle(doc)} aria-label={`Detach ${doc.title}`}>
              <X className="h-3 w-3 hover:text-destructive" />
            </button>
          </span>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach documents</DialogTitle>
            <DialogDescription>
              Replies will be grounded in the most relevant excerpts. Only indexed documents can
              answer — others are listed for status.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {(options ?? []).length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No documents yet — create some on the Documents page.
              </p>
            )}
            {(options ?? []).map((doc) => {
              const isAttached = attached.some((d) => d.id === doc.id)
              const indexed = doc.indexingStatus === 'INDEXED'
              return (
                <button
                  key={doc.id}
                  onClick={() => toggle(doc)}
                  disabled={!indexed && !isAttached}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    isAttached ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                    !indexed && 'opacity-50',
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                  {!indexed && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {doc.indexingStatus.toLowerCase()}
                    </span>
                  )}
                  {isAttached && <Check className="h-4 w-4 shrink-0" />}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
