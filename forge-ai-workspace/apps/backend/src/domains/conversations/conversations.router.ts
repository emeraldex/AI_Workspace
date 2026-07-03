// File: apps/backend/src/domains/conversations/conversations.router.ts
import { Router } from 'express'
import { conversationsController } from './conversations.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createConversationSchema, updateConversationSchema, sendMessageSchema } from './conversations.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(conversationsController.getAll))
router.post('/', validate(createConversationSchema), h(conversationsController.create))
router.get('/:id', h(conversationsController.getById))
router.patch('/:id', validate(updateConversationSchema), h(conversationsController.update))
router.delete('/:id', h(conversationsController.delete))
router.post('/:id/messages', validate(sendMessageSchema), h(conversationsController.sendMessage))

export { router as conversationsRouter }
