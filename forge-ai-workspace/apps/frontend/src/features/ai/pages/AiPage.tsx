// File: apps/frontend/src/features/ai/pages/AiPage.tsx
// Purpose: AI chat page — placeholder until conversation view and streaming are implemented

import { MessagesSquare } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function AiPage() {
  return (
    <PlaceholderPage
      title="AI Chat"
      description="Conversations, streaming responses, and document-grounded answers land here next. The backend API is already live at /api/v1/conversations."
      icon={MessagesSquare}
    />
  )
}
