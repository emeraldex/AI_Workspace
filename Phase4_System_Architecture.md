# Forge AI Workspace — Phase 4: System Architecture

---

## 1. Objectives

Define the complete system architecture — all service boundaries, component responsibilities, data flows, infrastructure topology, and integration points. This document is the blueprint every engineer works from.

---

## 2. Architecture Style

The system uses a **Layered Monolith with modular domain boundaries** for v1.0.

This is a deliberate choice over microservices. The domain boundaries are clean enough to extract services later, but the operational overhead of microservices is unjustified for a single-user v1.0 product.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│              React 19 + Vite + TypeScript               │
│         Zustand │ TanStack Query │ React Router         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / WebSocket
┌─────────────────────▼───────────────────────────────────┐
│                    GATEWAY LAYER                        │
│                 Nginx (reverse proxy)                   │
│          TLS termination │ Static file serving          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────────┐
│                   API SERVER LAYER                      │
│              Node.js + Express + TypeScript             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Auth   │ │  Tasks   │ │   Docs   │ │    AI    │  │
│  │  Domain  │ │  Domain  │ │  Domain  │ │  Domain  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Projects │ │Snippets  │ │ Notifs   │ │  Search  │  │
│  │  Domain  │ │  Domain  │ │  Domain  │ │  Domain  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│         Middleware: Auth │ Rate Limit │ Logger          │
│         Socket.IO (notifications + AI streaming)        │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼───────────────────┐
│  PostgreSQL │ │   Redis    │ │     OpenAI API          │
│  + pgvector │ │  (cache +  │ │  GPT-4o / Embeddings   │
│             │ │   queue)   │ │                         │
└─────────────┘ └────────────┘ └─────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend Architecture

```
src/
├── app/                    # Router, providers, global setup
├── features/               # Domain-scoped feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── tasks/
│   ├── projects/
│   ├── ai/
│   ├── documents/
│   ├── snippets/
│   ├── devtools/
│   ├── notifications/
│   └── settings/
├── shared/
│   ├── components/         # Reusable UI primitives
│   ├── hooks/              # Shared custom hooks
│   ├── stores/             # Zustand global stores
│   ├── api/                # API client + query hooks
│   ├── lib/                # Utilities, formatters
│   └── types/              # Shared TypeScript types
└── assets/
```

**State management strategy:**

| State Type | Solution |
|---|---|
| Server state (async data) | TanStack Query |
| Global UI state (theme, sidebar, modals) | Zustand |
| Form state | React Hook Form + Zod |
| URL/navigation state | React Router |
| Component-local state | useState / useReducer |

### 3.2 Backend Architecture

Each domain follows a strict 4-layer pattern:

```
Request → Router → Controller → Service → Repository → Prisma → PostgreSQL
```

```
src/
├── domains/
│   ├── auth/
│   │   ├── auth.router.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   └── auth.validator.ts
│   ├── tasks/
│   ├── projects/
│   ├── documents/
│   ├── ai/
│   ├── snippets/
│   ├── notifications/
│   └── search/
├── shared/
│   ├── middleware/
│   ├── errors/
│   ├── config/
│   ├── logger/
│   └── types/
├── infrastructure/
│   ├── database/           # Prisma client singleton
│   ├── cache/              # Redis client
│   ├── queue/              # Job queue (Bull)
│   ├── ai/                 # OpenAI + LangChain abstraction
│   └── vector/             # pgvector RAG service
└── app.ts
```

### 3.3 AI Architecture

The AI layer is abstracted behind a provider interface, enabling future Ollama support without touching business logic.

```
┌─────────────────────────────────────────┐
│              AI Domain Service          │
│  (conversation, task parsing, RAG)      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           AI Provider Interface         │
│  chat(messages) → AsyncIterable         │
│  embed(text)    → number[]              │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   OpenAI Provider   │  ← v1.0
        │  (GPT-4o + ada-002) │
        └─────────────────────┘
        (Ollama Provider)          ← v1.1
```

**RAG Pipeline:**

```
Document Save
     │
     ▼
Chunking Service (512 token chunks, 50 token overlap)
     │
     ▼
Embedding Service (text-embedding-ada-002)
     │
     ▼
pgvector Store (document_chunks table)
     │
     ▼
On AI Query: cosine similarity search → top-k chunks → injected into system prompt
```

### 3.4 Real-time Architecture

Socket.IO is used for two purposes only in v1.0:

| Channel | Purpose |
|---|---|
| `ai:stream` | Token-by-token AI response streaming per conversation |
| `notifications:new` | Push new notifications to client without polling |

All other data uses standard REST + TanStack Query polling/invalidation.

---

## 4. Infrastructure Topology

```
┌─────────────────────────────────────────────────────┐
│                   Docker Host                       │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐                 │
│  │    Nginx    │   │  Frontend   │                 │
│  │  :80/:443   │──▶│  (static)   │                 │
│  └──────┬──────┘   └─────────────┘                 │
│         │                                           │
│  ┌──────▼──────┐                                   │
│  │   Backend   │                                   │
│  │  Node.js    │                                   │
│  │   :3000     │                                   │
│  └──────┬──────┘                                   │
│         │                                           │
│  ┌──────▼──────┐   ┌─────────────┐                 │
│  │ PostgreSQL  │   │    Redis    │                 │
│  │   :5432     │   │    :6379    │                 │
│  └─────────────┘   └─────────────┘                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Docker Compose services:**

| Service | Image | Purpose |
|---|---|---|
| nginx | nginx:alpine | Reverse proxy, TLS, static files |
| frontend | node:20-alpine (build) | Vite build output served by Nginx |
| backend | node:20-alpine | Express API server |
| postgres | postgres:16-alpine | Primary database + pgvector |
| redis | redis:7-alpine | Cache + Bull job queue |

---

## 5. Data Flow Diagrams

### 5.1 Authentication Flow

```
Client → POST /api/v1/auth/login
       → Validate credentials
       → Issue accessToken (15min JWT)
       → Issue refreshToken (7d, hashed in DB)
       → Return { accessToken, refreshToken }

Client stores:
  accessToken  → memory (Zustand)
  refreshToken → httpOnly cookie

On 401:
  Client → POST /api/v1/auth/refresh
         → Validate refreshToken hash
         → Issue new accessToken
         → Rotate refreshToken
```

### 5.2 AI Chat Flow

```
Client → POST /api/v1/ai/conversations/:id/messages
       → Auth middleware validates JWT
       → AI Controller receives message
       → RAG Service: embed query → similarity search → retrieve chunks
       → Context Builder: system prompt + task context + RAG chunks + history
       → OpenAI Provider: stream response
       → Socket.IO: emit tokens to client room
       → On complete: persist full message to DB
       → TanStack Query invalidates conversation cache
```

### 5.3 Document RAG Indexing Flow

```
Client → POST/PUT /api/v1/documents
       → Document saved to PostgreSQL
       → Job enqueued to Bull queue (async)
       → Worker: chunk document text
       → Worker: embed each chunk via OpenAI
       → Worker: upsert vectors in pgvector
       → Document indexing_status updated to 'indexed'
       → Socket.IO notifies client of completion
```

---

## 6. Cross-Cutting Concerns

### 6.1 Error Handling

All errors flow through a centralized error handler. Every domain throws typed errors that map to HTTP status codes.

```
AppError (base)
├── ValidationError    → 400
├── AuthError          → 401
├── ForbiddenError     → 403
├── NotFoundError      → 404
├── ConflictError      → 409
└── InternalError      → 500
```

Response shape is always:
```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": [{ "field": "title", "message": "Required" }]
}
```

### 6.2 Request Lifecycle

```
Request
  → Nginx
  → Express
  → helmet() (security headers)
  → cors()
  → rateLimit()
  → requestId middleware (uuid attached to req)
  → logger middleware (request logged)
  → authenticate middleware (JWT verified)
  → Zod validator (body/query/params validated)
  → Controller
  → Service
  → Repository
  → Response
  → logger middleware (response logged with duration)
```

### 6.3 Configuration Management

All configuration loaded once at startup via a typed config module validated with Zod. No `process.env` calls scattered through the codebase.

```typescript
// config/index.ts — single source of truth
const config = {
  port, nodeEnv, databaseUrl,
  jwtSecret, jwtRefreshSecret,
  encryptionKey, redisUrl,
  openaiApiKey, corsOrigins
}
```

---

## 7. Security Architecture

| Layer | Control |
|---|---|
| Network | Nginx TLS termination; internal services not exposed |
| Transport | HTTPS enforced; HSTS header |
| Authentication | JWT RS256; refresh token rotation; httpOnly cookies |
| Authorization | userId ownership check on every resource access |
| Input | Zod validation on all inputs; DOMPurify on markdown output |
| Data | AES-256-GCM for sensitive fields; bcrypt for passwords |
| Headers | Helmet.js full suite |
| Rate limiting | express-rate-limit per IP |
| Dependencies | Automated audit in CI |

---

## 8. Design Decisions

| Decision | Rationale |
|---|---|
| Modular monolith over microservices | Operational simplicity for v1.0; domain boundaries preserved for future extraction |
| pgvector over Pinecone | Keeps the stack self-contained; no external vector DB dependency; sufficient for single-user scale |
| Redis for both cache and queue | Avoids a separate message broker; Bull is battle-tested on Redis |
| httpOnly cookie for refresh token | Prevents XSS from stealing the long-lived token; access token in memory prevents CSRF |
| Socket.IO over SSE for streaming | Bidirectional capability needed for notifications; SSE is unidirectional only |

---

## 9. Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Microservices | Premature for single-user v1.0; adds deployment and observability complexity |
| Pinecone for vectors | External dependency; pgvector is sufficient and keeps stack self-contained |
| RabbitMQ for queues | Heavier than needed; Bull on Redis covers all v1.0 job requirements |
| tRPC instead of REST | Less tooling ecosystem; OpenAPI/Swagger requirement favors REST |
| Next.js full-stack | Couples frontend and backend; reduces deployment flexibility |

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| pgvector performance at scale | Acceptable for single-user; HNSW index configured from day one |
| Redis as single point of failure | Acceptable for v1.0; Redis persistence (AOF) enabled |
| Socket.IO connection management | Heartbeat + reconnection logic on client; rooms scoped per userId |
| Bull queue job loss on crash | Bull persists jobs in Redis; failed jobs retained for inspection |

---

## 11. Deliverables

- [x] System architecture diagram
- [x] Frontend architecture and state strategy
- [x] Backend domain layer pattern
- [x] AI provider abstraction design
- [x] RAG pipeline design
- [x] Infrastructure topology
- [x] Data flow diagrams (auth, AI chat, RAG indexing)
- [x] Cross-cutting concerns (errors, request lifecycle, config)
- [x] Security architecture
- [x] Design decisions and alternatives

---

## 12. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ⏳ Pending | Phase 5 — Database Design |
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
