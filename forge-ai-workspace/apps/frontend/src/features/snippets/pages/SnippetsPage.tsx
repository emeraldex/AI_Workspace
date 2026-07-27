// File: apps/frontend/src/features/snippets/pages/SnippetsPage.tsx
// Purpose: Snippets page — placeholder until snippet management is implemented

import { Code2 } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function SnippetsPage() {
  return (
    <PlaceholderPage
      title="Snippets"
      description="Code snippet library with syntax highlighting and tags lands here next. The backend API is already live at /api/v1/snippets."
      icon={Code2}
    />
  )
}
