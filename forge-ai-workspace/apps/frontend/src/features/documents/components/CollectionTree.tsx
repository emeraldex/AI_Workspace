// File: apps/frontend/src/features/documents/components/CollectionTree.tsx
// Purpose: Nested collection navigation (max 3 levels server-side) with
//          inline create, rename, and delete

import { useState } from 'react'
import { FileText, Folder, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog'
import { Input } from '@shared/components/ui/Input'
import { cn } from '@shared/lib/utils'
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useRenameCollection,
} from '../hooks/useDocuments'
import type { Collection } from '../api/documents.api'

interface CollectionTreeProps {
  selectedId: string | undefined
  onSelect: (collectionId: string | undefined) => void
}

function CollectionNode({
  collection,
  depth,
  selectedId,
  onSelect,
}: {
  collection: Collection
  depth: number
  selectedId: string | undefined
  onSelect: (id: string | undefined) => void
}) {
  const renameCollection = useRenameCollection()
  const deleteCollection = useDeleteCollection()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(collection.name)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isSelected = selectedId === collection.id
  const Icon = isSelected ? FolderOpen : Folder

  function commitRename() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== collection.name) {
      renameCollection.mutate({ id: collection.id, name: trimmed })
    }
    setRenaming(false)
  }

  return (
    <div>
      <div
        className={cn(
          'group flex h-8 items-center gap-1.5 rounded-md pr-1 text-sm transition-colors',
          isSelected ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted',
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {renaming ? (
          <form
            className="flex flex-1 items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              commitRename()
            }}
          >
            <Input
              autoFocus
              className="h-6 px-1.5 text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => e.key === 'Escape' && setRenaming(false)}
            />
          </form>
        ) : (
          <>
            <button
              className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
              onClick={() => onSelect(isSelected ? undefined : collection.id)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{collection.name}</span>
            </button>
            <span className="hidden shrink-0 group-hover:flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Rename ${collection.name}`}
                onClick={() => {
                  setName(collection.name)
                  setRenaming(true)
                }}
              >
                <Pencil className="!h-3 !w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                aria-label={`Delete ${collection.name}`}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="!h-3 !w-3" />
              </Button>
            </span>
          </>
        )}
      </div>

      {collection.children.map((child) => (
        <CollectionNode
          key={child.id}
          collection={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete collection?"
        description={`"${collection.name}" will be removed. Its documents stay, uncategorized.`}
        onConfirm={() =>
          deleteCollection.mutate(collection.id, {
            onSuccess: () => {
              setConfirmOpen(false)
              if (isSelected) onSelect(undefined)
            },
          })
        }
        isPending={deleteCollection.isPending}
      />
    </div>
  )
}

export function CollectionTree({ selectedId, onSelect }: CollectionTreeProps) {
  const { data: collections } = useCollections()
  const createCollection = useCreateCollection()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  function commitCreate() {
    const trimmed = newName.trim()
    if (trimmed) {
      createCollection.mutate({ name: trimmed }, { onSuccess: () => setNewName('') })
    }
    setAdding(false)
  }

  return (
    <nav aria-label="Collections" className="flex flex-col gap-0.5">
      <button
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-md px-2 text-sm transition-colors',
          selectedId === undefined
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:bg-muted',
        )}
        onClick={() => onSelect(undefined)}
      >
        <FileText className="h-4 w-4" />
        All documents
      </button>

      {(collections ?? []).map((collection) => (
        <CollectionNode
          key={collection.id}
          collection={collection}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}

      {adding ? (
        <form
          className="flex items-center gap-1 px-2"
          onSubmit={(e) => {
            e.preventDefault()
            commitCreate()
          }}
        >
          <Input
            autoFocus
            className="h-7 text-xs"
            placeholder="Collection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={commitCreate}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Cancel" onClick={() => setAdding(false)}>
            <X className="!h-3.5 !w-3.5" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start px-2 text-muted-foreground"
          onClick={() => {
            setNewName('')
            setAdding(true)
          }}
        >
          <Plus />
          New collection
        </Button>
      )}
    </nav>
  )
}
