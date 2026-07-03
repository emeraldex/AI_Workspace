// File: apps/backend/src/domains/collections/collections.router.ts
import { Router } from 'express'
import { collectionsController } from './collections.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createCollectionSchema, updateCollectionSchema } from './collections.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(collectionsController.getAll))
router.post('/', validate(createCollectionSchema), h(collectionsController.create))
router.patch('/:id', validate(updateCollectionSchema), h(collectionsController.update))
router.delete('/:id', h(collectionsController.delete))

export { router as collectionsRouter }
