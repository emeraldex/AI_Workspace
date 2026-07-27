// File: apps/frontend/src/features/tasks/pages/TasksPage.tsx
// Purpose: Tasks page — placeholder until task list/board is implemented

import { ListTodo } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function TasksPage() {
  return (
    <PlaceholderPage
      title="Tasks"
      description="Task list, board view, filters, and subtasks land here next. The backend API is already live at /api/v1/tasks."
      icon={ListTodo}
    />
  )
}
