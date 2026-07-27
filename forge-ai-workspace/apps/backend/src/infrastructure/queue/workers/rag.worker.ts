// File: apps/backend/src/infrastructure/queue/workers/rag.worker.ts
// Purpose: RAG indexing processor — chunk the document, embed the chunks,
//          store vectors, track indexingStatus, notify the user's sockets.

import { logger } from '../../../shared/logger'
import { config } from '../../../shared/config'
import { prisma } from '../../database/prisma.client'
import { settingsService } from '../../../domains/settings/settings.service'
import { embedTexts } from '../../ai/embeddings'
import { vectorService } from '../../vector/vector.service'
import { ragQueue } from '../queue.client'
import type { RagIndexJob } from '../jobs/rag.job'
import type { IndexingStatus } from '@prisma/client'

const MAX_CHUNKS = 200

/** Paragraph-aware splitter: ~1500-char chunks with one-paragraph overlap */
export function chunkText(text: string, maxLength = 1500): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ''
  let previous = ''

  for (const paragraph of paragraphs) {
    // A single oversized paragraph is split hard
    if (paragraph.length > maxLength) {
      if (current) {
        chunks.push(current)
        previous = current
        current = ''
      }
      for (let i = 0; i < paragraph.length; i += maxLength) {
        chunks.push(paragraph.slice(i, i + maxLength))
      }
      previous = chunks[chunks.length - 1]
      continue
    }

    if (current.length + paragraph.length + 2 > maxLength) {
      chunks.push(current)
      // Overlap: seed the next chunk with the tail paragraph of the previous one
      const tail = current.split(/\n{2,}/).pop() ?? ''
      previous = current
      current = tail.length < maxLength / 2 ? `${tail}\n\n${paragraph}` : paragraph
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph
    }
  }
  if (current && current !== previous) chunks.push(current)
  return chunks.slice(0, MAX_CHUNKS)
}

async function setStatus(documentId: string, status: IndexingStatus): Promise<void> {
  await prisma.document.update({ where: { id: documentId }, data: { indexingStatus: status } })
}

function notify(userId: string, documentId: string, status: IndexingStatus): void {
  // Socket server may be absent (tests, one-off scripts) — notification is best-effort
  try {
    // Lazy import avoids a startup-order dependency on socket initialization

    const { getIO } = require('../../../sockets/socket.server') as typeof import('../../../sockets/socket.server')
    getIO().to(`user:${userId}`).emit('document:indexed', { documentId, status })
  } catch {
    /* no socket server in this process */
  }
}

export function registerRagWorker(): void {
  void ragQueue.process(async (job) => {
    const { documentId, userId } = job.data as RagIndexJob

    const document = await prisma.document.findFirst({
      where: { id: documentId, deletedAt: null },
    })
    if (!document) return // deleted since enqueue — nothing to index

    try {
      await setStatus(documentId, 'INDEXING')

      const apiKey = (await settingsService.getDecryptedApiKey(userId)) ?? config.openaiApiKey
      if (!apiKey) throw new Error('No OpenAI API key configured')

      const text = `${document.title}\n\n${document.body}`.trim()
      const chunks = chunkText(text)

      if (chunks.length === 0) {
        await vectorService.replaceChunks(documentId, [])
        await setStatus(documentId, 'INDEXED')
        notify(userId, documentId, 'INDEXED')
        return
      }

      const embeddings = await embedTexts(apiKey, chunks)
      await vectorService.replaceChunks(
        documentId,
        chunks.map((content, chunkIndex) => ({
          chunkIndex,
          content,
          embedding: embeddings[chunkIndex],
        })),
      )

      await setStatus(documentId, 'INDEXED')
      notify(userId, documentId, 'INDEXED')
      logger.info({ documentId, chunks: chunks.length }, 'Document indexed')
    } catch (err) {
      logger.error({ err, documentId }, 'RAG indexing failed')
      await setStatus(documentId, 'FAILED').catch(() => undefined)
      notify(userId, documentId, 'FAILED')
      throw err // let Bull retry per queue policy
    }
  })

  logger.info('RAG worker registered')
}
