// File: apps/frontend/src/features/snippets/components/SnippetForm.tsx
// Purpose: Create/edit snippet dialog — language with suggestions, comma-separated tags

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/Dialog'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { Textarea } from '@shared/components/ui/Textarea'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useCreateSnippet, useUpdateSnippet } from '../hooks/useSnippets'
import type { Snippet } from '../api/snippets.api'

export const COMMON_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'sql',
  'bash',
  'json',
  'yaml',
  'html',
  'css',
  'go',
  'rust',
  'java',
] as const

interface SnippetFormValues {
  title: string
  language: string
  code: string
  tags: string
}

interface SnippetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippet?: Snippet | null
}

export function SnippetForm({ open, onOpenChange, snippet }: SnippetFormProps) {
  const isEdit = snippet != null
  const createSnippet = useCreateSnippet()
  const updateSnippet = useUpdateSnippet()
  const mutation = isEdit ? updateSnippet : createSnippet

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SnippetFormValues>()

  useEffect(() => {
    if (open) {
      reset({
        title: snippet?.title ?? '',
        language: snippet?.language ?? '',
        code: snippet?.code ?? '',
        tags: snippet?.tags.join(', ') ?? '',
      })
    }
  }, [open, snippet, reset])

  function onSubmit(values: SnippetFormValues) {
    const body = {
      title: values.title,
      language: values.language.trim().toLowerCase(),
      code: values.code,
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    const options = { onSuccess: () => onOpenChange(false) }
    if (snippet) updateSnippet.mutate({ id: snippet.id, ...body }, options)
    else createSnippet.mutate(body, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit snippet' : 'New snippet'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="snippet-title">Title</Label>
            <Input
              id="snippet-title"
              placeholder="e.g. Debounce helper"
              {...register('title', { required: 'Title is required', maxLength: 200 })}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="snippet-language">Language</Label>
              <Input
                id="snippet-language"
                list="snippet-languages"
                placeholder="typescript"
                {...register('language', { required: 'Language is required', maxLength: 50 })}
              />
              <datalist id="snippet-languages">
                {COMMON_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} />
                ))}
              </datalist>
              {errors.language && (
                <p className="text-xs text-destructive">{errors.language.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="snippet-tags">Tags</Label>
              <Input id="snippet-tags" placeholder="react, hooks" {...register('tags')} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="snippet-code">Code</Label>
            <Textarea
              id="snippet-code"
              spellCheck={false}
              className="min-h-40 font-mono text-xs"
              placeholder="Paste your code here"
              {...register('code', { required: 'Code is required' })}
            />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          {mutation.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(mutation.error, 'Could not save the snippet')}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner />}
              {isEdit ? 'Save changes' : 'Create snippet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
