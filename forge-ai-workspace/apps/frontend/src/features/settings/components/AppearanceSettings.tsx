// File: apps/frontend/src/features/settings/components/AppearanceSettings.tsx
// Purpose: Theme selection — applies immediately on choice

import { Monitor, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { cn } from '@shared/lib/utils'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import type { Theme } from '@forge/shared'

const THEMES: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'LIGHT', label: 'Light', icon: Sun },
  { value: 'DARK', label: 'Dark', icon: Moon },
  { value: 'SYSTEM', label: 'System', icon: Monitor },
]

export function AppearanceSettings() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Theme applies immediately</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3" role="radiogroup" aria-label="Theme">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              role="radio"
              aria-checked={settings?.theme === value}
              disabled={updateSettings.isPending}
              onClick={() => updateSettings.mutate({ theme: value })}
              className={cn(
                'flex w-24 flex-col items-center gap-2 rounded-lg border p-3 text-xs transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                settings?.theme === value
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
