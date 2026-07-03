// File: apps/backend/src/domains/collections/collections.controller.ts
import { Request, Response } from 'express'
import { collectionsService } from './collections.service'

export const collectionsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const data = await collectionsService.getAll(req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await collectionsService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await collectionsService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await collectionsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },
}
