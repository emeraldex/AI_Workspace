// File: apps/backend/src/domains/notifications/notifications.router.ts
import { Router } from 'express'
import { notificationsController } from './notifications.controller'
import { authenticate } from '../../shared/middleware/authenticate'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(notificationsController.getAll))
router.patch('/read-all', h(notificationsController.markAllRead))
router.patch('/:id/read', h(notificationsController.markRead))
router.delete('/:id', h(notificationsController.delete))

export { router as notificationsRouter }
