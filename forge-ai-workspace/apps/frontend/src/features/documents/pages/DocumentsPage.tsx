// File: apps/frontend/src/features/documents/pages/DocumentsPage.tsx
// Purpose: Documents page — placeholder until editor and collections are implemented

import { FileText } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function DocumentsPage() {
  return (
    <PlaceholderPage
      title="Documents"
      description="Markdown editor, collections tree, and RAG indexing status land here next. The backend API is already live at /api/v1/documents."
      icon={FileText}
    />
  )
}
