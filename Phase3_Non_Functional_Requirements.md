# Forge AI Workspace — Phase 3: Non-Functional Requirements

---

## 1. Objectives

Define the quality attributes, performance targets, security standards, scalability constraints, and operational requirements the system must satisfy — independent of any specific feature. These are the engineering quality bars that every component must meet.

---

## 2. Non-Functional Requirements

---

### NFR-01 — Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01-01 | API response time (p95) for standard CRUD operations | ≤ 200ms |
| NFR-01-02 | API response time (p95) for search queries | ≤ 500ms |
| NFR-01-03 | Time to first AI streaming token | ≤ 1500ms |
| NFR-01-04 | Frontend initial page load (LCP) | ≤ 2.5s on broadband |
| NFR-01-05 | Frontend route transitions | ≤ 200ms |
| NFR-01-06 | RAG document indexing (per document) | ≤ 5s async; non-blocking |
| NFR-01-07 | Global search results (debounced) | ≤ 300ms after 250ms debounce |
| NFR-01-08 | Dashboard load (all widgets) | ≤ 1s with parallel data fetching |

---

### NFR-02 — Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-02-01 | Backend must handle concurrent users without degradation | Designed for 100 concurrent users in v1.0 |
| NFR-02-02 | Database schema must support multi-user without migration | userId foreign keys on all user-owned entities from day one |
| NFR-02-03 | RAG vector store must support incremental indexing | No full re-index required on document update |
| NFR-02-04 | API must be stateless | No server-side session state; all state in JWT or database |
| NFR-02-05 | Background jobs must be queue-based | Decoupled from request lifecycle; retryable |

---

### NFR-03 — Security

| ID | Requirement | Standard |
|---|---|---|
| NFR-03-01 | All passwords hashed using bcrypt | Minimum cost factor of 12 |
| NFR-03-02 | JWT access tokens signed with RS256 or HS256 | Secret minimum 256-bit; rotated on deployment |
| NFR-03-03 | Refresh tokens stored as hashed values in database | Raw token never stored |
| NFR-03-04 | All API inputs validated and sanitized | Zod schemas on all request bodies and query params |
| NFR-03-05 | OpenAI API keys encrypted at rest | AES-256-GCM; encryption key from environment variable |
| NFR-03-06 | HTTP security headers applied globally | Helmet.js: CSP, HSTS, X-Frame-Options, X-Content-Type |
| NFR-03-07 | Rate limiting on all public endpoints | 100 req/min per IP general; 10 req/15min on auth |
| NFR-03-08 | SQL injection prevention | Prisma parameterized queries exclusively; no raw SQL with user input |
| NFR-03-09 | XSS prevention | Output sanitized; React's default escaping + DOMPurify for markdown render |
| NFR-03-10 | CORS restricted to known origins | Configurable allowlist via environment variable |
| NFR-03-11 | Sensitive fields never returned in API responses | API key, password hash, token hash excluded from all serializers |
| NFR-03-12 | Dependency vulnerability scanning | Automated via GitHub Actions on every PR |

---

### NFR-04 — Reliability & Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-04-01 | Application uptime target | 99.5% monthly (single-user self-hosted context) |
| NFR-04-02 | Graceful degradation when OpenAI API is unavailable | AI features show clear error state; all other features remain functional |
| NFR-04-03 | Database connection pooling | PgBouncer or Prisma connection pool; max 10 connections in v1.0 |
| NFR-04-04 | Unhandled errors must not crash the server | Global error handler catches all unhandled exceptions and rejections |
| NFR-04-05 | Background job failures must be retried | Max 3 retries with exponential backoff |
| NFR-04-06 | Auto-save for documents | Client-side auto-save every 30 seconds with conflict detection |

---

### NFR-05 — Maintainability

| ID | Requirement | Standard |
|---|---|---|
| NFR-05-01 | All source files under 300 lines | Enforced by code review; refactor if exceeded |
| NFR-05-02 | No circular dependencies | Enforced via ESLint import plugin |
| NFR-05-03 | All environment configuration via .env | No hardcoded values; validated on startup with Zod |
| NFR-05-04 | All database changes via Prisma migrations | No manual schema changes; migration files committed to version control |
| NFR-05-05 | Consistent error response shape across all endpoints | `{ success, message, errors?, data? }` |
| NFR-05-06 | Structured logging throughout backend | JSON logs with level, timestamp, requestId, userId |
| NFR-05-07 | API versioned from day one | All routes prefixed with `/api/v1` |
| NFR-05-08 | OpenAPI spec generated from code | Swagger auto-generated; always in sync with implementation |

---

### NFR-06 — Observability

| ID | Requirement | Standard |
|---|---|---|
| NFR-06-01 | Request logging on all API calls | Method, path, status, duration, requestId |
| NFR-06-02 | Error logging with stack traces | Errors logged with context; never swallowed silently |
| NFR-06-03 | Health check endpoint | `GET /health` returns service status, DB connectivity, uptime |
| NFR-06-04 | AI usage logging | Token counts, model used, latency logged per request |
| NFR-06-05 | Log levels configurable via environment | debug, info, warn, error; default info in production |

---

### NFR-07 — Testability

| ID | Requirement | Target |
|---|---|---|
| NFR-07-01 | Business logic unit test coverage | ≥ 80% line coverage on service layer |
| NFR-07-02 | All API endpoints covered by integration tests | 100% of routes have at least one happy-path and one error-path test |
| NFR-07-03 | Tests must run in isolation | No shared state between tests; database reset between integration test suites |
| NFR-07-04 | CI pipeline runs all tests on every PR | Failing tests block merge |
| NFR-07-05 | E2E tests cover critical user flows | Auth, task creation, AI chat, document creation |

---

### NFR-08 — Usability & Accessibility

| ID | Requirement | Standard |
|---|---|---|
| NFR-08-01 | WCAG 2.1 Level AA compliance target | Keyboard navigable; sufficient color contrast; ARIA labels on interactive elements |
| NFR-08-02 | All interactive elements keyboard accessible | No mouse-only interactions |
| NFR-08-03 | Focus management on modal/dialog open and close | Focus trapped in modal; restored on close |
| NFR-08-04 | Responsive layout | Functional on screens ≥ 1024px wide for v1.0; mobile-aware layout |
| NFR-08-05 | Loading states on all async operations | Skeleton loaders or spinners; no blank content flashes |
| NFR-08-06 | Error states communicated clearly | User-facing error messages are actionable, not technical |
| NFR-08-07 | Toast notifications for all user actions | Success, error, and info feedback within 300ms of action |

---

### NFR-09 — Data Integrity

| ID | Requirement | Standard |
|---|---|---|
| NFR-09-01 | All user-owned entities include userId | Enforced at database and application layer |
| NFR-09-02 | All entities include created_at and updated_at | Auto-managed by Prisma |
| NFR-09-03 | Soft deletes on all primary entities | deleted_at nullable timestamp; hard delete only on account deletion |
| NFR-09-04 | Foreign key constraints enforced at database level | Prisma schema defines all relations with referential integrity |
| NFR-09-05 | No orphaned records | Cascade rules defined explicitly on all relations |

---

### NFR-10 — Deployment & Operations

| ID | Requirement | Standard |
|---|---|---|
| NFR-10-01 | Application fully containerized | Docker + Docker Compose for all services |
| NFR-10-02 | Environment parity across dev, staging, production | Same Docker images; only environment variables differ |
| NFR-10-03 | Zero-downtime deployment strategy | PM2 cluster mode or Docker rolling update |
| NFR-10-04 | Database migrations run automatically on deploy | Prisma migrate deploy in CI/CD pipeline |
| NFR-10-05 | Secrets never committed to version control | .env.example committed; .env gitignored; secrets via environment injection |
| NFR-10-06 | Build artifacts reproducible | Locked dependency versions (package-lock.json committed) |

---

## 3. Design Decisions

| Decision | Rationale |
|---|---|
| AES-256-GCM for API key encryption | Authenticated encryption prevents both tampering and disclosure; GCM mode is preferred over CBC |
| Zod for all input validation | Single validation library shared across frontend and backend; runtime + compile-time safety |
| JSON structured logging | Machine-parseable logs enable future integration with log aggregators (Loki, CloudWatch) |
| `/api/v1` versioning from day one | Avoids breaking changes when v2 endpoints are introduced; costs nothing to add now |
| Soft deletes on all entities | Supports audit trail, recovery window, and future undo features without schema changes |

---

## 4. Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| Session-based auth instead of JWT | Stateful sessions complicate horizontal scaling; JWT aligns with stateless API design |
| MongoDB instead of PostgreSQL | Relational integrity and tsvector full-text search are strong PostgreSQL advantages for this domain |
| Winston for logging | Pino is significantly faster and produces structured JSON natively; better fit for production |
| Joi for validation | Zod provides TypeScript type inference from schemas; eliminates duplicate type definitions |

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| Performance targets not met under RAG load | Vector search isolated to dedicated service layer; can be offloaded to pgvector or Pinecone |
| AES encryption key loss | Key stored in environment variable; documented in ops runbook; backup procedure required |
| Test coverage targets slipping under time pressure | Coverage enforced in CI pipeline; PR blocked if coverage drops below threshold |
| Accessibility compliance gaps | Automated axe-core checks in Playwright E2E suite from day one |

---

## 6. Deliverables

- [x] 10 NFR domains
- [x] 57 individual non-functional requirements with measurable targets
- [x] Design decisions with rationale
- [x] Alternatives considered
- [x] Risk register updated

---

## 7. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ⏳ Pending | Phase 4 — System Architecture |
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
