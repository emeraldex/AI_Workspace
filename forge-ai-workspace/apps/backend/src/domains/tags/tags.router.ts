// File: apps/backend/src/domains/tags/tags.router.ts
import { Router } from 'express'
import { tagsController } from './tags.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createTagSchema } from './tags.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(tagsController.getAll))
router.post('/', validate(createTagSchema), h(tagsController.create))
router.delete('/:id', h(tagsController.delete))

export { router as tagsRouter }
