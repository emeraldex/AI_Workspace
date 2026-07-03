// File: apps/backend/src/domains/documents/documents.router.ts
import { Router } from 'express'
import { documentsController } from './documents.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createDocumentSchema, updateDocumentSchema } from './documents.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(documentsController.getAll))
router.post('/', validate(createDocumentSchema), h(documentsController.create))
router.get('/:id', h(documentsController.getById))
router.patch('/:id', validate(updateDocumentSchema), h(documentsController.update))
router.delete('/:id', h(documentsController.delete))
router.get('/:id/export', h(documentsController.export))

export { router as documentsRouter }
