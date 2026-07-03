// File: apps/backend/src/domains/tags/tags.controller.ts
import { Request, Response } from 'express'
import { tagsService } from './tags.service'

export const tagsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const data = await tagsService.getAll(req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await tagsService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await tagsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },
}
