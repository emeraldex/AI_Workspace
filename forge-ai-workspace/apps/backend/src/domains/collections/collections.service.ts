// File: apps/backend/src/domains/collections/collections.service.ts
import { collectionsRepository } from './collections.repository'
import { NotFoundError, ValidationError } from '../../shared/errors/AppError'

function buildTree(collections: any[]): any[] {
  const map = new Map(collections.map((c) => [c.id, { ...c, children: [] }]))
  const roots: any[] = []
  for (const col of map.values()) {
    if (col.parentId) {
      map.get(col.parentId)?.children.push(col)
    } else {
      roots.push(col)
    }
  }
  return roots
}

export const collectionsService = {
  async getAll(userId: string) {
    const collections = await collectionsRepository.findAll(userId)
    return buildTree(collections)
  },

  async create(userId: string, data: { name: string; parentId?: string }) {
    if (data.parentId) {
      const parent = await collectionsRepository.findById(data.parentId, userId)
      if (!parent) throw new NotFoundError('Parent collection')
      if (parent.parentId) {
        // Check depth — max 3 levels (root → child → grandchild)
        const grandparent = await collectionsRepository.findById(parent.parentId, userId)
        if (grandparent?.parentId) {
          throw new ValidationError([{ field: 'parentId', message: 'Maximum nesting depth of 3 exceeded' }])
        }
      }
    }
    return collectionsRepository.create(userId, data)
  },

  async update(id: string, userId: string, data: { name: string }) {
    const col = await collectionsRepository.findById(id, userId)
    if (!col) throw new NotFoundError('Collection')
    return collectionsRepository.update(id, data)
  },

  async delete(id: string, userId: string) {
    const col = await collectionsRepository.findById(id, userId)
    if (!col) throw new NotFoundError('Collection')
    await collectionsRepository.detachDocuments(id)
    await collectionsRepository.softDelete(id)
  },
}
