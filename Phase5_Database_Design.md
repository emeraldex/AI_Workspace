# Forge AI Workspace — Phase 5: Database Design

---

## 1. Objectives

Produce the complete normalized database schema covering all domains, with full Prisma schema, indexes, constraints, relations, and design rationale. This schema must be migration-safe, audit-ready, and multi-user-ready from day one.

---

## 2. Design Decisions

| Decision | Rationale |
|---|---|
| PostgreSQL 16 + pgvector | Relational integrity, tsvector full-text search, and vector similarity in one engine |
| UUID primary keys | Avoids enumeration attacks; safe for future distributed use |
| Soft deletes via `deletedAt` | All primary entities recoverable; audit trail preserved |
| `createdAt` / `updatedAt` on all tables | Prisma `@updatedAt` auto-managed; required for sync and audit |
| `userId` on all user-owned entities | Multi-user ready without schema migration |
| Enums in Prisma | Type-safe status/priority values; enforced at DB level |
| Separate `document_chunks` table | Keeps document table clean; vector data isolated for RAG |
| Hashed refresh tokens | Raw token never persisted; hash compared on validation |

---

## 3. Entity Relationship Overview

```
User
 ├── RefreshToken (1:many)
 ├── Project (1:many)
 │    └── Task (1:many)
 ├── Task (1:many)
 │    ├── Subtask (1:many)
 │    └── TaskTag (many:many via join)
 ├── Tag (1:many)
 ├── Document (1:many)
 │    ├── DocumentChunk (1:many) ← RAG vectors
 │    └── DocumentTag (many:many via join)
 ├── Collection (1:many, self-referential for nesting)
 ├── Snippet (1:many)
 ├── Conversation (1:many)
 │    └── Message (1:many)
 ├── Notification (1:many)
 └── UserSettings (1:1)
```

---

## 4. Prisma Schema

```prisma
// File: prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector"), pg_trgm, unaccent]
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum NotificationType {
  TASK_DUE_SOON
  TASK_OVERDUE
  AI_TASK_CREATED
  SYSTEM
}

enum IndexingStatus {
  PENDING
  INDEXING
  INDEXED
  FAILED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String
  avatarUrl    String?   @map("avatar_url")
  bio          String?
  timezone     String    @default("UTC")
  deletedAt    DateTime? @map("deleted_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  settings      UserSettings?
  refreshTokens RefreshToken[]
  projects      Project[]
  tasks         Task[]
  tags          Tag[]
  documents     Document[]
  collections   Collection[]
  snippets      Snippet[]
  conversations Conversation[]
  notifications Notification[]

  @@map("users")
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String   @unique @map("token_hash")
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

// ─────────────────────────────────────────
// USER SETTINGS
// ─────────────────────────────────────────

model UserSettings {
  id                    String   @id @default(uuid())
  userId                String   @unique @map("user_id")
  theme                 Theme    @default(SYSTEM)
  openaiApiKeyEncrypted String?  @map("openai_api_key_encrypted")
  openaiModel           String   @default("gpt-4o") @map("openai_model")
  notifyTaskDueSoon     Boolean  @default(true) @map("notify_task_due_soon")
  notifyTaskOverdue     Boolean  @default(true) @map("notify_task_overdue")
  notifyAiTaskCreated   Boolean  @default(true) @map("notify_ai_task_created")
  dismissedWidgets      String[] @default([]) @map("dismissed_widgets")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ─────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────

model Project {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  name        String
  description String?
  color       String?
  icon        String?
  isArchived  Boolean   @default(false) @map("is_archived")
  deletedAt   DateTime? @map("deleted_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@index([userId])
  @@map("projects")
}

// ─────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────

model Task {
  id          String       @id @default(uuid())
  userId      String       @map("user_id")
  projectId   String?      @map("project_id")
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?    @map("due_date")
  sortOrder   Int          @default(0) @map("sort_order")
  deletedAt   DateTime?    @map("deleted_at")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  project  Project?  @relation(fields: [projectId], references: [id], onDelete: SetNull)
  subtasks Subtask[]
  taskTags TaskTag[]

  @@index([userId])
  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}

model Subtask {
  id          String   @id @default(uuid())
  taskId      String   @map("task_id")
  title       String
  isCompleted Boolean  @default(false) @map("is_completed")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@map("subtasks")
}

// ─────────────────────────────────────────
// TAGS (shared across tasks and documents)
// ─────────────────────────────────────────

model Tag {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  color     String?
  createdAt DateTime @default(now()) @map("created_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskTags     TaskTag[]
  documentTags DocumentTag[]

  @@unique([userId, name])
  @@index([userId])
  @@map("tags")
}

model TaskTag {
  taskId String @map("task_id")
  tagId  String @map("tag_id")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([taskId, tagId])
  @@map("task_tags")
}

// ─────────────────────────────────────────
// DOCUMENTS & KNOWLEDGE BASE
// ─────────────────────────────────────────

model Collection {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  parentId  String?   @map("parent_id")
  name      String
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent    Collection?  @relation("CollectionTree", fields: [parentId], references: [id])
  children  Collection[] @relation("CollectionTree")
  documents Document[]

  @@index([userId])
  @@index([parentId])
  @@map("collections")
}

model Document {
  id             String         @id @default(uuid())
  userId         String         @map("user_id")
  collectionId   String?        @map("collection_id")
  title          String
  body           String         @default("")
  indexingStatus IndexingStatus @default(PENDING) @map("indexing_status")
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  collection   Collection?     @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  chunks       DocumentChunk[]
  documentTags DocumentTag[]

  @@index([userId])
  @@index([collectionId])
  @@map("documents")
}

model DocumentTag {
  documentId String @map("document_id")
  tagId      String @map("tag_id")

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  tag      Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([documentId, tagId])
  @@map("document_tags")
}

model DocumentChunk {
  id         String                     @id @default(uuid())
  documentId String                     @map("document_id")
  chunkIndex Int                        @map("chunk_index")
  content    String
  embedding  Unsupported("vector(1536)")?
  createdAt  DateTime                   @default(now()) @map("created_at")

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@map("document_chunks")
}

// ─────────────────────────────────────────
// CODE SNIPPETS
// ─────────────────────────────────────────

model Snippet {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  title     String
  language  String
  code      String
  tags      String[]  @default([])
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("snippets")
}

// ─────────────────────────────────────────
// AI CONVERSATIONS
// ─────────────────────────────────────────

model Conversation {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  title     String    @default("New Conversation")
  deletedAt DateTime? @map("deleted_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId])
  @@map("conversations")
}

model Message {
  id             String      @id @default(uuid())
  conversationId String      @map("conversation_id")
  role           MessageRole
  content        String
  tokenCount     Int?        @map("token_count")
  createdAt      DateTime    @default(now()) @map("created_at")

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@map("messages")
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false) @map("is_read")
  metadata  Json?
  createdAt DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}
```

---

## 5. Index Strategy

| Table | Index | Reason |
|---|---|---|
| users | `email` (unique) | Login lookup |
| refresh_tokens | `token_hash` (unique), `user_id` | Token validation, user token cleanup |
| tasks | `user_id`, `project_id`, `status`, `due_date` | Filtering, dashboard queries |
| documents | `user_id`, `collection_id` | Listing, collection browsing |
| document_chunks | `document_id` | RAG chunk retrieval |
| document_chunks | HNSW on `embedding` (raw SQL migration) | Fast cosine similarity search |
| conversations | `user_id` | Listing conversations |
| messages | `conversation_id` | Loading conversation history |
| notifications | `user_id, is_read` | Unread count, notification list |
| tags | `user_id, name` (unique) | Tag autocomplete, deduplication |

**HNSW vector index** (applied via raw SQL migration):

```sql
CREATE INDEX document_chunks_embedding_idx
ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 6. Full-Text Search Strategy

PostgreSQL `tsvector` used for full-text search across tasks and documents. Applied via raw SQL migration alongside Prisma:

```sql
-- Tasks full-text search
ALTER TABLE tasks ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX tasks_search_idx ON tasks USING GIN(search_vector);

-- Documents full-text search
ALTER TABLE documents ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED;

CREATE INDEX documents_search_idx ON documents USING GIN(search_vector);
```

---

## 7. Soft Delete Strategy

All primary entities use `deletedAt DateTime?`. All repository queries apply a default filter:

```typescript
// Applied automatically in base repository
where: { deletedAt: null }
```

Hard delete only occurs on account deletion (cascade via foreign keys).

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| pgvector HNSW index memory usage | Acceptable for single-user document volumes; monitor in production |
| tsvector generated columns on large bodies | Async indexing; GIN index keeps query fast |
| UUID primary key join performance | Acceptable at single-user scale; B-tree indexes on all FK columns |
| Snippet tags as string array | Simple for v1.0; migrate to join table if tag filtering becomes complex |

---

## 9. Deliverables

- [x] Complete Prisma schema with all domains
- [x] All enums defined
- [x] All relations with referential integrity
- [x] Index strategy documented
- [x] Full-text search strategy
- [x] Vector index strategy (HNSW)
- [x] Soft delete strategy
- [x] Risk register updated

---

## 10. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ✅ Complete | Phase 5 — Database Design |
| ⏳ Pending | Phase 6 — Folder Structure |
| ⏳ Pending | Phase 7 — UI Design System |
| ⏳ Pending | Phase 8 — API Design |
| ⏳ Pending | Phase 9 — Authentication |
| ⏳ Pending | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
