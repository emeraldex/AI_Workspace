# Forge AI Workspace — Phase 10: Backend Development

---

## 1. Objectives

Implement all remaining backend domains following the 4-layer pattern established in Phase 9. Every domain is independently testable, owns its own router/controller/service/repository, and is wired into the central Express app.

---

## 2. Domains Implemented

| Domain | Routes | Notes |
|---|---|---|
| Users | GET/PATCH/DELETE `/users/me` | Profile management |
| Settings | GET/PATCH `/settings` | API key encrypted at rest; never returned |
| Dashboard | GET `/dashboard` | All widgets in one parallel query |
| Projects | Full CRUD + archive | Task counts included |
| Tasks | Full CRUD + subtasks + reorder | Cursor pagination, full filter set |
| Tags | GET/POST/DELETE `/tags` | Shared across tasks and documents |
| Documents | Full CRUD + export | RAG hook stubs ready for Phase 12 |
| Collections | Full CRUD + tree response | Max 3-level nesting enforced |
| Snippets | Full CRUD | Array tags, language filter |
| Notifications | List + mark read + mark all + delete | Unread filter supported |
| Conversations | Full CRUD + send message | AI streaming wired in Phase 12 |
| Search | Full-text across all types | Parallel queries, excerpt extraction |

---

## 3. Files Produced

### Users
- `domains/users/users.repository.ts`
- `domains/users/users.service.ts`
- `domains/users/users.validator.ts`
- `domains/users/users.controller.ts`
- `domains/users/users.router.ts`

### Settings
- `domains/settings/settings.repository.ts`
- `domains/settings/settings.service.ts`
- `domains/settings/settings.validator.ts`
- `domains/settings/settings.controller.ts`
- `domains/settings/settings.router.ts`

### Dashboard
- `domains/dashboard/dashboard.service.ts`
- `domains/dashboard/dashboard.controller.ts`
- `domains/dashboard/dashboard.router.ts`

### Projects
- `domains/projects/projects.repository.ts`
- `domains/projects/projects.service.ts`
- `domains/projects/projects.validator.ts`
- `domains/projects/projects.controller.ts`
- `domains/projects/projects.router.ts`

### Tasks
- `domains/tasks/tasks.repository.ts`
- `domains/tasks/tasks.service.ts`
- `domains/tasks/tasks.validator.ts`
- `domains/tasks/tasks.controller.ts`
- `domains/tasks/tasks.router.ts`

### Tags
- `domains/tags/tags.repository.ts`
- `domains/tags/tags.service.ts`
- `domains/tags/tags.validator.ts`
- `domains/tags/tags.controller.ts`
- `domains/tags/tags.router.ts`

### Documents
- `domains/documents/documents.repository.ts`
- `domains/documents/documents.service.ts`
- `domains/documents/documents.validator.ts`
- `domains/documents/documents.controller.ts`
- `domains/documents/documents.router.ts`

### Collections
- `domains/collections/collections.repository.ts`
- `domains/collections/collections.service.ts`
- `domains/collections/collections.validator.ts`
- `domains/collections/collections.controller.ts`
- `domains/collections/collections.router.ts`

### Snippets
- `domains/snippets/snippets.repository.ts`
- `domains/snippets/snippets.service.ts`
- `domains/snippets/snippets.validator.ts`
- `domains/snippets/snippets.controller.ts`
- `domains/snippets/snippets.router.ts`

### Notifications
- `domains/notifications/notifications.repository.ts`
- `domains/notifications/notifications.service.ts`
- `domains/notifications/notifications.controller.ts`
- `domains/notifications/notifications.router.ts`

### Conversations
- `domains/conversations/conversations.repository.ts`
- `domains/conversations/conversations.service.ts`
- `domains/conversations/conversations.validator.ts`
- `domains/conversations/conversations.controller.ts`
- `domains/conversations/conversations.router.ts`

### Search
- `domains/search/search.service.ts`
- `domains/search/search.validator.ts`
- `domains/search/search.controller.ts`
- `domains/search/search.router.ts`

### Updated
- `src/app.ts` — all 13 routers wired + health check with DB/Redis status

---

## 4. Design Decisions

| Decision | Rationale |
|---|---|
| `userId` ownership check in every service | Defense in depth — repository filters by userId, service also verifies before mutate |
| Cursor pagination on all list endpoints | Consistent pattern; avoids page drift on live data |
| Dashboard uses `Promise.all` for all queries | All 6 widget queries run in parallel — single round-trip latency |
| Collection tree built in memory | Flat DB query + in-memory tree assembly is simpler and faster than recursive CTE for max 3 levels |
| Streak computed from `updatedAt` on DONE tasks | Pragmatic approximation; accurate enough for v1.0 |
| RAG indexing stubs in documents.service | Placeholder comments mark exact integration points for Phase 12 |
| AI streaming stub in conversations.service | `sendMessage` persists user message and returns `streamId`; AI call wired in Phase 12 |
| Settings `getDecryptedApiKey` method | Internal-only method for AI service to retrieve key; never exposed via HTTP |

---

## 5. Security Controls

| Control | Applied |
|---|---|
| Ownership enforcement | Every service method verifies `userId` before any mutation |
| Soft deletes | All primary entities — data never hard-deleted until account deletion |
| API key never returned | Settings GET returns `hasOpenaiKey: boolean` only |
| Input validation | Zod schemas on all POST/PATCH bodies |
| Rate limiting | Inherited from global middleware in `app.ts` |

---

## 6. Risks

| Risk | Mitigation |
|---|---|
| Dashboard streak query scans all DONE tasks | Acceptable for single-user; add index on `status + updatedAt` if slow |
| Search `ILIKE` without tsvector index | Phase 16 optimization will migrate to tsvector GIN index |
| Collection depth check requires 2 extra queries | Max 3 levels means max 2 lookups; negligible at this scale |

---

## 7. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ✅ Complete | Phase 5 — Database Design |
| ✅ Complete | Phase 6 — Folder Structure |
| ✅ Complete | Phase 7 — UI Design System |
| ✅ Complete | Phase 8 — API Design |
| ✅ Complete | Phase 9 — Authentication |
| ✅ Complete | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
