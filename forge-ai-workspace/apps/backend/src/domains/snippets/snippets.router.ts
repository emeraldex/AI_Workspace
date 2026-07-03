// File: apps/backend/src/domains/snippets/snippets.router.ts
import { Router } from 'express'
import { snippetsController } from './snippets.controller'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { createSnippetSchema, updateSnippetSchema } from './snippets.validator'

const router = Router()
const h = (fn: any) => (req: any, res: any, next: any) => fn(req, res).catch(next)

router.use(authenticate)
router.get('/', h(snippetsController.getAll))
router.post('/', validate(createSnippetSchema), h(snippetsController.create))
router.patch('/:id', validate(updateSnippetSchema), h(snippetsController.update))
router.delete('/:id', h(snippetsController.delete))

export { router as snippetsRouter }
