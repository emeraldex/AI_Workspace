// File: apps/frontend/src/features/documents/hooks/useAutoSave.ts
// Purpose: Debounced autosave for the document editor with a visible save state

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUpdateDocument } from './useDocuments'
import type { UpdateDocumentInput } from '../api/documents.api'

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export function useAutoSave(documentId: string, delayMs = 800) {
  const updateDocument = useUpdateDocument()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef<UpdateDocumentInput>({})

  const flush = useCallback(() => {
    const body = pending.current
    if (Object.keys(body).length === 0) return
    pending.current = {}
    setSaveState('saving')
    updateDocument.mutate(
      { id: documentId, ...body },
      {
        onSuccess: () => {
          // Only report 'saved' if nothing new was typed while saving
          setSaveState((s) => (Object.keys(pending.current).length === 0 && s === 'saving' ? 'saved' : s))
        },
        onError: () => setSaveState('error'),
      },
    )
  }, [documentId, updateDocument])

  const queueSave = useCallback(
    (patch: UpdateDocumentInput) => {
      pending.current = { ...pending.current, ...patch }
      setSaveState('dirty')
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, delayMs)
    },
    [flush, delayMs],
  )

  // Flush on unmount so navigating away doesn't drop the last keystrokes
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      flush()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return { queueSave, saveState }
}
