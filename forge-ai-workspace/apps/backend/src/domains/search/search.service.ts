// File: apps/backend/src/domains/search/search.service.ts
// Purpose: Full-text search across tasks, documents, snippets, conversations in parallel

import { prisma } from '../../infrastructure/database/prisma.client'

export const searchService = {
  async search(userId: string, query: string, types: string[], limit: number) {
    const q = query.trim()
    if (!q) return { tasks: [], documents: [], snippets: [], conversations: [] }

    const searchTypes = types.length ? types : ['tasks', 'documents', 'snippets', 'conversations']

    const [tasks, documents, snippets, conversations] = await Promise.all([
      searchTypes.includes('tasks')
        ? prisma.task.findMany({
            where: {
              userId, deletedAt: null,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: { id: true, title: true, status: true, priority: true },
            take: limit,
          })
        : [],

      searchTypes.includes('documents')
        ? prisma.document.findMany({
            where: {
              userId, deletedAt: null,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { body: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: { id: true, title: true, body: true },
            take: limit,
          })
        : [],

      searchTypes.includes('snippets')
        ? prisma.snippet.findMany({
            where: {
              userId, deletedAt: null,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: { id: true, title: true, language: true },
            take: limit,
          })
        : [],

      searchTypes.includes('conversations')
        ? prisma.conversation.findMany({
            where: { userId, deletedAt: null, title: { contains: q, mode: 'insensitive' } },
            select: { id: true, title: true },
            take: limit,
          })
        : [],
    ])

    return {
      tasks,
      documents: (documents as any[]).map((d) => ({
        id: d.id,
        title: d.title,
        excerpt: extractExcerpt(d.body, q),
      })),
      snippets,
      conversations,
    }
  },
}

function extractExcerpt(body: string, query: string, maxLength = 150): string {
  const idx = body.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return body.slice(0, maxLength)
  const start = Math.max(0, idx - 60)
  const end = Math.min(body.length, idx + query.length + 60)
  return (start > 0 ? '...' : '') + body.slice(start, end) + (end < body.length ? '...' : '')
}
