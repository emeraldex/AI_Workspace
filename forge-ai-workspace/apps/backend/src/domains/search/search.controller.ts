// File: apps/backend/src/domains/search/search.controller.ts
import { Request, Response } from 'express'
import { searchService } from './search.service'

export const searchController = {
  async search(req: Request, res: Response): Promise<void> {
    const { q, types, limit } = req.query as any
    const typeList = types ? types.split(',') : []
    const data = await searchService.search(req.user!.id, q, typeList, Number(limit) || 5)
    res.json({ success: true, data })
  },

  async semantic(req: Request, res: Response): Promise<void> {
    const { q, limit } = req.query as any
    const data = await searchService.semanticSearch(req.user!.id, q, Number(limit) || 5)
    res.json({ success: true, data })
  },
}
