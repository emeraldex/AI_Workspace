// File: apps/backend/src/domains/snippets/snippets.controller.ts
import { Request, Response } from 'express'
import { snippetsService } from './snippets.service'

export const snippetsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const q = req.query as any
    const filters = {
      ...q,
      tags: q.tags ? q.tags.split(',') : undefined,
      limit: q.limit ? Number(q.limit) : 20,
    }
    const result = await snippetsService.getAll(req.user!.id, filters)
    res.json({ success: true, ...result })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await snippetsService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await snippetsService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await snippetsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },
}
