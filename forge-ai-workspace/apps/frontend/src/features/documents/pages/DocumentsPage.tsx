// File: apps/frontend/src/features/documents/pages/DocumentsPage.tsx
// Purpose: Documents page — collection sidebar + list, or editor when a
//          document is selected via /documents/:documentId

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { useDebounce } from '@shared/hooks/useDebounce'
import { CollectionTree } from '../components/CollectionTree'
import { DocumentList } from '../components/DocumentList'
import { DocumentEditor } from '../components/DocumentEditor'
import { useCreateDocument } from '../hooks/useDocuments'

export function DocumentsPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const createDocument = useCreateDocument()

  const [collectionId, setCollectionId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  function handleCreate() {
    createDocument.mutate(
      { title: 'Untitled', body: '', collectionId },
      { onSuccess: (doc) => navigate(`/documents/${doc.id}`) },
    )
  }

  if (documentId) {
    return (
      <PageContainer title="Documents" className="max-w-4xl">
        <DocumentEditor key={documentId} documentId={documentId} />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Documents"
      description="Notes and knowledge, ready for AI"
      actions={
        <Button onClick={handleCreate} disabled={createDocument.isPending}>
          <Plus />
          New document
        </Button>
      }
    >
      <div className="flex gap-6">
        <aside className="w-56 shrink-0">
          <CollectionTree selectedId={collectionId} onSelect={setCollectionId} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search titles and content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search documents"
            />
          </div>
          <DocumentList
            filters={{ collectionId, search: debouncedSearch || undefined }}
            onCreate={handleCreate}
          />
        </div>
      </div>
    </PageContainer>
  )
}
