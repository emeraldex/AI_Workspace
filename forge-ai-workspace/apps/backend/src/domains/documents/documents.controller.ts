// File: apps/backend/src/domains/documents/documents.controller.ts
import { Request, Response } from 'express'
import { documentsService } from './documents.service'

export const documentsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const q = req.query as any
    const filters = { ...q, tagIds: q.tagIds ? q.tagIds.split(',') : undefined, limit: q.limit ? Number(q.limit) : 20 }
    const result = await documentsService.getAll(req.user!.id, filters)
    res.json({ success: true, ...result })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const data = await documentsService.getById(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await documentsService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await documentsService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await documentsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },

  async export(req: Request, res: Response): Promise<void> {
    const { format } = req.query as { format?: string }
    const doc = await documentsService.export(req.params.id, req.user!.id)
    const contentType = format === 'text' ? 'text/plain' : 'text/markdown'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${doc.title}.${format === 'text' ? 'txt' : 'md'}"`)
    res.send(doc.body)
  },
}
