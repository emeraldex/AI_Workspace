// File: apps/frontend/src/features/settings/pages/SettingsPage.tsx
// Purpose: Settings page — placeholder until profile/appearance/AI settings are implemented

import { Settings } from 'lucide-react'
import { PlaceholderPage } from '@shared/components/PlaceholderPage'

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Profile, appearance, notification, and AI provider settings land here next. The backend API is already live at /api/v1/settings."
      icon={Settings}
    />
  )
}
