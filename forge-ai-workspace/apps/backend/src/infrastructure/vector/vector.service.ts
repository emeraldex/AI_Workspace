// File: apps/backend/src/infrastructure/vector/vector.service.ts
// Purpose: pgvector storage and cosine-similarity search over document chunks.
//          Raw SQL — Prisma cannot express the Unsupported("vector") column.

import { Prisma } from '@prisma/client'
import { prisma } from '../database/prisma.client'

export interface ChunkInput {
  chunkIndex: number
  content: string
  embedding: number[]
}

export interface SimilarityHit {
  documentId: string
  documentTitle: string
  excerpt: string
  similarity: number
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

export const vectorService = {
  /** Atomically replaces all chunks for a document */
  async replaceChunks(documentId: string, chunks: ChunkInput[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({ where: { documentId } })
      for (const chunk of chunks) {
        await tx.$executeRaw`
          INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding)
          VALUES (gen_random_uuid(), ${documentId}, ${chunk.chunkIndex}, ${chunk.content},
                  ${toVectorLiteral(chunk.embedding)}::vector)
        `
      }
    })
  },

  async similaritySearch(
    userId: string,
    embedding: number[],
    options: { documentIds?: string[]; limit?: number } = {},
  ): Promise<SimilarityHit[]> {
    const limit = options.limit ?? 5
    const vector = toVectorLiteral(embedding)
    const documentFilter = options.documentIds?.length
      ? Prisma.sql`AND dc.document_id IN (${Prisma.join(options.documentIds)})`
      : Prisma.empty

    return prisma.$queryRaw<SimilarityHit[]>`
      SELECT dc.document_id  AS "documentId",
             d.title         AS "documentTitle",
             dc.content      AS excerpt,
             1 - (dc.embedding <=> ${vector}::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE d.user_id = ${userId}
        AND d.deleted_at IS NULL
        AND dc.embedding IS NOT NULL
        ${documentFilter}
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `
  },
}
