// File: apps/frontend/src/features/settings/components/NotificationSettings.tsx
// Purpose: Notification toggles — saved immediately on change

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { Label } from '@shared/components/ui/Label'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import type { UserSettings } from '@forge/shared'

const TOGGLES: Array<{ key: keyof Pick<UserSettings, 'notifyTaskDueSoon' | 'notifyTaskOverdue' | 'notifyAiTaskCreated'>; label: string; description: string }> = [
  { key: 'notifyTaskDueSoon', label: 'Task due soon', description: 'When a task is due within 24 hours' },
  { key: 'notifyTaskOverdue', label: 'Task overdue', description: 'When a task passes its due date' },
  { key: 'notifyAiTaskCreated', label: 'AI created a task', description: 'When the assistant adds a task for you' },
]

export function NotificationSettings() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what shows up in your notification feed</CardDescription>
      </CardHeader>
      <CardContent className="flex max-w-md flex-col gap-3">
        {TOGGLES.map(({ key, label, description }) => (
          <div key={key} className="flex items-start gap-3">
            <input
              id={`notify-${key}`}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              checked={settings?.[key] ?? true}
              disabled={updateSettings.isPending || !settings}
              onChange={(e) => updateSettings.mutate({ [key]: e.target.checked })}
            />
            <div>
              <Label htmlFor={`notify-${key}`} className="cursor-pointer">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
