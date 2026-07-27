// File: apps/frontend/src/features/settings/components/AiSettings.tsx
// Purpose: OpenAI model + API key management. The key is write-only:
//          the backend stores it encrypted and only reports hasOpenaiKey.

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Badge } from '@shared/components/ui/Badge'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Select } from '@shared/components/ui/Select'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'

const MODELS = ['gpt-4o', 'gpt-4o-mini'] as const

export function AiSettings() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [apiKey, setApiKey] = useState('')

  function saveKey() {
    if (!apiKey.trim()) return
    updateSettings.mutate({ openaiApiKey: apiKey.trim() }, { onSuccess: () => setApiKey('') })
  }

  function removeKey() {
    updateSettings.mutate({ openaiApiKey: '' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI provider</CardTitle>
        <CardDescription>Your own OpenAI key powers conversations — stored encrypted</CardDescription>
      </CardHeader>
      <CardContent className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-model">Model</Label>
          <Select
            id="ai-model"
            value={settings?.openaiModel ?? 'gpt-4o'}
            disabled={updateSettings.isPending}
            onChange={(e) => updateSettings.mutate({ openaiModel: e.target.value })}
          >
            {MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="ai-key">API key</Label>
            {settings?.hasOpenaiKey && (
              <Badge>
                <KeyRound className="mr-1 h-3 w-3" />
                Key saved
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              id="ai-key"
              type="password"
              autoComplete="off"
              placeholder={settings?.hasOpenaiKey ? 'Enter a new key to replace' : 'sk-…'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={saveKey} disabled={updateSettings.isPending || !apiKey.trim()}>
              {updateSettings.isPending && <Spinner />}
              Save
            </Button>
          </div>
          {settings?.hasOpenaiKey && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground hover:text-destructive"
              onClick={removeKey}
              disabled={updateSettings.isPending}
            >
              Remove key
            </Button>
          )}
        </div>

        {updateSettings.isError && (
          <p role="alert" className="text-xs text-destructive">
            {getApiErrorMessage(updateSettings.error, 'Could not update AI settings')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
