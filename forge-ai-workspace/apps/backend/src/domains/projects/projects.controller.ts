// File: apps/backend/src/domains/projects/projects.controller.ts
import { Request, Response } from 'express'
import { projectsService } from './projects.service'

export const projectsController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const { includeArchived } = req.query as { includeArchived?: string }
    const data = await projectsService.getAll(req.user!.id, includeArchived === 'true')
    res.json({ success: true, data })
  },

  async getById(req: Request, res: Response): Promise<void> {
    const data = await projectsService.getById(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async create(req: Request, res: Response): Promise<void> {
    const data = await projectsService.create(req.user!.id, req.body)
    res.status(201).json({ success: true, data })
  },

  async update(req: Request, res: Response): Promise<void> {
    const data = await projectsService.update(req.params.id, req.user!.id, req.body)
    res.json({ success: true, data })
  },

  async archive(req: Request, res: Response): Promise<void> {
    const data = await projectsService.archive(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async unarchive(req: Request, res: Response): Promise<void> {
    const data = await projectsService.unarchive(req.params.id, req.user!.id)
    res.json({ success: true, data })
  },

  async delete(req: Request, res: Response): Promise<void> {
    await projectsService.delete(req.params.id, req.user!.id)
    res.status(204).send()
  },
}
