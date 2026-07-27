// File: apps/frontend/src/features/documents/components/DocumentEditor.tsx
// Purpose: Markdown editor with debounced autosave, preview tab, export, delete

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { ArrowLeft, Download, RefreshCw, Trash2 } from 'lucide-react'
import 'highlight.js/styles/github-dark-dimmed.css'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Textarea } from '@shared/components/ui/Textarea'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { cn } from '@shared/lib/utils'
import { documentsApi } from '../api/documents.api'
import { useDeleteDocument, useDocument } from '../hooks/useDocuments'
import { useAutoSave, type SaveState } from '../hooks/useAutoSave'
import { IndexingStatus } from './IndexingStatus'

const SAVE_LABELS: Record<SaveState, string> = {
  idle: '',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed — still typing? It will retry on your next change',
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

export function DocumentEditor({ documentId }: { documentId: string }) {
  const navigate = useNavigate()
  const { data: doc, isPending, isError, error, refetch } = useDocument(documentId)
  const deleteDocument = useDeleteDocument()
  const { queueSave, saveState } = useAutoSave(documentId)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // Seed local state once per document (component is keyed by documentId)
  useEffect(() => {
    if (doc && !seeded) {
      setTitle(doc.title)
      setBody(doc.body)
      setSeeded(true)
    }
  }, [doc, seeded])

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {getApiErrorMessage(error, 'Failed to load this document')}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw />
              Retry
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/documents">Back to documents</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back to documents">
          <Link to="/documents">
            <ArrowLeft />
          </Link>
        </Button>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (e.target.value.trim()) queueSave({ title: e.target.value.trim() })
          }}
          placeholder="Untitled"
          aria-label="Document title"
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold focus:outline-none"
        />
        <span
          className={cn(
            'shrink-0 text-xs',
            saveState === 'error' ? 'text-destructive' : 'text-muted-foreground',
          )}
          role="status"
        >
          {SAVE_LABELS[saveState]}
        </span>
        <IndexingStatus status={doc.indexingStatus} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Export as Markdown"
          onClick={async () => {
            const blob = await documentsApi.export(documentId)
            downloadBlob(blob, `${title || 'document'}.md`)
          }}
        >
          <Download />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete document"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {(['edit', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-3 py-1.5 text-sm capitalize transition-colors',
              tab === t
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'edit' ? (
        <Textarea
          value={body}
          spellCheck={false}
          onChange={(e) => {
            setBody(e.target.value)
            queueSave({ body: e.target.value })
          }}
          placeholder="Write in Markdown…"
          className="min-h-[60vh] flex-1 resize-none font-mono text-sm leading-relaxed"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert min-h-[60vh] max-w-none rounded-lg border bg-surface p-6">
          {body.trim() ? (
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{body}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete document?"
        description={`"${title || 'Untitled'}" will be moved to trash.`}
        onConfirm={() =>
          deleteDocument.mutate(documentId, {
            onSuccess: () => navigate('/documents', { replace: true }),
          })
        }
        isPending={deleteDocument.isPending}
      />
    </div>
  )
}
