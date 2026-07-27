// File: apps/frontend/src/features/projects/pages/ProjectsPage.tsx
// Purpose: Projects page — placeholder until project management is implemented

import { FolderKanban } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Projects"
      description="Project cards, creation, and archiving land here next. The backend API is already live at /api/v1/projects."
      icon={FolderKanban}
    />
  )
}
