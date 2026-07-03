// File: apps/backend/src/domains/users/users.controller.ts
import { Request, Response } from 'express'
import { usersService } from './users.service'

export const usersController = {
  async getMe(req: Request, res: Response): Promise<void> {
    const profile = await usersService.getProfile(req.user!.id)
    res.json({ success: true, data: profile })
  },

  async updateMe(req: Request, res: Response): Promise<void> {
    const profile = await usersService.updateProfile(req.user!.id, req.body)
    res.json({ success: true, data: profile })
  },

  async deleteMe(req: Request, res: Response): Promise<void> {
    await usersService.deleteAccount(req.user!.id)
    res.status(204).send()
  },
}
