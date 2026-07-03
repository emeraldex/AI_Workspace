// File: apps/backend/tests/helpers/testDb.ts
// Purpose: Database helpers for integration tests — seed and cleanup utilities

import { prisma } from '../../src/infrastructure/database/prisma.client'

export async function cleanDatabase() {
  // Delete in dependency order to respect FK constraints
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.documentChunk.deleteMany()
  await prisma.documentTag.deleteMany()
  await prisma.document.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.taskTag.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.snippet.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.userSettings.deleteMany()
  await prisma.user.deleteMany()
}

export async function createTestUser(overrides?: Partial<{
  name: string
  email: string
  passwordHash: string
}>) {
  const bcrypt = await import('bcrypt')
  return prisma.user.create({
    data: {
      name: overrides?.name ?? 'Test User',
      email: overrides?.email ?? 'test@example.com',
      passwordHash: overrides?.passwordHash ?? await bcrypt.hash('password123', 12),
      settings: { create: {} },
    },
  })
}
