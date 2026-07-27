// File: apps/frontend/src/features/settings/pages/SettingsPage.tsx
// Purpose: Settings page — profile, appearance, AI, notifications, password sections

import { PageContainer } from '@shared/components/layout/PageContainer'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { useProfile, useSettings } from '../hooks/useSettings'
import { ProfileSettings } from '../components/ProfileSettings'
import { AppearanceSettings } from '../components/AppearanceSettings'
import { AiSettings } from '../components/AiSettings'
import { NotificationSettings } from '../components/NotificationSettings'
import { ChangePasswordSettings } from '../components/ChangePasswordSettings'

export function SettingsPage() {
  const settings = useSettings()
  const profile = useProfile()
  const loading = settings.isPending || profile.isPending

  return (
    <PageContainer title="Settings" description="Profile, appearance, AI, and notifications">
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ProfileSettings />
          <AppearanceSettings />
          <AiSettings />
          <NotificationSettings />
          <ChangePasswordSettings />
        </div>
      )}
    </PageContainer>
  )
}
