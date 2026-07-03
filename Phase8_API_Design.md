# Forge AI Workspace — Phase 8: API Design

---

## 1. Objectives

Define the complete REST API contract — every endpoint, request/response shape, HTTP status codes, authentication requirements, and pagination strategy — before any backend implementation begins. This is the binding contract between frontend and backend.

---

## 2. Design Decisions

| Decision | Rationale |
|---|---|
| `/api/v1` prefix on all routes | Version isolation from day one; v2 can coexist without breaking clients |
| Consistent `ApiResponse<T>` envelope | Predictable shape for all clients; errors always have the same structure |
| Cursor-based pagination for lists | More efficient than offset at scale; avoids page-drift on live data |
| Soft-delete filter applied at repository layer | Clients never see deleted records; no query param needed |
| `userId` never accepted from client | Always derived from JWT; prevents IDOR attacks |
| Streaming via Socket.IO, not HTTP SSE | Bidirectional channel already needed for notifications |
| ISO 8601 for all timestamps | Unambiguous, timezone-aware, universally parseable |

---

## 3. Global Conventions

### 3.1 Base URL

```
Development:  http://localhost:3000/api/v1
Production:   https://{domain}/api/v1
```

### 3.2 Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/health` require:

```
Authorization: Bearer <accessToken>
```

### 3.3 Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated success:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "nextCursor": "uuid-or-null",
    "hasMore": true,
    "total": 142
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Required" }
  ]
}
```

### 3.4 Pagination Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `cursor` | string (UUID) | — | Last item ID from previous page |
| `limit` | number | 20 | Items per page (max 100) |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |

### 3.5 HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (owns resource check failed) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 4. Health Check

```
GET /health
```

**Response 200:**
```json
{
  "status": "ok",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. Authentication — `/api/v1/auth`

### POST `/auth/register`

**Rate limit:** 5 req / 15 min per IP

**Request:**
```json
{
  "name": "string (1–100)",
  "email": "string (valid email)",
  "password": "string (min 8, max 72)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "", "name": "", "email": "" },
    "accessToken": "jwt"
  }
}
```

Refresh token set as `httpOnly` cookie: `refreshToken`.

---

### POST `/auth/login`

**Rate limit:** 10 req / 15 min per IP

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "", "name": "", "email": "", "avatarUrl": null },
    "accessToken": "jwt"
  }
}
```

---

### POST `/auth/refresh`

Reads `refreshToken` from httpOnly cookie.

**Response 200:**
```json
{
  "success": true,
  "data": { "accessToken": "jwt" }
}
```

---

### POST `/auth/logout`

**Auth required.** Invalidates current refresh token.

**Response 204** (no body)

---

### POST `/auth/change-password`

**Auth required.**

**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 8)"
}
```

**Response 200:**
```json
{ "success": true, "data": { "message": "Password updated" } }
```

---

## 6. Users — `/api/v1/users`

### GET `/users/me`

Returns the authenticated user's profile.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "",
    "name": "",
    "email": "",
    "avatarUrl": null,
    "bio": null,
    "timezone": "UTC",
    "createdAt": ""
  }
}
```

---

### PATCH `/users/me`

**Request (all fields optional):**
```json
{
  "name": "string",
  "avatarUrl": "string (url)",
  "bio": "string (max 500)",
  "timezone": "string (IANA)"
}
```

**Response 200:** Updated user object (same shape as GET `/users/me`)

---

### DELETE `/users/me`

Soft-deletes the account. Schedules hard delete after 30 days.

**Response 204**

---

## 7. Settings — `/api/v1/settings`

### GET `/settings`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "theme": "DARK",
    "openaiModel": "gpt-4o",
    "hasOpenaiKey": true,
    "notifyTaskDueSoon": true,
    "notifyTaskOverdue": true,
    "notifyAiTaskCreated": true,
    "dismissedWidgets": []
  }
}
```

Note: `hasOpenaiKey` is a boolean — the actual key is never returned.

---

### PATCH `/settings`

**Request (all fields optional):**
```json
{
  "theme": "LIGHT | DARK | SYSTEM",
  "openaiApiKey": "string (stored encrypted)",
  "openaiModel": "gpt-4o | gpt-4o-mini",
  "notifyTaskDueSoon": true,
  "notifyTaskOverdue": true,
  "notifyAiTaskCreated": true,
  "dismissedWidgets": ["widget-id"]
}
```

**Response 200:** Updated settings (same shape as GET, key never returned)

---

## 8. Dashboard — `/api/v1/dashboard`

### GET `/dashboard`

Returns all dashboard data in a single request (parallel DB queries server-side).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "taskSummary": {
      "todo": 5,
      "inProgress": 3,
      "inReview": 1,
      "done": 12,
      "cancelled": 0
    },
    "todayTasks": [ { "id": "", "title": "", "priority": "", "dueDate": "" } ],
    "overdueTasks": [ { "id": "", "title": "", "priority": "", "dueDate": "" } ],
    "recentDocuments": [ { "id": "", "title": "", "updatedAt": "" } ],
    "recentConversations": [ { "id": "", "title": "", "updatedAt": "" } ],
    "streak": 7
  }
}
```

---

## 9. Projects — `/api/v1/projects`

### GET `/projects`

**Query params:** `includeArchived=false`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "name": "", "description": null,
      "color": null, "icon": null, "isArchived": false,
      "taskCount": 8, "completedCount": 3,
      "createdAt": "", "updatedAt": ""
    }
  ]
}
```

---

### POST `/projects`

**Request:**
```json
{
  "name": "string (1–100, required)",
  "description": "string (optional)",
  "color": "string (hex, optional)",
  "icon": "string (optional)"
}
```

**Response 201:** Created project object

---

### GET `/projects/:id`

**Response 200:** Single project with `taskCount` and `completedCount`

---

### PATCH `/projects/:id`

**Request:** Same fields as POST, all optional

**Response 200:** Updated project

---

### PATCH `/projects/:id/archive`

**Response 200:** `{ "isArchived": true }`

---

### DELETE `/projects/:id`

Soft delete. Tasks retain `projectId` but project is hidden.

**Response 204**

---

## 10. Tasks — `/api/v1/tasks`

### GET `/tasks`

**Query params:**

| Param | Type | Description |
|---|---|---|
| `projectId` | UUID | Filter by project |
| `status` | enum | `TODO,IN_PROGRESS,IN_REVIEW,DONE,CANCELLED` |
| `priority` | enum | `LOW,MEDIUM,HIGH,URGENT` |
| `tagIds` | UUID[] | Comma-separated tag IDs |
| `dueBefore` | ISO date | Filter due before date |
| `dueAfter` | ISO date | Filter due after date |
| `search` | string | Full-text search |
| `cursor` | UUID | Pagination cursor |
| `limit` | number | Default 20 |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "title": "", "description": null,
      "status": "TODO", "priority": "MEDIUM",
      "dueDate": null, "sortOrder": 0,
      "project": { "id": "", "name": "", "color": null },
      "tags": [ { "id": "", "name": "", "color": null } ],
      "subtaskCount": 2, "completedSubtaskCount": 1,
      "createdAt": "", "updatedAt": ""
    }
  ],
  "pagination": { "nextCursor": null, "hasMore": false, "total": 21 }
}
```

---

### POST `/tasks`

**Request:**
```json
{
  "title": "string (required, 1–500)",
  "description": "string (optional)",
  "projectId": "UUID (optional)",
  "priority": "LOW | MEDIUM | HIGH | URGENT (default MEDIUM)",
  "status": "TODO | IN_PROGRESS | IN_REVIEW | DONE | CANCELLED (default TODO)",
  "dueDate": "ISO 8601 (optional)",
  "tagIds": ["UUID"],
  "sortOrder": 0
}
```

**Response 201:** Full task object (same shape as list item)

---

### GET `/tasks/:id`

**Response 200:** Full task with `subtasks` array included

```json
{
  "success": true,
  "data": {
    "...taskFields": "...",
    "subtasks": [
      { "id": "", "title": "", "isCompleted": false, "sortOrder": 0 }
    ]
  }
}
```

---

### PATCH `/tasks/:id`

**Request:** Any subset of POST fields

**Response 200:** Updated task

---

### DELETE `/tasks/:id`

Soft delete.

**Response 204**

---

### PATCH `/tasks/reorder`

Used for drag-and-drop board reordering.

**Request:**
```json
{
  "updates": [
    { "id": "UUID", "sortOrder": 0, "status": "IN_PROGRESS" }
  ]
}
```

**Response 200:** `{ "success": true, "data": { "updated": 3 } }`

---

### POST `/tasks/:id/subtasks`

**Request:**
```json
{
  "title": "string (required)",
  "sortOrder": 0
}
```

**Response 201:** Created subtask

---

### PATCH `/tasks/:id/subtasks/:subtaskId`

**Request:**
```json
{
  "title": "string (optional)",
  "isCompleted": "boolean (optional)",
  "sortOrder": "number (optional)"
}
```

**Response 200:** Updated subtask

---

### DELETE `/tasks/:id/subtasks/:subtaskId`

**Response 204**

---

## 11. Tags — `/api/v1/tags`

### GET `/tags`

**Response 200:**
```json
{
  "success": true,
  "data": [ { "id": "", "name": "", "color": null } ]
}
```

---

### POST `/tags`

**Request:**
```json
{ "name": "string (1–50)", "color": "string (hex, optional)" }
```

**Response 201:** Created tag

---

### DELETE `/tags/:id`

Removes tag from all tasks and documents.

**Response 204**

---

## 12. Documents — `/api/v1/documents`

### GET `/documents`

**Query params:** `collectionId`, `search`, `tagIds`, `cursor`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "title": "", "collectionId": null,
      "indexingStatus": "INDEXED",
      "tags": [],
      "createdAt": "", "updatedAt": ""
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/documents`

**Request:**
```json
{
  "title": "string (required, 1–500)",
  "body": "string (default empty)",
  "collectionId": "UUID (optional)",
  "tagIds": ["UUID"]
}
```

**Response 201:** Created document (body included)

Triggers async RAG indexing job.

---

### GET `/documents/:id`

**Response 200:** Full document including `body`

---

### PATCH `/documents/:id`

**Request:** Any subset of POST fields

**Response 200:** Updated document (without body for performance — use GET for body)

Triggers async RAG re-indexing job.

---

### DELETE `/documents/:id`

Soft delete. Removes from RAG index.

**Response 204**

---

### GET `/documents/:id/export`

**Query params:** `format=markdown|text`

**Response 200:** `Content-Type: text/plain` or `text/markdown`

---

## 13. Collections — `/api/v1/collections`

### GET `/collections`

Returns tree structure (max 3 levels).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "name": "", "parentId": null,
      "children": [ { "id": "", "name": "", "parentId": "", "children": [] } ]
    }
  ]
}
```

---

### POST `/collections`

**Request:**
```json
{
  "name": "string (required)",
  "parentId": "UUID (optional, max depth 3)"
}
```

**Response 201:** Created collection

---

### PATCH `/collections/:id`

**Request:** `{ "name": "string" }`

**Response 200:** Updated collection

---

### DELETE `/collections/:id`

Documents in collection have `collectionId` set to null.

**Response 204**

---

## 14. Conversations — `/api/v1/conversations`

### GET `/conversations`

**Query params:** `cursor`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "", "title": "", "messageCount": 12, "updatedAt": "" }
  ],
  "pagination": { ... }
}
```

---

### POST `/conversations`

Creates a new empty conversation.

**Request:**
```json
{ "title": "string (optional, default 'New Conversation')" }
```

**Response 201:** `{ "id": "", "title": "", "messages": [] }`

---

### GET `/conversations/:id`

Returns conversation with full message history.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "", "title": "",
    "messages": [
      {
        "id": "", "role": "USER | ASSISTANT | SYSTEM",
        "content": "", "tokenCount": null, "createdAt": ""
      }
    ]
  }
}
```

---

### PATCH `/conversations/:id`

**Request:** `{ "title": "string" }`

**Response 200:** Updated conversation

---

### DELETE `/conversations/:id`

Soft delete. All messages cascade.

**Response 204**

---

### POST `/conversations/:id/messages`

Sends a user message. AI response is streamed via Socket.IO (`ai:stream` event on room `conversation:{id}`). The HTTP response returns immediately after the user message is persisted.

**Request:**
```json
{
  "content": "string (required, 1–32000)",
  "documentIds": ["UUID"]
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "userMessage": { "id": "", "role": "USER", "content": "", "createdAt": "" },
    "streamId": "uuid"
  }
}
```

Socket.IO events emitted to room `conversation:{id}`:
- `ai:token` — `{ streamId, token }`
- `ai:done` — `{ streamId, messageId, tokenCount }`
- `ai:error` — `{ streamId, message }`

---

### POST `/conversations/:id/messages/:messageId/regenerate`

Regenerates the last assistant message.

**Response 201:** Same shape as POST messages

---

## 15. Snippets — `/api/v1/snippets`

### GET `/snippets`

**Query params:** `language`, `search`, `tags` (comma-separated), `cursor`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "title": "", "language": "",
      "code": "", "tags": [],
      "createdAt": "", "updatedAt": ""
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/snippets`

**Request:**
```json
{
  "title": "string (required)",
  "language": "string (required)",
  "code": "string (required)",
  "tags": ["string"]
}
```

**Response 201:** Created snippet

---

### PATCH `/snippets/:id`

**Request:** Any subset of POST fields

**Response 200:** Updated snippet

---

### DELETE `/snippets/:id`

Soft delete.

**Response 204**

---

## 16. Notifications — `/api/v1/notifications`

### GET `/notifications`

**Query params:** `unreadOnly=false`, `cursor`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "", "type": "TASK_DUE_SOON",
      "title": "", "body": "",
      "isRead": false, "metadata": {},
      "createdAt": ""
    }
  ],
  "pagination": { ... }
}
```

---

### PATCH `/notifications/:id/read`

**Response 200:** `{ "isRead": true }`

---

### PATCH `/notifications/read-all`

Marks all unread notifications as read.

**Response 200:** `{ "updated": 5 }`

---

### DELETE `/notifications/:id`

**Response 204**

---

## 17. Search — `/api/v1/search`

### GET `/search`

**Query params:**

| Param | Type | Description |
|---|---|---|
| `q` | string (required) | Search query |
| `types` | string | Comma-separated: `tasks,documents,snippets,conversations` |
| `limit` | number | Per-type limit (default 5) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      { "id": "", "title": "", "status": "", "priority": "" }
    ],
    "documents": [
      { "id": "", "title": "", "excerpt": "...matched text..." }
    ],
    "snippets": [
      { "id": "", "title": "", "language": "" }
    ],
    "conversations": [
      { "id": "", "title": "" }
    ]
  }
}
```

---

### GET `/search/semantic`

Semantic (RAG) search over documents.

**Query params:** `q` (required), `limit` (default 5)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "documentId": "", "documentTitle": "",
      "excerpt": "...relevant chunk...",
      "similarity": 0.87
    }
  ]
}
```

---

## 18. Socket.IO Events

### Connection

```
ws://{host}?token={accessToken}
```

Token validated on connection. Connection rejected with `401` if invalid.

### Rooms

| Room | Joined when |
|---|---|
| `user:{userId}` | On authenticated connection |
| `conversation:{id}` | On GET `/conversations/:id` (client joins via socket) |

### Server → Client Events

| Event | Room | Payload |
|---|---|---|
| `ai:token` | `conversation:{id}` | `{ streamId, token }` |
| `ai:done` | `conversation:{id}` | `{ streamId, messageId, tokenCount }` |
| `ai:error` | `conversation:{id}` | `{ streamId, message }` |
| `notification:new` | `user:{userId}` | Full notification object |
| `document:indexed` | `user:{userId}` | `{ documentId, status }` |

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `conversation:join` | `{ conversationId }` | Join conversation room |
| `conversation:leave` | `{ conversationId }` | Leave conversation room |

---

## 19. Error Reference

| Scenario | Status | Message |
|---|---|---|
| Missing/invalid JWT | 401 | `Authentication required` |
| Expired access token | 401 | `Token expired` |
| Resource belongs to another user | 403 | `Access denied` |
| Resource not found | 404 | `{Resource} not found` |
| Duplicate email on register | 409 | `Email already in use` |
| Duplicate tag name | 409 | `Tag name already exists` |
| Validation failure | 400 | `Validation failed` + `errors[]` |
| Rate limit exceeded | 429 | `Too many requests` |
| OpenAI API unavailable | 503 | `AI service temporarily unavailable` |

---

## 20. Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| GraphQL | REST + OpenAPI is simpler to document, test, and secure for this scope |
| Offset pagination | Cursor pagination avoids page drift on live-updating lists |
| SSE for AI streaming | Socket.IO already required for notifications; avoids two real-time protocols |
| Returning API key in settings GET | Security risk; `hasOpenaiKey` boolean is sufficient for UI needs |
| Flat search endpoint | Grouped results by type are more useful for command palette UX |

---

## 21. Risks

| Risk | Mitigation |
|---|---|
| AI streaming and HTTP response race condition | HTTP returns immediately after user message persisted; stream is independent |
| Large conversation history in context | Message history truncated to last N tokens before sending to OpenAI |
| Semantic search latency | pgvector HNSW index; results cached in Redis for 60s per query |
| Socket.IO room leaks | Rooms cleaned up on disconnect; TTL on conversation rooms |

---

## 22. Deliverables

- [x] Global API conventions (envelope, pagination, status codes)
- [x] Health check endpoint
- [x] Auth endpoints (register, login, refresh, logout, change-password)
- [x] User profile endpoints
- [x] Settings endpoints
- [x] Dashboard endpoint
- [x] Projects CRUD
- [x] Tasks CRUD with subtasks and reorder
- [x] Tags CRUD
- [x] Documents CRUD with export
- [x] Collections CRUD
- [x] Conversations CRUD with message streaming
- [x] Snippets CRUD
- [x] Notifications endpoints
- [x] Search (full-text + semantic)
- [x] Socket.IO event contract
- [x] Error reference

---

## 23. Updated Project Backlog

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
| ⏳ Pending | Phase 9 — Authentication |
| ⏳ Pending | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
