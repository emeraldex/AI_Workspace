// File: apps/backend/src/infrastructure/queue/jobs/rag.job.ts
// Purpose: RAG indexing job contract

export const RAG_QUEUE_NAME = 'rag-indexing'

export interface RagIndexJob {
  documentId: string
  userId: string
}
